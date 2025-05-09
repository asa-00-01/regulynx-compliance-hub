
import { useState, useEffect, useCallback } from 'react';
import { ComplianceCaseDetails, CaseAction, CaseFilters, CaseSummary } from '@/types/case';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';

// Mock cases data for development - this would be replaced with actual API calls
import { mockComplianceCases } from '@/mocks/casesData';

export function useComplianceCases(currentUser?: User) {
  const [cases, setCases] = useState<ComplianceCaseDetails[]>([]);
  const [caseActions, setCaseActions] = useState<CaseAction[]>([]);
  const [caseSummary, setCaseSummary] = useState<CaseSummary>({
    totalCases: 0,
    openCases: 0,
    highRiskCases: 0,
    escalatedCases: 0,
    resolvedLastWeek: 0,
    averageResolutionDays: 0,
    casesByType: {},
    casesByStatus: {}
  });
  const [filters, setFilters] = useState<CaseFilters>({
    dateRange: '30days'
  });
  const [selectedCase, setSelectedCase] = useState<ComplianceCaseDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch cases from Supabase
  const fetchCases = useCallback(async () => {
    setLoading(true);
    
    try {
      // In a real implementation, this would fetch from Supabase
      // For now, we'll use mock data
      let filteredCases = [...mockComplianceCases];
      
      // Apply filters
      if (filters.status && filters.status.length > 0) {
        filteredCases = filteredCases.filter(c => filters.status?.includes(c.status));
      }
      
      if (filters.type && filters.type.length > 0) {
        filteredCases = filteredCases.filter(c => filters.type?.includes(c.type));
      }
      
      if (filters.priority && filters.priority.length > 0) {
        filteredCases = filteredCases.filter(c => filters.priority?.includes(c.priority));
      }
      
      if (filters.assignedTo) {
        filteredCases = filteredCases.filter(c => c.assignedTo === filters.assignedTo);
      }
      
      if (filters.riskScoreMin !== undefined) {
        filteredCases = filteredCases.filter(c => c.riskScore >= filters.riskScoreMin!);
      }
      
      if (filters.riskScoreMax !== undefined) {
        filteredCases = filteredCases.filter(c => c.riskScore <= filters.riskScoreMax!);
      }
      
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        filteredCases = filteredCases.filter(c => 
          c.userName.toLowerCase().includes(term) || 
          c.description.toLowerCase().includes(term)
        );
      }
      
      setCases(filteredCases);
      calculateCaseSummary(filteredCases);
    } catch (error) {
      console.error('Error fetching compliance cases:', error);
      toast({
        title: 'Error',
        description: 'Failed to load compliance cases.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [filters, toast]);

  // Calculate case summary metrics
  const calculateCaseSummary = (caseData: ComplianceCaseDetails[]) => {
    const summary: CaseSummary = {
      totalCases: caseData.length,
      openCases: caseData.filter(c => c.status === 'open').length,
      highRiskCases: caseData.filter(c => c.riskScore >= 70).length,
      escalatedCases: caseData.filter(c => c.status === 'escalated').length,
      resolvedLastWeek: caseData.filter(c => 
        c.status === 'closed' && 
        new Date(c.updatedAt) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length,
      averageResolutionDays: 0,
      casesByType: {},
      casesByStatus: {}
    };
    
    // Calculate cases by type
    caseData.forEach(c => {
      summary.casesByType[c.type] = (summary.casesByType[c.type] || 0) + 1;
      summary.casesByStatus[c.status] = (summary.casesByStatus[c.status] || 0) + 1;
    });
    
    // Calculate average resolution days
    const closedCases = caseData.filter(c => c.status === 'closed');
    if (closedCases.length > 0) {
      const totalDays = closedCases.reduce((total, c) => {
        const created = new Date(c.createdAt);
        const updated = new Date(c.updatedAt);
        const diffTime = Math.abs(updated.getTime() - created.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return total + diffDays;
      }, 0);
      summary.averageResolutionDays = Math.round((totalDays / closedCases.length) * 10) / 10;
    }
    
    setCaseSummary(summary);
  };

  // Fetch case actions
  const fetchCaseActions = useCallback(async (caseId: string) => {
    try {
      // In a real implementation, this would fetch from Supabase
      // For mock, we'll create some static actions
      const actions: CaseAction[] = [
        {
          id: '1',
          caseId: caseId,
          actionBy: 'system',
          actionByName: 'System',
          actionDate: new Date().toISOString(),
          actionType: 'status_change',
          description: 'Case created',
        },
        {
          id: '2',
          caseId: caseId,
          actionBy: '123',
          actionByName: 'Alex Nordström',
          actionDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          actionType: 'assignment',
          description: 'Case assigned to compliance officer',
        }
      ];
      
      setCaseActions(actions);
    } catch (error) {
      console.error('Error fetching case actions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load case history.',
        variant: 'destructive'
      });
    }
  }, [toast]);

  // Add a note to a case
  const addCaseNote = useCallback(async (caseId: string, note: string) => {
    try {
      // In a real implementation, this would save to Supabase
      const newAction: CaseAction = {
        id: Date.now().toString(),
        caseId: caseId,
        actionBy: currentUser?.id || 'unknown',
        actionByName: currentUser?.name || 'Unknown User',
        actionDate: new Date().toISOString(),
        actionType: 'note',
        description: note,
      };
      
      setCaseActions(prev => [...prev, newAction]);
      
      toast({
        title: 'Note Added',
        description: 'Your note has been added to the case.'
      });
      
      return newAction;
    } catch (error) {
      console.error('Error adding case note:', error);
      toast({
        title: 'Error',
        description: 'Failed to add note to the case.',
        variant: 'destructive'
      });
      return null;
    }
  }, [currentUser, toast]);

  // Update case status
  const updateCaseStatus = useCallback(async (
    caseId: string, 
    newStatus: ComplianceCaseDetails['status'],
    note?: string
  ) => {
    try {
      // In a real implementation, this would update in Supabase
      setCases(prev => prev.map(c => 
        c.id === caseId 
          ? { ...c, status: newStatus, updatedAt: new Date().toISOString() } 
          : c
      ));
      
      const newAction: CaseAction = {
        id: Date.now().toString(),
        caseId: caseId,
        actionBy: currentUser?.id || 'unknown',
        actionByName: currentUser?.name || 'Unknown User',
        actionDate: new Date().toISOString(),
        actionType: 'status_change',
        description: `Case status changed to ${newStatus.replace(/_/g, ' ')}`,
        details: note ? { note } : undefined
      };
      
      setCaseActions(prev => [...prev, newAction]);
      
      if (selectedCase?.id === caseId) {
        setSelectedCase(prev => prev ? { ...prev, status: newStatus, updatedAt: new Date().toISOString() } : null);
      }
      
      toast({
        title: 'Status Updated',
        description: `Case status has been updated to ${newStatus.replace(/_/g, ' ')}.`
      });
      
      return true;
    } catch (error) {
      console.error('Error updating case status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update case status.',
        variant: 'destructive'
      });
      return false;
    }
  }, [currentUser, selectedCase, toast]);

  // Assign case to user
  const assignCase = useCallback(async (
    caseId: string, 
    assignToId: string, 
    assignToName: string
  ) => {
    try {
      // In a real implementation, this would update in Supabase
      setCases(prev => prev.map(c => 
        c.id === caseId 
          ? { ...c, assignedTo: assignToId, assignedToName: assignToName, updatedAt: new Date().toISOString() } 
          : c
      ));
      
      const newAction: CaseAction = {
        id: Date.now().toString(),
        caseId: caseId,
        actionBy: currentUser?.id || 'unknown',
        actionByName: currentUser?.name || 'Unknown User',
        actionDate: new Date().toISOString(),
        actionType: 'assignment',
        description: `Case assigned to ${assignToName}`
      };
      
      setCaseActions(prev => [...prev, newAction]);
      
      if (selectedCase?.id === caseId) {
        setSelectedCase(prev => prev ? { 
          ...prev, 
          assignedTo: assignToId, 
          assignedToName: assignToName, 
          updatedAt: new Date().toISOString() 
        } : null);
      }
      
      toast({
        title: 'Case Assigned',
        description: `Case has been assigned to ${assignToName}.`
      });
      
      return true;
    } catch (error) {
      console.error('Error assigning case:', error);
      toast({
        title: 'Error',
        description: 'Failed to assign the case.',
        variant: 'destructive'
      });
      return false;
    }
  }, [currentUser, selectedCase, toast]);

  // Create a new case
  const createCase = useCallback(async (caseData: Partial<ComplianceCaseDetails>) => {
    try {
      // In a real implementation, this would save to Supabase
      const newCase: ComplianceCaseDetails = {
        id: `case-${Date.now()}`,
        userId: caseData.userId || '',
        userName: caseData.userName || 'Unknown User',
        createdAt: new Date().toISOString(),
        createdBy: currentUser?.id,
        updatedAt: new Date().toISOString(),
        type: caseData.type || 'kyc',
        status: 'open',
        riskScore: caseData.riskScore || 50,
        description: caseData.description || 'No description provided',
        assignedTo: caseData.assignedTo,
        assignedToName: caseData.assignedToName,
        priority: caseData.priority || 'medium',
        source: caseData.source || 'manual',
        relatedTransactions: caseData.relatedTransactions || [],
        relatedAlerts: caseData.relatedAlerts || [],
        documents: caseData.documents || [],
      };
      
      setCases(prev => [newCase, ...prev]);
      
      // Also update the case summary
      setCaseSummary(prev => ({
        ...prev,
        totalCases: prev.totalCases + 1,
        openCases: prev.openCases + 1,
        casesByType: {
          ...prev.casesByType,
          [newCase.type]: (prev.casesByType[newCase.type] || 0) + 1
        },
        casesByStatus: {
          ...prev.casesByStatus,
          open: (prev.casesByStatus.open || 0) + 1
        }
      }));
      
      toast({
        title: 'Case Created',
        description: 'New compliance case has been created successfully.'
      });
      
      return newCase;
    } catch (error) {
      console.error('Error creating case:', error);
      toast({
        title: 'Error',
        description: 'Failed to create new case.',
        variant: 'destructive'
      });
      return null;
    }
  }, [currentUser, toast]);

  // Select a case for viewing details
  const selectCase = useCallback((caseItem: ComplianceCaseDetails) => {
    setSelectedCase(caseItem);
    fetchCaseActions(caseItem.id);
  }, [fetchCaseActions]);

  // Initialize
  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  return {
    cases,
    caseActions,
    caseSummary,
    filters,
    selectedCase,
    loading,
    setFilters,
    selectCase,
    addCaseNote,
    updateCaseStatus,
    assignCase,
    createCase,
    fetchCases
  };
}
