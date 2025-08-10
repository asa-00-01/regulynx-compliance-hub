
import { useCallback } from 'react';
import { enhancedErrorTrackingService, ErrorContext } from '@/services/enhancedErrorTracking';
import { useAuth } from '@/context/AuthContext';

export const useEnhancedErrorTracking = () => {
  const { user } = useAuth();

  const captureError = useCallback(async (
    error: Error, 
    context?: Partial<ErrorContext>
  ): Promise<string> => {
    return enhancedErrorTrackingService.captureError(error, {
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
    // Implementation would add breadcrumb logic here
    console.log('Breadcrumb:', { category, message, level, data });
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
