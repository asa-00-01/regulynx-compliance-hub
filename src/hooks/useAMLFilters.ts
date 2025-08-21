
import { useState, useMemo } from 'react';
import { AMLTransaction } from '@/types/aml';

export interface AMLFilters {
  search: string;
  status: string[];
  riskScore: [number, number];
  amountRange: [number, number];
  dateRange: {
    from?: Date;
    to?: Date;
  };
  flags: string[];
}

export const useAMLFilters = (transactions: AMLTransaction[]) => {
  const [filters, setFilters] = useState<AMLFilters>({
    search: '',
    status: [],
    riskScore: [0, 100],
    amountRange: [0, 1000000],
    dateRange: {},
    flags: []
  });

  const [searchTerm, setSearchTerm] = useState('');

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      // Search filter
      if (filters.search && !transaction.id?.toLowerCase().includes(filters.search.toLowerCase()) &&
          !transaction.fromAccount?.toLowerCase().includes(filters.search.toLowerCase()) &&
          !transaction.toAccount?.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }

      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(transaction.status)) {
        return false;
      }

      // Risk score filter
      if (transaction.riskScore < filters.riskScore[0] || transaction.riskScore > filters.riskScore[1]) {
        return false;
      }

      // Amount range filter
      if (transaction.transactionAmount < filters.amountRange[0] || transaction.transactionAmount > filters.amountRange[1]) {
        return false;
      }

      // Date range filter
      if (filters.dateRange.from && new Date(transaction.transactionDate) < filters.dateRange.from) {
        return false;
      }
      if (filters.dateRange.to && new Date(transaction.transactionDate) > filters.dateRange.to) {
        return false;
      }

      // Flags filter
      if (filters.flags.length > 0 && !filters.flags.some(flag => transaction.suspiciousFlags?.includes(flag))) {
        return false;
      }

      return true;
    });
  }, [transactions, filters]);

  return {
    filters,
    setFilters,
    searchTerm,
    setSearchTerm,
    filteredTransactions,
    totalCount: transactions.length,
    filteredCount: filteredTransactions.length
  };
};
