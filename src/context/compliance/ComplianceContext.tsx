
import React, { createContext, useContext, ReactNode } from 'react';
import { CompliantUser } from '@/types/compliance';

interface ComplianceFilters {
  kycStatus: string[];
  riskLevel: string[];
  country: string[];
  dateRange: string;
}

interface ComplianceMetrics {
  totalUsers: number;
  highRiskUsers: number;
  pendingKYC: number;
  verifiedUsers: number;
}

interface ComplianceState {
  users: CompliantUser[];
  selectedUser: CompliantUser | null;
  filters: ComplianceFilters;
  loading: boolean;
  error: string | null;
  metrics: ComplianceMetrics;
}

interface ComplianceActions {
  loadUsers: () => Promise<void>;
  selectUser: (user: CompliantUser) => void;
  updateFilters: (filters: ComplianceFilters) => void;
  refreshMetrics: () => Promise<void>;
}

interface ComplianceContextType {
  state: ComplianceState;
  actions: ComplianceActions;
}

const ComplianceContext = createContext<ComplianceContextType | undefined>(undefined);

const initialState: ComplianceState = {
  users: [],
  selectedUser: null,
  filters: {
    kycStatus: [],
    riskLevel: [],
    country: [],
    dateRange: 'all'
  },
  loading: false,
  error: null,
  metrics: {
    totalUsers: 0,
    highRiskUsers: 0,
    pendingKYC: 0,
    verifiedUsers: 0
  }
};

export const ComplianceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = React.useState<ComplianceState>(initialState);

  const loadUsers = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      // Mock implementation - replace with actual API call
      const mockUsers: CompliantUser[] = [];
      setState(prev => ({ ...prev, users: mockUsers, loading: false }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to load users',
        loading: false 
      }));
    }
  };

  const selectUser = (user: CompliantUser) => {
    setState(prev => ({ ...prev, selectedUser: user }));
  };

  const updateFilters = (filters: ComplianceFilters) => {
    setState(prev => ({ ...prev, filters }));
  };

  const refreshMetrics = async () => {
    try {
      // Mock implementation - replace with actual API call
      const metrics: ComplianceMetrics = {
        totalUsers: state.users.length,
        highRiskUsers: state.users.filter(u => u.riskScore > 75).length,
        pendingKYC: state.users.filter(u => u.kycStatus === 'pending').length,
        verifiedUsers: state.users.filter(u => u.kycStatus === 'verified').length
      };
      setState(prev => ({ ...prev, metrics }));
    } catch (error) {
      console.error('Failed to refresh metrics:', error);
    }
  };

  const actions: ComplianceActions = {
    loadUsers,
    selectUser,
    updateFilters,
    refreshMetrics
  };

  return (
    <ComplianceContext.Provider value={{ state, actions }}>
      {children}
    </ComplianceContext.Provider>
  );
};

export const useComplianceContext = (): ComplianceContextType => {
  const context = useContext(ComplianceContext);
  if (!context) {
    throw new Error('useComplianceContext must be used within a ComplianceProvider');
  }
  return context;
};
