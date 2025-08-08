
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

/**
 * Manages AML transaction filtering logic including search parameters and filter application.
 * Provides filtered transaction results based on various criteria.
 */
export const useAMLFilters = (transactionsList: AMLTransaction[]) => {
  const [searchParams] = useSearchParams();
  const userIdFromSearchParams = searchParams.get('userId');
  
  const [activeFilters, setActiveFilters] = useState<AMLFilters>({
    dateRange: '30days',
    riskLevel: 'all',
    status: 'all',
    amountRange: 'all',
    userId: userIdFromSearchParams || '',
    onlyFlagged: false
  });
  const [currentSearchTerm, setCurrentSearchTerm] = useState('');

  /**
   * Applies user ID filter to transactions
   */
  const filterByUserId = (transaction: AMLTransaction): boolean => {
    if (!activeFilters.userId) return true;
    return transaction.senderUserId === activeFilters.userId;
  };

  /**
   * Applies search term filter to transactions
   */
  const filterBySearchTerm = (transaction: AMLTransaction): boolean => {
    if (!currentSearchTerm) return true;
    
    const searchTermLowerCase = currentSearchTerm.toLowerCase();
    const matchesTransactionId = transaction.id.toLowerCase().includes(searchTermLowerCase);
    const matchesSenderName = transaction.senderName.toLowerCase().includes(searchTermLowerCase);
    const matchesReceiverName = transaction.receiverName?.toLowerCase().includes(searchTermLowerCase);
    
    return matchesTransactionId || matchesSenderName || matchesReceiverName;
  };

  /**
   * Applies risk level filter to transactions
   */
  const filterByRiskLevel = (transaction: AMLTransaction): boolean => {
    if (activeFilters.riskLevel === 'all') return true;
    
    const transactionRiskScore = transaction.riskScore;
    
    switch (activeFilters.riskLevel) {
      case 'low':
        return transactionRiskScore < 30;
      case 'medium':
        return transactionRiskScore >= 30 && transactionRiskScore < 70;
      case 'high':
        return transactionRiskScore >= 70;
      default:
        return true;
    }
  };

  /**
   * Applies status filter to transactions
   */
  const filterByStatus = (transaction: AMLTransaction): boolean => {
    return activeFilters.status === 'all' || transaction.status === activeFilters.status;
  };

  /**
   * Applies amount range filter to transactions
   */
  const filterByAmountRange = (transaction: AMLTransaction): boolean => {
    if (activeFilters.amountRange === 'all') return true;
    
    const transactionAmount = transaction.senderAmount;
    
    switch (activeFilters.amountRange) {
      case 'small':
        return transactionAmount < 1000;
      case 'medium':
        return transactionAmount >= 1000 && transactionAmount < 10000;
      case 'large':
        return transactionAmount >= 10000;
      default:
        return true;
    }
  };

  // Filter transactions based on current filters
  const filteredTransactionsList = useMemo(() => {
    return transactionsList.filter(transaction => {
      return filterByUserId(transaction) &&
             filterBySearchTerm(transaction) &&
             filterByRiskLevel(transaction) &&
             filterByStatus(transaction) &&
             filterByAmountRange(transaction);
    });
  }, [transactionsList, activeFilters, currentSearchTerm]);

  return {
    filters: activeFilters,
    searchTerm: currentSearchTerm,
    filteredTransactions: filteredTransactionsList,
    setFilters: setActiveFilters,
    setSearchTerm: setCurrentSearchTerm,
  };
};
