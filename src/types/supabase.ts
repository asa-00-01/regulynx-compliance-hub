
import { Database } from '@/integrations/supabase/types';

// Export specific types from the Supabase schema
export type DocumentStatus = 'pending' | 'verified' | 'rejected' | 'information_requested';
export type CaseType = Database['public']['Enums']['case_type'];
export type CaseStatus = Database['public']['Enums']['case_status'];
export type DocumentType = Database['public']['Enums']['document_type'];
export type CaseSource = Database['public']['Enums']['case_source'];
export type PlatformRole = Database['public']['Enums']['platform_role'];
export type CustomerRole = Database['public']['Enums']['customer_role'];
export type UserRole = Database['public']['Enums']['user_role'];
export type UserStatus = Database['public']['Enums']['user_status'];

// Table row types
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Document = Database['public']['Tables']['documents']['Row'];
export type ComplianceCase = Database['public']['Tables']['compliance_cases']['Row'];
export type CaseAction = Database['public']['Tables']['case_actions']['Row'];
export type AuditLog = Database['public']['Tables']['audit_logs']['Row'];
export type Customer = Database['public']['Tables']['customers']['Row'];
export type PlatformRoleAssignment = Database['public']['Tables']['platform_roles']['Row'];
export type UserRoleAssignment = Database['public']['Tables']['user_roles']['Row'];

// Insert types
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type DocumentInsert = Database['public']['Tables']['documents']['Insert'];
export type ComplianceCaseInsert = Database['public']['Tables']['compliance_cases']['Insert'];
export type CaseActionInsert = Database['public']['Tables']['case_actions']['Insert'];
export type AuditLogInsert = Database['public']['Tables']['audit_logs']['Insert'];
export type CustomerInsert = Database['public']['Tables']['customers']['Insert'];
export type PlatformRoleInsert = Database['public']['Tables']['platform_roles']['Insert'];
export type UserRoleInsert = Database['public']['Tables']['user_roles']['Insert'];

// Update types
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];
export type DocumentUpdate = Database['public']['Tables']['documents']['Update'];
export type ComplianceCaseUpdate = Database['public']['Tables']['compliance_cases']['Update'];
export type CaseActionUpdate = Database['public']['Tables']['case_actions']['Update'];
export type AuditLogUpdate = Database['public']['Tables']['audit_logs']['Update'];
export type CustomerUpdate = Database['public']['Tables']['customers']['Update'];
export type PlatformRoleUpdate = Database['public']['Tables']['platform_roles']['Update'];
export type UserRoleUpdate = Database['public']['Tables']['user_roles']['Update'];
