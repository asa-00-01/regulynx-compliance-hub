
export type SARStatus = 'draft' | 'submitted' | 'reviewed';

export interface SAR {
  id: string;
  userId: string;
  userName: string;
  dateSubmitted: string;
  dateOfActivity: string;
  status: SARStatus;
  summary: string;
  transactions: string[]; // Transaction IDs
  documents?: string[]; // Document IDs or paths
  notes?: string[];
}

export interface PatternMatch {
  id: string;
  patternId: string;
  userId: string;
  userName: string;
  transactionId: string;
  country: string;
  amount: number;
  currency: string;
  timestamp: string;
}

export interface Pattern {
  id: string;
  name: string;
  description: string;
  matchCount: number;
  category: 'structuring' | 'high_risk_corridor' | 'time_pattern' | 'other';
}
