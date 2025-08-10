
export { 
  riskEvaluationService, 
  evaluateUserRisk, 
  evaluateTransactionRisk,
  type RiskFactor,
  type RiskEvaluation,
  type RiskAssessmentResult
} from './riskEvaluationService';

// Additional mock exports for compatibility
export const getRulesByCategory = async (category: string) => {
  return [
    {
      id: `rule_${category}_1`,
      rule_id: `${category}_rule_001`,
      rule_name: `${category.charAt(0).toUpperCase() + category.slice(1)} Risk Rule`,
      description: `Mock rule for ${category} category`,
      condition: { threshold: 50 },
      risk_score: 25,
      category,
      is_active: true
    }
  ];
};

export const getRiskMatchesForEntity = async (entityId: string, entityType: 'user' | 'transaction') => {
  return [
    {
      rule_id: `${entityType}_rule_001`,
      rule_name: `High ${entityType} Risk`,
      risk_score: 75,
      category: entityType === 'user' ? 'kyc' : 'transaction',
      description: `High risk detected for ${entityType}`,
      match_data: { entityId, entityType }
    }
  ];
};
