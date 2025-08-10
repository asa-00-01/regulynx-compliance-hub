
export interface RiskFactor {
  name: string;
  value: number;
  weight: number;
  description?: string;
}

export interface RiskEvaluation {
  id: string;
  score: number;
  level: 'low' | 'medium' | 'high' | 'critical';
  factors: RiskFactor[];
  userId?: string;
  customer_id?: string;
  total_risk_score?: number;
  risk_level?: 'low' | 'medium' | 'high' | 'critical';
  created_at?: string;
  updated_at?: string;
  matched_rules?: string[];
  rule_categories?: string[];
}

export interface RiskAssessmentResult extends RiskEvaluation {}

class RiskEvaluationService {
  async evaluateCustomerRisk(customerId: string, transactionData?: any): Promise<RiskEvaluation> {
    // Mock implementation for now
    const riskFactors: RiskFactor[] = [
      {
        name: 'Transaction Volume',
        value: 75,
        weight: 0.3,
        description: 'High transaction volume detected'
      },
      {
        name: 'Geographic Risk',
        value: 45,
        weight: 0.2,
        description: 'Transactions from medium-risk countries'
      }
    ];

    const totalScore = riskFactors.reduce((sum, factor) => sum + (factor.value * factor.weight), 0);
    
    return {
      id: `risk_${Date.now()}`,
      customer_id: customerId,
      score: Math.round(totalScore),
      total_risk_score: Math.round(totalScore),
      level: this.getRiskLevel(totalScore),
      risk_level: this.getRiskLevel(totalScore),
      factors: riskFactors,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      matched_rules: ['high_volume', 'geo_risk'],
      rule_categories: ['transaction', 'geographic']
    };
  }

  private getRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 80) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  }

  async evaluateTransactionRisk(transactionId: string, additionalContext?: any): Promise<RiskEvaluation> {
    // Mock implementation
    return this.evaluateCustomerRisk(`customer_${transactionId}`, additionalContext);
  }
}

export const riskEvaluationService = new RiskEvaluationService();

// Export individual functions for backward compatibility
export const evaluateUserRisk = (userId: string, factors: RiskFactor[]) => {
  const totalScore = factors.reduce((sum, factor) => sum + (factor.value * factor.weight), 0);
  return {
    id: `risk_${Date.now()}`,
    userId,
    score: Math.round(totalScore),
    level: totalScore >= 80 ? 'critical' : totalScore >= 60 ? 'high' : totalScore >= 40 ? 'medium' : 'low' as 'low' | 'medium' | 'high' | 'critical',
    factors
  };
};

export const evaluateTransactionRisk = (transactionData: any) => {
  let score = 0;
  if (transactionData.amount > 10000) score += 30;
  if (transactionData.frequency > 10) score += 25;
  if (transactionData.highRiskCountry) score += 50;
  
  return {
    id: `transaction_risk_${Date.now()}`,
    score,
    level: score >= 80 ? 'critical' : score >= 60 ? 'high' : score >= 40 ? 'medium' : 'low' as 'low' | 'medium' | 'high' | 'critical',
    factors: []
  };
};
