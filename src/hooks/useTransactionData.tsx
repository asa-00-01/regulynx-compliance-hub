
import { useState, useEffect, useMemo } from 'react';
import { Transaction, TransactionAlert } from '@/types/transaction';
import { TransactionFilters } from './types/transactionTypes';
import { applyTransactionFilters } from './utils/transactionFilters';
import { useTransactionMetrics } from './useTransactionMetrics';
import { useAlertManagement } from './useAlertManagement';
import { UnifiedDataService } from '@/services/unifiedDataService';
import config from '@/config/environment';

// Re-export types for backward compatibility
export type { DateRange, TransactionFilters } from './types/transactionTypes';

/**
 * Manages transaction data, filtering, and alert operations.
 * Provides access to filtered transactions, metrics, and alert management functionality.
 */
export function useTransactionData() {
  const [transactionsList, setTransactionsList] = useState<Transaction[]>([]);
  const [alertsList, setAlertsList] = useState<TransactionAlert[]>([]);
  const [currentFilters, setCurrentFilters] = useState<TransactionFilters>({
    dateRange: '30days',
    onlyFlagged: false
  });
  const [isDataLoading, setIsDataLoading] = useState(false);

  // Load data when component mounts or mock mode changes
  useEffect(() => {
    const loadTransactionData = async () => {
      setIsDataLoading(true);
      try {
        console.log(`🔄 Loading transaction data via ${UnifiedDataService.getCurrentDataSource()}...`);
        
        // Note: This would need to be implemented in the unified service
        // For now, we'll fall back to mock data but log the data source
        const { mockTransactionData } = await import('@/components/transactions/mockTransactionData');
        
        if (config.features.useMockData) {
          console.log('📊 Using mock transaction data');
          setTransactionsList(mockTransactionData.transactions);
          setAlertsList(mockTransactionData.alerts);
        } else {
          console.log('🌐 Real transaction data not yet implemented - using empty arrays');
          // In a real implementation, this would call UnifiedDataService.getTransactions()
          setTransactionsList([]);
          setAlertsList([]);
        }
      } catch (error) {
        console.error('Error loading transaction data:', error);
        setTransactionsList([]);
        setAlertsList([]);
      } finally {
        setIsDataLoading(false);
      }
    };

    loadTransactionData();
  }, [config.features.useMockData]); // Re-load when mock mode changes

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
  } = useAlertManagement(alertsList);

  // Alert management functions
  const acknowledgeAlert = async (alertId: string) => {
    try {
      // In a real implementation, this would call an API to acknowledge the alert
      console.log('Acknowledging alert:', alertId);
      
      // Update local state - use 'investigating' status instead of 'acknowledged'
      setAlertsList(prev => prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, status: 'investigating' as const }
          : alert
      ));
      
      return true;
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      return false;
    }
  };

  const resolveAlert = async (alertId: string, resolution: string) => {
    try {
      // In a real implementation, this would call an API to resolve the alert
      console.log('Resolving alert:', alertId, 'with resolution:', resolution);
      
      // Update local state - use 'closed' status instead of 'resolved'
      setAlertsList(prev => prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, status: 'closed' as const }
          : alert
      ));
      
      return true;
    } catch (error) {
      console.error('Error resolving alert:', error);
      return false;
    }
  };

  const escalateAlert = async (alertId: string, escalationReason: string) => {
    try {
      // In a real implementation, this would call an API to escalate the alert
      console.log('Escalating alert:', alertId, 'with reason:', escalationReason);
      
      // Update local state - use 'investigating' status instead of 'escalated'
      setAlertsList(prev => prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, status: 'investigating' as const }
          : alert
      ));
      
      return true;
    } catch (error) {
      console.error('Error escalating alert:', error);
      return false;
    }
  };

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
    dismissAlert,
    acknowledgeAlert,
    resolveAlert,
    escalateAlert,
    dataSource: UnifiedDataService.getCurrentDataSource(),
    isMockMode: config.features.useMockData,
  };
}
