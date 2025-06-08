
export type UserRole = 'complianceOfficer' | 'admin' | 'executive' | 'support';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  avatarUrl?: string;
}

export type DocumentStatus = 'pending' | 'verified' | 'rejected' | 'information_requested';

export interface Document {
  id: string;
  userId: string;
  type: 'passport' | 'id' | 'license';
  fileName: string;
  uploadDate: string;
  status: DocumentStatus;
  verifiedBy?: string;
  verificationDate?: string;
  extractedData?: {
    name?: string;
    dob?: string;
    idNumber?: string;
    nationality?: string;
    expiryDate?: string;
  };
}

export interface ComplianceCase {
  id: string;
  userId: string;
  createdAt: string;
  type: 'kyc' | 'aml' | 'sanctions';
  status: 'open' | 'resolved' | 'escalated';
  riskScore: number;
  description: string;
  assignedTo?: string;
  actions?: {
    date: string;
    action: string;
    by: string;
  }[];
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
