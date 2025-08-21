
import { useState } from 'react';
import { ComplianceCaseDetails } from '@/types/compliance-cases';

export interface CaseActionInsert {
  case_id: string;
  type: 'kyc' | 'sanctions' | 'aml' | 'transaction_monitoring' | 'pep' | 'other';
  description: string;
  created_by: string;
}

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
        type: caseData.type || 'kyc',
        status: 'open',
        risk_score: caseData.risk_score || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        priority: caseData.priority || 'medium',
        source: 'manual',
        user_name: caseData.user_name || '',
        description: caseData.description || '',
        assigned_to: caseData.assigned_to || null,
        assigned_to_name: caseData.assigned_to_name || null,
        created_by: caseData.created_by || 'current_user',
        resolved_at: null,
        related_alerts: [],
        related_transactions: [],
        documents: [],
        actions: []
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
        type: 'kyc',
        status: 'open',
        risk_score: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        priority: 'medium',
        source: 'manual',
        user_name: '',
        description: '',
        assigned_to: null,
        assigned_to_name: null,
        created_by: 'current_user',
        resolved_at: null,
        related_alerts: [],
        related_transactions: [],
        documents: [],
        actions: [],
        ...updates
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
