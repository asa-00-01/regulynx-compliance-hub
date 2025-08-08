
import { supabase } from '@/integrations/supabase/client';
import { auditLogger } from '@/services/auditLogger';
import config from '@/config/environment';

export interface BackupStatus {
  id: string;
  backup_type: 'full' | 'incremental' | 'differential';
  status: 'started' | 'completed' | 'failed' | 'cancelled';
  file_path?: string;
  file_size?: number;
  duration_seconds?: number;
  error_message?: string;
  created_at: string;
  completed_at?: string;
}

export interface ErrorLog {
  id: string;
  error_id: string;
  error_message: string;
  error_stack?: string;
  error_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  user_id?: string;
  url?: string;
  user_agent?: string;
  environment?: string;
  additional_context?: Record<string, any>;
  resolved?: boolean;
  resolved_at?: string;
  resolved_by?: string;
  created_at: string;
}

export interface DeploymentLog {
  id: string;
  deployment_id: string;
  version: string;
  environment: 'development' | 'staging' | 'production';
  status: 'started' | 'building' | 'testing' | 'deploying' | 'completed' | 'failed' | 'rolled_back';
  commit_hash?: string;
  branch?: string;
  deployed_by?: string;
  build_duration_seconds?: number;
  deployment_duration_seconds?: number;
  error_message?: string;
  rollback_reason?: string;
  created_at: string;
  completed_at?: string;
}

export interface EnvironmentValidation {
  validation_type: string;
  status: 'passed' | 'failed' | 'warning';
  message: string;
  recommendation?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

class ProductionMonitorService {
  // Backup Management
  async scheduleBackup(backupType: 'full' | 'incremental' | 'differential' = 'incremental'): Promise<string> {
    try {
      const { data, error } = await supabase.rpc('schedule_backup', { backup_type: backupType });
      
      if (error) throw error;
      
      console.log(`✅ Backup scheduled: ${backupType} backup with ID ${data}`);
      
      // Log the backup scheduling
      await auditLogger.logSystemEvent('backup_scheduled', {
        backup_type: backupType,
        backup_id: data
      });
      
      return data;
    } catch (error) {
      console.error('Failed to schedule backup:', error);
      throw error;
    }
  }

  async getBackupLogs(limit = 50): Promise<BackupStatus[]> {
    try {
      const { data, error } = await supabase
        .from('backup_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []) as BackupStatus[];
    } catch (error) {
      console.error('Failed to fetch backup logs:', error);
      return [];
    }
  }

  // Error Tracking
  async logError(
    errorId: string,
    errorMessage: string,
    errorStack?: string,
    errorType: string = 'runtime',
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    url?: string,
    userAgent?: string,
    additionalContext?: Record<string, any>
  ): Promise<string> {
    try {
      const { data, error } = await supabase.rpc('log_error', {
        p_error_id: errorId,
        p_error_message: errorMessage,
        p_error_stack: errorStack,
        p_error_type: errorType,
        p_severity: severity,
        p_url: url || window.location.href,
        p_user_agent: userAgent || navigator.userAgent,
        p_additional_context: additionalContext
      });

      if (error) throw error;
      
      console.log(`🚨 Error logged with ID: ${data}`);
      return data;
    } catch (error) {
      console.error('Failed to log error to database:', error);
      throw error;
    }
  }

  async getErrorLogs(limit = 100): Promise<ErrorLog[]> {
    try {
      const { data, error } = await supabase
        .from('error_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []) as ErrorLog[];
    } catch (error) {
      console.error('Failed to fetch error logs:', error);
      return [];
    }
  }

  async resolveError(errorId: string, resolvedBy?: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('error_logs')
        .update({
          resolved: true,
          resolved_at: new Date().toISOString(),
          resolved_by: resolvedBy
        })
        .eq('id', errorId);

      if (error) throw error;
      
      console.log(`✅ Error ${errorId} marked as resolved`);
    } catch (error) {
      console.error('Failed to resolve error:', error);
      throw error;
    }
  }

  // Deployment Tracking
  async getDeploymentLogs(limit = 50): Promise<DeploymentLog[]> {
    try {
      const { data, error } = await supabase
        .from('deployment_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []) as DeploymentLog[];
    } catch (error) {
      console.error('Failed to fetch deployment logs:', error);
      return [];
    }
  }

  // Environment Validation
  async validateEnvironment(): Promise<EnvironmentValidation[]> {
    try {
      const { data, error } = await supabase.rpc('validate_environment_config');
      
      if (error) throw error;
      
      console.log('🔍 Environment validation completed:', data);
      return (data || []) as EnvironmentValidation[];
    } catch (error) {
      console.error('Failed to validate environment:', error);
      return [];
    }
  }

  // System Health Monitoring
  async getSystemHealth(): Promise<{
    backups: { recent: BackupStatus[]; failed: number };
    errors: { critical: number; high: number; total: number };
    deployments: { recent: DeploymentLog[]; successful: number };
    validations: EnvironmentValidation[];
  }> {
    try {
      const [backups, errors, deployments, validations] = await Promise.all([
        this.getBackupLogs(10),
        this.getErrorLogs(50),
        this.getDeploymentLogs(10),
        this.validateEnvironment()
      ]);

      const criticalErrors = errors.filter(e => e.severity === 'critical').length;
      const highErrors = errors.filter(e => e.severity === 'high').length;
      const failedBackups = backups.filter(b => b.status === 'failed').length;
      const successfulDeployments = deployments.filter(d => d.status === 'completed').length;

      return {
        backups: { recent: backups, failed: failedBackups },
        errors: { critical: criticalErrors, high: highErrors, total: errors.length },
        deployments: { recent: deployments, successful: successfulDeployments },
        validations
      };
    } catch (error) {
      console.error('Failed to get system health:', error);
      throw error;
    }
  }

  // Production Readiness Check
  async checkProductionReadiness(): Promise<{
    isReady: boolean;
    score: number;
    issues: Array<{ type: string; severity: string; message: string; recommendation: string }>;
  }> {
    try {
      const health = await this.getSystemHealth();
      const issues: Array<{ type: string; severity: string; message: string; recommendation: string }> = [];
      let score = 100;

      // Check for critical errors
      if (health.errors.critical > 0) {
        issues.push({
          type: 'critical_errors',
          severity: 'critical',
          message: `${health.errors.critical} critical error(s) detected`,
          recommendation: 'Resolve all critical errors before production deployment'
        });
        score -= 30;
      }

      // Check for failed backups
      if (health.backups.failed > 2) {
        issues.push({
          type: 'backup_failures',
          severity: 'high',
          message: `${health.backups.failed} recent backup failures`,
          recommendation: 'Investigate and fix backup system issues'
        });
        score -= 20;
      }

      // Check environment validations
      const failedValidations = health.validations.filter(v => v.status === 'failed');
      if (failedValidations.length > 0) {
        issues.push({
          type: 'validation_failures',
          severity: 'high',
          message: `${failedValidations.length} environment validation(s) failed`,
          recommendation: 'Fix environment configuration issues'
        });
        score -= 25;
      }

      // Check configuration
      if (!config.isProduction) {
        issues.push({
          type: 'environment_config',
          severity: 'medium',
          message: 'Application is not configured for production environment',
          recommendation: 'Set VITE_ENVIRONMENT to "production"'
        });
        score -= 15;
      }

      const isReady = issues.filter(i => i.severity === 'critical').length === 0 && score >= 70;

      return {
        isReady,
        score: Math.max(0, score),
        issues
      };
    } catch (error) {
      console.error('Failed to check production readiness:', error);
      return {
        isReady: false,
        score: 0,
        issues: [{
          type: 'check_failed',
          severity: 'critical',
          message: 'Production readiness check failed',
          recommendation: 'Fix system connectivity and try again'
        }]
      };
    }
  }
}

export const productionMonitor = new ProductionMonitorService();
