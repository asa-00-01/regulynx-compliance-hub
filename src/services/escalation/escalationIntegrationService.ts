import { supabase } from '@/integrations/supabase/client';
import { EscalationService } from './escalationService';
import { ComplianceCaseWorkflowService } from '../complianceCaseWorkflow';
import { UnifiedUserData } from '@/types/user';

export class EscalationIntegrationService {
  private static complianceWorkflow = new ComplianceCaseWorkflowService();

  /**
   * Automatically escalate a case based on risk assessment
   */
  static async autoEscalateCase(caseId: string, userData: UnifiedUserData): Promise<void> {
    try {
      // Check if case should be escalated
      const escalationResults = await EscalationService.checkCaseEscalation(caseId);
      
      if (escalationResults && escalationResults.length > 0) {
        const shouldEscalate = escalationResults.find(result => result.shouldEscalate);
        
        if (shouldEscalate) {
          // Perform automatic escalation
          await EscalationService.manuallyEscalateCase({
            caseId,
            escalationLevel: shouldEscalate.escalationLevel || 2,
            reason: `Automatic escalation based on risk assessment: ${userData.riskScore} risk score`,
            targetRole: shouldEscalate.targetRole || 'customer_admin',
            priorityBoost: true,
            sendNotifications: true
          });

          console.log(`Case ${caseId} automatically escalated to level ${shouldEscalate.escalationLevel}`);
        }
      }
    } catch (error) {
      console.error('Error in auto escalation:', error);
      throw error;
    }
  }

  /**
   * Escalate KYC cases based on user flags and risk factors
   */
  static async escalateKYCCase(userId: string, reason: string, riskFactors: string[]): Promise<void> {
    try {
      // Create compliance case for KYC escalation
      const caseData = {
        userId,
        userName: 'KYC User', // Will be populated from user data
        type: 'kyc_review' as const,
        source: 'manual_review' as const,
        description: `KYC escalation: ${reason}. Risk factors: ${riskFactors.join(', ')}`,
        riskScore: 80, // High risk for escalation
        priority: 'high' as const
      };

      // Create the case
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('customer_id')
        .eq('id', user.id)
        .single();

      if (!profile?.customer_id) throw new Error('User not associated with any organization');

      const { data: newCase, error: caseError } = await supabase
        .from('compliance_cases')
        .insert({
          organization_customer_id: userId,
          customer_id: profile.customer_id,
          type: 'kyc_review',
          status: 'open',
          priority: 'high',
          source: 'manual_review',
          description: caseData.description,
          risk_score: caseData.riskScore,
          created_by: user.id
        })
        .select()
        .single();

      if (caseError) throw caseError;

      // Automatically escalate the case
      await this.autoEscalateCase(newCase.id, {
        id: userId,
        riskScore: caseData.riskScore,
        kycStatus: 'pending',
        isPEP: false,
        isSanctioned: false,
        flags: { riskScore: caseData.riskScore }
      } as UnifiedUserData);

    } catch (error) {
      console.error('Error escalating KYC case:', error);
      throw error;
    }
  }

  /**
   * Escalate AML cases based on transaction patterns
   */
  static async escalateAMLCase(transactionId: string, patternType: string, riskScore: number): Promise<void> {
    try {
      // Get transaction details
      const { data: transaction, error: transactionError } = await supabase
        .from('aml_transactions')
        .select(`
          *,
          organization_customers (
            id,
            full_name,
            email
          )
        `)
        .eq('id', transactionId)
        .single();

      if (transactionError) throw transactionError;

      // Create compliance case for AML escalation
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('customer_id')
        .eq('id', user.id)
        .single();

      if (!profile?.customer_id) throw new Error('User not associated with any organization');

      const { data: newCase, error: caseError } = await supabase
        .from('compliance_cases')
        .insert({
          organization_customer_id: transaction.organization_customer_id,
          customer_id: profile.customer_id,
          type: 'aml_alert',
          status: 'open',
          priority: riskScore > 80 ? 'critical' : riskScore > 60 ? 'high' : 'medium',
          source: 'system_alert',
          description: `AML alert: ${patternType} pattern detected. Risk score: ${riskScore}. Transaction: ${transaction.external_transaction_id}`,
          risk_score: riskScore,
          related_transactions: [transactionId],
          created_by: user.id
        })
        .select()
        .single();

      if (caseError) throw caseError;

      // Automatically escalate the case
      await this.autoEscalateCase(newCase.id, {
        id: transaction.organization_customer_id,
        riskScore,
        kycStatus: 'pending',
        isPEP: false,
        isSanctioned: false,
        flags: { riskScore }
      } as UnifiedUserData);

    } catch (error) {
      console.error('Error escalating AML case:', error);
      throw error;
    }
  }

  /**
   * Escalate sanctions cases
   */
  static async escalateSanctionsCase(userId: string, sanctionsMatch: string): Promise<void> {
    try {
      // Create compliance case for sanctions escalation
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('customer_id')
        .eq('id', user.id)
        .single();

      if (!profile?.customer_id) throw new Error('User not associated with any organization');

      const { data: newCase, error: caseError } = await supabase
        .from('compliance_cases')
        .insert({
          organization_customer_id: userId,
          customer_id: profile.customer_id,
          type: 'sanctions_hit',
          status: 'open',
          priority: 'critical',
          source: 'system_alert',
          description: `Sanctions match detected: ${sanctionsMatch}. Immediate action required.`,
          risk_score: 100,
          created_by: user.id
        })
        .select()
        .single();

      if (caseError) throw caseError;

      // Automatically escalate to highest level
      await EscalationService.manuallyEscalateCase({
        caseId: newCase.id,
        escalationLevel: 5,
        reason: `Critical: Sanctions list match - ${sanctionsMatch}`,
        targetRole: 'customer_admin',
        priorityBoost: true,
        sendNotifications: true
      });

    } catch (error) {
      console.error('Error escalating sanctions case:', error);
      throw error;
    }
  }

  /**
   * Process escalation notifications and send them
   */
  static async processEscalationNotifications(): Promise<number> {
    try {
      // Call the database function to process pending notifications
      const { data, error } = await supabase.rpc('trigger_notification_processing');
      
      if (error) throw error;
      
      return data || 0;
    } catch (error) {
      console.error('Error processing escalation notifications:', error);
      throw error;
    }
  }

  /**
   * Get escalation statistics for dashboard
   */
  static async getEscalationDashboardStats(customerId: string) {
    try {
      const { data, error } = await supabase.rpc('get_escalation_dashboard_stats', {
        p_customer_id: customerId
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting escalation dashboard stats:', error);
      throw error;
    }
  }

  /**
   * Monitor and escalate overdue cases
   */
  static async monitorOverdueCases(): Promise<void> {
    try {
      // Get cases that might need escalation
      const { data: cases, error } = await supabase
        .from('compliance_cases')
        .select('id, created_at, priority, risk_score, status')
        .in('status', ['open', 'in_progress'])
        .lt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // Cases older than 24 hours

      if (error) throw error;

      // Check each case for escalation
      for (const caseItem of cases || []) {
        try {
          await this.autoEscalateCase(caseItem.id, {
            id: caseItem.id,
            riskScore: caseItem.risk_score,
            kycStatus: 'pending',
            isPEP: false,
            isSanctioned: false,
            flags: { riskScore: caseItem.risk_score }
          } as UnifiedUserData);
        } catch (escalationError) {
          console.error(`Error escalating case ${caseItem.id}:`, escalationError);
        }
      }
    } catch (error) {
      console.error('Error monitoring overdue cases:', error);
      throw error;
    }
  }

  /**
   * Resolve escalation when case is resolved
   */
  static async resolveEscalationOnCaseResolution(caseId: string, resolutionNotes: string): Promise<void> {
    try {
      // Get active escalations for this case
      const { data: escalations, error } = await supabase
        .from('escalation_history')
        .select('id')
        .eq('case_id', caseId)
        .is('resolved_at', null);

      if (error) throw error;

      // Resolve all active escalations
      for (const escalation of escalations || []) {
        await EscalationService.resolveEscalation({
          escalationHistoryId: escalation.id,
          resolutionNotes: `Case resolved: ${resolutionNotes}`,
          newStatus: 'resolved'
        });
      }
    } catch (error) {
      console.error('Error resolving escalation on case resolution:', error);
      throw error;
    }
  }

  /**
   * Get escalation metrics for reporting
   */
  static async getEscalationMetrics(customerId: string) {
    try {
      const { data, error } = await supabase.rpc('get_escalation_metrics', {
        p_customer_id: customerId
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting escalation metrics:', error);
      throw error;
    }
  }
}
