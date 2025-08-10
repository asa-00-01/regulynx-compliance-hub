
import { supabase } from '@/integrations/supabase/client';
import { auditLogger } from '@/services/auditLogger';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html_content: string;
  text_content: string;
  variables: string[];
  category: 'compliance' | 'kyc' | 'system' | 'marketing';
  created_at: string;
  updated_at: string;
}

export interface EmailJob {
  id: string;
  template_id: string;
  recipient_email: string;
  recipient_name?: string;
  variables: Record<string, any>;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  scheduled_for?: string;
  sent_at?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

class EmailAutomationService {
  private templates: Map<string, EmailTemplate> = new Map();

  constructor() {
    this.initializeDefaultTemplates();
  }

  private initializeDefaultTemplates() {
    const defaultTemplates: EmailTemplate[] = [
      {
        id: 'kyc_approval_required',
        name: 'KYC Approval Required',
        subject: 'KYC Documentation Review Required',
        html_content: `
          <h2>KYC Review Required</h2>
          <p>Hello {{customer_name}},</p>
          <p>Your KYC documentation requires review. Please log in to your account to complete the process.</p>
          <p>Case ID: {{case_id}}</p>
          <p>Due Date: {{due_date}}</p>
        `,
        text_content: 'KYC Review Required for {{customer_name}}. Case ID: {{case_id}}',
        variables: ['customer_name', 'case_id', 'due_date'],
        category: 'kyc',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'compliance_case_created',
        name: 'Compliance Case Created',
        subject: 'New Compliance Case: {{case_id}}',
        html_content: `
          <h2>New Compliance Case</h2>
          <p>A new compliance case has been created:</p>
          <ul>
            <li>Case ID: {{case_id}}</li>
            <li>Customer: {{customer_name}}</li>
            <li>Priority: {{priority}}</li>
            <li>Assigned to: {{assigned_to}}</li>
          </ul>
        `,
        text_content: 'New compliance case {{case_id}} for {{customer_name}}',
        variables: ['case_id', 'customer_name', 'priority', 'assigned_to'],
        category: 'compliance',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'system_alert',
        name: 'System Alert',
        subject: 'System Alert: {{alert_type}}',
        html_content: `
          <h2>System Alert</h2>
          <p>Alert Type: {{alert_type}}</p>
          <p>Severity: {{severity}}</p>
          <p>Message: {{message}}</p>
          <p>Time: {{timestamp}}</p>
        `,
        text_content: 'System Alert: {{alert_type}} - {{message}}',
        variables: ['alert_type', 'severity', 'message', 'timestamp'],
        category: 'system',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    defaultTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  async sendEmail(
    templateId: string,
    recipientEmail: string,
    variables: Record<string, any>,
    options?: {
      recipientName?: string;
      scheduleFor?: Date;
    }
  ): Promise<string> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const emailJob: EmailJob = {
      id: jobId,
      template_id: templateId,
      recipient_email: recipientEmail,
      recipient_name: options?.recipientName,
      variables,
      status: options?.scheduleFor ? 'pending' : 'pending',
      scheduled_for: options?.scheduleFor?.toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      // Store job in local storage for now (in production, use proper database)
      const stored = localStorage.getItem('email_jobs');
      const jobs = stored ? JSON.parse(stored) : [];
      jobs.push(emailJob);
      localStorage.setItem('email_jobs', JSON.stringify(jobs));

      // Process email immediately if not scheduled
      if (!options?.scheduleFor) {
        await this.processEmailJob(emailJob);
      }

      await auditLogger.logUserAction('email_scheduled', 'email', jobId, {
        template_id: templateId,
        recipient: recipientEmail,
        scheduled_for: options?.scheduleFor?.toISOString()
      });

      return jobId;
    } catch (error) {
      console.error('Failed to schedule email:', error);
      throw error;
    }
  }

  private async processEmailJob(job: EmailJob): Promise<void> {
    try {
      const template = this.templates.get(job.template_id);
      if (!template) {
        throw new Error(`Template ${job.template_id} not found`);
      }

      // Replace variables in content
      let htmlContent = template.html_content;
      let textContent = template.text_content;
      let subject = template.subject;

      Object.entries(job.variables).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`;
        htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), String(value));
        textContent = textContent.replace(new RegExp(placeholder, 'g'), String(value));
        subject = subject.replace(new RegExp(placeholder, 'g'), String(value));
      });

      // Call Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: job.recipient_email,
          subject,
          html: htmlContent,
          text: textContent
        }
      });

      if (error) {
        throw error;
      }

      // Update job status
      await this.updateJobStatus(job.id, 'sent', undefined, new Date().toISOString());

      await auditLogger.logUserAction('email_sent', 'email', job.id, {
        template_id: job.template_id,
        recipient: job.recipient_email
      });

    } catch (error) {
      console.error('Failed to process email job:', error);
      await this.updateJobStatus(job.id, 'failed', error instanceof Error ? error.message : 'Unknown error');
      
      await auditLogger.logError(
        error instanceof Error ? error : new Error('Email processing failed'),
        'email_automation',
        { job_id: job.id }
      );
    }
  }

  private async updateJobStatus(
    jobId: string, 
    status: EmailJob['status'], 
    errorMessage?: string,
    sentAt?: string
  ): Promise<void> {
    try {
      const stored = localStorage.getItem('email_jobs');
      const jobs: EmailJob[] = stored ? JSON.parse(stored) : [];
      
      const jobIndex = jobs.findIndex(j => j.id === jobId);
      if (jobIndex >= 0) {
        jobs[jobIndex].status = status;
        jobs[jobIndex].updated_at = new Date().toISOString();
        if (errorMessage) jobs[jobIndex].error_message = errorMessage;
        if (sentAt) jobs[jobIndex].sent_at = sentAt;
        
        localStorage.setItem('email_jobs', JSON.stringify(jobs));
      }
    } catch (error) {
      console.error('Failed to update job status:', error);
    }
  }

  async getEmailJobs(filter?: {
    status?: EmailJob['status'];
    template_id?: string;
    limit?: number;
  }): Promise<EmailJob[]> {
    try {
      const stored = localStorage.getItem('email_jobs');
      let jobs: EmailJob[] = stored ? JSON.parse(stored) : [];

      if (filter?.status) {
        jobs = jobs.filter(job => job.status === filter.status);
      }
      if (filter?.template_id) {
        jobs = jobs.filter(job => job.template_id === filter.template_id);
      }

      return jobs.slice(0, filter?.limit || 100);
    } catch {
      return [];
    }
  }

  async getEmailTemplates(): Promise<EmailTemplate[]> {
    return Array.from(this.templates.values());
  }

  async createTemplate(template: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    const id = `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newTemplate: EmailTemplate = {
      ...template,
      id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.templates.set(id, newTemplate);
    
    await auditLogger.logUserAction('email_template_created', 'email_template', id, {
      name: template.name,
      category: template.category
    });

    return id;
  }

  async updateTemplate(id: string, updates: Partial<EmailTemplate>): Promise<boolean> {
    const template = this.templates.get(id);
    if (!template) {
      return false;
    }

    const updatedTemplate = {
      ...template,
      ...updates,
      updated_at: new Date().toISOString()
    };

    this.templates.set(id, updatedTemplate);

    await auditLogger.logUserAction('email_template_updated', 'email_template', id, updates);

    return true;
  }

  async deleteTemplate(id: string): Promise<boolean> {
    const success = this.templates.delete(id);
    
    if (success) {
      await auditLogger.logUserAction('email_template_deleted', 'email_template', id);
    }
    
    return success;
  }

  // Process scheduled emails (would be called by a cron job in production)
  async processScheduledEmails(): Promise<void> {
    try {
      const stored = localStorage.getItem('email_jobs');
      const jobs: EmailJob[] = stored ? JSON.parse(stored) : [];
      
      const now = new Date();
      const jobsToProcess = jobs.filter(job => 
        job.status === 'pending' && 
        job.scheduled_for && 
        new Date(job.scheduled_for) <= now
      );

      for (const job of jobsToProcess) {
        await this.processEmailJob(job);
      }
    } catch (error) {
      console.error('Failed to process scheduled emails:', error);
    }
  }
}

export const emailAutomationService = new EmailAutomationService();

// Export as emailAutomation for backward compatibility
export const emailAutomation = emailAutomationService;
