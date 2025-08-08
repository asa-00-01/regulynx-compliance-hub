
import { useState, useCallback } from 'react';
import { ComplianceCaseDetails, CaseAction } from '@/types/case';
import { User } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CaseActionInsert } from '@/types/supabase';

// Helper function to validate UUID
const isValidUuid = (value: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
};

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
      const newActionData: CaseActionInsert = {
        case_id: caseId,
        action_by: currentUser?.id,
        action_by_name: currentUser?.name,
        action_type: 'commented',
        description: note,
      };

      const { data, error } = await supabase
        .from('case_actions')
        .insert(newActionData)
        .select()
        .single();

      if (error) throw error;
      
      const newAction: CaseAction = {
        id: data.id,
        caseId: data.case_id,
        actionBy: data.action_by || '',
        actionByName: data.action_by_name || 'System',
        actionDate: data.action_date,
        actionType: 'note',
        description: data.description,
        details: data.details as Record<string, any> | undefined,
      };

      setCaseActions(prev => {
        const updated = [...prev, newAction];
        onCaseActionsUpdated?.(updated);
        return updated;
      });
      
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
      // Map application status to database status with proper typing
      let dbStatus: 'open' | 'closed' | 'resolved' | 'in_progress';
      switch (newStatus) {
        case 'under_review':
        case 'pending_info':
        case 'escalated':
          dbStatus = 'in_progress';
          break;
        case 'closed':
          dbStatus = 'resolved';
          break;
        case 'open':
          dbStatus = 'open';
          break;
        default:
          dbStatus = 'open';
      }
      
      const { error: updateError } = await supabase
        .from('compliance_cases')
        .update({ status: dbStatus, updated_at: new Date().toISOString() })
        .eq('id', caseId);
      
      if (updateError) throw updateError;
      
      if (selectedCase?.id === caseId) {
        const updatedCase = { 
          ...selectedCase, 
          status: newStatus, 
          updatedAt: new Date().toISOString() 
        };
        onCaseUpdated?.(updatedCase);
      }
      
      const newActionData: CaseActionInsert = {
        case_id: caseId,
        action_by: currentUser?.id,
        action_by_name: currentUser?.name || 'Unknown User',
        action_type: 'updated',
        description: `Case status changed to ${newStatus.replace(/_/g, ' ')}`,
        details: note ? { note } : undefined
      };
      
      const { data, error: actionError } = await supabase
        .from('case_actions')
        .insert(newActionData)
        .select()
        .single();
      
      if (actionError) throw actionError;

      const newAction: CaseAction = {
        id: data.id,
        caseId: data.case_id,
        actionBy: data.action_by || '',
        actionByName: data.action_by_name || 'System',
        actionDate: data.action_date,
        actionType: 'status_change',
        description: data.description,
        details: data.details as Record<string, any> | undefined,
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
      // Validate UUID format for database insertion
      let validatedAssignedTo: string | null = null;
      
      if (isValidUuid(assignToId)) {
        validatedAssignedTo = assignToId;
      } else {
        // For mock data or non-UUID IDs, we'll store null in the database 
        // but keep the name for display purposes
        console.log(`Assignment ID ${assignToId} is not a valid UUID, storing null but keeping name`);
        validatedAssignedTo = null;
      }

      const { error: updateError } = await supabase
        .from('compliance_cases')
        .update({ 
          assigned_to: validatedAssignedTo, 
          assigned_to_name: assignToName,
          updated_at: new Date().toISOString() 
        })
        .eq('id', caseId);

      if (updateError) throw updateError;

      if (selectedCase?.id === caseId) {
        const updatedCase = { 
          ...selectedCase, 
          assignedTo: validatedAssignedTo, 
          assignedToName: assignToName, 
          updatedAt: new Date().toISOString() 
        };
        onCaseUpdated?.(updatedCase);
      }
      
      const newActionData: CaseActionInsert = {
        case_id: caseId,
        action_by: currentUser?.id,
        action_by_name: currentUser?.name || 'Unknown User',
        action_type: 'assigned',
        description: `Case assigned to ${assignToName}`
      };
      
      const { data, error: actionError } = await supabase
        .from('case_actions')
        .insert(newActionData)
        .select()
        .single();
      
      if (actionError) throw actionError;
      
      const newAction: CaseAction = {
        id: data.id,
        caseId: data.case_id,
        actionBy: data.action_by || '',
        actionByName: data.action_by_name || 'System',
        actionDate: data.action_date,
        actionType: 'assignment',
        description: data.description,
        details: data.details as Record<string, any> | undefined,
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
