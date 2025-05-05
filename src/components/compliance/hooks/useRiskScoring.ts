
import { useEffect, useState } from 'react';
import { 
  mockUsers, 
  COUNTRY_RISK, 
  RISK_WEIGHTS, 
  UserWithRiskScore,
  RiskDistributionItem 
} from '../types/riskScoringTypes';

export function useRiskScoring() {
  const [usersWithRiskScores, setUsersWithRiskScores] = useState<UserWithRiskScore[]>([]);
  const [riskDistribution, setRiskDistribution] = useState<RiskDistributionItem[]>([]);

  useEffect(() => {
    // Calculate risk scores for all users
    const scoredUsers = mockUsers.map(user => {
      // Country risk (0.1 to 0.9 based on country risk tier)
      const countryRisk = COUNTRY_RISK[user.country as keyof typeof COUNTRY_RISK] || COUNTRY_RISK.DEFAULT;
      
      // Transaction frequency risk (0.1 to 0.9 based on frequency)
      let frequencyRisk = 0.1;
      if (user.transactionFrequency > 5) frequencyRisk = 0.3;
      if (user.transactionFrequency > 10) frequencyRisk = 0.6;
      if (user.transactionFrequency > 15) frequencyRisk = 0.9;
      
      // Transaction amount risk (0.1 to 0.9 based on amount)
      let amountRisk = 0.1;
      if (user.transactionAmount > 5000) amountRisk = 0.3;
      if (user.transactionAmount > 10000) amountRisk = 0.6;
      if (user.transactionAmount > 20000) amountRisk = 0.9;
      
      // KYC status risk (0.1 to 0.9 based on verification status)
      let kycRisk = 0.1; // Verified
      if (user.kycStatus === 'pending') kycRisk = 0.5;
      if (user.kycStatus === 'rejected') kycRisk = 0.9;
      
      // Calculate weighted risk score (0-100)
      const weightedRiskScore = 
        (countryRisk * RISK_WEIGHTS.COUNTRY) +
        (frequencyRisk * RISK_WEIGHTS.TRANSACTION_FREQUENCY) +
        (amountRisk * RISK_WEIGHTS.TRANSACTION_AMOUNT) +
        (kycRisk * RISK_WEIGHTS.KYC_STATUS);
      
      // Convert to 0-100 scale
      const riskScore = Math.round(weightedRiskScore * 100);
      
      // Add a simulated previous score for trend visualization
      const previousScore = Math.max(0, Math.min(100, riskScore + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 10)));
      
      return {
        ...user,
        riskScore,
        previousScore,
        countryRisk: Math.round(countryRisk * 100),
        frequencyRisk: Math.round(frequencyRisk * 100),
        amountRisk: Math.round(amountRisk * 100),
        kycRisk: Math.round(kycRisk * 100)
      };
    });
    
    setUsersWithRiskScores(scoredUsers);
    
    // Calculate risk distribution
    const lowRisk = scoredUsers.filter(u => u.riskScore <= 30).length;
    const mediumRisk = scoredUsers.filter(u => u.riskScore > 30 && u.riskScore <= 70).length;
    const highRisk = scoredUsers.filter(u => u.riskScore > 70).length;
    
    setRiskDistribution([
      { name: 'Low Risk (0-30)', value: lowRisk, color: '#4caf50' },
      { name: 'Medium Risk (31-70)', value: mediumRisk, color: '#ff9800' },
      { name: 'High Risk (71-100)', value: highRisk, color: '#f44336' },
    ]);
    
  }, []);

  // Helper function for risk score CSS class
  const getRiskScoreClass = (score: number) => {
    if (score <= 30) return "bg-green-100 text-green-800";
    if (score <= 70) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return {
    usersWithRiskScores,
    riskDistribution,
    getRiskScoreClass
  };
}
