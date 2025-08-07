
import { useCallback } from 'react';
import { ComplianceState, ComplianceAction, UnifiedUserData } from './types';
import { Document } from '@/types';
import { AMLTransaction } from '@/types/aml';
import { ComplianceCaseDetails } from '@/types/case';

export const useComplianceOperations = (
  state: ComplianceState,
  dispatch: React.Dispatch<ComplianceAction>
) => {
  const selectedUser = state.selectedUserId 
    ? state.users.find(user => user.id === state.selectedUserId) || null
    : null;
    
  const setSelectedUser = useCallback((userId: string | null) => {
    dispatch({ type: 'SET_SELECTED_USER', payload: userId });
  }, [dispatch]);
  
  const getUserById = useCallback((userId: string): UnifiedUserData | null => {
    return state.users.find(user => user.id === userId) || null;
  }, [state.users]);
  
  const getRelatedDocuments = useCallback((userId: string): Document[] => {
    const user = getUserById(userId);
    return user ? user.documents : [];
  }, [getUserById]);
  
  const getRelatedTransactions = useCallback((userId: string): AMLTransaction[] => {
    const user = getUserById(userId);
    return user ? user.transactions : [];
  }, [getUserById]);
  
  const getRelatedCases = useCallback((userId: string): ComplianceCaseDetails[] => {
    const user = getUserById(userId);
    return user ? user.complianceCases : [];
  }, [getUserById]);

  return {
    selectedUser,
    setSelectedUser,
    getUserById,
    getRelatedDocuments,
    getRelatedTransactions,
    getRelatedCases
  };
};
