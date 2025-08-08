
import { Database } from '@/integrations/supabase/types';

// Export specific types from the Supabase schema
export type DocumentStatus = 'pending' | 'verified' | 'rejected' | 'information_requested';
export type CaseType = Database['public']['Enums']['case_type'];
export type CaseStatus = Database['public']['Enums']['case_status'];
export type DocumentType = Database['public']['Enums']['document_type'];
export type CaseSource = Database['public']['Enums']['case_source'];

// Table row types
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Document = Database['public']['Tables']['documents']['Row'];
export type ComplianceCase = Database['public']['Tables']['compliance_cases']['Row'];
export type CaseAction = Database['public']['Tables']['case_actions']['Row'];
export type AuditLog = Database['public']['Tables']['audit_logs']['Row'];

// For now, define Customer type manually since it might not be in generated types yet
export type Customer = {
  id: string;
  name: string;
  domain: string | null;
  settings: Record<string, any>;
  subscription_tier: string;
  created_at: string;
  updated_at: string;
};

// Insert types
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type DocumentInsert = Database['public']['Tables']['documents']['Insert'];
export type ComplianceCaseInsert = Database['public']['Tables']['compliance_cases']['Insert'];
export type CaseActionInsert = Database['public']['Tables']['case_actions']['Insert'];
export type AuditLogInsert = Database['public']['Tables']['audit_logs']['Insert'];
export type CustomerInsert = Omit<Customer, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

// Update types
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];
export type DocumentUpdate = Database['public']['Tables']['documents']['Update'];
export type ComplianceCaseUpdate = Database['public']['Tables']['compliance_cases']['Update'];
export type CaseActionUpdate = Database['public']['Tables']['case_actions']['Update'];
export type AuditLogUpdate = Database['public']['Tables']['audit_logs']['Update'];
export type CustomerUpdate = Partial<CustomerInsert>;
