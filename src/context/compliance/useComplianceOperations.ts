
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
    if (!user) return [];
    
    // Convert user documents to the expected Document type with proper type assertions
    return user.documents.map((doc): Document => {
      // Ensure type and status are properly validated and cast
      const documentType = (doc.type === 'passport' || doc.type === 'id' || doc.type === 'license') 
        ? doc.type as 'passport' | 'id' | 'license'
        : 'id' as const; // fallback to 'id' if invalid
        
      const documentStatus = (doc.status === 'pending' || doc.status === 'verified' || doc.status === 'rejected' || doc.status === 'information_requested')
        ? doc.status as 'pending' | 'verified' | 'rejected' | 'information_requested'
        : 'pending' as const; // fallback to 'pending' if invalid
      
      return {
        id: doc.id,
        user_id: doc.user_id,
        type: documentType,
        file_name: doc.file_name,
        upload_date: doc.upload_date,
        status: documentStatus,
        verified_by: doc.verified_by || undefined,
        verification_date: doc.verification_date || undefined,
        extracted_data: doc.extracted_data
      } as Document;
    });
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
