
export interface AMLTransaction {
  id: string;
  senderUserId: string;
  receiverUserId: string;
  senderName: string;
  receiverName: string;
  senderAmount: number;
  senderCurrency: string;
  receiverAmount: number;
  receiverCurrency: string;
  method: string;
  status: string;
  timestamp: string;
  senderCountryCode: string;
  receiverCountryCode: string;
  riskScore: number;
  isSuspect: boolean;
  flagged?: boolean;
  reasonForSending: string;
  notes?: string;
}

export interface AMLTransactionFilters {
  dateRange: { from: Date | null; to: Date | null };
  amountRange: { min: number | null; max: number | null };
  currency: string;
  method: string;
  riskLevel: string;
  country: string;
  status: string;
  searchTerm: string;
}

export interface HighRiskCountry {
  countryCode: string;
  name: string;
  riskLevel: 'high' | 'medium' | 'low';
}

export const HIGH_RISK_COUNTRIES: HighRiskCountry[] = [
  { countryCode: 'AF', name: 'Afghanistan', riskLevel: 'high' },
  { countryCode: 'IR', name: 'Iran', riskLevel: 'high' },
  { countryCode: 'KP', name: 'North Korea', riskLevel: 'high' },
  { countryCode: 'SY', name: 'Syria', riskLevel: 'high' },
  { countryCode: 'VE', name: 'Venezuela', riskLevel: 'high' },
];

export interface DetectedPattern {
  id: string;
  type: string;
  name: string;
  description: string;
  riskScore: number;
  confidence: number;
  transactionIds: string[];
  category: 'structuring' | 'high_risk_corridor' | 'time_pattern' | 'velocity';
  severity: 'low' | 'medium' | 'high';
  matchCount: number;
  lastDetected: string;
  transactions: AMLTransaction[];
}
