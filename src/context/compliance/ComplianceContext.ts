
import { createContext, useContext } from 'react';
import { ComplianceContextInterface } from './ComplianceContextInterface';
import { ComplianceState } from './types';

export const ComplianceContext = createContext<ComplianceContextInterface>({
  state: {
    users: [],
    selectedUserId: null,
    selectedUser: null,
    selectedCase: null,
    globalFilters: {
      searchTerm: '',
      riskLevel: 'all',
      dateRange: '30days',
      kycStatus: [],
      country: undefined,
    },
    filters: {
      searchTerm: '',
      riskLevel: 'all',
      dateRange: '30days',
      kycStatus: [],
      country: undefined,
    },
    loading: false,
    error: null,
    metrics: {
      totalUsers: 0,
      highRiskUsers: 0,
      pendingKYC: 0,
      verifiedUsers: 0,
    },
  },
  dispatch: () => null,
  selectedUser: null,
  setSelectedUser: () => null,
  getUserById: () => null,
  getRelatedDocuments: () => [],
  getRelatedTransactions: () => [],
  getRelatedCases: () => [],
  actions: {
    loadUsers: () => Promise.resolve(),
    selectUser: () => {},
    updateFilters: () => {},
    refreshMetrics: () => Promise.resolve(),
  },
});

export const useComplianceContext = () => {
  const context = useContext(ComplianceContext);
  if (!context) {
    throw new Error('useComplianceContext must be used within a ComplianceProvider');
  }
  return context;
};
