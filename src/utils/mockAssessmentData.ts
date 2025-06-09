
import { mockTransactionsCollection, unifiedMockData } from '@/mocks/centralizedMockData';
import { AMLTransaction } from '@/types/aml';
import { UnifiedUserData } from '@/context/compliance/types';

// Export mock transactions for risk assessment
export const getMockTransactions = (): AMLTransaction[] => {
  console.log('Getting mock transactions from centralized data...');
  console.log('Available transactions:', mockTransactionsCollection.length);
  return mockTransactionsCollection;
};

// Export mock users for risk assessment
export const getMockUsers = (): UnifiedUserData[] => {
  console.log('Getting mock users from centralized data...');
  console.log('Available users:', unifiedMockData.length);
  return unifiedMockData;
};

// Helper function to get high-risk users for testing
export const getHighRiskUsers = (): UnifiedUserData[] => {
  return unifiedMockData.filter(user => user.riskScore > 70);
};

// Helper function to get high-risk transactions for testing
export const getHighRiskTransactions = (): AMLTransaction[] => {
  return mockTransactionsCollection.filter(tx => tx.riskScore > 70);
};

// Get transactions for a specific user
export const getTransactionsForUser = (userId: string): AMLTransaction[] => {
  return mockTransactionsCollection.filter(tx => tx.senderUserId === userId);
};

// Get user by ID
export const getMockUserById = (userId: string): UnifiedUserData | null => {
  return unifiedMockData.find(user => user.id === userId) || null;
};
