
import { useCallback } from 'react';
import { productionMonitor } from '@/services/productionMonitor';
import { auditLogger } from '@/services/auditLogger';
import config from '@/config/environment';

export const useErrorTracking = () => {
  const logError = useCallback(async (
    error: Error,
    context?: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    additionalContext?: Record<string, any>
  ) => {
    try {
      const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Log to production monitor database
      await productionMonitor.logError(
        errorId,
        error.message,
        error.stack,
        'runtime',
        severity,
        window.location.href,
        navigator.userAgent,
        {
          context,
          ...additionalContext,
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent,
          viewport: `${window.innerWidth}x${window.innerHeight}`,
        }
      );

      // Also log to audit system
      await auditLogger.logError(error, context || 'unknown', {
        error_id: errorId,
        severity,
        ...additionalContext
      });

      // Console log in development
      if (config.isDevelopment) {
        console.error(`🚨 Error tracked [${severity.toUpperCase()}]:`, {
          id: errorId,
          message: error.message,
          context,
          stack: error.stack
        });
      }

      return errorId;
    } catch (loggingError) {
      console.error('Failed to track error:', loggingError);
      return null;
    }
  }, []);

  const logUserError = useCallback(async (
    message: string,
    context?: string,
    additionalData?: Record<string, any>
  ) => {
    const error = new Error(message);
    return await logError(error, context, 'medium', additionalData);
  }, [logError]);

  const logCriticalError = useCallback(async (
    error: Error,
    context?: string,
    additionalData?: Record<string, any>
  ) => {
    return await logError(error, context, 'critical', additionalData);
  }, [logError]);

  return {
    logError,
    logUserError,
    logCriticalError,
  };
};
