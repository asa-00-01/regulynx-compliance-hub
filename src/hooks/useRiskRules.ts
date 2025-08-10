
import { useState, useEffect, useCallback } from 'react';
import { getRulesByCategory, getRiskMatchesForEntity } from '@/services/risk';
import { RiskRule, RiskMatchDisplay } from '@/types/risk';

export interface RiskRulesHook {
  rules: RiskRule[];
  matches: RiskMatchDisplay[];
  loading: boolean;
  error: string | null;
  fetchRulesByCategory: (category: string) => Promise<void>;
  fetchMatches: (entityId: string, entityType: 'user' | 'transaction') => Promise<void>;
  runRiskAssessment: (entityId: string, entityType: 'user' | 'transaction') => Promise<void>;
}

export const useRiskRules = (): RiskRulesHook => {
  const [rules, setRules] = useState<RiskRule[]>([]);
  const [matches, setMatches] = useState<RiskMatchDisplay[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        entity_id: match.match_data.entityId,
        entity_type: match.match_data.entityType,
        matched_at: new Date().toISOString(),
        rules: [{
          rule_id: match.rule_id,
          rule_name: match.rule_name,
          risk_score: match.risk_score,
          category: match.category,
          description: match.description
        }]
      }));
      
      setMatches(displayMatches);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch matches');
    } finally {
      setLoading(false);
    }
  }, []);

  const runRiskAssessment = useCallback(async (entityId: string, entityType: 'user' | 'transaction') => {
    await fetchMatches(entityId, entityType);
  }, [fetchMatches]);

  return {
    rules,
    matches,
    loading,
    error,
    fetchRulesByCategory,
    fetchMatches,
    runRiskAssessment
  };
};
