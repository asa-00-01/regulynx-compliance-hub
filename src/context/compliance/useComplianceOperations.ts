
import { useCallback } from 'react';
import { ComplianceState, ComplianceAction, UnifiedUserData } from './types';
import { Document } from '@/types/supabase';
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
    if (!user) return [];
    
    // Properly cast documents to match the Supabase Document type
    return user.documents.map((doc): Document => ({
      id: doc.id,
      user_id: doc.user_id,
      type: doc.type as Document['type'],
      file_name: doc.file_name,
      file_path: doc.file_path,
      upload_date: doc.upload_date,
      status: doc.status as Document['status'],
      verified_by: doc.verified_by,
      verification_date: doc.verification_date,
      extracted_data: doc.extracted_data,
      created_at: doc.created_at,
      updated_at: doc.updated_at
    }));
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
