
import { supabase } from '@/integrations/supabase/client';
import { analytics } from '@/services/analytics';
import config from '@/config/environment';

interface SystemHealthCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'down';
  responseTime: number;
  lastCheck: Date;
  error?: string;
}

interface AlertRule {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
}

interface SystemAlert {
  id: string;
  rule: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  resolved: boolean;
  acknowledgedBy?: string;
}

class SystemMonitor {
  private healthChecks: Map<string, SystemHealthCheck> = new Map();
  private alerts: SystemAlert[] = [];
  private alertRules: AlertRule[] = [
    {
      id: 'response_time',
      name: 'High Response Time',
      condition: 'response_time',
      threshold: 2000,
      severity: 'medium',
      enabled: true
    },
    {
      id: 'error_rate',
      name: 'High Error Rate',
      condition: 'error_rate',
      threshold: 5,
      severity: 'high',
      enabled: true
    },
    {
      id: 'failed_transactions',
      name: 'Failed Transactions',
      condition: 'transaction_failure_rate',
      threshold: 10,
      severity: 'critical',
      enabled: true
    }
  ];

  async performHealthCheck(service: string, checkFunction: () => Promise<boolean>): Promise<SystemHealthCheck> {
    const startTime = performance.now();
    
    try {
      const isHealthy = await checkFunction();
      const responseTime = performance.now() - startTime;
      
      const healthCheck: SystemHealthCheck = {
        service,
        status: isHealthy ? 'healthy' : 'down',
        responseTime,
        lastCheck: new Date()
      };

      this.healthChecks.set(service, healthCheck);
      
      // Check alert rules
      await this.checkAlertRules(service, healthCheck);
      
      return healthCheck;
    } catch (error) {
      const responseTime = performance.now() - startTime;
      const healthCheck: SystemHealthCheck = {
        service,
        status: 'down',
        responseTime,
        lastCheck: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };

      this.healthChecks.set(service, healthCheck);
      await this.triggerAlert('critical', `Service ${service} is down: ${healthCheck.error}`);
      
      return healthCheck;
    }
  }

  async checkDatabase(): Promise<boolean> {
    try {
      const { error } = await supabase.from('profiles').select('count').limit(1);
      return !error;
    } catch {
      return false;
    }
  }

  async checkAuthentication(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return true; // If we can call the auth service, it's working
    } catch {
      return false;
    }
  }

  async checkExternalServices(): Promise<boolean> {
    // Check if we can reach external compliance APIs
    try {
      // Mock external service check
      const response = await fetch('https://httpbin.org/status/200', { 
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async runAllHealthChecks(): Promise<Map<string, SystemHealthCheck>> {
    console.log('🏥 Running system health checks...');
    
    await Promise.all([
      this.performHealthCheck('database', () => this.checkDatabase()),
      this.performHealthCheck('authentication', () => this.checkAuthentication()),
      this.performHealthCheck('external_services', () => this.checkExternalServices())
    ]);

    return this.healthChecks;
  }

  private async checkAlertRules(service: string, healthCheck: SystemHealthCheck) {
    for (const rule of this.alertRules) {
      if (!rule.enabled) continue;

      let shouldAlert = false;
      let message = '';

      switch (rule.condition) {
        case 'response_time':
          if (healthCheck.responseTime > rule.threshold) {
            shouldAlert = true;
            message = `${service} response time (${healthCheck.responseTime.toFixed(2)}ms) exceeds threshold (${rule.threshold}ms)`;
          }
          break;
        case 'error_rate':
          // This would be calculated from error logs
          break;
        case 'transaction_failure_rate':
          // This would be calculated from transaction data
          break;
      }

      if (shouldAlert) {
        await this.triggerAlert(rule.severity, message, rule.id);
      }
    }
  }

  private async triggerAlert(severity: SystemAlert['severity'], message: string, ruleId?: string) {
    const alert: SystemAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      rule: ruleId || 'system',
      severity,
      message,
      timestamp: new Date(),
      resolved: false
    };

    this.alerts.push(alert);
    
    console.warn(`🚨 SYSTEM ALERT [${severity.toUpperCase()}]: ${message}`);
    
    // Track in analytics
    if (config.features.enableAnalytics) {
      analytics.track('system_alert_triggered', {
        alert_id: alert.id,
        severity,
        message,
        rule: ruleId
      });
    }

    // In a real implementation, this would send notifications via:
    // - Email (critical alerts)
    // - Slack/Teams webhook
    // - SMS for critical issues
    // - Dashboard notifications
    
    return alert;
  }

  getSystemStatus(): { status: 'healthy' | 'degraded' | 'down'; details: SystemHealthCheck[] } {
    const checks = Array.from(this.healthChecks.values());
    
    if (checks.length === 0) {
      return { status: 'down', details: [] };
    }

    const hasDown = checks.some(check => check.status === 'down');
    const hasDegraded = checks.some(check => check.status === 'degraded');
    
    let status: 'healthy' | 'degraded' | 'down';
    if (hasDown) {
      status = 'down';
    } else if (hasDegraded) {
      status = 'degraded';
    } else {
      status = 'healthy';
    }

    return { status, details: checks };
  }

  getActiveAlerts(): SystemAlert[] {
    return this.alerts.filter(alert => !alert.resolved);
  }

  acknowledgeAlert(alertId: string, userId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledgedBy = userId;
      return true;
    }
    return false;
  }

  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      return true;
    }
    return false;
  }

  startMonitoring(intervalMs: number = 60000) {
    console.log('🔄 Starting system monitoring...');
    
    // Run initial health check
    this.runAllHealthChecks();
    
    // Set up periodic monitoring
    setInterval(() => {
      this.runAllHealthChecks();
    }, intervalMs);
  }
}

export const systemMonitor = new SystemMonitor();
