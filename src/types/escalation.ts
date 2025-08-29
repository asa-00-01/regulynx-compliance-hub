// Types for the comprehensive escalation workflow

export interface EscalationRule {
  id: string;
  customerId: string;
  name: string;
  description?: string;
  caseType?: 'kyc_review' | 'aml_alert' | 'sanctions_hit' | 'pep_review' | 'transaction_monitoring' | 'suspicious_activity' | 'document_review' | 'compliance_breach';
  priorityThreshold?: 'low' | 'medium' | 'high' | 'critical';
  riskScoreThreshold?: number;
  timeThresholdHours?: number;
  escalationLevel: number;
  targetRole?: 'customer_admin' | 'customer_compliance' | 'customer_executive' | 'customer_support';
  targetUserId?: string;
  autoAssign: boolean;
  sendNotifications: boolean;
  priorityBoost: boolean;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface EscalationHistory {
  id: string;
  caseId: string;
  escalationRuleId?: string;
  escalatedFromUserId?: string;
  escalatedToUserId?: string;
  escalatedToRole?: 'customer_admin' | 'customer_compliance' | 'customer_executive' | 'customer_support';
  escalationLevel: number;
  reason: string;
  previousPriority?: string;
  newPriority?: string;
  previousAssignedTo?: string;
  newAssignedTo?: string;
  escalationDate: string;
  resolvedAt?: string;
  resolutionNotes?: string;
}

export interface EscalationNotification {
  id: string;
  escalationHistoryId: string;
  notificationType: 'email' | 'sms' | 'in_app' | 'slack';
  recipientUserId?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  subject?: string;
  message: string;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  retryCount: number;
  errorMessage?: string;
  createdAt: string;
}

export interface SLATracking {
  id: string;
  caseId: string;
  escalationLevel: number;
  slaType: 'response_time' | 'resolution_time' | 'escalation_time';
  targetHours: number;
  startTime: string;
  endTime?: string;
  status: 'active' | 'met' | 'breached' | 'paused';
  breachReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EscalationCheckResult {
  shouldEscalate: boolean;
  ruleId?: string;
  escalationLevel?: number;
  targetRole?: 'customer_admin' | 'customer_compliance' | 'customer_executive' | 'customer_support';
  targetUserId?: string;
  reason?: string;
}

export interface SLABreachResult {
  slaId: string;
  caseId: string;
  escalationLevel: number;
  slaType: string;
  targetHours: number;
  actualHours: number;
  status: string;
}

export interface EscalationWorkflowConfig {
  enableAutomaticEscalation: boolean;
  enableNotifications: boolean;
  enableSLATracking: boolean;
  defaultEscalationRules: EscalationRule[];
  notificationChannels: ('email' | 'sms' | 'in_app' | 'slack')[];
  slaTargets: {
    level1: number; // hours
    level2: number;
    level3: number;
    level4: number;
    level5: number;
  };
}

export interface EscalationSummary {
  totalEscalations: number;
  activeEscalations: number;
  slaBreaches: number;
  escalationLevels: {
    level1: number;
    level2: number;
    level3: number;
    level4: number;
    level5: number;
  };
  recentEscalations: EscalationHistory[];
  slaBreaches: SLABreachResult[];
}

export interface EscalationFilters {
  caseId?: string;
  escalationLevel?: number;
  status?: 'active' | 'resolved';
  dateFrom?: string;
  dateTo?: string;
  assignedTo?: string;
  slaStatus?: 'active' | 'met' | 'breached';
}

// Types for API requests and responses
export interface CreateEscalationRuleRequest {
  name: string;
  description?: string;
  caseType?: EscalationRule['caseType'];
  priorityThreshold?: EscalationRule['priorityThreshold'];
  riskScoreThreshold?: number;
  timeThresholdHours?: number;
  escalationLevel: number;
  targetRole?: EscalationRule['targetRole'];
  targetUserId?: string;
  autoAssign?: boolean;
  sendNotifications?: boolean;
  priorityBoost?: boolean;
}

export interface UpdateEscalationRuleRequest extends Partial<CreateEscalationRuleRequest> {
  isActive?: boolean;
}

export interface ManualEscalationRequest {
  caseId: string;
  escalationLevel: number;
  reason: string;
  targetUserId?: string;
  targetRole?: EscalationRule['targetRole'];
  priorityBoost?: boolean;
  sendNotifications?: boolean;
}

export interface EscalationResolutionRequest {
  escalationHistoryId: string;
  resolutionNotes: string;
  newStatus?: 'resolved' | 'closed';
}

// Types for dashboard and reporting
export interface EscalationMetrics {
  totalEscalations: number;
  escalationsToday: number;
  escalationsThisWeek: number;
  escalationsThisMonth: number;
  averageResolutionTime: number; // hours
  slaComplianceRate: number; // percentage
  escalationByLevel: Record<number, number>;
  escalationByType: Record<string, number>;
  topEscalatedCases: Array<{
    caseId: string;
    caseType: string;
    escalationLevel: number;
    escalationDate: string;
    assignedTo?: string;
  }>;
}

export interface EscalationDashboardData {
  metrics: EscalationMetrics;
  recentEscalations: EscalationHistory[];
  slaBreaches: SLABreachResult[];
  pendingNotifications: EscalationNotification[];
  escalationRules: EscalationRule[];
}
