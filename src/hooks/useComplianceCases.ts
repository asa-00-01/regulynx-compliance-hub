import { useState, useEffect, useCallback } from 'react';
import { ComplianceCaseDetails, CaseFilters, CaseSummary } from '@/types/case';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/types';
import { complianceCaseService } from './useComplianceCases/service';
import { calculateCaseSummary } from './useComplianceCases/utils';
import { useCaseActions } from './useComplianceCases/actions';
import { UseComplianceCasesReturn } from './useComplianceCases/types';

export function useComplianceCases(currentUser?: User): UseComplianceCasesReturn {
  const [cases, setCases] = useState<ComplianceCaseDetails[]>([]);
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

  // Handle case updates from actions
  const handleCaseUpdated = useCallback((updatedCase: ComplianceCaseDetails) => {
    setCases(prev => prev.map(c => c.id === updatedCase.id ? updatedCase : c));
    setSelectedCase(updatedCase);
  }, []);

  // Handle case actions updates
  const handleCaseActionsUpdated = useCallback((actions: any[]) => {
    // This is handled by the actions hook internally
  }, []);

  // Use the case actions hook
  const {
    caseActions,
    setCaseActions,
    addCaseNote,
    updateCaseStatus,
    assignCase
  } = useCaseActions(currentUser, selectedCase, handleCaseUpdated, handleCaseActionsUpdated);

  // Fetch cases from service
  const fetchCases = useCallback(async () => {
    setLoading(true);
    
    try {
      const filteredCases = await complianceCaseService.fetchCases(filters);
      setCases(filteredCases);
      setCaseSummary(calculateCaseSummary(filteredCases));
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

  // Fetch case actions
  const fetchCaseActions = useCallback(async (caseId: string) => {
    try {
      const actions = await complianceCaseService.fetchCaseActions(caseId);
      setCaseActions(actions);
    } catch (error) {
      console.error('Error fetching case actions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load case history.',
        variant: 'destructive'
      });
    }
  }, [setCaseActions, toast]);

  // Create a new case
  const createCase = useCallback(async (caseData: Partial<ComplianceCaseDetails>) => {
    try {
      const newCase = await complianceCaseService.createCase({
        ...caseData,
        createdBy: currentUser?.id
      });
      
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
    fetchCases,
  };
}
