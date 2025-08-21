
import { useState } from 'react';
import { ComplianceCaseDetails } from '@/types/case';

export interface CaseServiceOperations {
  createCase: (caseData: Partial<ComplianceCaseDetails>) => Promise<ComplianceCaseDetails>;
  updateCase: (id: string, updates: Partial<ComplianceCaseDetails>) => Promise<ComplianceCaseDetails>;
  loading: boolean;
  error: string | null;
}

export const useCaseActions = (): CaseServiceOperations => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCase = async (caseData: Partial<ComplianceCaseDetails>): Promise<ComplianceCaseDetails> => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newCase: ComplianceCaseDetails = {
        id: Math.random().toString(36).substr(2, 9),
        userId: caseData.userId || '',
        userName: caseData.userName || '',
        createdAt: caseData.createdAt || new Date().toISOString(),
        createdBy: caseData.createdBy || 'current_user',
        updatedAt: caseData.updatedAt || new Date().toISOString(),
        type: caseData.type || 'kyc',
        status: 'open',
        riskScore: caseData.riskScore || 0,
        description: caseData.description || '',
        assignedTo: caseData.assignedTo || undefined,
        assignedToName: caseData.assignedToName || undefined,
        priority: caseData.priority || 'medium',
        source: 'manual',
        relatedTransactions: caseData.relatedTransactions || [],
        relatedAlerts: caseData.relatedAlerts || [],
        documents: caseData.documents || []
      };
      
      return newCase;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create case';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateCase = async (id: string, updates: Partial<ComplianceCaseDetails>): Promise<ComplianceCaseDetails> => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Return updated case
      const updatedCase: ComplianceCaseDetails = {
        id,
        userId: updates.userId || '',
        userName: updates.userName || '',
        createdAt: updates.createdAt || new Date().toISOString(),
        createdBy: updates.createdBy || 'current_user',
        updatedAt: new Date().toISOString(),
        type: updates.type || 'kyc',
        status: updates.status || 'open',
        riskScore: updates.riskScore || 0,
        description: updates.description || '',
        assignedTo: updates.assignedTo || undefined,
        assignedToName: updates.assignedToName || undefined,
        priority: updates.priority || 'medium',
        source: updates.source || 'manual',
        relatedTransactions: updates.relatedTransactions || [],
        relatedAlerts: updates.relatedAlerts || [],
        documents: updates.documents || []
      };
      
      return updatedCase;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update case';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    createCase,
    updateCase,
    loading,
    error
  };
};
