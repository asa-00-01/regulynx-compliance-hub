
import { useState, useMemo } from 'react';
import { Transaction } from '@/types/transaction';
import { mockTransactionData } from '@/components/transactions/mockTransactionData';
import { TransactionFilters } from './types/transactionTypes';
import { applyTransactionFilters } from './utils/transactionFilters';
import { useTransactionMetrics } from './useTransactionMetrics';
import { useAlertManagement } from './useAlertManagement';

// Re-export types for backward compatibility
export type { DateRange, TransactionFilters } from './types/transactionTypes';

/**
 * Manages transaction data, filtering, and alert operations.
 * Provides access to filtered transactions, metrics, and alert management functionality.
 */
export function useTransactionData() {
  const [transactionsList, setTransactionsList] = useState<Transaction[]>(mockTransactionData.transactions);
  const [currentFilters, setCurrentFilters] = useState<TransactionFilters>({
    dateRange: '30days',
    onlyFlagged: false
  });
  const [isDataLoading, setIsDataLoading] = useState(false);

  // Apply filters to transactions
  const filteredTransactionsList = useMemo(() => {
    return applyTransactionFilters(transactionsList, currentFilters);
  }, [transactionsList, currentFilters]);

  // Get metrics for dashboard
  const transactionMetrics = useTransactionMetrics(transactionsList);

  // Alert management
  const {
    alerts: transactionAlerts,
    setAlerts: setTransactionAlerts,
    updateAlertStatus,
    addAlertNote,
    createCaseFromAlert,
    dismissAlert
  } = useAlertManagement(mockTransactionData.alerts);

  return {
    transactions: transactionsList,
    filteredTransactions: filteredTransactionsList,
    alerts: transactionAlerts,
    filters: currentFilters,
    setFilters: setCurrentFilters,
    loading: isDataLoading,
    metrics: transactionMetrics,
    updateAlertStatus,
    addAlertNote,
    createCaseFromAlert,
    dismissAlert
  };
}
