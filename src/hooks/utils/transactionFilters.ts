
import { Transaction } from '@/types/transaction';
import { TransactionFilters } from '../types/transactionTypes';

export function applyTransactionFilters(
  transactions: Transaction[],
  filters: TransactionFilters
): Transaction[] {
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
}
