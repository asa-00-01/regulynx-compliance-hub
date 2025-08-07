
export interface DashboardMetrics {
  totalCases: number;
  openCases: number;
  pendingReview: number;
  averageRiskScore: number;
  riskScoreTrend: number;
}

export interface ComplianceCase {
  id: string;
  userId: string;
  type: 'kyc' | 'aml' | 'sanctions';
  status: 'open' | 'under_review' | 'escalated' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
  riskScore: number;
}

export type CasePriority = 'low' | 'medium' | 'high' | 'critical';
export type CaseStatus = 'open' | 'under_review' | 'escalated' | 'closed';
export type CaseType = 'kyc' | 'aml' | 'sanctions';
