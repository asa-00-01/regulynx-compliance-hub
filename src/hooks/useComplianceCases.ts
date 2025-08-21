
import { useState, useEffect } from 'react';
import { ComplianceCaseDetails, CaseAction, CaseFilters, CaseSummary } from '@/types/compliance-cases';
import { useCaseActions } from '@/hooks/useComplianceCases/actions';

export const useComplianceCases = (organizationCustomerId?: string) => {
  const [cases, setCases] = useState<ComplianceCaseDetails[]>([]);
  const [caseActions, setCaseActions] = useState<CaseAction[]>([]);
  const [selectedCase, setSelectedCase] = useState<ComplianceCaseDetails | null>(null);
  const [filters, setFilters] = useState<CaseFilters>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const caseActionsHook = useCaseActions();

  // Calculate case summary
  const caseSummary: CaseSummary = {
    total: cases.length,
    open: cases.filter(c => c.status === 'open').length,
    inProgress: cases.filter(c => c.status === 'in_progress').length,
    resolved: cases.filter(c => c.status === 'resolved').length,
    highPriority: cases.filter(c => c.priority === 'high' || c.priority === 'critical').length,
  };

  // Mock data for cases
  const fetchCases = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockCases: ComplianceCaseDetails[] = [
        {
          id: '1',
          type: 'kyc',
          status: 'open',
          risk_score: 75,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          priority: 'high',
          source: 'system',
          user_name: 'John Doe',
          description: 'KYC verification required',
          assigned_to: null,
          assigned_to_name: null,
          created_by: 'system',
          resolved_at: null,
          related_alerts: [],
          related_transactions: [],
          documents: [],
          actions: []
        }
      ];
      
      setCases(mockCases);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cases');
    } finally {
      setLoading(false);
    }
  };

  const selectCase = (caseItem: ComplianceCaseDetails) => {
    setSelectedCase(caseItem);
  };

  const addCaseNote = async (caseId: string, note: string): Promise<CaseAction | null> => {
    try {
      const newAction: CaseAction = {
        id: Math.random().toString(36).substr(2, 9),
        case_id: caseId,
        type: 'note',
        description: note,
        created_at: new Date().toISOString(),
        created_by: 'current_user'
      };
      setCaseActions(prev => [...prev, newAction]);
      return newAction;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add note');
      return null;
    }
  };

  const updateCaseStatus = async (
    caseId: string, 
    newStatus: ComplianceCaseDetails['status'],
    note?: string
  ): Promise<boolean> => {
    try {
      setCases(prev => prev.map(c => 
        c.id === caseId 
          ? { ...c, status: newStatus, updated_at: new Date().toISOString() }
          : c
      ));
      
      if (note) {
        await addCaseNote(caseId, `Status changed to ${newStatus}: ${note}`);
      }
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update case status');
      return false;
    }
  };

  const assignCase = async (
    caseId: string, 
    assignToId: string, 
    assignToName: string
  ): Promise<boolean> => {
    try {
      setCases(prev => prev.map(c => 
        c.id === caseId 
          ? { ...c, assigned_to: assignToId, assigned_to_name: assignToName, updated_at: new Date().toISOString() }
          : c
      ));
      
      await addCaseNote(caseId, `Case assigned to ${assignToName}`);
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign case');
      return false;
    }
  };

  useEffect(() => {
    fetchCases();
  }, [organizationCustomerId]);

  return {
    cases,
    caseActions,
    caseSummary,
    filters,
    selectedCase,
    loading,
    error,
    setFilters,
    selectCase,
    addCaseNote,
    updateCaseStatus,
    assignCase,
    createCase: caseActionsHook.createCase,
    fetchCases,
    refreshCases: fetchCases,
    ...caseActionsHook
  };
};
