import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Transaction } from '@/types/transaction';
import { TransactionService, TransactionFilters, TransactionStats } from '@/services/transactionService';
import { config } from '@/config/environment';
import { mockTransactionData } from '@/components/transactions/mockTransactionData';

export const useTransactions = () => {
  const { user } = useAuth();
  // For now, use a hardcoded customer ID for the Test Organization
  const customerId = '550e8400-e29b-41d4-a716-446655440100';
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<TransactionStats>({
    totalTransactions: 0,
    flaggedTransactions: 0,
    totalVolume: 0,
    uniqueUsers: 0,
    averageRiskScore: 0,
    statusBreakdown: {
      completed: 0,
      pending: 0,
      flagged: 0,
      failed: 0
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [filters, setFilters] = useState<TransactionFilters>({
    status: 'all',
    riskLevel: undefined,
    searchTerm: '',
    customerId: customerId
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Load transactions
  const loadTransactions = async () => {
    setLoading(true);
    setError(null);

    try {
      let transactionData: Transaction[] = [];
      let statsData: TransactionStats;

      if (config.features.useMockData) {
        // Use mock data
        transactionData = (mockTransactionData?.transactions ?? []) as Transaction[];
        statsData = {
          totalTransactions: transactionData.length,
          flaggedTransactions: transactionData.filter(t => t.flagged).length,
          totalVolume: transactionData.reduce((sum, t) => sum + t.amount, 0),
          uniqueUsers: new Set(transactionData.map(t => t.userId)).size,
          averageRiskScore: Math.round(transactionData.reduce((sum, t) => sum + t.riskScore, 0) / transactionData.length || 0),
          statusBreakdown: {
            completed: transactionData.filter(t => t.status === 'approved').length,
            pending: transactionData.filter(t => t.status === 'pending').length,
            flagged: transactionData.filter(t => t.status === 'flagged').length,
            failed: transactionData.filter(t => t.status === 'rejected').length
          }
        };
      } else {
        // Use real data from database
        transactionData = await TransactionService.getTransactions(filters);
        statsData = await TransactionService.getTransactionStats(customerId);
      }

      setTransactions(transactionData);
      setStats(statsData);
    } catch (err) {
      console.error('Error loading transactions:', err);
      setError('Failed to load transactions');
      setTransactions([]);
      setStats({
        totalTransactions: 0,
        flaggedTransactions: 0,
        totalVolume: 0,
        uniqueUsers: 0,
        averageRiskScore: 0,
        statusBreakdown: {
          completed: 0,
          pending: 0,
          flagged: 0,
          failed: 0
        }
      });
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount and when filters change
  useEffect(() => {
    loadTransactions();
  }, [filters, config.features.useMockData, customerId]);

  // Apply client-side filtering
  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    // Apply search filter
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(tx => 
        tx.userName.toLowerCase().includes(searchTerm) ||
        tx.id.toLowerCase().includes(searchTerm) ||
        tx.externalId?.toLowerCase().includes(searchTerm) ||
        tx.description?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply status filter
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(tx => tx.status === filters.status);
    }

    // Apply risk level filter
    if (filters.riskLevel) {
      switch (filters.riskLevel) {
        case 'low':
          filtered = filtered.filter(tx => tx.riskScore <= 30);
          break;
        case 'medium':
          filtered = filtered.filter(tx => tx.riskScore > 30 && tx.riskScore <= 70);
          break;
        case 'high':
          filtered = filtered.filter(tx => tx.riskScore > 70);
          break;
      }
    }

    // Apply amount range filter
    if (filters.amountRange) {
      if (filters.amountRange.min !== undefined) {
        filtered = filtered.filter(tx => tx.amount >= filters.amountRange.min!);
      }
      if (filters.amountRange.max !== undefined) {
        filtered = filtered.filter(tx => tx.amount <= filters.amountRange.max!);
      }
    }

    return filtered;
  }, [transactions, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

  // Update filters
  const updateFilters = (newFilters: Partial<TransactionFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Pagination handlers
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Transaction actions
  const updateTransactionStatus = async (transactionId: string, status: 'pending' | 'approved' | 'rejected' | 'flagged') => {
    try {
      if (!config.features.useMockData) {
        const success = await TransactionService.updateTransactionStatus(transactionId, status);
        if (success) {
          // Reload transactions to get updated data
          await loadTransactions();
        }
        return success;
      } else {
        // Update mock data
        setTransactions(prev => 
          prev.map(tx => 
            tx.id === transactionId 
              ? { ...tx, status, flagged: status === 'flagged' }
              : tx
          )
        );
        return true;
      }
    } catch (error) {
      console.error('Error updating transaction status:', error);
      return false;
    }
  };

  const exportTransactions = async () => {
    try {
      if (!config.features.useMockData) {
        const csvContent = await TransactionService.exportTransactions(filters);
        
        // Create and download CSV file
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        // Export mock data
        const csvContent = [
          'Transaction ID,User Name,Amount,Currency,Type,Status,Risk Score,Date,Description',
          ...filteredTransactions.map(tx => [
            tx.id,
            `"${tx.userName}"`,
            tx.amount,
            tx.currency,
            tx.method,
            tx.status,
            tx.riskScore,
            new Date(tx.timestamp).toISOString(),
            `"${tx.description || ''}"`
          ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting transactions:', error);
    }
  };

  return {
    // Data
    transactions: filteredTransactions,
    paginatedTransactions,
    stats,
    loading,
    error,

    // Filters
    filters,
    updateFilters,

    // Pagination
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    totalItems: filteredTransactions.length,
    goToPage,
    goToNextPage,
    goToPrevPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,

    // Actions
    updateTransactionStatus,
    exportTransactions,
    refresh: loadTransactions,

    // Data source info
    isMockMode: config.features.useMockData
  };
};
