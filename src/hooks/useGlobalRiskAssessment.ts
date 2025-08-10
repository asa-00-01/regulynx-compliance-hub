
import { useState, useEffect } from 'react';
import { UnifiedUserData } from '@/context/compliance/types';
import { AMLTransaction } from '@/types/aml';
import { riskEvaluationService, RiskAssessmentResult } from '@/services/risk';

interface GlobalRiskAssessmentHook {
  assessments: RiskAssessmentResult[];
  loading: boolean;
  error: string | null;
  runGlobalAssessment: () => Promise<void>;
  assessEntity: (entity: UnifiedUserData | AMLTransaction) => Promise<RiskAssessmentResult | null>;
  getHighRiskEntities: () => RiskAssessmentResult[];
  refreshAssessments: () => Promise<void>;
}

export const useGlobalRiskAssessment = (): GlobalRiskAssessmentHook => {
  const [assessments, setAssessments] = useState<RiskAssessmentResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runGlobalAssessment = async () => {
    setLoading(true);
    setError(null);

    try {
      // Mock global assessment - in real implementation, this would assess all entities
      const mockAssessments: RiskAssessmentResult[] = [
        {
          id: 'assessment_1',
          customer_id: 'customer_1',
          score: 85,
          total_risk_score: 85,
          level: 'critical',
          risk_level: 'critical',
          factors: [
            { name: 'High Transaction Volume', value: 90, weight: 0.4 },
            { name: 'Suspicious Pattern', value: 80, weight: 0.6 }
          ],
          matched_rules: ['high_volume', 'suspicious_pattern'],
          rule_categories: ['transaction', 'behavioral'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      setAssessments(mockAssessments);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run global assessment');
    } finally {
      setLoading(false);
    }
  };

  const assessEntity = async (entity: UnifiedUserData | AMLTransaction): Promise<RiskAssessmentResult | null> => {
    try {
      if ('senderAmount' in entity) {
        return await riskEvaluationService.evaluateTransactionRisk(entity.id, entity);
      } else {
        return await riskEvaluationService.evaluateCustomerRisk(entity.id, entity);
      }
    } catch (err) {
      console.error('Failed to assess entity:', err);
      return null;
    }
  };

  const getHighRiskEntities = (): RiskAssessmentResult[] => {
    return assessments.filter(assessment => 
      (assessment.total_risk_score || assessment.score) >= 70
    );
  };

  const refreshAssessments = async () => {
    await runGlobalAssessment();
  };

  useEffect(() => {
    runGlobalAssessment();
  }, []);

  return {
    assessments,
    loading,
    error,
    runGlobalAssessment,
    assessEntity,
    getHighRiskEntities,
    refreshAssessments,
  };
};
