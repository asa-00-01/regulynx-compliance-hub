
import { User } from "./index";

export type CasePriority = 'low' | 'medium' | 'high' | 'critical';
export type CaseSource = 'manual' | 'transaction_alert' | 'kyc_flag' | 'sanctions_hit' | 'system';

export interface ComplianceCaseDetails {
  id: string;
  userId: string;
  userName: string;
  createdAt: string;
  createdBy?: string;
  updatedAt: string;
  type: 'kyc' | 'aml' | 'sanctions';
  status: 'open' | 'under_review' | 'escalated' | 'pending_info' | 'closed';
  riskScore: number;
  description: string;
  assignedTo?: string;
  assignedToName?: string;
  priority: CasePriority;
  source: CaseSource;
  relatedTransactions?: string[];
  relatedAlerts?: string[];
  documents?: string[];
}

export interface CaseAction {
  id: string;
  caseId: string;
  actionBy: string;
  actionByName: string;
  actionDate: string;
  actionType: 'note' | 'status_change' | 'assignment' | 'document_request' | 'escalation' | 'resolution';
  description: string;
  details?: Record<string, any>;
}

export interface CaseFilters {
  status?: string[];
  type?: string[];
  priority?: CasePriority[];
  dateRange?: string;
  assignedTo?: string;
  riskScoreMin?: number;
  riskScoreMax?: number;
  searchTerm?: string;
}

export interface CaseSummary {
  totalCases: number;
  openCases: number;
  highRiskCases: number;
  escalatedCases: number;
  resolvedLastWeek: number;
  averageResolutionDays: number;
  casesByType: Record<string, number>;
  casesByStatus: Record<string, number>;
}
