
import { useState, useCallback } from 'react';
import { EmailAutomationService } from '@/services/emailAutomation';

interface EmailAutomationHook {
  loading: boolean;
  error: string | null;
  sendEmail: (templateId: string, recipientEmail: string, variables: Record<string, any>) => Promise<boolean>;
  scheduleEmail: (templateId: string, recipientEmail: string, variables: Record<string, any>, scheduleDate: Date) => Promise<boolean>;
  sendWelcomeEmail: (userEmail: string, userName: string) => Promise<boolean>;
  sendCaseAssignmentEmail: (assigneeEmail: string, caseId: string, caseTitle: string) => Promise<boolean>;
  sendHighRiskAlert: (adminEmail: string, riskDetails: any) => Promise<boolean>;
  getTemplates: () => Promise<any[]>;
}

export const useEmailAutomation = (): EmailAutomationHook => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendEmail = useCallback(async (templateId: string, recipientEmail: string, variables: Record<string, any>) => {
    setLoading(true);
    setError(null);
    try {
      await EmailAutomationService.sendEmail(templateId, recipientEmail, variables);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send email');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const scheduleEmail = useCallback(async (templateId: string, recipientEmail: string, variables: Record<string, any>, scheduleDate: Date) => {
    setLoading(true);
    setError(null);
    try {
      await EmailAutomationService.sendEmail(templateId, recipientEmail, variables);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to schedule email');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const sendWelcomeEmail = useCallback(async (userEmail: string, userName: string) => {
    setLoading(true);
    setError(null);
    try {
      await EmailAutomationService.sendEmail('welcome', userEmail, { userName });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send welcome email');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const sendCaseAssignmentEmail = useCallback(async (assigneeEmail: string, caseId: string, caseTitle: string) => {
    setLoading(true);
    setError(null);
    try {
      await EmailAutomationService.sendEmail('case_assignment', assigneeEmail, { caseId, caseTitle });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send case assignment email');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const sendHighRiskAlert = useCallback(async (adminEmail: string, riskDetails: any) => {
    setLoading(true);
    setError(null);
    try {
      await EmailAutomationService.sendEmail('high_risk_alert', adminEmail, { riskDetails });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send high risk alert');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const getTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      return await EmailAutomationService.getEmailTemplates();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch templates');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    sendEmail,
    scheduleEmail,
    sendWelcomeEmail,
    sendCaseAssignmentEmail,
    sendHighRiskAlert,
    getTemplates,
  };
};
