
import React, { useEffect } from 'react';
import { analytics } from '@/services/analytics';
import config from '@/config/environment';

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children }) => {
  useEffect(() => {
    // Initialize analytics service
    analytics.initialize();

    // Log analytics configuration in development
    if (config.isDevelopment) {
      console.log('Analytics Configuration:', {
        enableAnalytics: config.features.enableAnalytics,
        enableErrorReporting: config.features.enableErrorReporting,
        enablePerformanceMonitoring: config.features.enablePerformanceMonitoring,
        environment: config.app.environment,
      });
    }
  }, []);

  return <>{children}</>;
};

export default AnalyticsProvider;
