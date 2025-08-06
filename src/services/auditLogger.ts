
import { supabase } from '@/integrations/supabase/client';
import config from '@/config/environment';

export interface AuditLogEntry {
  action: string;
  entity: string;
  entity_id?: string;
  user_id?: string;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'authentication' | 'payment' | 'data_access' | 'user_action' | 'system' | 'security';
}

class AuditLogger {
  private sessionId: string;
  private ipAddress: string | null = null;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.getClientInfo();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async getClientInfo() {
    try {
      // Get IP address (simplified - in production use a proper service)
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      this.ipAddress = data.ip;
    } catch (error) {
      console.warn('Could not fetch IP address for audit logging:', error);
    }
  }

  private async getCurrentUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } catch (error) {
      console.warn('Could not get current user for audit logging:', error);
      return null;
    }
  }

  async log(entry: Omit<AuditLogEntry, 'timestamp' | 'user_id' | 'ip_address' | 'user_agent' | 'session_id'>) {
    try {
      const user = await this.getCurrentUser();
      
      const auditEntry: AuditLogEntry = {
        ...entry,
        user_id: user?.id,
        ip_address: this.ipAddress || 'unknown',
        user_agent: navigator.userAgent,
        session_id: this.sessionId,
        timestamp: new Date().toISOString()
      };

      // Log to console in development
      if (config.isDevelopment) {
        console.log(`🔍 AUDIT LOG [${entry.severity.toUpperCase()}]:`, auditEntry);
      }

      // Store in Supabase
      const { error } = await supabase.from('audit_logs').insert({
        action: auditEntry.action,
        entity: auditEntry.entity,
        entity_id: auditEntry.entity_id,
        user_id: auditEntry.user_id,
        details: {
          ...auditEntry.details,
          ip_address: auditEntry.ip_address,
          user_agent: auditEntry.user_agent,
          session_id: auditEntry.session_id,
          severity: auditEntry.severity,
          category: entry.category
        }
      });

      if (error) {
        console.error('Failed to store audit log:', error);
      }

      // Also track in analytics for admin users
      if (config.features.enableAnalytics) {
        const { trackUserAction } = await import('./analytics');
        trackUserAction('audit_log', {
          action: entry.action,
          entity: entry.entity,
          severity: entry.severity,
          category: entry.category
        });
      }

    } catch (error) {
      console.error('Audit logging failed:', error);
    }
  }

  // Specialized logging methods
  async logAuthentication(action: string, details?: Record<string, any>, success = true) {
    await this.log({
      action,
      entity: 'authentication',
      details: { success, ...details },
      severity: success ? 'low' : 'medium',
      category: 'authentication'
    });
  }

  async logPayment(action: string, details: Record<string, any>, success = true) {
    await this.log({
      action,
      entity: 'payment',
      details: { success, ...details },
      severity: success ? 'medium' : 'high',
      category: 'payment'
    });
  }

  async logDataAccess(action: string, entity: string, entityId?: string, details?: Record<string, any>) {
    await this.log({
      action,
      entity,
      entity_id: entityId,
      details,
      severity: 'low',
      category: 'data_access'
    });
  }

  async logUserAction(action: string, entity: string, entityId?: string, details?: Record<string, any>) {
    await this.log({
      action,
      entity,
      entity_id: entityId,
      details,
      severity: 'low',
      category: 'user_action'
    });
  }

  async logSecurityEvent(action: string, details: Record<string, any>, severity: 'medium' | 'high' | 'critical' = 'high') {
    await this.log({
      action,
      entity: 'security',
      details,
      severity,
      category: 'security'
    });
  }

  async logSystemEvent(action: string, details: Record<string, any>, severity: 'low' | 'medium' | 'high' = 'low') {
    await this.log({
      action,
      entity: 'system',
      details,
      severity,
      category: 'system'
    });
  }

  async logError(error: Error, context: string, details?: Record<string, any>) {
    await this.log({
      action: 'error_occurred',
      entity: 'system',
      details: {
        error_message: error.message,
        error_stack: error.stack,
        context,
        ...details
      },
      severity: 'high',
      category: 'system'
    });
  }
}

export const auditLogger = new AuditLogger();
export default auditLogger;
