
export interface RiskFactor {
  name: string;
  value: number;
  weight: number;
}

export interface RiskEvaluation {
  score: number;
  level: 'low' | 'medium' | 'high' | 'critical';
  factors: RiskFactor[];
  timestamp: Date;
}

export const evaluateUserRisk = (userId: string, factors: RiskFactor[]): RiskEvaluation => {
  const score = factors.reduce((total, factor) => {
    return total + (factor.value * factor.weight);
  }, 0);

  let level: 'low' | 'medium' | 'high' | 'critical';
  if (score >= 80) level = 'critical';
  else if (score >= 60) level = 'high';
  else if (score >= 40) level = 'medium';
  else level = 'low';

  return {
    score,
    level,
    factors,
    timestamp: new Date()
  };
};

export const evaluateTransactionRisk = (transactionData: any): RiskEvaluation => {
  const factors: RiskFactor[] = [
    { name: 'amount', value: transactionData.amount > 10000 ? 70 : 20, weight: 1 },
    { name: 'frequency', value: transactionData.frequency > 10 ? 80 : 30, weight: 0.8 },
    { name: 'location', value: transactionData.highRiskCountry ? 90 : 10, weight: 0.9 }
  ];

  return evaluateUserRisk(transactionData.userId, factors);
};
