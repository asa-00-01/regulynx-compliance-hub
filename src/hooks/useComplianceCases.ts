
import { useState, useEffect } from 'react';
import { ComplianceCaseDetails, CaseAction, CaseFilters, CaseSummary } from '@/types/case';
import { useCaseActions } from '@/hooks/useComplianceCases/actions';

export const useComplianceCases = (currentUserId?: string) => {
  const [cases, setCases] = useState<ComplianceCaseDetails[]>([]);
  const [caseActions, setCaseActions] = useState<CaseAction[]>([]);
  const [selectedCase, setSelectedCase] = useState<ComplianceCaseDetails | null>(null);
  const [filters, setFilters] = useState<CaseFilters>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const caseActionsHook = useCaseActions();

  // Calculate case summary
  const caseSummary: CaseSummary = {
    totalCases: cases.length,
    openCases: cases.filter(c => c.status === 'open').length,
    highRiskCases: cases.filter(c => c.riskScore >= 75).length,
    escalatedCases: cases.filter(c => c.status === 'escalated').length,
    resolvedLastWeek: cases.filter(c => 
      c.status === 'closed' && 
      new Date(c.updatedAt) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length,
    averageResolutionDays: 3.5,
    casesByType: {
      kyc: cases.filter(c => c.type === 'kyc').length,
      aml: cases.filter(c => c.type === 'aml').length,
      sanctions: cases.filter(c => c.type === 'sanctions').length,
    },
    casesByStatus: {
      open: cases.filter(c => c.status === 'open').length,
      under_review: cases.filter(c => c.status === 'under_review').length,
      escalated: cases.filter(c => c.status === 'escalated').length,
      pending_info: cases.filter(c => c.status === 'pending_info').length,
      closed: cases.filter(c => c.status === 'closed').length,
    }
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
          userId: 'user-1',
          userName: 'John Doe',
          createdAt: new Date().toISOString(),
          createdBy: 'admin-1',
          updatedAt: new Date().toISOString(),
          type: 'kyc',
          status: 'open',
          riskScore: 75,
          description: 'KYC verification required',
          assignedTo: undefined,
          assignedToName: undefined,
          priority: 'high',
          source: 'system',
          relatedTransactions: [],
          relatedAlerts: [],
          documents: []
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

  const addCaseNote = async (caseId: string, note: string): Promise<CaseAction> => {
    const newAction: CaseAction = {
      id: Math.random().toString(36).substr(2, 9),
      caseId: caseId,
      actionBy: currentUserId || 'current_user',
      actionByName: 'Current User',
      actionDate: new Date().toISOString(),
      actionType: 'note',
      description: note
    };
    setCaseActions(prev => [...prev, newAction]);
    return newAction;
  };

  const updateCaseStatus = async (
    caseId: string, 
    newStatus: ComplianceCaseDetails['status'],
    note?: string
  ): Promise<boolean> => {
    try {
      setCases(prev => prev.map(c => 
        c.id === caseId 
          ? { ...c, status: newStatus, updatedAt: new Date().toISOString() }
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
          ? { ...c, assignedTo: assignToId, assignedToName: assignToName, updatedAt: new Date().toISOString() }
          : c
      ));
      
      await addCaseNote(caseId, `Case assigned to ${assignToName}`);
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign case');
      return false;
    }
  };

  const createCase = async (caseData: Partial<ComplianceCaseDetails>): Promise<ComplianceCaseDetails> => {
    const newCase: ComplianceCaseDetails = {
      id: Math.random().toString(36).substr(2, 9),
      userId: caseData.userId || '',
      userName: caseData.userName || '',
      createdAt: new Date().toISOString(),
      createdBy: currentUserId || 'current_user',
      updatedAt: new Date().toISOString(),
      type: caseData.type || 'kyc',
      status: 'open',
      riskScore: caseData.riskScore || 0,
      description: caseData.description || '',
      assignedTo: caseData.assignedTo,
      assignedToName: caseData.assignedToName,
      priority: caseData.priority || 'medium',
      source: caseData.source || 'manual',
      relatedTransactions: caseData.relatedTransactions || [],
      relatedAlerts: caseData.relatedAlerts || [],
      documents: caseData.documents || []
    };
    
    setCases(prev => [newCase, ...prev]);
    return newCase;
  };

  useEffect(() => {
    fetchCases();
  }, []);

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
    createCase,
    fetchCases,
    refreshCases: fetchCases,
    ...caseActionsHook
  };
};
