
export interface ErrorLog {
  id: string;
  timestamp: Date;
  level: 'error' | 'warning' | 'info';
  message: string;
  stack?: string;
  stackTrace?: string;
  url: string;
  userAgent: string;
  userId?: string;
  context?: Record<string, any>;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
  severity: 'critical' | 'high' | 'medium' | 'low';
  component?: string;
  occurrenceCount: number;
  status: 'resolved' | 'unresolved';
}

export interface ErrorAnalytics {
  totalErrors: number;
  errorsByLevel: Record<string, number>;
  errorsByPage: Record<string, number>;
  errorTrends: Array<{ date: string; count: number }>;
  topErrors: Array<{ message: string; count: number }>;
  resolutionRate: number;
  criticalErrors: number;
  errorRate: number;
  averageResolutionTime: number;
  topErrorTypes: Array<{ type: string; count: number }>;
  errorDistribution: Record<string, number>;
}

export interface ErrorContext {
  userId?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
}

export class EnhancedErrorTrackingService {
  private static instance: EnhancedErrorTrackingService;
  private errorLogs: ErrorLog[] = [];

  static getInstance(): EnhancedErrorTrackingService {
    if (!this.instance) {
      this.instance = new EnhancedErrorTrackingService();
    }
    return this.instance;
  }

  captureError(error: Error, context?: ErrorContext): string {
    const errorLog: ErrorLog = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      level: 'error',
      message: error.message,
      stack: error.stack,
      stackTrace: error.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      context,
      resolved: false,
      severity: 'high',
      component: context?.component,
      occurrenceCount: 1,
      status: 'unresolved'
    };

    this.errorLogs.push(errorLog);
    console.error('Enhanced Error Tracking:', errorLog);
    return errorLog.id;
  }

  captureWarning(message: string, context?: ErrorContext): string {
    const errorLog: ErrorLog = {
      id: `warning_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      level: 'warning',
      message,
      url: window.location.href,
      userAgent: navigator.userAgent,
      context,
      resolved: false,
      severity: 'medium',
      component: context?.component,
      occurrenceCount: 1,
      status: 'unresolved'
    };

    this.errorLogs.push(errorLog);
    console.warn('Enhanced Warning Tracking:', errorLog);
    return errorLog.id;
  }

  getErrorLogs(): ErrorLog[] {
    return [...this.errorLogs].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  getErrorAnalytics(): ErrorAnalytics {
    const totalErrors = this.errorLogs.length;
    const errorsByLevel = this.errorLogs.reduce((acc, log) => {
      acc[log.level] = (acc[log.level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const errorsByPage = this.errorLogs.reduce((acc, log) => {
      const page = new URL(log.url).pathname;
      acc[page] = (acc[page] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const resolvedCount = this.errorLogs.filter(log => log.resolved).length;
    const resolutionRate = totalErrors > 0 ? (resolvedCount / totalErrors) * 100 : 0;
    const criticalErrors = this.errorLogs.filter(log => log.severity === 'critical').length;
    const errorRate = totalErrors > 0 ? (totalErrors / 100) * 100 : 0;
    const averageResolutionTime = 24; // Mock value

    const topErrors = Object.entries(
      this.errorLogs.reduce((acc, log) => {
        acc[log.message] = (acc[log.message] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    )
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([message, count]) => ({ message, count }));

    const topErrorTypes = Object.entries(
      this.errorLogs.reduce((acc, log) => {
        const type = log.component || 'Unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    )
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([type, count]) => ({ type, count }));

    const errorDistribution = this.errorLogs.reduce((acc, log) => {
      acc[log.severity] = (acc[log.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalErrors,
      errorsByLevel,
      errorsByPage,
      errorTrends: [], // Would need more complex logic for real trends
      topErrors,
      resolutionRate,
      criticalErrors,
      errorRate,
      averageResolutionTime,
      topErrorTypes,
      errorDistribution
    };
  }

  resolveError(errorId: string, resolvedBy?: string): boolean {
    const errorLog = this.errorLogs.find(log => log.id === errorId);
    if (errorLog) {
      errorLog.resolved = true;
      errorLog.resolvedBy = resolvedBy;
      errorLog.resolvedAt = new Date();
      errorLog.status = 'resolved';
      return true;
    }
    return false;
  }

  exportErrorLogs(): string {
    const data = {
      exportedAt: new Date().toISOString(),
      totalErrors: this.errorLogs.length,
      errorLogs: this.errorLogs
    };
    return JSON.stringify(data, null, 2);
  }

  clearResolvedErrors(): number {
    const resolvedCount = this.errorLogs.filter(log => log.resolved).length;
    this.errorLogs = this.errorLogs.filter(log => !log.resolved);
    return resolvedCount;
  }
}

export const enhancedErrorTrackingService = EnhancedErrorTrackingService.getInstance();
