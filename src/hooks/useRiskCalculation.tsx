
import { HIGH_RISK_COUNTRIES } from '@/types/aml';

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

// No longer export useRiskCalculation hook since we've moved the logic into the components
