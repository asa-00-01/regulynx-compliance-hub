
import { useMemo } from 'react';
import { Transaction } from '@/types/transaction';
import { TransactionMetrics } from './types/transactionTypes';

export function useTransactionMetrics(transactions: Transaction[]): TransactionMetrics {
  return useMemo(() => {
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
}
