
import { useCallback } from 'react';
import { ComplianceState, ComplianceAction, UnifiedUserData } from './types';
import { Document } from '@/types/document';
import { AMLTransaction } from '@/types/aml';
import { ComplianceCaseDetails } from '@/types/case';

export const useComplianceOperations = (state: ComplianceState, dispatch: React.Dispatch<ComplianceAction>) => {
  const { 
    users, 
    transactions, 
    cases, 
    riskRules, 
    filteredUsers, 
    userRiskScores 
  } = state;

  // User operations
  const getUserById = useCallback((userId: string): UnifiedUserData | undefined => {
    return users.find(user => user.id === userId);
  }, [users]);

  const getUserDocuments = useCallback((userId: string): Document[] => {
    const user = getUserById(userId);
    if (!user) return [];
    
    // Convert user documents to the expected Document type
    return user.documents.map((doc): Document => ({
      id: doc.id,
      user_id: doc.user_id,
      type: doc.type,
      file_name: doc.file_name,
      file_path: doc.file_path || '',
      status: doc.status,
      upload_date: doc.upload_date,
      verified_by: doc.verified_by || undefined,
      verification_date: doc.verification_date || undefined,
      extracted_data: doc.extracted_data || {},
      created_at: doc.created_at || doc.upload_date,
      updated_at: doc.updated_at || doc.upload_date
    }));
  }, [getUserById]);

  const getUserTransactions = useCallback((userId: string): AMLTransaction[] => {
    return transactions.filter(transaction => transaction.senderUserId === userId);
  }, [transactions]);

  const getUserCases = useCallback((userId: string): ComplianceCaseDetails[] => {
    return cases.filter(caseItem => caseItem.userId === userId);
  }, [cases]);

  const updateUserStatus = useCallback((userId: string, status: 'verified' | 'pending' | 'flagged') => {
    dispatch({
      type: 'UPDATE_USER_STATUS',
      payload: { userId, status }
    });
  }, [dispatch]);

  const updateUserRiskScore = useCallback((userId: string, riskScore: number) => {
    dispatch({
      type: 'UPDATE_USER_RISK_SCORE',
      payload: { userId, riskScore }
    });
  }, [dispatch]);

  const createComplianceCase = useCallback((caseData: Omit<ComplianceCaseDetails, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCase: ComplianceCaseDetails = {
      ...caseData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    dispatch({
      type: 'CREATE_COMPLIANCE_CASE',
      payload: newCase
    });
  }, [dispatch]);

  const updateComplianceCase = useCallback((caseId: string, updates: Partial<ComplianceCaseDetails>) => {
    dispatch({
      type: 'UPDATE_COMPLIANCE_CASE',
      payload: { caseId, updates }
    });
  }, [dispatch]);

  const filterUsers = useCallback((filters: any) => {
    dispatch({
      type: 'FILTER_USERS',
      payload: filters
    });
  }, [dispatch]);

  const calculateUserRiskScore = useCallback((userId: string): number => {
    return userRiskScores[userId] || 0;
  }, [userRiskScores]);

  return {
    // User operations
    getUserById,
    getUserDocuments,
    getUserTransactions,
    getUserCases,
    updateUserStatus,
    updateUserRiskScore,
    calculateUserRiskScore,
    
    // Case operations
    createComplianceCase,
    updateComplianceCase,
    
    // Filter operations
    filterUsers,
    
    // State accessors
    users: filteredUsers,
    allUsers: users,
    transactions,
    cases,
    riskRules
  };
};
