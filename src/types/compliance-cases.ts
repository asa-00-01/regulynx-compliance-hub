
export interface ComplianceCaseDetails {
  id: string;
  type: 'kyc' | 'aml' | 'sanctions' | 'transaction_monitoring' | 'pep' | 'other';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  risk_score: number;
  created_at: string;
  updated_at: string;
  resolved_at?: string | null;
  priority: 'low' | 'medium' | 'high' | 'critical';
  source: 'system' | 'manual' | 'alert';
  user_name: string;
  description: string;
  assigned_to?: string | null;
  assigned_to_name?: string | null;
  created_by: string;
  related_alerts: string[];
  related_transactions: string[];
  documents: any[];
  actions: any[];
}

export interface CaseAction {
  id: string;
  case_id: string;
  type: 'note' | 'status_change' | 'assignment' | 'document_upload';
  description: string;
  created_at: string;
  created_by: string;
  metadata?: any;
}

export interface CaseFilters {
  status?: string[];
  type?: string[];
  priority?: string[];
  assignedTo?: string;
  dateRange?: {
    from?: Date;
    to?: Date;
  };
}

export interface CaseSummary {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  highPriority: number;
}
