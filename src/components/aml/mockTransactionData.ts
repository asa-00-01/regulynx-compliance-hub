
import { AMLTransaction } from '@/types/aml';
import { mockTransactionsCollection } from '@/mocks/centralizedMockData';

export const mockTransactions: AMLTransaction[] = mockTransactionsCollection;

export const mockRiskDistribution = [
  { name: 'Low Risk', value: mockTransactions.filter(t => t.riskScore <= 30).length, color: '#10b981' },
  { name: 'Medium Risk', value: mockTransactions.filter(t => t.riskScore > 30 && t.riskScore <= 70).length, color: '#f59e0b' },
  { name: 'High Risk', value: mockTransactions.filter(t => t.riskScore > 70).length, color: '#ef4444' },
];

export const mockComplianceMetrics = {
  totalTransactions: mockTransactions.length,
  flaggedTransactions: mockTransactions.filter(t => t.isSuspect).length,
  verifiedUsers: mockTransactionsCollection.length,
  sanctionedUsers: 2, // From centralized data
  pepUsers: 1 // From centralized data
};
