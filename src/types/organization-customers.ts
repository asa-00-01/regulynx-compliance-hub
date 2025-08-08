
import { Database } from '@/integrations/supabase/types';

// Organization customer types - these are the end-users that SaaS customers monitor for compliance
export type OrganizationCustomer = Database['public']['Tables']['organization_customers']['Row'];
export type OrganizationCustomerInsert = Database['public']['Tables']['organization_customers']['Insert'];
export type OrganizationCustomerUpdate = Database['public']['Tables']['organization_customers']['Update'];

// AML Transaction types - linked to organization customers
export type AMLTransaction = Database['public']['Tables']['aml_transactions']['Row'];
export type AMLTransactionInsert = Database['public']['Tables']['aml_transactions']['Insert'];
export type AMLTransactionUpdate = Database['public']['Tables']['aml_transactions']['Update'];

export interface EnrichedOrganizationCustomer extends OrganizationCustomer {
  // Additional computed fields for UI display
  transactionCount?: number;
  lastTransactionDate?: string;
  complianceCaseCount?: number;
  documentCount?: number;
  
  // Related data
  transactions?: AMLTransaction[];
  documents?: any[];
  complianceCases?: any[];
}

// KYC status mapping for better type safety
export type KYCStatus = 'verified' | 'pending' | 'rejected' | 'information_requested';

// Risk level categories
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface OrganizationCustomerFilters {
  searchTerm?: string;
  kycStatus?: KYCStatus[];
  riskLevel?: RiskLevel;
  country?: string;
  customerId?: string;
  isPEP?: boolean;
  isSanctioned?: boolean;
  dateRange?: {
    from: Date;
    to: Date;
  };
}

export interface OrganizationCustomerStats {
  totalCustomers: number;
  verifiedCustomers: number;
  pendingCustomers: number;
  rejectedCustomers: number;
  highRiskCustomers: number;
  pepCustomers: number;
  sanctionedCustomers: number;
  averageRiskScore: number;
}
