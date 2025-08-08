
import { useMemo } from 'react';
import { Transaction } from '@/types/transaction';
import { TransactionMetrics } from './types/transactionTypes';

/**
 * Calculates comprehensive metrics for transaction analysis including risk assessment and corridor analysis.
 * Provides insights into transaction patterns, high-risk users, and geographic corridors.
 */
export function useTransactionMetrics(transactionsList: Transaction[]): TransactionMetrics {
  return useMemo(() => {
    const transactionsFromLast30Days = getTransactionsFromLast30Days(transactionsList);
    const flaggedTransactionCount = countFlaggedTransactions(transactionsFromLast30Days);
    const highRiskUsersList = calculateHighRiskUsers(transactionsList);
    const topTransactionCorridors = calculateTopCorridors(transactionsList);
    
    return {
      totalTransactions: transactionsFromLast30Days.length,
      flaggedCount: flaggedTransactionCount,
      highRiskUsers: highRiskUsersList,
      topCorridors: topTransactionCorridors
    };
  }, [transactionsList]);
}

/**
 * Filters transactions to only include those from the last 30 days
 */
function getTransactionsFromLast30Days(transactionsList: Transaction[]): Transaction[] {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 30);
  
  return transactionsList.filter(transaction => {
    const transactionDate = new Date(transaction.timestamp);
    return transactionDate >= cutoffDate;
  });
}

/**
 * Counts the number of flagged transactions in the provided list
 */
function countFlaggedTransactions(transactionsList: Transaction[]): number {
  return transactionsList.filter(transaction => transaction.flagged).length;
}

/**
 * Calculates and returns the top 5 highest risk users based on average risk score
 */
function calculateHighRiskUsers(transactionsList: Transaction[]) {
  const userRiskDataMap = new Map<string, { userId: string, userName: string, totalRisk: number, count: number }>();
  
  // Aggregate risk data by user
  transactionsList.forEach(transaction => {
    const existingUserData = userRiskDataMap.get(transaction.userId) || { 
      userId: transaction.userId, 
      userName: transaction.userName, 
      totalRisk: 0, 
      count: 0 
    };
    
    userRiskDataMap.set(transaction.userId, {
      ...existingUserData,
      totalRisk: existingUserData.totalRisk + transaction.riskScore,
      count: existingUserData.count + 1
    });
  });
  
  // Calculate average risk and return top 5
  return Array.from(userRiskDataMap.values())
    .map(userData => ({
      ...userData,
      averageRisk: userData.totalRisk / userData.count
    }))
    .sort((userA, userB) => userB.averageRisk - userA.averageRisk)
    .slice(0, 5);
}

/**
 * Calculates and returns the top 10 transaction corridors by frequency
 */
function calculateTopCorridors(transactionsList: Transaction[]) {
  const corridorFrequencyMap = new Map<string, number>();
  
  // Count transactions by corridor
  transactionsList.forEach(transaction => {
    const corridorKey = `${transaction.originCountry}-${transaction.destinationCountry}`;
    const currentCount = corridorFrequencyMap.get(corridorKey) || 0;
    corridorFrequencyMap.set(corridorKey, currentCount + 1);
  });
  
  // Convert to array format and return top 10
  return Array.from(corridorFrequencyMap.entries())
    .map(([corridorKey, transactionCount]) => {
      const [originCountry, destinationCountry] = corridorKey.split('-');
      return { origin: originCountry, destination: destinationCountry, count: transactionCount };
    })
    .sort((corridorA, corridorB) => corridorB.count - corridorA.count)
    .slice(0, 10);
}
