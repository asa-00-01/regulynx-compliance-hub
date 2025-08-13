
import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AMLTransaction } from '@/types/aml';

interface AMLFilters {
  dateRange: { from: Date | null; to: Date | null };
  amountRange: { min: number | null; max: number | null };
  currency: string;
  method: string;
  riskLevel: string;
  country: string;
  status: string;
  searchTerm: string;
}

/**
 * Manages AML transaction filtering logic including search parameters and filter application.
 * Provides filtered transaction results based on various criteria.
 */
export const useAMLFilters = (transactionsList: AMLTransaction[]) => {
  const [searchParams] = useSearchParams();
  const userIdFromSearchParams = searchParams.get('userId');
  
  const [activeFilters, setActiveFilters] = useState<AMLFilters>({
    dateRange: { from: null, to: null },
    amountRange: { min: null, max: null },
    currency: '',
    method: '',
    riskLevel: '',
    country: '',
    status: '',
    searchTerm: ''
  });
  const [currentSearchTerm, setCurrentSearchTerm] = useState('');

  /**
   * Applies search term filter to transactions
   */
  const filterBySearchTerm = (transaction: AMLTransaction): boolean => {
    const searchTerm = activeFilters.searchTerm || currentSearchTerm;
    if (!searchTerm) return true;
    
    const searchTermLowerCase = searchTerm.toLowerCase();
    const matchesTransactionId = transaction.id.toLowerCase().includes(searchTermLowerCase);
    const matchesSenderName = transaction.senderName.toLowerCase().includes(searchTermLowerCase);
    const matchesReceiverName = transaction.receiverName?.toLowerCase().includes(searchTermLowerCase);
    
    return matchesTransactionId || matchesSenderName || matchesReceiverName;
  };

  /**
   * Applies risk level filter to transactions
   */
  const filterByRiskLevel = (transaction: AMLTransaction): boolean => {
    if (!activeFilters.riskLevel) return true;
    
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
    if (!activeFilters.status) return true;
    return transaction.status === activeFilters.status;
  };

  /**
   * Applies currency filter to transactions
   */
  const filterByCurrency = (transaction: AMLTransaction): boolean => {
    if (!activeFilters.currency) return true;
    return transaction.currency === activeFilters.currency;
  };

  /**
   * Applies method filter to transactions
   */
  const filterByMethod = (transaction: AMLTransaction): boolean => {
    if (!activeFilters.method) return true;
    return transaction.method === activeFilters.method;
  };

  /**
   * Applies country filter to transactions
   */
  const filterByCountry = (transaction: AMLTransaction): boolean => {
    if (!activeFilters.country) return true;
    return transaction.senderCountry === activeFilters.country || transaction.receiverCountry === activeFilters.country;
  };

  /**
   * Applies date range filter to transactions
   */
  const filterByDateRange = (transaction: AMLTransaction): boolean => {
    if (!activeFilters.dateRange.from && !activeFilters.dateRange.to) return true;
    
    const transactionDate = new Date(transaction.timestamp);
    
    if (activeFilters.dateRange.from && transactionDate < activeFilters.dateRange.from) return false;
    if (activeFilters.dateRange.to && transactionDate > activeFilters.dateRange.to) return false;
    
    return true;
  };

  /**
   * Applies amount range filter to transactions
   */
  const filterByAmountRange = (transaction: AMLTransaction): boolean => {
    if (!activeFilters.amountRange.min && !activeFilters.amountRange.max) return true;
    
    const transactionAmount = transaction.senderAmount;
    
    if (activeFilters.amountRange.min && transactionAmount < activeFilters.amountRange.min) return false;
    if (activeFilters.amountRange.max && transactionAmount > activeFilters.amountRange.max) return false;
    
    return true;
  };

  // Filter transactions based on current filters
  const filteredTransactionsList = useMemo(() => {
    return transactionsList.filter(transaction => {
      return filterBySearchTerm(transaction) &&
             filterByCurrency(transaction) &&
             filterByMethod(transaction) &&
             filterByRiskLevel(transaction) &&
             filterByCountry(transaction) &&
             filterByStatus(transaction) &&
             filterByDateRange(transaction) &&
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
