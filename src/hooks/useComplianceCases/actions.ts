
import { useState } from 'react';
import { ComplianceCaseDetails } from '@/types/case';
import { complianceCaseService } from './service';

export interface CaseActionInsert {
  userId: string;
  userName: string;
  type: 'kyc' | 'transaction_monitoring' | 'sanctions' | 'pep' | 'other';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  riskScore: number;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  assignedTo?: string;
  assignedToName?: string;
  createdBy?: string;
  relatedTransactions?: string[];
  relatedAlerts?: string[];
  documents?: string[];
}

export const useCaseActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCase = async (caseData: Partial<CaseActionInsert>): Promise<ComplianceCaseDetails | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await complianceCaseService.createCase(caseData);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create case';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCase = async (id: string, updates: Partial<ComplianceCaseDetails>): Promise<ComplianceCaseDetails | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await complianceCaseService.updateCase(id, updates);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update case';
      setError(errorMessage);
      throw err;
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
