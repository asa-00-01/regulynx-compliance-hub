
import { useState, useCallback } from 'react';
import { riskEvaluationService } from '@/services/risk';
import { RiskAssessmentResult } from '@/types/risk';

export interface GlobalRiskAssessmentHook {
  assessment: RiskAssessmentResult | null;
  loading: boolean;
  error: string | null;
  runGlobalAssessment: () => Promise<RiskAssessmentResult | null>;
  clearAssessment: () => void;
}

export const useGlobalRiskAssessment = (): GlobalRiskAssessmentHook => {
  const [assessment, setAssessment] = useState<RiskAssessmentResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runGlobalAssessment = useCallback(async (): Promise<RiskAssessmentResult | null> => {
    setLoading(true);
    setError(null);

    try {
      // Mock global assessment - would integrate with actual service
      const result = await riskEvaluationService.evaluateCustomerRisk('global', {});
      const globalAssessment: RiskAssessmentResult = {
        ...result,
        total_risk_score: result.total_risk_score || result.score,
        risk_level: result.level,
        matched_rules: result.matched_rules || [],
        rule_categories: result.rule_categories || []
      };
      
      setAssessment(globalAssessment);
      return globalAssessment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to run global assessment';
      setError(errorMessage);
      console.error('Global risk assessment error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearAssessment = useCallback(() => {
    setAssessment(null);
    setError(null);
  }, []);

  return {
    assessment,
    loading,
    error,
    runGlobalAssessment,
    clearAssessment
  };
};
