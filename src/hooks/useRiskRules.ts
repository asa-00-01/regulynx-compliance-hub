
import { useState, useEffect, useCallback } from 'react';
import { getRulesByCategory, getRiskMatchesForEntity, evaluateTransactionRisk, evaluateUserRisk } from '@/services/risk';
import { AMLTransaction } from '@/types/aml';
import { UnifiedUserData } from '@/context/compliance/types';
import { Rule, RiskMatchDisplay } from '@/types/risk';

interface RiskRulesHookProps {
  transaction?: AMLTransaction;
  user?: UnifiedUserData;
}

/**
 * Manages risk rules evaluation and display for transactions and users.
 * Provides rule matching, assessment execution, and category filtering capabilities.
 */
export const useRiskRules = ({ transaction, user }: RiskRulesHookProps) => {
  // State management
  const [matchedRiskRules, setMatchedRiskRules] = useState<RiskMatchDisplay[]>([]);
  const [availableRulesList, setAvailableRulesList] = useState<Rule[]>([]);
  const [activeRuleCategory, setActiveRuleCategory] = useState<string>('all');
  const [calculatedTotalRiskScore, setCalculatedTotalRiskScore] = useState<number>(0);
  const [isRiskDataLoading, setIsRiskDataLoading] = useState(false);

  const entityIdentifier = transaction?.id || user?.id || '';
  const entityTypeClassification = transaction ? 'transaction' : 'user';

  /**
   * Loads existing risk matches for the current entity
   */
  const loadExistingRiskData = useCallback(async () => {
    if (!entityIdentifier) return;
    
    setIsRiskDataLoading(true);
    try {
      const existingRiskMatches = await getRiskMatchesForEntity(entityIdentifier, entityTypeClassification);
      setMatchedRiskRules(existingRiskMatches);
      
      const aggregatedRiskScore = calculateTotalRiskScore(existingRiskMatches);
      setCalculatedTotalRiskScore(aggregatedRiskScore);
    } catch (error) {
      console.error('Error loading risk data:', error);
    } finally {
      setIsRiskDataLoading(false);
    }
  }, [entityIdentifier, entityTypeClassification]);

  /**
   * Executes comprehensive risk assessment for the current entity
   */
  const executeRiskAssessment = useCallback(async () => {
    setIsRiskDataLoading(true);
    try {
      let assessmentResult;
      
      if (transaction) {
        assessmentResult = await evaluateTransactionRisk(transaction);
      } else if (user) {
        assessmentResult = await evaluateUserRisk(user);
      } else {
        setIsRiskDataLoading(false);
        return;
      }

      setCalculatedTotalRiskScore(assessmentResult.total_risk_score);
      await loadExistingRiskData();
    } catch (error) {
      console.error('Error running risk assessment:', error);
      setIsRiskDataLoading(false);
    }
  }, [transaction, user, loadExistingRiskData]);

  // Load risk data when entity changes
  useEffect(() => {
    if (entityIdentifier) {
      loadExistingRiskData();
    }
  }, [entityIdentifier, loadExistingRiskData]);

  // Load rules when category filter changes
  useEffect(() => {
    const loadRulesByCategory = async () => {
      try {
        const categoryRules = await getRulesByCategory(activeRuleCategory);
        setAvailableRulesList(categoryRules);
      } catch (error) {
        console.error('Error loading rules:', error);
      }
    };
    loadRulesByCategory();
  }, [activeRuleCategory]);
  
  const filteredRiskMatches = getFilteredMatches(matchedRiskRules, activeRuleCategory);
  const triggeredRuleIdentifiers = createTriggeredRuleSet(matchedRiskRules);

  return {
    loading: isRiskDataLoading,
    totalRiskScore: calculatedTotalRiskScore,
    riskMatches: matchedRiskRules,
    filteredMatches: filteredRiskMatches,
    allRules: availableRulesList,
    selectedCategory: activeRuleCategory,
    setSelectedCategory: setActiveRuleCategory,
    runRiskAssessment: executeRiskAssessment,
    triggeredRuleIds: triggeredRuleIdentifiers
  };
};

/**
 * Calculates total risk score from risk matches, capped at maximum value
 */
function calculateTotalRiskScore(riskMatchesList: RiskMatchDisplay[]): number {
  const MAX_RISK_SCORE = 100;
  const totalScore = riskMatchesList.reduce(
    (accumulator: number, riskMatch: RiskMatchDisplay) => 
      accumulator + (riskMatch.rules?.risk_score || 0), 
    0
  );
  return Math.min(totalScore, MAX_RISK_SCORE);
}

/**
 * Filters risk matches by category
 */
function getFilteredMatches(riskMatchesList: RiskMatchDisplay[], categoryFilter: string): RiskMatchDisplay[] {
  return categoryFilter === 'all' 
    ? riskMatchesList 
    : riskMatchesList.filter(riskMatch => riskMatch.rules?.category === categoryFilter);
}

/**
 * Creates a set of triggered rule IDs for quick lookup
 */
function createTriggeredRuleSet(riskMatchesList: RiskMatchDisplay[]): Set<string> {
  return new Set(riskMatchesList.map(riskMatch => riskMatch.rule_id));
}
