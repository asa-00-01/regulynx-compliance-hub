
import React, { useReducer, useEffect } from 'react';
import { ComplianceContext } from './ComplianceContext';
import { complianceReducer } from './reducer';
import { initializeMockData } from './mockDataInitializer';
import { config } from '@/config/environment';
import { useComplianceOperations } from './useComplianceOperations';
import { ComplianceState } from './types';

const initialState: ComplianceState = {
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
};

export const ComplianceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(complianceReducer, initialState);
  
  // Initialize mock data only when feature flag is enabled
  useEffect(() => {
    if (!config.features.useMockData) {
      return;
    }
    console.log('ComplianceProvider: Initializing mock data...');
    const generatedUsers = initializeMockData();
    console.log('ComplianceProvider: Generated users:', generatedUsers.length);
    
    dispatch({ type: 'SET_GLOBAL_FILTERS', payload: initialState.globalFilters });
    
    // Set all users at once instead of one by one
    dispatch({ 
      type: 'SET_USERS', 
      payload: generatedUsers
    });
    
    console.log('ComplianceProvider: Users dispatched to state');
  }, [config.features.useMockData]);
  
  const operations = useComplianceOperations(state, dispatch);

  return (
    <ComplianceContext.Provider 
      value={{ 
        state, 
        dispatch, 
        ...operations
      }}
    >
      {children}
    </ComplianceContext.Provider>
  );
};
