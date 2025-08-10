
import { useCallback } from 'react';
import { enhancedErrorTracking, ErrorContext } from '@/services/enhancedErrorTracking';
import { useAuth } from '@/context/AuthContext';

export const useEnhancedErrorTracking = () => {
  const { user } = useAuth();

  const captureError = useCallback(async (
    error: Error, 
    context?: Partial<ErrorContext>
  ): Promise<string> => {
    return await enhancedErrorTracking.captureError(error, {
      userId: user?.id,
      ...context
    });
  }, [user?.id]);

  const addBreadcrumb = useCallback((
    category: 'navigation' | 'user_action' | 'console' | 'network' | 'error',
    message: string,
    level: 'info' | 'warning' | 'error' = 'info',
    data?: Record<string, any>
  ) => {
    enhancedErrorTracking.addBreadcrumb({
      category,
      message,
      level,
      timestamp: new Date().toISOString(),
      data
    });
  }, []);

  const trackUserAction = useCallback((action: string, component?: string, data?: Record<string, any>) => {
    addBreadcrumb('user_action', `User performed: ${action}`, 'info', {
      component,
      ...data
    });
  }, [addBreadcrumb]);

  const trackNavigation = useCallback((from: string, to: string) => {
    addBreadcrumb('navigation', `Navigated from ${from} to ${to}`, 'info', {
      from,
      to
    });
  }, [addBreadcrumb]);

  return {
    captureError,
    addBreadcrumb,
    trackUserAction,
    trackNavigation
  };
};
