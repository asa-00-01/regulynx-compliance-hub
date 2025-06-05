
export type DateRange = '7days' | '30days' | '90days' | 'all';

export interface TransactionFilters {
  dateRange: DateRange;
  minAmount?: number;
  maxAmount?: number;
  countries?: string[];
  methods?: string[];
  onlyFlagged?: boolean;
}

export interface TransactionMetrics {
  totalTransactions: number;
  flaggedCount: number;
  highRiskUsers: Array<{
    userId: string;
    userName: string;
    totalRisk: number;
    count: number;
    averageRisk: number;
  }>;
  topCorridors: Array<{
    origin: string;
    destination: string;
    count: number;
  }>;
}
