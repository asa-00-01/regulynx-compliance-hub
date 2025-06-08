// Risk factor weights (should be configurable in a real system)
export const RISK_WEIGHTS = {
  COUNTRY: 0.35,
  TRANSACTION_FREQUENCY: 0.25,
  TRANSACTION_AMOUNT: 0.30,
  KYC_STATUS: 0.10,
};

// Country risk tiers
export const COUNTRY_RISK = {
  'Sweden': 0.1,
  'Norway': 0.1,
  'Finland': 0.1,
  'Denmark': 0.1,
  'Germany': 0.2,
  'UK': 0.2,
  'France': 0.2,
  'Spain': 0.3,
  'Turkey': 0.6,
  'Russia': 0.7,
  'Colombia': 0.8,
  'Nigeria': 0.9,
  // Default for unlisted countries
  'DEFAULT': 0.5
};

// Transform centralized data to risk scoring format
import { unifiedMockData } from '@/mocks/centralizedMockData';
export const mockUsers = unifiedMockData.map(user => ({
  id: user.id,
  name: user.fullName,
  country: user.countryOfResidence || 'Unknown',
  transactionFrequency: user.transactions.length,
  transactionAmount: user.transactions.reduce((sum, tx) => sum + tx.senderAmount, 0) / Math.max(1, user.transactions.length),
  kycStatus: user.kycStatus,
}));

export type UserWithRiskScore = {
  id: string;
  name: string;
  country: string;
  transactionFrequency: number;
  transactionAmount: number;
  kycStatus: string;
  riskScore: number;
  previousScore?: number;
  countryRisk: number;
  frequencyRisk: number;
  amountRisk: number;
  kycRisk: number;
};

// Define a type for the risk distribution data that includes the color property
export type RiskDistributionItem = {
  name: string;
  value: number;
  color: string;
};
