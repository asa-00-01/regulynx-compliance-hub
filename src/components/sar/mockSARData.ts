
import { SAR, Pattern, PatternMatch } from '@/types/sar';
import { normalizedSARs, normalizedPatterns, normalizedPatternMatches, normalizedTransactions } from '@/mocks/normalizedMockData';

// Export normalized SAR data
export const mockSARs: SAR[] = normalizedSARs;

// Export normalized pattern data
export const mockPatterns: Pattern[] = normalizedPatterns;

// Export normalized pattern matches
export const mockPatternMatches: Record<string, PatternMatch[]> = normalizedPatternMatches;

// Export normalized users for SAR creation
export const mockUsers = [
  { id: 'user-001', name: 'Elin West' },
  { id: 'user-002', name: 'Ahmed Hassan' },
  { id: 'user-003', name: 'Maria Rodriguez' },
  { id: 'user-004', name: 'Lars Andersson' },
  { id: 'user-005', name: 'Fatima Al-Zahra' }
];

// Export normalized transaction data for selection
export const mockAvailableTransactions = normalizedTransactions.map(tx => ({
  id: tx.id,
  description: `${tx.amount.toLocaleString()} ${tx.currency} to ${tx.recipientCountry} on ${new Date(tx.timestamp).toLocaleDateString()}`,
  amount: tx.amount,
  currency: tx.currency,
  date: new Date(tx.timestamp).toISOString().split('T')[0]
}));
