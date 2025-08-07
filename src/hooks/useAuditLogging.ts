
import { useCallback } from 'react';
import { useAuth } from '@/context/auth/AuthContext';
import { auditLogger } from '@/services/auditLogger';

export const useAuditLogging = () => {
  const { user } = useAuth();

  const logAuthentication = useCallback(async (action: string, details?: Record<string, any>, success = true) => {
    await auditLogger.logAuthentication(action, {
      user_email: user?.email,
      ...details
    }, success);
  }, [user?.email]);

  const logPayment = useCallback(async (action: string, details: Record<string, any>, success = true) => {
    await auditLogger.logPayment(action, {
      user_id: user?.id,
      user_email: user?.email,
      ...details
    }, success);
  }, [user?.id, user?.email]);

  const logDataAccess = useCallback(async (action: string, entity: string, entityId?: string, details?: Record<string, any>) => {
    await auditLogger.logDataAccess(action, entity, entityId, {
      user_id: user?.id,
      user_email: user?.email,
      ...details
    });
  }, [user?.id, user?.email]);

  const logUserAction = useCallback(async (action: string, entity: string, entityId?: string, details?: Record<string, any>) => {
    await auditLogger.logUserAction(action, entity, entityId, {
      user_id: user?.id,
      user_email: user?.email,
      ...details
    });
  }, [user?.id, user?.email]);

  const logSecurityEvent = useCallback(async (action: string, details: Record<string, any>, severity: 'medium' | 'high' | 'critical' = 'high') => {
    await auditLogger.logSecurityEvent(action, {
      user_id: user?.id,
      user_email: user?.email,
      ...details
    }, severity);
  }, [user?.id, user?.email]);

  const logError = useCallback(async (error: Error, context: string, details?: Record<string, any>) => {
    await auditLogger.logError(error, context, {
      user_id: user?.id,
      user_email: user?.email,
      ...details
    });
  }, [user?.id, user?.email]);

  return {
    logAuthentication,
    logPayment,
    logDataAccess,
    logUserAction,
    logSecurityEvent,
    logError
  };
};
