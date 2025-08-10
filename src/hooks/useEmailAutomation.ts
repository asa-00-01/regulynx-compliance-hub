
import { useState, useCallback } from 'react';
import { emailAutomationService } from '@/services/emailAutomation';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  category: string;
  html_content: string;
  text_content: string;
  variables: string[];
  created_at: string;
  updated_at: string;
}

interface EmailAutomationHook {
  loading: boolean;
  error: string | null;
  templates: EmailTemplate[];
  isSending: boolean;
  sendEmail: (templateId: string, recipientEmail: string, variables: Record<string, any>) => Promise<boolean>;
  scheduleEmail: (templateId: string, recipientEmail: string, variables: Record<string, any>, scheduleDate: Date) => Promise<boolean>;
  sendWelcomeEmail: (userEmail: string, userName: string) => Promise<boolean>;
  sendCaseAssignmentEmail: (assigneeEmail: string, caseId: string, caseTitle: string) => Promise<boolean>;
  sendHighRiskAlert: (adminEmail: string, riskDetails: any) => Promise<boolean>;
  getTemplates: () => Promise<any[]>;
  loadTemplates: () => Promise<void>;
}

export const useEmailAutomation = (): EmailAutomationHook => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isSending, setIsSending] = useState(false);

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const templatesData = await emailAutomationService.getEmailTemplates();
      setTemplates(templatesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  }, []);

  const sendEmail = useCallback(async (templateId: string, recipientEmail: string, variables: Record<string, any>) => {
    setIsSending(true);
    setError(null);
    try {
      await emailAutomationService.sendEmail(templateId, recipientEmail, variables);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send email');
      return false;
    } finally {
      setIsSending(false);
    }
  }, []);

  const scheduleEmail = useCallback(async (templateId: string, recipientEmail: string, variables: Record<string, any>, scheduleDate: Date) => {
    setIsSending(true);
    setError(null);
    try {
      await emailAutomationService.sendEmail(templateId, recipientEmail, variables);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to schedule email');
      return false;
    } finally {
      setIsSending(false);
    }
  }, []);

  const sendWelcomeEmail = useCallback(async (userEmail: string, userName: string) => {
    setIsSending(true);
    setError(null);
    try {
      await emailAutomationService.sendEmail('welcome', userEmail, { userName });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send welcome email');
      return false;
    } finally {
      setIsSending(false);
    }
  }, []);

  const sendCaseAssignmentEmail = useCallback(async (assigneeEmail: string, caseId: string, caseTitle: string) => {
    setIsSending(true);
    setError(null);
    try {
      await emailAutomationService.sendEmail('case_assignment', assigneeEmail, { caseId, caseTitle });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send case assignment email');
      return false;
    } finally {
      setIsSending(false);
    }
  }, []);

  const sendHighRiskAlert = useCallback(async (adminEmail: string, riskDetails: any) => {
    setIsSending(true);
    setError(null);
    try {
      await emailAutomationService.sendEmail('high_risk_alert', adminEmail, { riskDetails });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send high risk alert');
      return false;
    } finally {
      setIsSending(false);
    }
  }, []);

  const getTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      return await emailAutomationService.getEmailTemplates();
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
    templates,
    isSending,
    sendEmail,
    scheduleEmail,
    sendWelcomeEmail,
    sendCaseAssignmentEmail,
    sendHighRiskAlert,
    getTemplates,
    loadTemplates,
  };
};
