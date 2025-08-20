
import { Transaction, TransactionAlert } from '@/types/transaction';
import { normalizedTransactions, normalizedAlerts } from '@/mocks/normalizedMockData';

export const HIGH_RISK_COUNTRIES = [
  'Afghanistan', 'Iran', 'North Korea', 'Syria', 'Belarus', 'Myanmar',
  'Venezuela', 'Cuba', 'Somalia', 'Sudan', 'Yemen', 'Libya'
];

export const mockTransactionData = {
  transactions: normalizedTransactions,
  alerts: normalizedAlerts
};
