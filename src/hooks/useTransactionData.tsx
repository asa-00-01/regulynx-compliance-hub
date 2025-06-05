
import { useState, useMemo } from 'react';
import { Transaction } from '@/types/transaction';
import { mockTransactionData } from '@/components/transactions/mockTransactionData';
import { TransactionFilters } from './types/transactionTypes';
import { applyTransactionFilters } from './utils/transactionFilters';
import { useTransactionMetrics } from './useTransactionMetrics';
import { useAlertManagement } from './useAlertManagement';

// Re-export types for backward compatibility
export type { DateRange, TransactionFilters } from './types/transactionTypes';

export function useTransactionData() {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactionData.transactions);
  const [filters, setFilters] = useState<TransactionFilters>({
    dateRange: '30days',
    onlyFlagged: false
  });
  const [loading, setLoading] = useState(false);

  // Apply filters to transactions
  const filteredTransactions = useMemo(() => {
    return applyTransactionFilters(transactions, filters);
  }, [transactions, filters]);

  // Get metrics for dashboard
  const metrics = useTransactionMetrics(transactions);

  // Alert management
  const {
    alerts,
    setAlerts,
    updateAlertStatus,
    addAlertNote,
    createCaseFromAlert,
    dismissAlert
  } = useAlertManagement(mockTransactionData.alerts);

  return {
    transactions,
    filteredTransactions,
    alerts,
    filters,
    setFilters,
    loading,
    metrics,
    updateAlertStatus,
    addAlertNote,
    createCaseFromAlert,
    dismissAlert
  };
}
