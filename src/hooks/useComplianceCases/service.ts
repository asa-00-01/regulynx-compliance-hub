
import { ComplianceCaseDetails, CaseAction, CaseFilters } from '@/types/case';
import { CaseServiceOperations } from './types';
import { supabase } from '@/integrations/supabase/client';
import { 
  ComplianceCase, 
  CaseAction as SupabaseCaseAction,
  ComplianceCaseInsert,
} from '@/types/supabase';
import { config } from '@/config/environment';
import { normalizedComplianceCases } from '@/mocks/normalizedMockData';

const mapToComplianceCaseDetails = (c: ComplianceCase): ComplianceCaseDetails => ({
  id: c.id,
  userId: c.organization_customer_id || c.user_id || '', // Prefer organization_customer_id, fallback to user_id
  userName: c.user_name!,
  createdAt: c.created_at,
  createdBy: c.created_by || undefined,
  updatedAt: c.updated_at,
  type: c.type as 'kyc_review' | 'aml_alert' | 'sanctions_hit' | 'pep_review' | 'transaction_monitoring' | 'suspicious_activity' | 'document_review' | 'compliance_breach',
  status: c.status as 'open' | 'in_progress' | 'resolved' | 'closed' | 'escalated',
  riskScore: c.risk_score,
  description: c.description,
  assignedTo: c.assigned_to || undefined,
  assignedToName: c.assigned_to_name || undefined,
  priority: c.priority as 'low' | 'medium' | 'high' | 'critical',
  source: c.source as 'system_alert' | 'manual_review' | 'external_report' | 'regulatory_request',
  relatedTransactions: (c.related_transactions as string[]) || [],
  relatedAlerts: (c.related_alerts as string[]) || [],
  documents: (c.documents as string[]) || [],
});

const mapToCaseAction = (a: SupabaseCaseAction): CaseAction => ({
  id: a.id,
  caseId: a.case_id,
  actionBy: a.action_by || '',
  actionByName: a.action_by_name || 'System',
  actionDate: a.action_date,
  actionType: mapSupabaseActionType(a.action_type),
  description: a.description,
  details: a.details as Record<string, unknown> | undefined,
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

// Helper function to validate and convert UUID
const validateAndConvertUuid = (value: string | undefined): string | null => {
  if (!value) return null;
  
  // Check if it's already a valid UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  if (uuidRegex.test(value)) {
    return value;
  }
  
  // If it's a non-UUID string like "admin_001", return null
  // This prevents the "invalid input syntax for type uuid" error
  console.warn(`Invalid UUID format: ${value}, setting to null`);
  return null;
};

// Valid database status values based on schema
const VALID_DB_STATUSES = ['open', 'closed', 'resolved', 'in_progress'] as const;
const VALID_DB_TYPES = ['kyc_review', 'aml_alert', 'sanctions_hit', 'pep_review', 'transaction_monitoring', 'suspicious_activity', 'document_review', 'compliance_breach'] as const;

// Mock data storage for runtime updates
const mockDataStore = {
  cases: [...normalizedComplianceCases]
};

// Function to update case status in mock data
export const updateMockCaseStatus = (caseId: string, newStatus: ComplianceCaseDetails['status']) => {
  const caseIndex = mockDataStore.cases.findIndex(caseItem => caseItem.id === caseId);
  if (caseIndex !== -1) {
    mockDataStore.cases[caseIndex] = {
      ...mockDataStore.cases[caseIndex],
      status: newStatus,
      updatedAt: new Date().toISOString()
    };
    console.log(`🎭 Updated mock case ${caseId} status to ${newStatus}`);
    return true;
  }
  console.warn(`🎭 Case ${caseId} not found in mock data`);
  return false;
};

// Function to get current mock data
export const getMockCasesData = () => [...mockDataStore.cases];

export const complianceCaseService: CaseServiceOperations = {
  async fetchCases(filters: CaseFilters): Promise<ComplianceCaseDetails[]> {
    // Use mock data if feature flag is enabled
    if (config.features.useMockData) {
      console.log('🎭 Using mock compliance cases data');
      let filteredCases = [...mockDataStore.cases];
      
      // Apply filters to mock data
      if (filters.status && filters.status.length > 0) {
        filteredCases = filteredCases.filter(caseItem => 
          filters.status!.includes(caseItem.status as ComplianceCaseDetails['status'])
        );
      }
      
      if (filters.type && filters.type.length > 0) {
        filteredCases = filteredCases.filter(caseItem => 
          filters.type!.includes(caseItem.type as ComplianceCaseDetails['type'])
        );
      }
      
      if (filters.priority && filters.priority.length > 0) {
        filteredCases = filteredCases.filter(caseItem => 
          filters.priority!.includes(caseItem.priority as ComplianceCaseDetails['priority'])
        );
      }
      
      if (filters.assignedTo) {
        filteredCases = filteredCases.filter(caseItem => 
          caseItem.assignedTo === filters.assignedTo
        );
      }
      
      if (filters.riskScoreMin) {
        filteredCases = filteredCases.filter(caseItem => 
          caseItem.riskScore >= filters.riskScoreMin!
        );
      }
      
      if (filters.riskScoreMax) {
        filteredCases = filteredCases.filter(caseItem => 
          caseItem.riskScore <= filters.riskScoreMax!
        );
      }
      
      return filteredCases;
    }

    // Use real database
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
      }).filter(status => VALID_DB_STATUSES.includes(status as typeof VALID_DB_STATUSES[number])) as (typeof VALID_DB_STATUSES[number])[];
      
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
      }).filter(type => VALID_DB_TYPES.includes(type as typeof VALID_DB_TYPES[number])) as (typeof VALID_DB_TYPES[number])[];
      
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
    // Validate and clean UUID fields
    const validatedAssignedTo = validateAndConvertUuid(caseData.assignedTo);
    const validatedCreatedBy = validateAndConvertUuid(caseData.createdBy);
    const validatedUserId = validateAndConvertUuid(caseData.userId);

    // Get the current user's customer_id from the auth context
    const { data: { user } } = await supabase.auth.getUser();
    let customerId = null;
    
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('customer_id')
        .eq('id', user.id)
        .single();
      
      customerId = profile?.customer_id || null;
    }

    const dbCase: Omit<ComplianceCaseInsert, 'id' | 'created_at' | 'updated_at' | 'status'> = {
      organization_customer_id: validatedUserId, // Use organization_customer_id instead of user_id
      customer_id: customerId, // Add customer_id
      user_id: null, // Set user_id to null since we're using organization_customer_id
      user_name: caseData.userName,
      created_by: validatedCreatedBy,
      type: caseData.type!,
      risk_score: caseData.riskScore!,
      description: caseData.description!,
      assigned_to: validatedAssignedTo,
      assigned_to_name: caseData.assignedToName,
      priority: caseData.priority!,
      source: caseData.source as 'system_alert' | 'manual_review' | 'external_report' | 'regulatory_request',
      related_transactions: caseData.relatedTransactions,
      related_alerts: caseData.relatedAlerts,
      documents: caseData.documents,
    };

    console.log('Creating compliance case with data:', dbCase);

    const { data, error } = await supabase
      .from('compliance_cases')
      .insert(dbCase)
      .select('*')
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
