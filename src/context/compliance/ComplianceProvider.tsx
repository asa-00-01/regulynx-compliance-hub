
import React, { useReducer, useEffect } from 'react';
import { ComplianceContext } from './ComplianceContext';
import { complianceReducer } from './reducer';
import { initializeMockData } from './mockDataInitializer';
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
  
  // Initialize with mock data
  useEffect(() => {
    const generatedUsers = initializeMockData();
    
    dispatch({ type: 'SET_GLOBAL_FILTERS', payload: initialState.globalFilters });
    
    // Set mock users in state
    generatedUsers.forEach(user => {
      dispatch({ 
        type: 'UPDATE_USER_DATA', 
        payload: user
      });
    });
  }, []);
  
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
