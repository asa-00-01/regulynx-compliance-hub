
import React, { useEffect } from 'react';
import { analytics } from '@/services/analytics';
import config from '@/config/environment';
import { useDebugMode } from '@/hooks/useDebugMode';

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children }) => {
  const { debugLog, isDebugMode } = useDebugMode();

  useEffect(() => {
    // Initialize analytics service
    analytics.initialize();

    // Enhanced logging when debug mode is enabled
    if (isDebugMode) {
      debugLog('Analytics service initialized');
      debugLog('Analytics Configuration:', {
        enableAnalytics: config.features.enableAnalytics,
        enableErrorReporting: config.features.enableErrorReporting,
        enablePerformanceMonitoring: config.features.enablePerformanceMonitoring,
        environment: config.app.environment,
      });
    } else if (config.isDevelopment) {
      // Basic logging for development without debug mode
      console.log('Analytics Configuration:', {
        enableAnalytics: config.features.enableAnalytics,
        enableErrorReporting: config.features.enableErrorReporting,
        enablePerformanceMonitoring: config.features.enablePerformanceMonitoring,
        environment: config.app.environment,
      });
    }
  }, [debugLog, isDebugMode]);

  return <>{children}</>;
};

export default AnalyticsProvider;
