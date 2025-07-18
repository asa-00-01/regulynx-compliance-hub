import { ComplianceCaseDetails, CaseAction, CaseFilters } from '@/types/case';
import { CaseServiceOperations } from './types';
import { supabase } from '@/integrations/supabase/client';
import { 
  ComplianceCase, 
  CaseAction as SupabaseCaseAction,
  ComplianceCaseInsert,
  CaseStatus,
  CaseType,
} from '@/types/supabase';

const mapToComplianceCaseDetails = (c: ComplianceCase): ComplianceCaseDetails => ({
  id: c.id,
  userId: c.user_id!,
  userName: c.user_name!,
  createdAt: c.created_at,
  createdBy: c.created_by || undefined,
  updatedAt: c.updated_at,
  type: c.type,
  status: c.status,
  riskScore: c.risk_score,
  description: c.description,
  assignedTo: c.assigned_to || undefined,
  assignedToName: c.assigned_to_name || undefined,
  priority: c.priority,
  source: c.source!,
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
  actionType: a.action_type,
  description: a.description,
  details: a.details as Record<string, any> | undefined,
});

export const complianceCaseService: CaseServiceOperations = {
  async fetchCases(filters: CaseFilters): Promise<ComplianceCaseDetails[]> {
    let query = supabase.from('compliance_cases').select('*');

    if (filters.status && filters.status.length > 0) {
      query = query.in('status', filters.status as CaseStatus[]);
    }
    if (filters.type && filters.type.length > 0) {
      query = query.in('type', filters.type as CaseType[]);
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
      source: caseData.source,
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
    
    return data ? data.map(a => ({
        id: a.id,
        caseId: a.case_id,
        actionBy: a.action_by || '',
        actionByName: a.action_by_name || 'System',
        actionDate: a.action_date,
        actionType: a.action_type,
        description: a.description,
        details: a.details as Record<string, any> | undefined,
      })) 
      : [];
  }
};
