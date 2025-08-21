
import { createContext, useContext } from 'react';
import { ComplianceContextInterface } from './ComplianceContextInterface';
import { ComplianceState } from './types';

export const ComplianceContext = createContext<ComplianceContextInterface>({
  state: {
    users: [],
    selectedUserId: null,
    selectedCase: null,
    globalFilters: {
      searchTerm: '',
      riskLevel: 'all',
      dateRange: '30days',
      kycStatus: [],
      country: undefined,
    },
  },
  dispatch: () => null,
  selectedUser: null,
  setSelectedUser: () => null,
  getUserById: () => null,
  getRelatedDocuments: () => [],
  getRelatedTransactions: () => [],
  getRelatedCases: () => [],
});

export const useComplianceContext = () => {
  const context = useContext(ComplianceContext);
  if (!context) {
    throw new Error('useComplianceContext must be used within a ComplianceProvider');
  }
  return context;
};
