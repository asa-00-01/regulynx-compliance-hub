
import { supabase } from '@/integrations/supabase/client';
import { auditLogger } from '@/services/auditLogger';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  type: 'transactional' | 'lifecycle' | 'compliance' | 'alert';
  variables: string[];
}

export interface EmailJob {
  id: string;
  templateId: string;
  recipient: string;
  variables: Record<string, any>;
  scheduledFor?: Date;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  sentAt?: Date;
  errorMessage?: string;
}

class EmailAutomationService {
  private templates: Map<string, EmailTemplate> = new Map();

  constructor() {
    this.initializeDefaultTemplates();
  }

  private initializeDefaultTemplates() {
    const defaultTemplates: EmailTemplate[] = [
      {
        id: 'welcome',
        name: 'Welcome Email',
        subject: 'Welcome to Regulynx - {{user_name}}',
        htmlContent: `
          <h1>Welcome to Regulynx, {{user_name}}!</h1>
          <p>Thank you for joining our compliance platform. Here's what you can do next:</p>
          <ul>
            <li>Complete your profile setup</li>
            <li>Explore the dashboard</li>
            <li>Set up your notification preferences</li>
          </ul>
          <p><a href="{{dashboard_url}}">Get Started</a></p>
        `,
        type: 'lifecycle',
        variables: ['user_name', 'dashboard_url']
      },
      {
        id: 'password_reset',
        name: 'Password Reset',
        subject: 'Reset Your Regulynx Password',
        htmlContent: `
          <h1>Password Reset Request</h1>
          <p>You requested a password reset for your Regulynx account.</p>
          <p><a href="{{reset_url}}">Reset Your Password</a></p>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `,
        type: 'transactional',
        variables: ['reset_url']
      },
      {
        id: 'case_assigned',
        name: 'Case Assignment',
        subject: 'New Case Assigned: {{case_id}}',
        htmlContent: `
          <h1>New Case Assigned</h1>
          <p>A new compliance case has been assigned to you:</p>
          <ul>
            <li><strong>Case ID:</strong> {{case_id}}</li>
            <li><strong>Priority:</strong> {{priority}}</li>
            <li><strong>Due Date:</strong> {{due_date}}</li>
          </ul>
          <p><a href="{{case_url}}">View Case Details</a></p>
        `,
        type: 'compliance',
        variables: ['case_id', 'priority', 'due_date', 'case_url']
      },
      {
        id: 'high_risk_alert',
        name: 'High Risk Alert',
        subject: 'URGENT: High Risk Transaction Detected',
        htmlContent: `
          <h1 style="color: #dc2626;">High Risk Alert</h1>
          <p>A high-risk transaction has been detected and requires immediate attention:</p>
          <ul>
            <li><strong>Transaction ID:</strong> {{transaction_id}}</li>
            <li><strong>Amount:</strong> {{amount}}</li>
            <li><strong>Risk Score:</strong> {{risk_score}}</li>
            <li><strong>Customer:</strong> {{customer_name}}</li>
          </ul>
          <p><a href="{{transaction_url}}">Review Transaction</a></p>
        `,
        type: 'alert',
        variables: ['transaction_id', 'amount', 'risk_score', 'customer_name', 'transaction_url']
      },
      {
        id: 'weekly_summary',
        name: 'Weekly Compliance Summary',
        subject: 'Weekly Compliance Report - {{week_ending}}',
        htmlContent: `
          <h1>Weekly Compliance Summary</h1>
          <p>Here's your compliance summary for the week ending {{week_ending}}:</p>
          <h2>Key Metrics</h2>
          <ul>
            <li>Cases Processed: {{cases_processed}}</li>
            <li>High Risk Transactions: {{high_risk_count}}</li>
            <li>Pending Reviews: {{pending_reviews}}</li>
            <li>Compliance Score: {{compliance_score}}%</li>
          </ul>
          <p><a href="{{dashboard_url}}">View Full Report</a></p>
        `,
        type: 'lifecycle',
        variables: ['week_ending', 'cases_processed', 'high_risk_count', 'pending_reviews', 'compliance_score', 'dashboard_url']
      }
    ];

    defaultTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  async sendEmail(templateId: string, recipient: string, variables: Record<string, any>): Promise<string> {
    try {
      const template = this.templates.get(templateId);
      if (!template) {
        throw new Error(`Template ${templateId} not found`);
      }

      // Create email job
      const emailJob: EmailJob = {
        id: crypto.randomUUID(),
        templateId,
        recipient,
        variables,
        status: 'pending'
      };

      // Call Supabase Edge Function to send email
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          template: template,
          recipient,
          variables
        }
      });

      if (error) {
        throw error;
      }

      // Log successful email
      await auditLogger.logUserAction('email_sent', 'email', emailJob.id, {
        templateId,
        recipient,
        type: template.type
      });

      return emailJob.id;
    } catch (error) {
      console.error('Failed to send email:', error);
      
      await auditLogger.logError(
        error instanceof Error ? error : new Error('Email sending failed'),
        'email_automation',
        { templateId, recipient }
      );
      
      throw error;
    }
  }

  async scheduleEmail(templateId: string, recipient: string, variables: Record<string, any>, scheduledFor: Date): Promise<string> {
    const emailJob: EmailJob = {
      id: crypto.randomUUID(),
      templateId,
      recipient,
      variables,
      scheduledFor,
      status: 'pending'
    };

    // Store scheduled job in database
    const { error } = await supabase.from('email_jobs').insert({
      id: emailJob.id,
      template_id: emailJob.templateId,
      recipient: emailJob.recipient,
      variables: emailJob.variables,
      scheduled_for: emailJob.scheduledFor?.toISOString(),
      status: emailJob.status
    });

    if (error) {
      throw error;
    }

    await auditLogger.logUserAction('email_scheduled', 'email', emailJob.id, {
      templateId,
      recipient,
      scheduledFor: scheduledFor.toISOString()
    });

    return emailJob.id;
  }

  // Lifecycle emails
  async sendWelcomeEmail(userEmail: string, userName: string): Promise<void> {
    await this.sendEmail('welcome', userEmail, {
      user_name: userName,
      dashboard_url: `${window.location.origin}/dashboard`
    });
  }

  async sendPasswordResetEmail(userEmail: string, resetUrl: string): Promise<void> {
    await this.sendEmail('password_reset', userEmail, {
      reset_url: resetUrl
    });
  }

  // Compliance emails
  async sendCaseAssignmentEmail(userEmail: string, caseData: any): Promise<void> {
    await this.sendEmail('case_assigned', userEmail, {
      case_id: caseData.id,
      priority: caseData.priority,
      due_date: new Date(caseData.dueDate).toLocaleDateString(),
      case_url: `${window.location.origin}/cases/${caseData.id}`
    });
  }

  async sendHighRiskAlert(userEmail: string, transactionData: any): Promise<void> {
    await this.sendEmail('high_risk_alert', userEmail, {
      transaction_id: transactionData.id,
      amount: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(transactionData.amount),
      risk_score: transactionData.riskScore,
      customer_name: transactionData.customerName,
      transaction_url: `${window.location.origin}/transactions/${transactionData.id}`
    });
  }

  // Weekly summary
  async sendWeeklySummary(userEmail: string, summaryData: any): Promise<void> {
    const weekEnding = new Date();
    weekEnding.setDate(weekEnding.getDate() - weekEnding.getDay());

    await this.sendEmail('weekly_summary', userEmail, {
      week_ending: weekEnding.toLocaleDateString(),
      cases_processed: summaryData.casesProcessed,
      high_risk_count: summaryData.highRiskCount,
      pending_reviews: summaryData.pendingReviews,
      compliance_score: summaryData.complianceScore,
      dashboard_url: `${window.location.origin}/dashboard`
    });
  }

  getTemplate(templateId: string): EmailTemplate | undefined {
    return this.templates.get(templateId);
  }

  getAllTemplates(): EmailTemplate[] {
    return Array.from(this.templates.values());
  }

  async getEmailHistory(limit: number = 50): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('email_jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to fetch email history:', error);
      return [];
    }
  }
}

export const emailAutomation = new EmailAutomationService();
