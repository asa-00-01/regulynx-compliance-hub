import { supabase } from '@/integrations/supabase/client';
import { auditLogger } from '@/services/auditLogger';
import { analytics } from '@/services/analytics';
import config from '@/config/environment';

export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  url?: string;
  component?: string;
  action?: string;
  timestamp: string;
  stackTrace?: string;
  breadcrumbs?: ErrorBreadcrumb[];
  customData?: Record<string, any>;
}

export interface ErrorBreadcrumb {
  timestamp: string;
  category: 'navigation' | 'user_action' | 'console' | 'network' | 'error';
  message: string;
  level: 'info' | 'warning' | 'error';
  data?: Record<string, any>;
}

export interface EnhancedError {
  id: string;
  message: string;
  stack?: string;
  context: ErrorContext;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'investigating' | 'resolved' | 'ignored';
  occurrences: number;
  firstSeen: string;
  lastSeen: string;
  fingerprint: string;
}

class EnhancedErrorTrackingService {
  private breadcrumbs: ErrorBreadcrumb[] = [];
  private maxBreadcrumbs = 50;
  private sessionId: string;

  constructor() {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.initializeGlobalErrorHandlers();
  }

  private initializeGlobalErrorHandlers() {
    // Handle unhandled JavaScript errors
    window.addEventListener('error', (event) => {
      this.captureError(event.error || new Error(event.message), {
        component: 'global',
        action: 'unhandled_error',
        customData: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      });
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError(
        new Error(`Unhandled Promise Rejection: ${event.reason}`),
        {
          component: 'global',
          action: 'unhandled_promise_rejection',
          customData: {
            reason: event.reason
          }
        }
      );
    });

    // Capture console errors
    const originalConsoleError = console.error;
    console.error = (...args) => {
      this.addBreadcrumb({
        category: 'console',
        message: args.join(' '),
        level: 'error',
        timestamp: new Date().toISOString()
      });
      originalConsoleError.apply(console, args);
    };
  }

  addBreadcrumb(breadcrumb: ErrorBreadcrumb) {
    this.breadcrumbs.push(breadcrumb);
    if (this.breadcrumbs.length > this.maxBreadcrumbs) {
      this.breadcrumbs.shift();
    }
  }

  async captureError(error: Error, contextData?: Partial<ErrorContext>): Promise<string> {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Add error breadcrumb
    this.addBreadcrumb({
      category: 'error',
      message: error.message,
      level: 'error',
      timestamp: new Date().toISOString(),
      data: { stack: error.stack }
    });

    const context: ErrorContext = {
      userId: await this.getCurrentUserId(),
      sessionId: this.sessionId,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      stackTrace: error.stack,
      breadcrumbs: [...this.breadcrumbs],
      ...contextData
    };

    const enhancedError: EnhancedError = {
      id: errorId,
      message: error.message,
      stack: error.stack,
      context,
      severity: this.calculateSeverity(error, context),
      status: 'new',
      occurrences: 1,
      firstSeen: context.timestamp,
      lastSeen: context.timestamp,
      fingerprint: this.generateFingerprint(error, context)
    };

    // Store error
    await this.storeError(enhancedError);

    // Log to audit system
    await auditLogger.logError(error, 'enhanced_error_tracking', {
      error_id: errorId,
      severity: enhancedError.severity,
      fingerprint: enhancedError.fingerprint,
      context: context
    });

    // Track in analytics
    if (config.features.enableErrorReporting) {
      analytics.reportError(error, {
        error_id: errorId,
        severity: enhancedError.severity,
        context: context.component
      });
    }

    // Send real-time notifications for critical errors
    if (enhancedError.severity === 'critical') {
      await this.sendCriticalErrorNotification(enhancedError);
    }

    return errorId;
  }

  private async getCurrentUserId(): Promise<string | undefined> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.id;
    } catch {
      return undefined;
    }
  }

  private calculateSeverity(error: Error, context: ErrorContext): 'low' | 'medium' | 'high' | 'critical' {
    // Critical errors
    if (error.message.includes('ChunkLoadError') || 
        error.message.includes('Network Error') ||
        error.message.includes('Authentication') ||
        context.component === 'payment') {
      return 'critical';
    }

    // High severity errors
    if (error.stack?.includes('TypeError') ||
        error.stack?.includes('ReferenceError') ||
        context.component === 'compliance' ||
        context.component === 'kyc') {
      return 'high';
    }

    // Medium severity errors
    if (error.message.includes('404') ||
        error.message.includes('Validation') ||
        context.component === 'ui') {
      return 'medium';
    }

    return 'low';
  }

  private generateFingerprint(error: Error, context: ErrorContext): string {
    const key = `${error.message}_${context.component}_${context.action}`;
    return btoa(key).substr(0, 16);
  }

  private async storeError(error: EnhancedError): Promise<void> {
    try {
      // Store in local storage for immediate access
      const stored = localStorage.getItem('enhanced_errors');
      const errors = stored ? JSON.parse(stored) : [];
      errors.unshift(error);
      
      // Keep only last 100 errors locally
      if (errors.length > 100) {
        errors.splice(100);
      }
      
      localStorage.setItem('enhanced_errors', JSON.stringify(errors));

      // In a real implementation, you would also store in a database
      // This would require creating a proper errors table in Supabase
      console.log('Enhanced error stored:', error);
    } catch (storeError) {
      console.error('Failed to store enhanced error:', storeError);
    }
  }

  private async sendCriticalErrorNotification(error: EnhancedError): Promise<void> {
    try {
      // In production, this would send notifications via:
      // - Email to development team
      // - Slack/Teams webhook
      // - SMS for truly critical issues
      // - Dashboard alerts

      console.error('🚨 CRITICAL ERROR DETECTED:', {
        id: error.id,
        message: error.message,
        component: error.context.component,
        userId: error.context.userId
      });

      // For now, just track in analytics
      analytics.track('critical_error_notification', {
        error_id: error.id,
        message: error.message,
        component: error.context.component
      });
    } catch (notificationError) {
      console.error('Failed to send critical error notification:', notificationError);
    }
  }

  async searchErrors(query: {
    severity?: string;
    component?: string;
    status?: string;
    dateRange?: { start: string; end: string };
    limit?: number;
  }): Promise<EnhancedError[]> {
    try {
      const stored = localStorage.getItem('enhanced_errors');
      let errors: EnhancedError[] = stored ? JSON.parse(stored) : [];

      // Apply filters
      if (query.severity) {
        errors = errors.filter(e => e.severity === query.severity);
      }
      if (query.component) {
        errors = errors.filter(e => e.context.component === query.component);
      }
      if (query.status) {
        errors = errors.filter(e => e.status === query.status);
      }
      if (query.dateRange) {
        errors = errors.filter(e => 
          e.firstSeen >= query.dateRange!.start && 
          e.firstSeen <= query.dateRange!.end
        );
      }

      return errors.slice(0, query.limit || 50);
    } catch {
      return [];
    }
  }

  async updateErrorStatus(errorId: string, status: EnhancedError['status']): Promise<boolean> {
    try {
      const stored = localStorage.getItem('enhanced_errors');
      const errors: EnhancedError[] = stored ? JSON.parse(stored) : [];
      
      const errorIndex = errors.findIndex(e => e.id === errorId);
      if (errorIndex >= 0) {
        errors[errorIndex].status = status;
        localStorage.setItem('enhanced_errors', JSON.stringify(errors));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  getErrorStats(): {
    total: number;
    byStatus: Record<string, number>;
    bySeverity: Record<string, number>;
    recentTrend: number[];
  } {
    try {
      const stored = localStorage.getItem('enhanced_errors');
      const errors: EnhancedError[] = stored ? JSON.parse(stored) : [];

      const byStatus = errors.reduce((acc, error) => {
        acc[error.status] = (acc[error.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const bySeverity = errors.reduce((acc, error) => {
        acc[error.severity] = (acc[error.severity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Calculate trend for last 7 days
      const now = new Date();
      const recentTrend = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dayStart = date.toISOString().split('T')[0];
        return errors.filter(e => e.firstSeen.startsWith(dayStart)).length;
      }).reverse();

      return {
        total: errors.length,
        byStatus,
        bySeverity,
        recentTrend
      };
    } catch {
      return {
        total: 0,
        byStatus: {},
        bySeverity: {},
        recentTrend: []
      };
    }
  }
}

export const enhancedErrorTracking = new EnhancedErrorTrackingService();
