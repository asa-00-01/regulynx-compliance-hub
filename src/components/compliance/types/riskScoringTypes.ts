
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

// Mock user data with risk factors
export const mockUsers = [
  {
    id: '1',
    name: 'John Doe',
    country: 'Sweden',
    transactionFrequency: 5, // per month
    transactionAmount: 3000, // SEK
    kycStatus: 'verified',
  },
  {
    id: '2',
    name: 'Jane Smith',
    country: 'Denmark',
    transactionFrequency: 8,
    transactionAmount: 7500,
    kycStatus: 'pending',
  },
  {
    id: '3',
    name: 'Ahmed Hassan',
    country: 'Turkey',
    transactionFrequency: 12,
    transactionAmount: 15000,
    kycStatus: 'pending',
  },
  {
    id: '4',
    name: 'Sofia Rodriguez',
    country: 'Colombia',
    transactionFrequency: 3,
    transactionAmount: 12000,
    kycStatus: 'rejected',
  },
  {
    id: '5',
    name: 'Alexander Petrov',
    country: 'Russia',
    transactionFrequency: 15,
    transactionAmount: 25000,
    kycStatus: 'verified',
  },
];

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
