
export interface Document {
  id: string;
  userId: string;
  type: 'passport' | 'id' | 'license';
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
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  riskScore: number;
  status: 'verified' | 'pending' | 'flagged';
  documents?: Document[];
  role?: UserRole;
  avatarUrl?: string;
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

export type UserRole = 'admin' | 'complianceOfficer' | 'executive' | 'support';

export interface ComplianceCase {
  id: string;
  userId: string;
  status: 'open' | 'closed' | 'pending' | 'under_review' | 'escalated' | 'pending_info';
  type: 'kyc' | 'aml' | 'sanctions';
  createdAt: string;
  updatedAt: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo?: string;
  description?: string;
  riskScore?: number;
}

export interface DashboardMetrics {
  totalUsers: number;
  pendingCases: number;
  riskScore: number;
  completedVerifications: number;
  pendingDocuments?: number;
  pendingKycReviews?: number;
  activeAlerts?: number;
  riskScoreTrend?: number;
}
