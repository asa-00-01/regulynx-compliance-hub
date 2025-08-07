
import { AMLTransaction } from '@/types/aml';
import { Document } from '@/types/supabase';
import { ComplianceCaseDetails } from '@/types/case';

export interface UnifiedUserData {
  id: string;
  fullName: string;
  email: string;
  dateOfBirth: string;
  nationality: string;
  identityNumber: string;
  phoneNumber: string;
  address: string;
  countryOfResidence: string;
  riskScore: number;
  isPEP: boolean;
  isSanctioned: boolean;
  kycStatus: 'verified' | 'pending' | 'rejected' | 'information_requested';
  createdAt: string;
  kycFlags: {
    userId: string;
    is_registered: boolean;
    is_email_confirmed: boolean;
    is_verified_pep: boolean;
    is_sanction_list: boolean;
    riskScore: number;
  };
  documents: Document[];
  transactions: AMLTransaction[];
  complianceCases: ComplianceCaseDetails[];
  notes: any[];
}

export interface GlobalFilters {
  searchTerm: string;
  riskLevel: 'all' | 'low' | 'medium' | 'high' | 'critical';
  dateRange: '7days' | '30days' | '90days' | '1year' | 'all';
  kycStatus: ('verified' | 'pending' | 'rejected' | 'information_requested')[];
  country?: string;
}

export interface RiskRule {
  id: string;
  name: string;
  description: string;
  riskFactor: number;
  isActive: boolean;
}

export interface ComplianceState {
  users: UnifiedUserData[];
  selectedUserId: string | null;
  selectedCase: ComplianceCaseDetails | null;
  globalFilters: GlobalFilters;
  transactions: AMLTransaction[];
  cases: ComplianceCaseDetails[];
  riskRules: RiskRule[];
  filteredUsers: UnifiedUserData[];
  userRiskScores: Record<string, number>;
}

export type ComplianceAction =
  | { type: 'SET_USERS'; payload: UnifiedUserData[] }
  | { type: 'UPDATE_USER_DATA'; payload: UnifiedUserData }
  | { type: 'SET_SELECTED_USER'; payload: string | null }
  | { type: 'SET_SELECTED_CASE'; payload: ComplianceCaseDetails | null }
  | { type: 'SET_GLOBAL_FILTERS'; payload: GlobalFilters }
  | { type: 'UPDATE_USER_STATUS'; payload: { userId: string; status: 'verified' | 'pending' | 'flagged' } }
  | { type: 'UPDATE_USER_RISK_SCORE'; payload: { userId: string; riskScore: number } }
  | { type: 'CREATE_COMPLIANCE_CASE'; payload: ComplianceCaseDetails }
  | { type: 'UPDATE_COMPLIANCE_CASE'; payload: { caseId: string; updates: Partial<ComplianceCaseDetails> } }
  | { type: 'FILTER_USERS'; payload: any }
  | { type: 'SET_TRANSACTIONS'; payload: AMLTransaction[] }
  | { type: 'SET_CASES'; payload: ComplianceCaseDetails[] }
  | { type: 'SET_RISK_RULES'; payload: RiskRule[] };
