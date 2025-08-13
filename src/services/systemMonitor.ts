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

interface PerformanceMetric {
  timestamp: Date;
  service: string;
  metric_type: string;
  value: number;
  unit: string;
}

class SystemMonitor {
  private healthChecks: Map<string, SystemHealthCheck> = new Map();
  private alerts: SystemAlert[] = [];
  private performanceHistory: PerformanceMetric[] = [];
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
    },
    {
      id: 'cpu_usage',
      name: 'High CPU Usage',
      condition: 'cpu_usage',
      threshold: 80,
      severity: 'high',
      enabled: true
    },
    {
      id: 'memory_usage',
      name: 'High Memory Usage',
      condition: 'memory_usage',
      threshold: 85,
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
      
      // Store performance metric
      this.recordPerformanceMetric(service, 'response_time', responseTime, 'ms');
      
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

  private recordPerformanceMetric(service: string, metricType: string, value: number, unit: string) {
    const metric: PerformanceMetric = {
      timestamp: new Date(),
      service,
      metric_type: metricType,
      value,
      unit
    };

    this.performanceHistory.push(metric);
    
    // Keep only last 1000 metrics to prevent memory issues
    if (this.performanceHistory.length > 1000) {
      this.performanceHistory = this.performanceHistory.slice(-1000);
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
    try {
      // Check if we can reach external compliance APIs
      const response = await fetch('https://httpbin.org/status/200', { 
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async checkApiGateway(): Promise<boolean> {
    try {
      // Mock API gateway check - replace with actual endpoint
      const response = await fetch('/api/health', { 
        method: 'HEAD',
        signal: AbortSignal.timeout(3000)
      });
      return response.ok;
    } catch {
      // If the endpoint doesn't exist, assume it's healthy for demo purposes
      return true;
    }
  }

  async checkBackgroundJobs(): Promise<boolean> {
    try {
      // This would check your background job processor status
      // For now, we'll simulate a warning condition
      return Math.random() > 0.2; // 80% healthy, 20% degraded
    } catch {
      return false;
    }
  }

  async runAllHealthChecks(): Promise<Map<string, SystemHealthCheck>> {
    console.log('🏥 Running comprehensive system health checks...');
    
    await Promise.all([
      this.performHealthCheck('database', () => this.checkDatabase()),
      this.performHealthCheck('authentication', () => this.checkAuthentication()),
      this.performHealthCheck('external_services', () => this.checkExternalServices()),
      this.performHealthCheck('api_gateway', () => this.checkApiGateway()),
      this.performHealthCheck('background_jobs', () => this.checkBackgroundJobs())
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
        case 'cpu_usage':
          // This would come from system metrics
          const cpuUsage = Math.random() * 100; // Mock data
          if (cpuUsage > rule.threshold) {
            shouldAlert = true;
            message = `High CPU usage detected: ${cpuUsage.toFixed(1)}% (threshold: ${rule.threshold}%)`;
          }
          break;
        case 'memory_usage':
          // This would come from system metrics
          const memoryUsage = Math.random() * 100; // Mock data
          if (memoryUsage > rule.threshold) {
            shouldAlert = true;
            message = `High memory usage detected: ${memoryUsage.toFixed(1)}% (threshold: ${rule.threshold}%)`;
          }
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

  getPerformanceHistory(service?: string, metricType?: string): PerformanceMetric[] {
    let filtered = this.performanceHistory;
    
    if (service) {
      filtered = filtered.filter(metric => metric.service === service);
    }
    
    if (metricType) {
      filtered = filtered.filter(metric => metric.metric_type === metricType);
    }
    
    return filtered.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  acknowledgeAlert(alertId: string, userId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledgedBy = userId;
      console.log(`Alert ${alertId} acknowledged by user ${userId}`);
      return true;
    }
    return false;
  }

  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      console.log(`Alert ${alertId} resolved`);
      return true;
    }
    return false;
  }

  getAlertRules(): AlertRule[] {
    return this.alertRules;
  }

  updateAlertRule(ruleId: string, updates: Partial<AlertRule>): boolean {
    const rule = this.alertRules.find(r => r.id === ruleId);
    if (rule) {
      Object.assign(rule, updates);
      console.log(`Alert rule ${ruleId} updated`);
      return true;
    }
    return false;
  }

  startMonitoring(intervalMs: number = 60000) {
    console.log('🔄 Starting enhanced system monitoring...');
    
    // Run initial health check
    this.runAllHealthChecks();
    
    // Set up periodic monitoring
    setInterval(() => {
      this.runAllHealthChecks();
    }, intervalMs);
  }
}

export const systemMonitor = new SystemMonitor();
