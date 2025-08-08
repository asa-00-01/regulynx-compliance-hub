
import { ComplianceCaseDetails, CaseAction, CaseFilters } from '@/types/case';
import { CaseServiceOperations } from './types';
import { supabase } from '@/integrations/supabase/client';
import { 
  ComplianceCase, 
  CaseAction as SupabaseCaseAction,
  ComplianceCaseInsert,
} from '@/types/supabase';

const mapToComplianceCaseDetails = (c: ComplianceCase): ComplianceCaseDetails => ({
  id: c.id,
  userId: c.user_id!,
  userName: c.user_name!,
  createdAt: c.created_at,
  createdBy: c.created_by || undefined,
  updatedAt: c.updated_at,
  type: c.type as 'kyc' | 'aml' | 'sanctions',
  status: c.status as 'open' | 'under_review' | 'escalated' | 'pending_info' | 'closed',
  riskScore: c.risk_score,
  description: c.description,
  assignedTo: c.assigned_to || undefined,
  assignedToName: c.assigned_to_name || undefined,
  priority: c.priority as 'low' | 'medium' | 'high' | 'critical',
  source: c.source as 'manual' | 'transaction_alert' | 'kyc_flag' | 'sanctions_hit' | 'system' | 'risk_assessment',
  relatedTransactions: c.related_transactions || [],
  relatedAlerts: c.related_alerts || [],
  documents: c.documents || [],
});

const mapToCaseAction = (a: SupabaseCaseAction): CaseAction => ({
  id: a.id,
  caseId: a.case_id,
  actionBy: a.action_by || '',
  actionByName: a.action_by_name || 'System',
  actionDate: a.action_date,
  actionType: mapSupabaseActionType(a.action_type),
  description: a.description,
  details: a.details as Record<string, any> | undefined,
});

const mapSupabaseActionType = (supabaseType: string): 'note' | 'status_change' | 'assignment' | 'document_request' | 'escalation' | 'resolution' => {
  switch (supabaseType) {
    case 'created':
    case 'updated':
    case 'commented':
      return 'note';
    case 'closed':
    case 'resolved':
      return 'status_change';
    case 'assigned':
      return 'assignment';
    default:
      return 'note';
  }
};

// Valid database status values based on schema
const VALID_DB_STATUSES = ['open', 'closed', 'resolved', 'in_progress'] as const;
const VALID_DB_TYPES = ['kyc', 'aml', 'sanctions', 'fraud', 'other'] as const;

export const complianceCaseService: CaseServiceOperations = {
  async fetchCases(filters: CaseFilters): Promise<ComplianceCaseDetails[]> {
    let query = supabase.from('compliance_cases').select('*');

    if (filters.status && filters.status.length > 0) {
      // Map application statuses to database statuses with proper typing
      const dbStatuses = filters.status.map(status => {
        switch (status) {
          case 'under_review': return 'in_progress';
          case 'pending_info': return 'in_progress'; 
          case 'escalated': return 'in_progress';
          case 'closed': return 'resolved';
          default: return status;
        }
      }).filter(status => VALID_DB_STATUSES.includes(status as any)) as (typeof VALID_DB_STATUSES[number])[];
      
      if (dbStatuses.length > 0) {
        query = query.in('status', dbStatuses);
      }
    }
    
    if (filters.type && filters.type.length > 0) {
      // Map application types to database types
      const dbTypes = filters.type.map(type => {
        switch (type) {
          case 'transaction': return 'fraud';
          case 'pep': return 'other';
          case 'document': return 'other';
          default: return type;
        }
      }).filter(type => VALID_DB_TYPES.includes(type as any)) as (typeof VALID_DB_TYPES[number])[];
      
      if (dbTypes.length > 0) {
        query = query.in('type', dbTypes);
      }
    }
    
    if (filters.priority && filters.priority.length > 0) {
      query = query.in('priority', filters.priority);
    }
    if (filters.assignedTo) {
      query = query.eq('assigned_to', filters.assignedTo);
    }
    if (filters.riskScoreMin) {
      query = query.gte('risk_score', filters.riskScoreMin);
    }
    if (filters.riskScoreMax) {
      query = query.lte('risk_score', filters.riskScoreMax);
    }
    if (filters.searchTerm) {
      query = query.or(`user_name.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching compliance cases:', error);
      throw error;
    }
    
    return data ? data.map(mapToComplianceCaseDetails) : [];
  },

  async createCase(caseData: Partial<ComplianceCaseDetails>): Promise<ComplianceCaseDetails> {
    const dbCase: Omit<ComplianceCaseInsert, 'id' | 'created_at' | 'updated_at' | 'status'> = {
      user_id: caseData.userId,
      user_name: caseData.userName,
      created_by: caseData.createdBy,
      type: caseData.type!,
      risk_score: caseData.riskScore!,
      description: caseData.description!,
      assigned_to: caseData.assignedTo,
      assigned_to_name: caseData.assignedToName,
      priority: caseData.priority!,
      source: caseData.source as any,
      related_transactions: caseData.relatedTransactions,
      related_alerts: caseData.relatedAlerts,
      documents: caseData.documents,
    };

    const { data, error } = await supabase
      .from('compliance_cases')
      .insert(dbCase)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating compliance case:', error);
      throw error;
    }

    return mapToComplianceCaseDetails(data);
  },

  async fetchCaseActions(caseId: string): Promise<CaseAction[]> {
    const { data, error } = await supabase
      .from('case_actions')
      .select('*')
      .eq('case_id', caseId)
      .order('action_date', { ascending: true });

    if (error) {
      console.error('Error fetching case actions:', error);
      throw error;
    }
    
    return data ? data.map(mapToCaseAction) : [];
  }
};
