import { AMLTransaction } from '@/types/aml';
import { Document } from '@/types';
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
  metadata?: {
    hasDocuments?: boolean;
    hasTransactions?: boolean;
    hasCases?: boolean;
    totalTransactionAmount?: number;
    lastActivityDate?: string;
    completenessScore?: number;
    enhancedProfile?: boolean;
    transferHabit?: string;
    frequencyOfTransaction?: string;
    receiverCountries?: string[];
    sendToMultipleRecipients?: boolean;
    recipientRelationship?: string[];
    originsOfFunds?: string[];
    lastScreenedAt?: string;
    lastLogin?: string;
    hasCompleteDocuments?: boolean;
    hasRecentTransactions?: boolean;
    dataQualityScore?: number;
    testingReady?: boolean;
  };
}

export interface GlobalFilters {
  searchTerm: string;
  riskLevel: 'all' | 'low' | 'medium' | 'high' | 'critical';
  dateRange: '7days' | '30days' | '90days' | '1year' | 'all';
  kycStatus: ('verified' | 'pending' | 'rejected' | 'information_requested')[];
  country?: string;
}

export interface ComplianceState {
  users: UnifiedUserData[];
  selectedUserId: string | null;
  selectedCase: ComplianceCaseDetails | null;
  globalFilters: GlobalFilters;
}

export type ComplianceAction =
  | { type: 'SET_USERS'; payload: UnifiedUserData[] }
  | { type: 'UPDATE_USER_DATA'; payload: UnifiedUserData }
  | { type: 'SET_SELECTED_USER'; payload: string | null }
  | { type: 'SET_SELECTED_CASE'; payload: ComplianceCaseDetails | null }
  | { type: 'SET_GLOBAL_FILTERS'; payload: GlobalFilters };
