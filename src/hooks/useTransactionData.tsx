
import { useState, useEffect, useMemo } from 'react';
import { Transaction, TransactionAlert } from '@/types/transaction';
import { mockTransactionData } from '@/components/transactions/mockTransactionData';
import { useToast } from '@/hooks/use-toast';

// Range filter options
export type DateRange = '7days' | '30days' | '90days' | 'all';

export interface TransactionFilters {
  dateRange: DateRange;
  minAmount?: number;
  maxAmount?: number;
  countries?: string[];
  methods?: string[];
  onlyFlagged?: boolean;
}

export function useTransactionData() {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactionData.transactions);
  const [alerts, setAlerts] = useState<TransactionAlert[]>(mockTransactionData.alerts);
  const [filters, setFilters] = useState<TransactionFilters>({
    dateRange: '30days',
    onlyFlagged: false
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Apply filters to transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const txDate = new Date(transaction.timestamp);
      const now = new Date();
      
      // Apply date range filter
      if (filters.dateRange !== 'all') {
        const daysAgo = {
          '7days': 7,
          '30days': 30,
          '90days': 90
        }[filters.dateRange];
        
        const cutoffDate = new Date();
        cutoffDate.setDate(now.getDate() - daysAgo);
        
        if (txDate < cutoffDate) return false;
      }
      
      // Apply amount filters
      if (filters.minAmount !== undefined && transaction.amount < filters.minAmount) return false;
      if (filters.maxAmount !== undefined && transaction.amount > filters.maxAmount) return false;
      
      // Apply country filter
      if (filters.countries?.length) {
        if (!filters.countries.includes(transaction.originCountry) && 
            !filters.countries.includes(transaction.destinationCountry)) {
          return false;
        }
      }
      
      // Apply payment method filter
      if (filters.methods?.length && !filters.methods.includes(transaction.method)) return false;
      
      // Apply flagged filter
      if (filters.onlyFlagged && !transaction.flagged) return false;
      
      return true;
    });
  }, [transactions, filters]);

  // Get metrics for dashboard
  const metrics = useMemo(() => {
    const last30Days = transactions.filter(tx => {
      const txDate = new Date(tx.timestamp);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 30);
      return txDate >= cutoffDate;
    });
    
    const flaggedCount = last30Days.filter(tx => tx.flagged).length;
    
    // Get top 5 high-risk users
    const userRiskMap = new Map<string, { userId: string, userName: string, totalRisk: number, count: number }>();
    
    transactions.forEach(tx => {
      const current = userRiskMap.get(tx.userId) || { 
        userId: tx.userId, 
        userName: tx.userName, 
        totalRisk: 0, 
        count: 0 
      };
      
      userRiskMap.set(tx.userId, {
        ...current,
        totalRisk: current.totalRisk + tx.riskScore,
        count: current.count + 1
      });
    });
    
    const highRiskUsers = Array.from(userRiskMap.values())
      .map(user => ({
        ...user,
        averageRisk: user.totalRisk / user.count
      }))
      .sort((a, b) => b.averageRisk - a.averageRisk)
      .slice(0, 5);
    
    // Get transaction corridors (country-to-country)
    const corridors = new Map<string, number>();
    
    transactions.forEach(tx => {
      const corridor = `${tx.originCountry}-${tx.destinationCountry}`;
      const current = corridors.get(corridor) || 0;
      corridors.set(corridor, current + 1);
    });
    
    const topCorridors = Array.from(corridors.entries())
      .map(([corridor, count]) => {
        const [origin, destination] = corridor.split('-');
        return { origin, destination, count };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    return {
      totalTransactions: last30Days.length,
      flaggedCount,
      highRiskUsers,
      topCorridors
    };
  }, [transactions]);

  // Handle alert status changes
  const updateAlertStatus = (alertId: string, newStatus: TransactionAlert['status']) => {
    setAlerts(currentAlerts => 
      currentAlerts.map(alert => 
        alert.id === alertId ? { ...alert, status: newStatus } : alert
      )
    );
    
    toast({
      title: "Alert Updated",
      description: `Alert status changed to ${newStatus}`
    });
  };

  // Add note to an alert
  const addAlertNote = (alertId: string, note: string) => {
    setAlerts(currentAlerts => 
      currentAlerts.map(alert => 
        alert.id === alertId 
          ? { 
              ...alert, 
              notes: [...(alert.notes || []), note] 
            } 
          : alert
      )
    );
    
    toast({
      title: "Note Added",
      description: "The note has been added to the alert"
    });
  };

  // Create compliance case from alert
  const createCaseFromAlert = (alertId: string) => {
    // In a real implementation, this would create a case in the database
    // For now, we'll just update the alert status
    updateAlertStatus(alertId, 'investigating');
    
    toast({
      title: "Case Created",
      description: "A new compliance case has been created from this alert"
    });
  };

  // Dismiss alert
  const dismissAlert = (alertId: string) => {
    updateAlertStatus(alertId, 'closed');
    
    toast({
      title: "Alert Dismissed",
      description: "The alert has been marked as closed"
    });
  };

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
