
export type TransactionCurrency = 'SEK' | 'USD' | 'EUR' | 'GBP';
export type TransactionMethod = 'card' | 'bank' | 'cash' | 'mobile' | 'crypto';

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  currency: TransactionCurrency;
  timestamp: string;
  originCountry: string;
  destinationCountry: string;
  method: TransactionMethod;
  description?: string;
  riskScore: number;
  flagged: boolean;
}

export interface TransactionAlert {
  id: string;
  transactionId: string;
  userId: string;
  userName: string;
  type: 'high_value' | 'suspicious_pattern' | 'high_risk_country' | 'structuring' | 'frequency';
  description: string;
  timestamp: string;
  status: 'open' | 'investigating' | 'closed';
  assignedTo?: string;
  notes?: string[];
}

// Rules for risk scoring
export interface RiskRule {
  id: string;
  name: string;
  description: string;
  riskFactor: number; // 0-100
  evaluate: (transaction: Transaction, history: Transaction[]) => boolean;
}
