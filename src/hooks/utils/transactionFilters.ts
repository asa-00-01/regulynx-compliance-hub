
import { Transaction } from '@/types/transaction';
import { TransactionFilters } from '../types/transactionTypes';

/**
 * Applies comprehensive filtering to transaction list based on provided filter criteria.
 * Supports date range, amount range, country, payment method, and flagged status filters.
 */
export function applyTransactionFilters(
  transactionsList: Transaction[],
  filterCriteria: TransactionFilters
): Transaction[] {
  return transactionsList.filter(transaction => {
    return applyDateRangeFilter(transaction, filterCriteria) &&
           applyAmountRangeFilters(transaction, filterCriteria) &&
           applyCountryFilter(transaction, filterCriteria) &&
           applyPaymentMethodFilter(transaction, filterCriteria) &&
           applyFlaggedStatusFilter(transaction, filterCriteria);
  });
}

/**
 * Applies date range filter to individual transaction
 */
function applyDateRangeFilter(transaction: Transaction, filterCriteria: TransactionFilters): boolean {
  if (filterCriteria.dateRange === 'all') return true;

  const transactionDate = new Date(transaction.timestamp);
  const currentDate = new Date();
  const daysCutoffMap = {
    '7days': 7,
    '30days': 30,
    '90days': 90
  };

  const daysToSubtract = daysCutoffMap[filterCriteria.dateRange as keyof typeof daysCutoffMap];
  if (!daysToSubtract) return true;

  const cutoffDate = new Date();
  cutoffDate.setDate(currentDate.getDate() - daysToSubtract);

  return transactionDate >= cutoffDate;
}

/**
 * Applies minimum and maximum amount filters to individual transaction
 */
function applyAmountRangeFilters(transaction: Transaction, filterCriteria: TransactionFilters): boolean {
  const transactionAmount = transaction.amount;
  
  const meetsMinimumAmount = filterCriteria.minAmount === undefined || 
                           transactionAmount >= filterCriteria.minAmount;
  
  const meetsMaximumAmount = filterCriteria.maxAmount === undefined || 
                           transactionAmount <= filterCriteria.maxAmount;
  
  return meetsMinimumAmount && meetsMaximumAmount;
}

/**
 * Applies country filter to individual transaction
 */
function applyCountryFilter(transaction: Transaction, filterCriteria: TransactionFilters): boolean {
  if (!filterCriteria.countries?.length) return true;

  const matchesOriginCountry = filterCriteria.countries.includes(transaction.originCountry);
  const matchesDestinationCountry = filterCriteria.countries.includes(transaction.destinationCountry);

  return matchesOriginCountry || matchesDestinationCountry;
}

/**
 * Applies payment method filter to individual transaction
 */
function applyPaymentMethodFilter(transaction: Transaction, filterCriteria: TransactionFilters): boolean {
  if (!filterCriteria.methods?.length) return true;
  return filterCriteria.methods.includes(transaction.method);
}

/**
 * Applies flagged status filter to individual transaction
 */
function applyFlaggedStatusFilter(transaction: Transaction, filterCriteria: TransactionFilters): boolean {
  if (!filterCriteria.onlyFlagged) return true;
  return transaction.flagged;
}
