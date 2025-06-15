
import { useState, useCallback } from 'react';
import { ComplianceCaseDetails, CaseAction } from '@/types/case';
import { User } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { config } from '@/config/environment';

export const useCaseActions = (
  currentUser?: User,
  selectedCase?: ComplianceCaseDetails | null,
  onCaseUpdated?: (updatedCase: ComplianceCaseDetails) => void,
  onCaseActionsUpdated?: (actions: CaseAction[]) => void
) => {
  const [caseActions, setCaseActions] = useState<CaseAction[]>([]);
  const { toast } = useToast();

  const addCaseNote = useCallback(async (caseId: string, note: string) => {
    try {
      const newAction: CaseAction = {
        id: Date.now().toString(),
        caseId: caseId,
        actionBy: currentUser?.id || 'unknown',
        actionByName: currentUser?.name || 'Unknown User',
        actionDate: new Date().toISOString(),
        actionType: 'note',
        description: note,
      };
      
      if (config.features.useMockData) {
        // Use mock data - just add to local state
        setCaseActions(prev => {
          const updated = [...prev, newAction];
          onCaseActionsUpdated?.(updated);
          return updated;
        });
      } else {
        // Use real Supabase API
        // This would save to Supabase and then update local state
        setCaseActions(prev => {
          const updated = [...prev, newAction];
          onCaseActionsUpdated?.(updated);
          return updated;
        });
      }
      
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
  }, [currentUser, toast, onCaseActionsUpdated]);

  const updateCaseStatus = useCallback(async (
    caseId: string, 
    newStatus: ComplianceCaseDetails['status'],
    note?: string
  ) => {
    try {
      if (selectedCase?.id === caseId) {
        const updatedCase = { 
          ...selectedCase, 
          status: newStatus, 
          updatedAt: new Date().toISOString() 
        };
        onCaseUpdated?.(updatedCase);
      }
      
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
      
      setCaseActions(prev => {
        const updated = [...prev, newAction];
        onCaseActionsUpdated?.(updated);
        return updated;
      });
      
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
  }, [currentUser, selectedCase, toast, onCaseUpdated, onCaseActionsUpdated]);

  const assignCase = useCallback(async (
    caseId: string, 
    assignToId: string, 
    assignToName: string
  ) => {
    try {
      if (selectedCase?.id === caseId) {
        const updatedCase = { 
          ...selectedCase, 
          assignedTo: assignToId, 
          assignedToName: assignToName, 
          updatedAt: new Date().toISOString() 
        };
        onCaseUpdated?.(updatedCase);
      }
      
      const newAction: CaseAction = {
        id: Date.now().toString(),
        caseId: caseId,
        actionBy: currentUser?.id || 'unknown',
        actionByName: currentUser?.name || 'Unknown User',
        actionDate: new Date().toISOString(),
        actionType: 'assignment',
        description: `Case assigned to ${assignToName}`
      };
      
      setCaseActions(prev => {
        const updated = [...prev, newAction];
        onCaseActionsUpdated?.(updated);
        return updated;
      });
      
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
  }, [currentUser, selectedCase, toast, onCaseUpdated, onCaseActionsUpdated]);

  return {
    caseActions,
    setCaseActions,
    addCaseNote,
    updateCaseStatus,
    assignCase
  };
};
