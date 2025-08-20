
import { useState, useMemo } from 'react';
import { AMLTransaction } from '@/types/aml';

export interface AMLFilters {
  status: string[];
  riskLevels: string[];
  amountRange: {
    min: number;
    max: number;
  };
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  countries: string[];
  currencies: string[];
  searchQuery: string;
}

const defaultFilters: AMLFilters = {
  status: [],
  riskLevels: [],
  amountRange: {
    min: 0,
    max: 1000000
  },
  dateRange: {
    start: null,
    end: null
  },
  countries: [],
  currencies: [],
  searchQuery: ''
};

export const useAMLFilters = (transactions: AMLTransaction[]) => {
  const [filters, setFilters] = useState<AMLFilters>(defaultFilters);
  const [searchTerm, setSearchTerm] = useState('');

  const updateFilters = (newFilters: Partial<AMLFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
    setSearchTerm('');
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(transaction.status)) {
        return false;
      }

      // Risk level filter
      if (filters.riskLevels.length > 0) {
        const riskLevel = transaction.riskScore > 75 ? 'high' : 
                         transaction.riskScore > 50 ? 'medium' : 'low';
        if (!filters.riskLevels.includes(riskLevel)) {
          return false;
        }
      }

      // Amount range filter - using totalAmount property
      if (transaction.totalAmount < filters.amountRange.min || 
          transaction.totalAmount > filters.amountRange.max) {
        return false;
      }

      // Date range filter - using timestamp property
      if (filters.dateRange.start || filters.dateRange.end) {
        const transactionDate = new Date(transaction.timestamp);
        if (filters.dateRange.start && transactionDate < filters.dateRange.start) {
          return false;
        }
        if (filters.dateRange.end && transactionDate > filters.dateRange.end) {
          return false;
        }
      }

      // Currency filter
      if (filters.currencies.length > 0 && 
          !filters.currencies.includes(transaction.senderCurrency)) {
        return false;
      }

      // Country filter
      if (filters.countries.length > 0 && 
          !filters.countries.includes(transaction.senderCountryCode) &&
          !filters.countries.includes(transaction.receiverCountryCode)) {
        return false;
      }

      // Search query filter
      if (filters.searchQuery || searchTerm) {
        const query = (filters.searchQuery || searchTerm).toLowerCase();
        const searchableText = [
          transaction.id,
          transaction.senderName,
          transaction.receiverName,
          transaction.senderCurrency,
          transaction.receiverCurrency
        ].join(' ').toLowerCase();
        
        if (!searchableText.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [transactions, filters, searchTerm]);

  return {
    filters,
    setFilters: updateFilters,
    searchTerm,
    setSearchTerm,
    filteredTransactions,
    updateFilters,
    clearFilters
  };
};
