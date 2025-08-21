
export interface ComplianceMetrics {
  totalCustomers: number;
  verifiedCustomers: number;
  pendingCustomers: number;
  rejectedCustomers: number;
  highRiskCustomers: number;
  pepCustomers: number;
  sanctionedCustomers: number;
  averageRiskScore: number;
}

export interface ComplianceUser {
  id: string;
  full_name: string;
  email: string;
  kyc_status: 'verified' | 'pending' | 'rejected' | 'information_requested';
  risk_score: number;
  country_of_residence: string;
  is_pep: boolean;
  is_sanctioned: boolean;
  created_at: string;
  updated_at: string;
}

export interface ComplianceFilters {
  searchTerm?: string;
  kycStatus?: string[];
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  country?: string;
  isPEP?: boolean;
  isSanctioned?: boolean;
}
