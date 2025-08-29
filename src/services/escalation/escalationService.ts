import { supabase } from '@/integrations/supabase/client';
import {
  EscalationRule,
  EscalationHistory,
  EscalationNotification,
  SLATracking,
  EscalationCheckResult,
  SLABreachResult,
  CreateEscalationRuleRequest,
  UpdateEscalationRuleRequest,
  ManualEscalationRequest,
  EscalationResolutionRequest,
  EscalationSummary,
  EscalationFilters,
  EscalationMetrics,
  EscalationDashboardData
} from '@/types/escalation';

export class EscalationService {
  // Escalation Rules Management
  static async getEscalationRules(customerId?: string): Promise<EscalationRule[]> {
    try {
      let query = supabase
        .from('escalation_rules')
        .select('*')
        .eq('is_active', true);

      if (customerId) {
        query = query.eq('customer_id', customerId);
      }

      const { data, error } = await query.order('escalation_level', { ascending: true });

      if (error) throw error;

      return data?.map(mapToEscalationRule) || [];
    } catch (error) {
      console.error('Error fetching escalation rules:', error);
      throw error;
    }
  }

  static async createEscalationRule(rule: CreateEscalationRuleRequest): Promise<EscalationRule> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('customer_id')
        .eq('id', user.id)
        .single();

      if (!profile?.customer_id) throw new Error('User not associated with any organization');

      const { data, error } = await supabase
        .from('escalation_rules')
        .insert({
          customer_id: profile.customer_id,
          name: rule.name,
          description: rule.description,
          case_type: rule.caseType,
          priority_threshold: rule.priorityThreshold,
          risk_score_threshold: rule.riskScoreThreshold,
          time_threshold_hours: rule.timeThresholdHours,
          escalation_level: rule.escalationLevel,
          target_role: rule.targetRole,
          target_user_id: rule.targetUserId,
          auto_assign: rule.autoAssign ?? true,
          send_notifications: rule.sendNotifications ?? true,
          priority_boost: rule.priorityBoost ?? false,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      return mapToEscalationRule(data);
    } catch (error) {
      console.error('Error creating escalation rule:', error);
      throw error;
    }
  }

  static async updateEscalationRule(ruleId: string, updates: UpdateEscalationRuleRequest): Promise<EscalationRule> {
    try {
      const { data, error } = await supabase
        .from('escalation_rules')
        .update({
          name: updates.name,
          description: updates.description,
          case_type: updates.caseType,
          priority_threshold: updates.priorityThreshold,
          risk_score_threshold: updates.riskScoreThreshold,
          time_threshold_hours: updates.timeThresholdHours,
          escalation_level: updates.escalationLevel,
          target_role: updates.targetRole,
          target_user_id: updates.targetUserId,
          auto_assign: updates.autoAssign,
          send_notifications: updates.sendNotifications,
          priority_boost: updates.priorityBoost,
          is_active: updates.isActive
        })
        .eq('id', ruleId)
        .select()
        .single();

      if (error) throw error;

      return mapToEscalationRule(data);
    } catch (error) {
      console.error('Error updating escalation rule:', error);
      throw error;
    }
  }

  static async deleteEscalationRule(ruleId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('escalation_rules')
        .delete()
        .eq('id', ruleId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting escalation rule:', error);
      throw error;
    }
  }

  // Escalation History Management
  static async getEscalationHistory(filters: EscalationFilters = {}): Promise<EscalationHistory[]> {
    try {
      let query = supabase
        .from('escalation_history')
        .select(`
          *,
          compliance_cases!inner(customer_id),
          escalation_rules(name, description)
        `);

      if (filters.caseId) {
        query = query.eq('case_id', filters.caseId);
      }

      if (filters.escalationLevel) {
        query = query.eq('escalation_level', filters.escalationLevel);
      }

      if (filters.status === 'active') {
        query = query.is('resolved_at', null);
      } else if (filters.status === 'resolved') {
        query = query.not('resolved_at', 'is', null);
      }

      if (filters.dateFrom) {
        query = query.gte('escalation_date', filters.dateFrom);
      }

      if (filters.dateTo) {
        query = query.lte('escalation_date', filters.dateTo);
      }

      if (filters.assignedTo) {
        query = query.eq('escalated_to_user_id', filters.assignedTo);
      }

      const { data, error } = await query
        .order('escalation_date', { ascending: false });

      if (error) throw error;

      return data?.map(mapToEscalationHistory) || [];
    } catch (error) {
      console.error('Error fetching escalation history:', error);
      throw error;
    }
  }

  // Manual Escalation
  static async manuallyEscalateCase(request: ManualEscalationRequest): Promise<EscalationHistory> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Call the database function to handle escalation with default values
      const { data, error } = await supabase.rpc('escalate_case', {
        case_id: request.caseId,
        escalation_rule_id: null, // Manual escalation
        escalated_from_user_id: user.id,
        escalation_level: request.escalationLevel || 2,
        target_role: request.targetRole || 'customer_admin',
        target_user_id: request.targetUserId || null,
        reason: request.reason || 'Manual escalation'
      });

      if (error) throw error;

      // If the function returned an escalation history ID, try to fetch it
      if (data) {
        try {
          const { data: historyData, error: historyError } = await supabase
            .from('escalation_history')
            .select('*')
            .eq('id', data)
            .single();

          if (!historyError && historyData) {
            return mapToEscalationHistory(historyData);
          }
        } catch (fetchError) {
          console.warn('Could not fetch escalation history immediately:', fetchError);
        }
      }

      // Fallback: fetch the most recent escalation history for this case
      const { data: recentHistory, error: recentError } = await supabase
        .from('escalation_history')
        .select('*')
        .eq('case_id', request.caseId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (recentError) {
        throw new Error('Escalation was processed but could not retrieve history record');
      }

      return mapToEscalationHistory(recentHistory);
    } catch (error) {
      console.error('Error manually escalating case:', error);
      throw error;
    }
  }

  // SLA Tracking
  static async getSLATracking(caseId: string): Promise<SLATracking[]> {
    try {
      const { data, error } = await supabase
        .from('sla_tracking')
        .select('*')
        .eq('case_id', caseId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data?.map(mapToSLATracking) || [];
    } catch (error) {
      console.error('Error fetching SLA tracking:', error);
      throw error;
    }
  }

  static async checkSLABreaches(): Promise<SLABreachResult[]> {
    try {
      const { data, error } = await supabase.rpc('check_sla_breaches');

      if (error) throw error;

      // Map the database result to the expected interface
      return (data || []).map((breach: any) => ({
        slaId: breach.sla_id,
        caseId: breach.case_id,
        escalationLevel: breach.escalation_level,
        slaType: breach.sla_type,
        targetHours: breach.target_hours,
        actualHours: breach.actual_hours,
        status: breach.status
      }));
    } catch (error) {
      console.error('Error checking SLA breaches:', error);
      throw error;
    }
  }

  // Notifications
  static async getEscalationNotifications(escalationHistoryId: string): Promise<EscalationNotification[]> {
    try {
      const { data, error } = await supabase
        .from('escalation_notifications')
        .select('*')
        .eq('escalation_history_id', escalationHistoryId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data?.map(mapToEscalationNotification) || [];
    } catch (error) {
      console.error('Error fetching escalation notifications:', error);
      throw error;
    }
  }

  static async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('escalation_notifications')
        .update({ 
          read_at: new Date().toISOString(),
          status: 'read'
        })
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Dashboard and Metrics
  static async getEscalationSummary(): Promise<EscalationSummary> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('customer_id')
        .eq('id', user.id)
        .single();

      if (!profile?.customer_id) throw new Error('User not associated with any organization');

      // Use the new database function for better performance
      const { data, error } = await supabase
        .rpc('get_escalation_dashboard_stats', {
          p_customer_id: profile.customer_id
        } as any);

      if (error) throw error;

      // Transform the data to match the expected interface
      const stats = data as any || {};
      
      return {
        totalEscalations: stats.totalEscalations || 0,
        activeEscalations: stats.activeEscalations || 0,
        slaBreaches: stats.slaBreaches || 0,
        escalationLevels: {
          level1: stats.escalationLevels?.level1 || 0,
          level2: stats.escalationLevels?.level2 || 0,
          level3: stats.escalationLevels?.level3 || 0,
          level4: stats.escalationLevels?.level4 || 0,
          level5: stats.escalationLevels?.level5 || 0
        },
        recentEscalations: (stats.recentEscalations || []).map((item: any) => ({
          id: item.id,
          caseId: item.caseId,
          escalationLevel: item.escalationLevel,
          reason: item.reason,
          escalationDate: item.escalationDate,
          resolvedAt: item.resolvedAt
        }))
      };
    } catch (error) {
      console.error('Error fetching escalation summary:', error);
      throw error;
    }
  }

  static async getEscalationMetrics(): Promise<EscalationMetrics> {
    try {
      const summary = await this.getEscalationSummary();
      
      // Calculate additional metrics
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getFullYear(), now.getMonth() - 1, now.getDate());

      const escalationsToday = summary.recentEscalations.filter(
        e => new Date(e.escalationDate) >= today
      ).length;

      const escalationsThisWeek = summary.recentEscalations.filter(
        e => new Date(e.escalationDate) >= weekAgo
      ).length;

      const escalationsThisMonth = summary.recentEscalations.filter(
        e => new Date(e.escalationDate) >= monthAgo
      ).length;

      // Calculate average resolution time
      const resolvedEscalations = summary.recentEscalations.filter(
        e => e.resolvedAt
      );

      const totalResolutionTime = resolvedEscalations.reduce((total, escalation) => {
        const escalationDate = new Date(escalation.escalationDate);
        const resolvedDate = new Date(escalation.resolvedAt!);
        return total + (resolvedDate.getTime() - escalationDate.getTime());
      }, 0);

      const averageResolutionTime = resolvedEscalations.length > 0 
        ? totalResolutionTime / resolvedEscalations.length / (1000 * 60 * 60) // Convert to hours
        : 0;

      // Calculate SLA compliance rate
      const totalSLAs = summary.slaBreaches.length + summary.activeEscalations;
      const slaComplianceRate = totalSLAs > 0 
        ? ((totalSLAs - summary.slaBreaches.length) / totalSLAs) * 100
        : 100;

      // Get escalation by type
      const escalationByType: Record<string, number> = {};
      summary.recentEscalations.forEach(escalation => {
        // This would need to be enhanced to get case type from the case
        escalationByType['unknown'] = (escalationByType['unknown'] || 0) + 1;
      });

      return {
        totalEscalations: summary.totalEscalations,
        escalationsToday,
        escalationsThisWeek,
        escalationsThisMonth,
        averageResolutionTime,
        slaComplianceRate,
        escalationByLevel: summary.escalationLevels,
        escalationByType,
        topEscalatedCases: summary.recentEscalations.slice(0, 5).map(e => ({
          caseId: e.caseId,
          caseType: 'unknown', // Would need to be enhanced
          escalationLevel: e.escalationLevel,
          escalationDate: e.escalationDate,
          assignedTo: e.newAssignedTo
        }))
      };
    } catch (error) {
      console.error('Error fetching escalation metrics:', error);
      throw error;
    }
  }

  // Automatic Escalation Check
  static async checkCaseEscalation(caseId: string): Promise<EscalationCheckResult[]> {
    try {
      const { data, error } = await supabase.rpc('check_case_escalation', {
        case_id: caseId
      });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error checking case escalation:', error);
      throw error;
    }
  }

  // Resolution Management
  static async resolveEscalation(request: EscalationResolutionRequest): Promise<void> {
    try {
      const { error } = await supabase
        .from('escalation_history')
        .update({
          resolved_at: new Date().toISOString(),
          resolution_notes: request.resolutionNotes
        })
        .eq('id', request.escalationHistoryId);

      if (error) throw error;

      // Update SLA tracking
      if (request.newStatus) {
        await supabase
          .from('sla_tracking')
          .update({
            end_time: new Date().toISOString(),
            status: request.newStatus === 'resolved' ? 'met' : 'breached'
          })
          .eq('case_id', 
            supabase
              .from('escalation_history')
              .select('case_id')
              .eq('id', request.escalationHistoryId)
          );
      }
    } catch (error) {
      console.error('Error resolving escalation:', error);
      throw error;
    }
  }
}

// Mapping functions
function mapToEscalationRule(data: any): EscalationRule {
  return {
    id: data.id,
    customerId: data.customer_id,
    name: data.name,
    description: data.description,
    caseType: data.case_type,
    priorityThreshold: data.priority_threshold,
    riskScoreThreshold: data.risk_score_threshold,
    timeThresholdHours: data.time_threshold_hours,
    escalationLevel: data.escalation_level,
    targetRole: data.target_role,
    targetUserId: data.target_user_id,
    autoAssign: data.auto_assign,
    sendNotifications: data.send_notifications,
    priorityBoost: data.priority_boost,
    isActive: data.is_active,
    createdBy: data.created_by,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}

function mapToEscalationHistory(data: any): EscalationHistory {
  return {
    id: data.id,
    caseId: data.case_id,
    escalationRuleId: data.escalation_rule_id,
    escalatedFromUserId: data.escalated_from_user_id,
    escalatedToUserId: data.escalated_to_user_id,
    escalatedToRole: data.escalated_to_role,
    escalationLevel: data.escalation_level,
    reason: data.reason,
    previousPriority: data.previous_priority,
    newPriority: data.new_priority,
    previousAssignedTo: data.previous_assigned_to,
    newAssignedTo: data.new_assigned_to,
    escalationDate: data.escalation_date,
    resolvedAt: data.resolved_at,
    resolutionNotes: data.resolution_notes
  };
}

function mapToEscalationNotification(data: any): EscalationNotification {
  return {
    id: data.id,
    escalationHistoryId: data.escalation_history_id,
    notificationType: data.notification_type,
    recipientUserId: data.recipient_user_id,
    recipientEmail: data.recipient_email,
    recipientPhone: data.recipient_phone,
    subject: data.subject,
    message: data.message,
    sentAt: data.sent_at,
    deliveredAt: data.delivered_at,
    readAt: data.read_at,
    status: data.status,
    retryCount: data.retry_count,
    errorMessage: data.error_message,
    createdAt: data.created_at
  };
}

function mapToSLATracking(data: any): SLATracking {
  return {
    id: data.id,
    caseId: data.case_id,
    escalationLevel: data.escalation_level,
    slaType: data.sla_type,
    targetHours: data.target_hours,
    startTime: data.start_time,
    endTime: data.end_time,
    status: data.status,
    breachReason: data.breach_reason,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}
