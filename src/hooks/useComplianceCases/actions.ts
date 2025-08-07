
import { useState, useCallback } from 'react';
import { ComplianceCaseDetails, CaseAction } from '@/types/case';
import { User } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CaseActionInsert, ActionType } from '@/types/supabase';

// Map Supabase ActionType to our CaseAction actionType
const mapActionType = (supabaseType: ActionType): CaseAction['actionType'] => {
  switch (supabaseType) {
    case 'created': return 'note';
    case 'updated': return 'status_change';
    case 'assigned': return 'assignment';
    case 'escalated': return 'escalation';
    case 'resolved': return 'resolution';
    case 'closed': return 'resolution';
    case 'note_added': return 'note';
    default: return 'note';
  }
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
        action_by_name: currentUser?.fullName || currentUser?.name || 'Unknown User',
        action_type: 'note_added' as ActionType,
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
        actionType: mapActionType(data.action_type),
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
      // Map our case status to Supabase status
      let supabaseStatus = newStatus;
      if (newStatus === 'under_review') {
        supabaseStatus = 'investigating' as any;
      } else if (newStatus === 'pending_info') {
        supabaseStatus = 'open' as any;
      }

      const { error: updateError } = await supabase
        .from('compliance_cases')
        .update({ status: supabaseStatus as any, updated_at: new Date().toISOString() })
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
        action_by_name: currentUser?.fullName || currentUser?.name || 'Unknown User',
        action_type: 'updated' as ActionType,
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
        actionType: mapActionType(data.action_type),
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
       const { error: updateError } = await supabase
        .from('compliance_cases')
        .update({ 
          assigned_to: assignToId, 
          assigned_to_name: assignToName,
          updated_at: new Date().toISOString() 
        })
        .eq('id', caseId);

      if (updateError) throw updateError;

      if (selectedCase?.id === caseId) {
        const updatedCase = { 
          ...selectedCase, 
          assignedTo: assignToId, 
          assignedToName: assignToName, 
          updatedAt: new Date().toISOString() 
        };
        onCaseUpdated?.(updatedCase);
      }
      
      const newActionData: CaseActionInsert = {
        case_id: caseId,
        action_by: currentUser?.id,
        action_by_name: currentUser?.fullName || currentUser?.name || 'Unknown User',
        action_type: 'assigned' as ActionType,
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
        actionType: mapActionType(data.action_type),
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
