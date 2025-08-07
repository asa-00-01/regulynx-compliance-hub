
import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { analytics, trackPageView, trackUserAction, trackComplianceEvent } from '@/services/analytics';
import { useAuth } from '@/context/auth/AuthContext';

export const useAnalytics = () => {
  const location = useLocation();
  const { user } = useAuth();

  // Only track for admin users
  const isAdmin = user?.role === 'admin';

  // Track page views automatically (admin only)
  useEffect(() => {
    if (!isAdmin) return;
    
    const pageName = location.pathname;
    trackPageView(pageName, {
      user_id: user?.id,
      user_role: user?.role,
    });
  }, [location.pathname, user?.id, user?.role, isAdmin]);

  // Initialize analytics on mount (admin only)
  useEffect(() => {
    if (!isAdmin) return;
    analytics.initialize();
  }, [isAdmin]);

  const trackAction = useCallback((action: string, properties?: Record<string, any>) => {
    if (!isAdmin) return;
    
    trackUserAction(action, {
      user_id: user?.id,
      user_role: user?.role,
      ...properties,
    });
  }, [user?.id, user?.role, isAdmin]);

  const trackCompliance = useCallback((eventType: string, properties?: Record<string, any>) => {
    if (!isAdmin) return;
    
    trackComplianceEvent(eventType, {
      user_id: user?.id,
      user_role: user?.role,
      ...properties,
    });
  }, [user?.id, user?.role, isAdmin]);

  const reportError = useCallback((error: Error, context?: Record<string, any>) => {
    if (!isAdmin) return;
    
    analytics.reportError(error, {
      user_id: user?.id,
      user_role: user?.role,
      ...context,
    });
  }, [user?.id, user?.role, isAdmin]);

  return {
    trackAction,
    trackCompliance,
    reportError,
  };
};
