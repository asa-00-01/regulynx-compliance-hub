
export interface ComplianceCase {
  id: string;
  userId: string;
  type: 'aml' | 'kyc' | 'sanctions' | 'fraud';
  status: 'open' | 'under_review' | 'closed' | 'escalated';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  tags?: string[];
  notes?: string[];
}

export interface DashboardMetrics {
  totalUsers: number;
  pendingVerifications: number;
  completedThisMonth: number;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  recentDocuments: Document[];
  complianceCases: ComplianceCase[];
}
