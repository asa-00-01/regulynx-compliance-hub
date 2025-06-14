
import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AMLTransaction } from '@/types/aml';

interface AMLFilters {
  dateRange: string;
  riskLevel: string;
  status: string;
  amountRange: string;
  userId: string;
  onlyFlagged: boolean;
}

export const useAMLFilters = (transactions: AMLTransaction[]) => {
  const [searchParams] = useSearchParams();
  const userIdFromParams = searchParams.get('userId');
  
  const [filters, setFilters] = useState<AMLFilters>({
    dateRange: '30days',
    riskLevel: 'all',
    status: 'all',
    amountRange: 'all',
    userId: userIdFromParams || '',
    onlyFlagged: false
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Filter transactions based on current filters
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      // User filter
      if (filters.userId && transaction.senderUserId !== filters.userId) {
        return false;
      }
      
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          transaction.id.toLowerCase().includes(searchLower) ||
          transaction.senderName.toLowerCase().includes(searchLower) ||
          transaction.receiverName?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }
      
      // Risk level filter
      if (filters.riskLevel !== 'all') {
        const riskScore = transaction.riskScore;
        switch (filters.riskLevel) {
          case 'low':
            if (riskScore >= 30) return false;
            break;
          case 'medium':
            if (riskScore < 30 || riskScore >= 70) return false;
            break;
          case 'high':
            if (riskScore < 70) return false;
            break;
        }
      }
      
      // Status filter
      if (filters.status !== 'all' && transaction.status !== filters.status) {
        return false;
      }
      
      // Amount range filter
      if (filters.amountRange !== 'all') {
        const amount = transaction.senderAmount;
        switch (filters.amountRange) {
          case 'small':
            if (amount >= 1000) return false;
            break;
          case 'medium':
            if (amount < 1000 || amount >= 10000) return false;
            break;
          case 'large':
            if (amount < 10000) return false;
            break;
        }
      }
      
      return true;
    });
  }, [transactions, filters, searchTerm]);

  return {
    filters,
    searchTerm,
    filteredTransactions,
    setFilters,
    setSearchTerm,
  };
};
