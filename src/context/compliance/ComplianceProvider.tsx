
import React, { useReducer, useEffect, useMemo } from 'react';
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
  transactions: [],
  cases: [],
  riskRules: [],
  filteredUsers: [],
  userRiskScores: {},
};

export const ComplianceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(complianceReducer, initialState);
  
  // Initialize with mock data
  useEffect(() => {
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
  }, []);
  
  const operations = useComplianceOperations(state, dispatch);

  // Get selected user
  const selectedUser = useMemo(() => {
    return state.selectedUserId ? operations.getUserById(state.selectedUserId) : null;
  }, [state.selectedUserId, operations]);

  // Set selected user function
  const setSelectedUser = (userId: string | null) => {
    dispatch({ type: 'SET_SELECTED_USER', payload: userId });
  };

  const contextValue = {
    state,
    dispatch,
    selectedUser,
    setSelectedUser,
    getUserById: operations.getUserById,
    getRelatedDocuments: operations.getUserDocuments,
    getRelatedTransactions: operations.getUserTransactions,
    getRelatedCases: operations.getUserCases,
    ...operations
  };

  return (
    <ComplianceContext.Provider value={contextValue}>
      {children}
    </ComplianceContext.Provider>
  );
};
