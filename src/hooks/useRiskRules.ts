
import { useState, useEffect, useCallback } from 'react';
import { getRulesByCategory, getRiskMatchesForEntity } from '@/services/risk';
import { RiskRule, RiskMatchDisplay } from '@/types/risk';
import { AMLTransaction } from '@/types/aml';
import { UnifiedUserData } from '@/context/compliance/types';

export interface RiskRulesHook {
  loading: boolean;
  totalRiskScore: number;
  riskMatches: RiskMatchDisplay[];
  filteredMatches: RiskMatchDisplay[];
  allRules: RiskRule[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  runRiskAssessment: () => Promise<void>;
  triggeredRuleIds: string[];
  rules: RiskRule[];
  matches: RiskMatchDisplay[];
  error: string | null;
  fetchRulesByCategory: (category: string) => Promise<void>;
  fetchMatches: (entityId: string, entityType: 'user' | 'transaction') => Promise<void>;
}

interface UseRiskRulesParams {
  transaction?: AMLTransaction;
  user?: UnifiedUserData;
}

export const useRiskRules = (params?: UseRiskRulesParams): RiskRulesHook => {
  const [rules, setRules] = useState<RiskRule[]>([]);
  const [matches, setMatches] = useState<RiskMatchDisplay[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [totalRiskScore, setTotalRiskScore] = useState(0);

  const fetchRulesByCategory = useCallback(async (category: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const fetchedRules = await getRulesByCategory(category);
      setRules(fetchedRules);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch rules');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMatches = useCallback(async (entityId: string, entityType: 'user' | 'transaction') => {
    setLoading(true);
    setError(null);
    
    try {
      const riskMatches = await getRiskMatchesForEntity(entityId, entityType);
      
      // Transform the data to match RiskMatchDisplay interface
      const displayMatches: RiskMatchDisplay[] = riskMatches.map(match => ({
        id: match.rule_id,
        rule_id: match.rule_id,
        matched_at: new Date().toISOString(),
        match_data: { entityId, entityType },
        rules: {
          rule_name: match.rule_name,
          description: match.description,
          risk_score: match.risk_score,
          category: match.category
        }
      }));
      
      setMatches(displayMatches);
      setTotalRiskScore(riskMatches.reduce((sum, match) => sum + match.risk_score, 0));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch matches');
    } finally {
      setLoading(false);
    }
  }, []);

  const runRiskAssessment = useCallback(async () => {
    if (params?.transaction) {
      await fetchMatches(params.transaction.id, 'transaction');
    } else if (params?.user) {
      await fetchMatches(params.user.id, 'user');
    }
  }, [fetchMatches, params]);

  const filteredMatches = selectedCategory === 'all' 
    ? matches 
    : matches.filter(match => match.rules.category === selectedCategory);

  const triggeredRuleIds = matches.map(match => match.rule_id);

  return {
    rules,
    matches,
    loading,
    error,
    fetchRulesByCategory,
    fetchMatches,
    runRiskAssessment,
    totalRiskScore,
    riskMatches: matches,
    filteredMatches,
    allRules: rules,
    selectedCategory,
    setSelectedCategory,
    triggeredRuleIds
  };
};
