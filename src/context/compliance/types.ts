
import { KYCUser, UserFlags } from '@/types/kyc';
import { AMLTransaction } from '@/types/aml';
import { Document } from '@/types';
import { ComplianceCaseDetails } from '@/types/case';

export interface UnifiedUserData {
  id: string;
  fullName: string;
  email: string;
  dateOfBirth?: string;
  nationality?: string;
  identityNumber?: string;
  phoneNumber?: string;
  address?: string;
  countryOfResidence?: string;
  createdAt: string;
  kycStatus: 'verified' | 'pending' | 'rejected' | 'information_requested';
  kycFlags: UserFlags;
  riskScore: number;
  documents: Document[];
  transactions: AMLTransaction[];
  complianceCases: ComplianceCaseDetails[];
  notes?: string[];
  isPEP: boolean;
  isSanctioned: boolean;
}

export interface ComplianceState {
  users: UnifiedUserData[];
  selectedUserId: string | null;
  selectedCase: ComplianceCaseDetails | null;
  globalFilters: {
    searchTerm: string;
    riskLevel: string;
    dateRange: string;
    kycStatus: string[];
    country: string | undefined;
  };
}

export type ComplianceAction =
  | { type: 'SET_SELECTED_USER'; payload: string | null }
  | { type: 'SET_SELECTED_CASE'; payload: ComplianceCaseDetails | null }
  | { type: 'UPDATE_USER_DATA'; payload: Partial<UnifiedUserData> & { id: string } }
  | { type: 'SET_GLOBAL_FILTERS'; payload: Partial<ComplianceState['globalFilters']> }
  | { type: 'ADD_CASE_TO_USER'; payload: { userId: string; caseData: ComplianceCaseDetails } }
  | { type: 'ADD_DOCUMENT_TO_USER'; payload: { userId: string; document: Document } }
  | { type: 'ADD_TRANSACTION_TO_USER'; payload: { userId: string; transaction: AMLTransaction } };
