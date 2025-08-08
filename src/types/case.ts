
import { User } from "./index";

export type CasePriority = 'low' | 'medium' | 'high' | 'critical';
export type CaseSource = 'manual' | 'transaction_alert' | 'kyc_flag' | 'sanctions_hit' | 'system' | 'risk_assessment';

export interface ComplianceCaseDetails {
  id: string;
  userId: string;
  userName: string;
  createdAt: string;
  createdBy?: string;
  updatedAt: string;
  type: 'kyc' | 'aml' | 'sanctions';
  status: 'open' | 'under_review' | 'escalated' | 'pending_info' | 'closed'; // Match database enum
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

// New interfaces for customer monitoring
export interface CustomerMonitoringAction {
  id: string;
  type: 'review' | 'flag' | 'case_creation' | 'document_request' | 'restriction';
  customerId: string;
  description: string;
  createdAt: string;
  createdBy: string;
  status: 'pending' | 'completed' | 'canceled';
}

export interface CustomerRiskOverride {
  id: string;
  customerId: string;
  originalScore: number;
  overrideScore: number;
  reason: string;
  createdAt: string;
  createdBy: string;
  expiresAt?: string;
}
