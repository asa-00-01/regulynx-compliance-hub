
import { useState } from 'react';
import { AMLTransaction } from '@/types/aml';
import { UnifiedUserData } from '@/context/compliance/types';
import { RiskAssessmentResult } from '@/types/risk';
import { riskEvaluationService } from '@/services/risk';

export const useRiskScoring = (entity?: AMLTransaction | UnifiedUserData) => {
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessmentResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAssessment = async () => {
    if (!entity) return;

    setLoading(true);
    setError(null);

    try {
      let assessment: RiskAssessmentResult;

      if ('senderAmount' in entity) {
        // It's a transaction
        assessment = await riskEvaluationService.evaluateTransactionRisk(entity.id, entity);
      } else {
        // It's a user
        assessment = await riskEvaluationService.evaluateCustomerRisk(entity.id, entity);
      }

      setRiskAssessment(assessment);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run risk assessment');
      console.error('Risk assessment error:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetAssessment = () => {
    setRiskAssessment(null);
    setError(null);
  };

  const updateRiskScore = (newScore: number) => {
    if (riskAssessment) {
      setRiskAssessment({
        ...riskAssessment,
        total_risk_score: newScore,
        score: newScore
      });
    }
  };

  const addRiskFactor = (factor: any) => {
    if (riskAssessment) {
      const updatedFactors = [...(riskAssessment.factors || []), factor];
      setRiskAssessment({
        ...riskAssessment,
        factors: updatedFactors
      });
    }
  };

  const removeRiskFactor = (factorId: string) => {
    if (riskAssessment && riskAssessment.factors) {
      const updatedFactors = riskAssessment.factors.filter(f => f.name !== factorId);
      setRiskAssessment({
        ...riskAssessment,
        factors: updatedFactors
      });
    }
  };

  const getMatchedRuleIds = (): string[] => {
    return riskAssessment?.matched_rules || [];
  };

  return {
    riskAssessment,
    loading,
    error,
    runAssessment,
    resetAssessment,
    updateRiskScore,
    addRiskFactor,
    removeRiskFactor,
    getMatchedRuleIds,
  };
};
