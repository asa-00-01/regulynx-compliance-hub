
import { useState, useCallback } from 'react';
import { emailAutomation, EmailTemplate } from '@/services/emailAutomation';
import { toast } from 'sonner';

export const useEmailAutomation = () => {
  const [isSending, setIsSending] = useState(false);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);

  const sendEmail = useCallback(async (
    templateId: string, 
    recipient: string, 
    variables: Record<string, any>
  ) => {
    setIsSending(true);
    try {
      const jobId = await emailAutomation.sendEmail(templateId, recipient, variables);
      toast.success('Email sent successfully');
      return jobId;
    } catch (error: any) {
      toast.error(error.message || 'Failed to send email');
      throw error;
    } finally {
      setIsSending(false);
    }
  }, []);

  const scheduleEmail = useCallback(async (
    templateId: string,
    recipient: string,
    variables: Record<string, any>,
    scheduledFor: Date
  ) => {
    setIsSending(true);
    try {
      const jobId = await emailAutomation.scheduleEmail(templateId, recipient, variables, scheduledFor);
      toast.success('Email scheduled successfully');
      return jobId;
    } catch (error: any) {
      toast.error(error.message || 'Failed to schedule email');
      throw error;
    } finally {
      setIsSending(false);
    }
  }, []);

  const sendWelcomeEmail = useCallback(async (userEmail: string, userName: string) => {
    setIsSending(true);
    try {
      await emailAutomation.sendWelcomeEmail(userEmail, userName);
      toast.success('Welcome email sent');
    } catch (error: any) {
      toast.error('Failed to send welcome email');
      throw error;
    } finally {
      setIsSending(false);
    }
  }, []);

  const sendCaseAssignmentEmail = useCallback(async (userEmail: string, caseData: any) => {
    setIsSending(true);
    try {
      await emailAutomation.sendCaseAssignmentEmail(userEmail, caseData);
      toast.success('Case assignment email sent');
    } catch (error: any) {
      toast.error('Failed to send case assignment email');
      throw error;
    } finally {
      setIsSending(false);
    }
  }, []);

  const sendHighRiskAlert = useCallback(async (userEmail: string, transactionData: any) => {
    setIsSending(true);
    try {
      await emailAutomation.sendHighRiskAlert(userEmail, transactionData);
      toast.success('High risk alert sent');
    } catch (error: any) {
      toast.error('Failed to send high risk alert');
      throw error;
    } finally {
      setIsSending(false);
    }
  }, []);

  const loadTemplates = useCallback(() => {
    const allTemplates = emailAutomation.getAllTemplates();
    setTemplates(allTemplates);
  }, []);

  return {
    isSending,
    templates,
    sendEmail,
    scheduleEmail,
    sendWelcomeEmail,
    sendCaseAssignmentEmail,
    sendHighRiskAlert,
    loadTemplates
  };
};
