export interface Document {
  id: string;
  userId: string;
  type: 'passport' | 'drivers_license' | 'utility_bill' | 'bank_statement' | 'other';
  fileName: string;
  uploadDate: string;
  status: 'pending' | 'verified' | 'rejected' | 'information_requested';
  verifiedBy?: string;
  verificationDate?: string;
  extractedData?: {
    name?: string;
    dob?: string;
    idNumber?: string;
    nationality?: string;
    expiryDate?: string;
    address?: string;
    issueDate?: string;
    sourceType?: string;
    amount?: string;
    verificationRequired?: string;
    accountHolder?: string;
    averageBalance?: string;
    transactionHistory?: string;
    rejection_reason?: string;
  };
}

export type { 
  PlatformRole, 
  CustomerRole, 
  Customer, 
  ExtendedUserProfile 
} from './platform-roles';

// Legacy role type for backward compatibility
export type UserRole = 'admin' | 'complianceOfficer' | 'executive' | 'support';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  riskScore: number;
  status: 'verified' | 'pending' | 'rejected' | 'information_requested'; // Updated to match ExtendedUser
  documents?: Document[];
  avatarUrl?: string;
  title?: string;
  department?: string;
  phone?: string;
  location?: string;
  customer_id?: string;
  platform_roles?: string[];
  customer_roles?: string[];
  isPlatformOwner?: boolean;
}

export interface Transaction {
  id: string;
  from: string;
  to: string;
  amount: number;
  currency: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
  risk_score?: number;
}

export interface DashboardMetrics {
  pendingDocuments: number;
  pendingKycReviews: number;
  activeAlerts: number;
  riskScoreTrend: number[];
  complianceCasesByType: {
    kyc: number;
    aml: number;
    sanctions: number;
  };
}

export interface ComplianceCase {
  id: string;
  userId: string;
  createdAt: string;
  type: 'kyc' | 'aml' | 'sanctions';
  status: 'open' | 'closed' | 'escalated';
  riskScore: number;
  description: string;
  assignedTo: string;
}
