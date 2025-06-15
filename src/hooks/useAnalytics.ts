
import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { analytics, trackPageView, trackUserAction, trackComplianceEvent } from '@/services/analytics';
import { useAuth } from '@/context/AuthContext';

export const useAnalytics = () => {
  const location = useLocation();
  const { user } = useAuth();

  // Track page views automatically
  useEffect(() => {
    const pageName = location.pathname;
    trackPageView(pageName, {
      user_id: user?.id,
      user_role: user?.role,
    });
  }, [location.pathname, user?.id, user?.role]);

  // Initialize analytics on mount
  useEffect(() => {
    analytics.initialize();
  }, []);

  const trackAction = useCallback((action: string, properties?: Record<string, any>) => {
    trackUserAction(action, {
      user_id: user?.id,
      user_role: user?.role,
      ...properties,
    });
  }, [user?.id, user?.role]);

  const trackCompliance = useCallback((eventType: string, properties?: Record<string, any>) => {
    trackComplianceEvent(eventType, {
      user_id: user?.id,
      user_role: user?.role,
      ...properties,
    });
  }, [user?.id, user?.role]);

  const reportError = useCallback((error: Error, context?: Record<string, any>) => {
    analytics.reportError(error, {
      user_id: user?.id,
      user_role: user?.role,
      ...context,
    });
  }, [user?.id, user?.role]);

  return {
    trackAction,
    trackCompliance,
    reportError,
  };
};
