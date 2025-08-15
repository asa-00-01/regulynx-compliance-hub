
import { Database } from '@/integrations/supabase/types';

// Core types based on new schema
export type OrganizationCustomer = {
  id: string;
  customer_id: string;
  external_customer_id?: string;
  full_name: string;
  email?: string;
  phone_number?: string;
  date_of_birth?: string;
  nationality?: string;
  identity_number?: string;
  address?: string;
  country_of_residence?: string;
  kyc_status: 'verified' | 'pending' | 'rejected' | 'information_requested';
  risk_score: number;
  is_pep: boolean;
  is_sanctioned: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
};

export type OrganizationCustomerInsert = Omit<OrganizationCustomer, 'id' | 'created_at' | 'updated_at'>;
export type OrganizationCustomerUpdate = Partial<Omit<OrganizationCustomer, 'id' | 'created_at'>>;

// Enhanced type with related data
export type EnrichedOrganizationCustomer = OrganizationCustomer & {
  transactions?: AMLTransaction[];
  documents?: Document[];
  complianceCases?: ComplianceCase[];
  transactionCount: number;
  lastTransactionDate?: string;
  complianceCaseCount: number;
  documentCount: number;
};

// Related entity types
export type AMLTransaction = {
  id: string;
  organization_customer_id: string;
  customer_id: string;
  external_transaction_id: string;
  from_account: string;
  to_account: string;
  amount: number;
  currency: string;
  transaction_type: string;
  transaction_date: string;
  description?: string;
  risk_score: number;
  flags: any[];
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  created_at: string;
  updated_at: string;
};

export type Document = {
  id: string;
  organization_customer_id?: string;
  customer_id?: string;
  user_id?: string;
  type: 'passport' | 'drivers_license' | 'national_id' | 'utility_bill' | 'bank_statement' | 'proof_of_income' | 'other';
  file_name: string;
  file_path: string;
  status: 'pending' | 'verified' | 'rejected' | 'information_requested';
  upload_date: string;
  verified_by?: string;
  verification_date?: string;
  extracted_data?: any;
  created_at: string;
  updated_at: string;
};

export type ComplianceCase = {
  id: string;
  organization_customer_id?: string;
  customer_id?: string;
  user_id?: string;
  type: 'kyc_review' | 'aml_alert' | 'sanctions_hit' | 'pep_review' | 'transaction_monitoring' | 'suspicious_activity' | 'document_review' | 'compliance_breach';
  status: 'open' | 'in_progress' | 'resolved' | 'closed' | 'escalated';
  priority: 'low' | 'medium' | 'high' | 'critical';
  source?: 'system_alert' | 'manual_review' | 'external_report' | 'regulatory_request';
  user_name?: string;
  description: string;
  risk_score: number;
  assigned_to?: string;
  assigned_to_name?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  related_alerts: any[];
  related_transactions: any[];
  documents: any[];
};

// Filter and stats types
export type OrganizationCustomerFilters = {
  searchTerm?: string;
  kycStatus?: ('verified' | 'pending' | 'rejected' | 'information_requested')[];
  country?: string;
  isPEP?: boolean;
  isSanctioned?: boolean;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
};

export type OrganizationCustomerStats = {
  totalCustomers: number;
  verifiedCustomers: number;
  pendingCustomers: number;
  rejectedCustomers: number;
  highRiskCustomers: number;
  pepCustomers: number;
  sanctionedCustomers: number;
  averageRiskScore: number;
};
