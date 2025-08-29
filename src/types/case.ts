
import { User } from "./index";

export type CasePriority = 'low' | 'medium' | 'high' | 'critical';
export type CaseSource = 'system_alert' | 'manual_review' | 'external_report' | 'regulatory_request';

export interface ComplianceCaseDetails {
  id: string;
  userId: string;
  userName: string;
  createdAt: string;
  createdBy?: string;
  updatedAt: string;
  type: 'kyc_review' | 'aml_alert' | 'sanctions_hit' | 'pep_review' | 'transaction_monitoring' | 'suspicious_activity' | 'document_review' | 'compliance_breach';
  status: 'open' | 'in_progress' | 'resolved' | 'closed' | 'escalated'; // Match database enum
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
  details?: Record<string, unknown>;
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
