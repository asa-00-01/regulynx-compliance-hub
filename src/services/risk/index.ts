
export { riskEvaluationService } from './riskEvaluationService';
export { evaluateUserRisk, evaluateTransactionRisk } from './riskEvaluationService';
export type { RiskEvaluation, RiskFactor, RiskAssessmentResult } from './riskEvaluationService';

// Mock implementations for missing functions
export const getRulesByCategory = async (category: string) => {
  return [];
};

export const getRiskMatchesForEntity = async (entityId: string, entityType: 'user' | 'transaction') => {
  return [];
};
