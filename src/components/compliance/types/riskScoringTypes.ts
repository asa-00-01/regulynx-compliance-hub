
// Risk factor weights (should be configurable in a real system)
export const RISK_WEIGHTS = {
  COUNTRY: 0.35,
  TRANSACTION_FREQUENCY: 0.25,
  TRANSACTION_AMOUNT: 0.30,
  KYC_STATUS: 0.10,
};

// Country risk tiers
export const COUNTRY_RISK = {
  'United States': 0.1,
  'Sweden': 0.1,
  'Norway': 0.1,
  'Finland': 0.1,
  'Denmark': 0.1,
  'Germany': 0.2,
  'United Kingdom': 0.2,
  'France': 0.2,
  'Spain': 0.3,
  'Canada': 0.1,
  'China': 0.4,
  'India': 0.3,
  'Poland': 0.2,
  'Brazil': 0.4,
  'Turkey': 0.6,
  'Russia': 0.7,
  'Colombia': 0.8,
  'Egypt': 0.5,
  'United Arab Emirates': 0.4,
  'Saudi Arabia': 0.6,
  // Default for unlisted countries
  'DEFAULT': 0.5
};

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
