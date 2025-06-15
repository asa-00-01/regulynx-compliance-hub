
import { useState, useEffect } from 'react';
import { evaluateTransactionRisk, evaluateUserRisk, getRiskMatchesForEntity } from '@/services/risk';
import { AMLTransaction } from '@/types/aml';
import { UnifiedUserData } from '@/context/compliance/types';
import { RiskAssessmentResult } from '@/types/risk';

// This is the unified hook that should be used for both transactions and users
export function useRiskScoringUnified(entity: AMLTransaction | UnifiedUserData | null) {
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessmentResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAssessment = async () => {
    if (!entity) return;

    setLoading(true);
    setError(null);

    try {
      let result: RiskAssessmentResult;
      
      if ('senderUserId' in entity) {
        // It's a transaction
        result = await evaluateTransactionRisk(entity as AMLTransaction);
      } else {
        // It's a user
        result = await evaluateUserRisk(entity as UnifiedUserData);
      }

      setRiskAssessment(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Risk assessment error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadExistingMatches = async () => {
    if (!entity) return;

    setLoading(true);
    setError(null);

    try {
      const entityId = entity.id;
      const entityType = 'senderUserId' in entity ? 'transaction' : 'user';
      
      const matches = await getRiskMatchesForEntity(entityId, entityType);
      
      const matchedRules = matches.map(match => ({
        rule_id: match.rule_id,
        rule_name: match.rules?.rule_name || match.rule_id,
        risk_score: match.rules?.risk_score || 0,
        category: match.rules?.category || 'unknown',
        description: match.rules?.description || '',
        match_data: match.match_data,
      }));

      const totalScore = matchedRules.reduce((sum, rule) => sum + rule.risk_score, 0);
      const categories = [...new Set(matchedRules.map(r => r.category))];

      setRiskAssessment({
        total_risk_score: Math.min(totalScore, 100),
        matched_rules: matchedRules,
        rule_categories: categories,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error loading existing matches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (entity) {
      loadExistingMatches();
    } else {
      setRiskAssessment(null);
    }
  }, [entity]);

  return {
    riskAssessment,
    loading,
    error,
    runAssessment,
    loadExistingMatches,
  };
}
