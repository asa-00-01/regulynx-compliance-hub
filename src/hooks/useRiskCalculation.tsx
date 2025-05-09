
import { useState, useEffect } from 'react';

// Define high risk countries
export const HIGH_RISK_COUNTRIES = [
  { countryName: 'Iran', riskLevel: 'high' },
  { countryName: 'Somalia', riskLevel: 'high' },
  { countryName: 'Russia', riskLevel: 'high' }
];

// Mock transaction data (in a real app, this would come from an API)
const mockTransactionData = {
  getTransactionCount: (userId: string): number => {
    // Mock logic - return random number between 1 and 20
    return Math.floor(Math.random() * 20) + 1;
  },
  getRecentTransactionAmount: (userId: string): number => {
    // Mock logic - return random amount between 1000 and 50000
    return Math.floor(Math.random() * 49000) + 1000;
  },
  getTransactionCountries: (userId: string): string[] => {
    // Mock list of countries from random transactions
    const countries = ['Sweden', 'Norway', 'Russia', 'Germany', 'Iran', 'Somalia', 'USA'];
    // Return 1-3 random countries
    const count = Math.floor(Math.random() * 3) + 1;
    const result = [];
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * countries.length);
      result.push(countries[randomIndex]);
    }
    return result;
  }
};

export interface UserRiskData {
  userId: string;
  riskScore: number;
  transactionCount: number;
  recentTransactionAmount: number;
  transactionCountries: string[];
  missingKYCFields: string[];
  riskFactors: {
    highAmount: boolean;
    highRiskCountry: boolean;
    highFrequency: boolean;
    incompleteKYC: boolean;
  };
}

// Create and export the hook to calculate user risk data
export const useRiskCalculation = (userId: string, userFlags?: any) => {
  const [riskData, setRiskData] = useState<UserRiskData | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const calculateRiskData = () => {
      // Fetch mock data
      const transactionCount = mockTransactionData.getTransactionCount(userId);
      const recentTransactionAmount = mockTransactionData.getRecentTransactionAmount(userId);
      const transactionCountries = mockTransactionData.getTransactionCountries(userId);
      
      // In a real app, we'd check user data from props or a context
      // For now, we'll create mock missing KYC fields
      const missingKYCFields = ['Phone Number', 'Address'].filter(() => Math.random() > 0.5);
      
      if (!userFlags?.is_email_confirmed) {
        missingKYCFields.push('Email Confirmation');
      }
      
      // Calculate risk factors
      const riskFactors = {
        highAmount: recentTransactionAmount > 10000,
        highRiskCountry: transactionCountries.some(country => 
          HIGH_RISK_COUNTRIES.some(riskCountry => 
            riskCountry.countryName === country && riskCountry.riskLevel === 'high'
          )
        ),
        highFrequency: transactionCount > 10,
        incompleteKYC: missingKYCFields.length > 0
      };
      
      // Calculate risk score based on risk factors
      let riskScore = 0;
      if (riskFactors.highAmount) riskScore += 40;
      if (riskFactors.highRiskCountry) riskScore += 30;
      if (riskFactors.highFrequency) riskScore += 20;
      if (riskFactors.incompleteKYC) riskScore += 10;
      
      // Add slight randomization (+/- 5 points)
      riskScore += Math.floor(Math.random() * 10) - 5;
      
      // Ensure score is within 0-100 range
      riskScore = Math.max(0, Math.min(100, riskScore));
      
      setRiskData({
        userId,
        riskScore,
        transactionCount,
        recentTransactionAmount,
        transactionCountries,
        missingKYCFields,
        riskFactors
      });
      
      setLoading(false);
    };
    
    calculateRiskData();
  }, [userId, userFlags]);
  
  return { riskData, loading };
};

// Helper function to calculate risk data synchronously (for components that can't use hooks directly)
export const calculateUserRiskData = (user: any): UserRiskData => {
  // Mock transaction data
  const transactionCount = mockTransactionData.getTransactionCount(user.id);
  const recentTransactionAmount = mockTransactionData.getRecentTransactionAmount(user.id);
  const transactionCountries = mockTransactionData.getTransactionCountries(user.id);
  
  // Check for missing KYC fields
  const missingKYCFields = [];
  if (!user.phoneNumber) missingKYCFields.push('Phone Number');
  if (!user.address) missingKYCFields.push('Address');
  if (!user.identityNumber) missingKYCFields.push('Identity Number');
  if (user.flags && !user.flags.is_email_confirmed) missingKYCFields.push('Email Confirmation');
  
  // Calculate risk factors
  const riskFactors = {
    highAmount: recentTransactionAmount > 10000,
    highRiskCountry: transactionCountries.some(country => 
      HIGH_RISK_COUNTRIES.some(riskCountry => 
        riskCountry.countryName === country && riskCountry.riskLevel === 'high'
      )
    ),
    highFrequency: transactionCount > 10,
    incompleteKYC: missingKYCFields.length > 0
  };
  
  // Calculate risk score based on risk factors
  let riskScore = 0;
  if (riskFactors.highAmount) riskScore += 40;
  if (riskFactors.highRiskCountry) riskScore += 30;
  if (riskFactors.highFrequency) riskScore += 20;
  if (riskFactors.incompleteKYC) riskScore += 10;
  
  // Add slight randomization (+/- 5 points)
  riskScore += Math.floor(Math.random() * 10) - 5;
  
  // Ensure score is within 0-100 range
  riskScore = Math.max(0, Math.min(100, riskScore));
  
  return {
    userId: user.id,
    riskScore,
    transactionCount,
    recentTransactionAmount,
    transactionCountries,
    missingKYCFields,
    riskFactors
  };
};
