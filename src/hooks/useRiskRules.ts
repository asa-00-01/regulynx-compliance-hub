
import { useState, useEffect, useCallback } from 'react';
import { getRulesByCategory, getRiskMatchesForEntity, evaluateTransactionRisk, evaluateUserRisk } from '@/services/risk';
import { AMLTransaction } from '@/types/aml';
import { UnifiedUserData } from '@/context/compliance/types';
import { Rule, RiskMatchDisplay } from '@/types/risk';

interface RiskRulesHookProps {
  transaction?: AMLTransaction;
  user?: UnifiedUserData;
}

export const useRiskRules = ({ transaction, user }: RiskRulesHookProps) => {
  const [riskMatches, setRiskMatches] = useState<RiskMatchDisplay[]>([]);
  const [allRules, setAllRules] = useState<Rule[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [totalRiskScore, setTotalRiskScore] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const entityId = transaction?.id || user?.id || '';
  const entityType = transaction ? 'transaction' : 'user';

  const loadRiskData = useCallback(async () => {
    if (!entityId) return;
    setLoading(true);
    try {
      const matches = await getRiskMatchesForEntity(entityId, entityType);
      setRiskMatches(matches);
      const total = matches.reduce((sum: number, match: RiskMatchDisplay) => sum + (match.rules?.risk_score || 0), 0);
      setTotalRiskScore(Math.min(total, 100));
    } catch (error) {
      console.error('Error loading risk data:', error);
    } finally {
      setLoading(false);
    }
  }, [entityId, entityType]);

  const runRiskAssessment = useCallback(async () => {
    setLoading(true);
    try {
      let result;
      if (transaction) {
        result = await evaluateTransactionRisk(transaction);
      } else if (user) {
        result = await evaluateUserRisk(user);
      } else {
        setLoading(false);
        return;
      }

      setTotalRiskScore(result.total_risk_score);
      await loadRiskData();
    } catch (error) {
      console.error('Error running risk assessment:', error);
      setLoading(false);
    }
  }, [transaction, user, loadRiskData]);

  useEffect(() => {
    if (entityId) {
      loadRiskData();
    }
  }, [entityId, loadRiskData]);

  useEffect(() => {
    const loadRules = async () => {
      try {
        const rules = await getRulesByCategory(selectedCategory);
        setAllRules(rules);
      } catch (error) {
        console.error('Error loading rules:', error);
      }
    };
    loadRules();
  }, [selectedCategory]);
  
  const filteredMatches = selectedCategory === 'all' 
    ? riskMatches 
    : riskMatches.filter(match => match.rules?.category === selectedCategory);
  
  const triggeredRuleIds = new Set(riskMatches.map(match => match.rule_id));

  return {
    loading,
    totalRiskScore,
    riskMatches,
    filteredMatches,
    allRules,
    selectedCategory,
    setSelectedCategory,
    runRiskAssessment,
    triggeredRuleIds
  };
};
