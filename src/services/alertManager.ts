
import { supabase } from '@/integrations/supabase/client';
import { auditLogger } from '@/services/auditLogger';

interface AlertChannel {
  type: 'email' | 'webhook' | 'sms';
  config: {
    endpoint?: string;
    apiKey?: string;
    phoneNumber?: string;
    email?: string;
  };
  enabled: boolean;
}

interface NotificationRule {
  id: string;
  name: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  channels: AlertChannel[];
  conditions: {
    minimumSeverity: 'low' | 'medium' | 'high' | 'critical';
    services?: string[];
    timeWindow?: number; // minutes
  };
}

class AlertManager {
  private notificationRules: NotificationRule[] = [
    {
      id: 'critical_alerts',
      name: 'Critical System Alerts',
      severity: 'critical',
      channels: [
        {
          type: 'email',
          config: { email: 'admin@company.com' },
          enabled: true
        },
        {
          type: 'webhook',
          config: { endpoint: 'https://hooks.slack.com/services/...' },
          enabled: false
        }
      ],
      conditions: {
        minimumSeverity: 'critical'
      }
    },
    {
      id: 'high_alerts',
      name: 'High Priority Alerts',
      severity: 'high',
      channels: [
        {
          type: 'email',
          config: { email: 'ops@company.com' },
          enabled: true
        }
      ],
      conditions: {
        minimumSeverity: 'high'
      }
    }
  ];

  async sendAlert(
    severity: 'low' | 'medium' | 'high' | 'critical',
    message: string,
    service?: string,
    metadata?: Record<string, any>
  ) {
    const applicableRules = this.notificationRules.filter(rule => 
      this.shouldTriggerRule(rule, severity, service)
    );

    for (const rule of applicableRules) {
      for (const channel of rule.channels.filter(c => c.enabled)) {
        try {
          await this.sendToChannel(channel, severity, message, metadata);
          
          // Log successful notification
          await auditLogger.logUserAction('alert_sent', 'notification', rule.id, {
            severity,
            message,
            service,
            channel: channel.type,
            rule: rule.name
          });
        } catch (error) {
          console.error(`Failed to send alert via ${channel.type}:`, error);
          
          // Log failed notification
          await auditLogger.logError(
            error instanceof Error ? error : new Error('Alert sending failed'),
            'alert_notification',
            {
              severity,
              message,
              service,
              channel: channel.type,
              rule: rule.name
            }
          );
        }
      }
    }
  }

  private shouldTriggerRule(
    rule: NotificationRule,
    severity: string,
    service?: string
  ): boolean {
    const severityLevels = ['low', 'medium', 'high', 'critical'];
    const alertLevel = severityLevels.indexOf(severity);
    const ruleLevel = severityLevels.indexOf(rule.conditions.minimumSeverity);
    
    if (alertLevel < ruleLevel) return false;
    
    if (rule.conditions.services && service) {
      return rule.conditions.services.includes(service);
    }
    
    return true;
  }

  private async sendToChannel(
    channel: AlertChannel,
    severity: string,
    message: string,
    metadata?: Record<string, any>
  ) {
    switch (channel.type) {
      case 'email':
        await this.sendEmailAlert(channel.config.email!, severity, message, metadata);
        break;
      case 'webhook':
        await this.sendWebhookAlert(channel.config.endpoint!, severity, message, metadata);
        break;
      case 'sms':
        await this.sendSMSAlert(channel.config.phoneNumber!, severity, message);
        break;
    }
  }

  private async sendEmailAlert(
    email: string,
    severity: string,
    message: string,
    metadata?: Record<string, any>
  ) {
    // In a real implementation, this would use an email service like SendGrid, AWS SES, etc.
    console.log(`📧 EMAIL ALERT to ${email}: [${severity.toUpperCase()}] ${message}`);
    
    // For now, we'll use Supabase's built-in email functionality
    // This is a placeholder - in production you'd integrate with a proper email service
    
    const emailData = {
      to: email,
      subject: `System Alert: ${severity.toUpperCase()}`,
      html: `
        <h2>System Alert</h2>
        <p><strong>Severity:</strong> ${severity.toUpperCase()}</p>
        <p><strong>Message:</strong> ${message}</p>
        <p><strong>Time:</strong> ${new Date().toISOString()}</p>
        ${metadata ? `<pre>${JSON.stringify(metadata, null, 2)}</pre>` : ''}
      `
    };
    
    // Log the email attempt
    console.log('Email alert prepared:', emailData);
  }

  private async sendWebhookAlert(
    endpoint: string,
    severity: string,
    message: string,
    metadata?: Record<string, any>
  ) {
    const payload = {
      text: `🚨 System Alert: ${message}`,
      severity,
      timestamp: new Date().toISOString(),
      metadata
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Webhook request failed: ${response.statusText}`);
    }
  }

  private async sendSMSAlert(phoneNumber: string, severity: string, message: string) {
    // In a real implementation, this would use Twilio, AWS SNS, etc.
    console.log(`📱 SMS ALERT to ${phoneNumber}: [${severity.toUpperCase()}] ${message}`);
    
    // This is a placeholder for SMS integration
    const smsData = {
      to: phoneNumber,
      body: `ALERT [${severity.toUpperCase()}]: ${message}`,
      timestamp: new Date().toISOString()
    };
    
    console.log('SMS alert prepared:', smsData);
  }

  async getAlertHistory(limit: number = 50) {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('action', 'alert_sent')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to fetch alert history:', error);
      return [];
    }
  }
}

export const alertManager = new AlertManager();
