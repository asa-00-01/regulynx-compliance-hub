
import React, { useReducer, useEffect } from 'react';
import { ComplianceContext } from './ComplianceContext';
import { complianceReducer } from './reducer';
import { initializeMockData } from './mockDataInitializer';
import { config } from '@/config/environment';
import { useComplianceOperations } from './useComplianceOperations';
import { ComplianceState, ComplianceMetrics } from './types';

const initialState: ComplianceState = {
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
};

export const ComplianceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(complianceReducer, initialState);
  
  const loadUsers = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      if (config.features.useMockData) {
        console.log('ComplianceProvider: Initializing mock data...');
        const generatedUsers = initializeMockData();
        console.log('ComplianceProvider: Generated users:', generatedUsers.length);
        
        dispatch({ 
          type: 'SET_USERS', 
          payload: generatedUsers
        });
        
        console.log('ComplianceProvider: Users dispatched to state');
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to load users' });
    }
  };

  const selectUser = (user: any) => {
    dispatch({ type: 'SET_SELECTED_USER', payload: user.id });
  };

  const updateFilters = (filters: any) => {
    dispatch({ type: 'SET_GLOBAL_FILTERS', payload: filters });
  };

  const refreshMetrics = async () => {
    // Metrics are automatically calculated in the reducer when users are set
    return Promise.resolve();
  };
  
  // Initialize mock data only when feature flag is enabled
  useEffect(() => {
    loadUsers();
  }, []);
  
  const operations = useComplianceOperations(state, dispatch);

  const actions = {
    loadUsers,
    selectUser,
    updateFilters,
    refreshMetrics,
  };

  return (
    <ComplianceContext.Provider 
      value={{ 
        state, 
        dispatch, 
        ...operations,
        actions
      }}
    >
      {children}
    </ComplianceContext.Provider>
  );
};
