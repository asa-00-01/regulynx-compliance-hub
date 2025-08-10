
import { useState, useEffect } from 'react';
import { riskEvaluationService } from '@/services/risk/riskEvaluationService';
import { RiskFactor, RiskAssessmentResult } from '@/types/risk';

interface KYCMonitoringData {
  totalUsers: number;
  pendingVerifications: number;
  riskAlerts: number;
  averageProcessingTime: number;
  recentRiskAssessments: RiskAssessmentResult[];
}

export const useKYCMonitoring = () => {
  const [data, setData] = useState<KYCMonitoringData>({
    totalUsers: 0,
    pendingVerifications: 0,
    riskAlerts: 0,
    averageProcessingTime: 0,
    recentRiskAssessments: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKYCData = async () => {
      try {
        // Mock data - in real implementation, fetch from API
        const mockAssessments: RiskAssessmentResult[] = [];
        
        for (let i = 0; i < 5; i++) {
          const factors: RiskFactor[] = [
            { name: 'Identity Verification', value: Math.random() * 100, weight: 0.3 },
            { name: 'Document Quality', value: Math.random() * 100, weight: 0.2 },
            { name: 'Address Verification', value: Math.random() * 100, weight: 0.2 }
          ];

          // Use the service to evaluate customer risk with proper parameters
          const evaluation = await riskEvaluationService.evaluateCustomerRisk(`customer_${i}`);
          
          const assessmentResult: RiskAssessmentResult = {
            ...evaluation,
            total_risk_score: evaluation.total_risk_score || evaluation.score,
            risk_level: evaluation.risk_level || evaluation.level,
            matched_rules: evaluation.matched_rules || [],
            rule_categories: evaluation.rule_categories || []
          };

          mockAssessments.push(assessmentResult);
        }

        setData({
          totalUsers: 1250,
          pendingVerifications: 45,
          riskAlerts: 12,
          averageProcessingTime: 24,
          recentRiskAssessments: mockAssessments
        });
      } catch (error) {
        console.error('Error fetching KYC monitoring data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchKYCData();
  }, []);

  return { data, loading };
};
