
import { useState, useEffect } from 'react';
import config from '@/config/environment';
import { analytics } from '@/services/analytics';

interface ProductionReadinessCheck {
  name: string;
  status: 'pass' | 'warning' | 'fail';
  message: string;
  category: 'security' | 'performance' | 'configuration' | 'monitoring';
}

interface ProductionReadinessReport {
  score: number;
  checks: ProductionReadinessCheck[];
  recommendations: string[];
  isReady: boolean;
}

export const useProductionReadiness = () => {
  const [report, setReport] = useState<ProductionReadinessReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runChecks = async () => {
    setIsLoading(true);
    
    try {
      const checks: ProductionReadinessCheck[] = [];
      
      // Security Checks
      checks.push({
        name: 'Environment Configuration',
        status: config.app.environment === 'production' ? 'pass' : 'warning',
        message: config.app.environment === 'production' 
          ? 'Environment is correctly set to production'
          : `Environment is set to ${config.app.environment}`,
        category: 'security'
      });

      checks.push({
        name: 'Debug Mode',
        status: !config.features.enableDebugMode ? 'pass' : 'warning',
        message: !config.features.enableDebugMode 
          ? 'Debug mode is disabled'
          : 'Debug mode is enabled - disable for production',
        category: 'security'
      });

      // Performance Checks
      checks.push({
        name: 'Performance Monitoring',
        status: config.features.enablePerformanceMonitoring ? 'pass' : 'warning',
        message: config.features.enablePerformanceMonitoring 
          ? 'Performance monitoring is enabled'
          : 'Performance monitoring is disabled',
        category: 'performance'
      });

      // Monitoring Checks
      checks.push({
        name: 'Error Reporting',
        status: config.features.enableErrorReporting ? 'pass' : 'warning',
        message: config.features.enableErrorReporting 
          ? 'Error reporting is enabled'
          : 'Error reporting is disabled',
        category: 'monitoring'
      });

      checks.push({
        name: 'Analytics',
        status: config.features.enableAnalytics ? 'pass' : 'warning',
        message: config.features.enableAnalytics 
          ? 'Analytics tracking is enabled'
          : 'Analytics tracking is disabled',
        category: 'monitoring'
      });

      // Configuration Checks
      checks.push({
        name: 'App Domain',
        status: config.app.domain !== 'localhost' ? 'pass' : 'warning',
        message: config.app.domain !== 'localhost' 
          ? `Domain is set to ${config.app.domain}`
          : 'Domain is set to localhost - update for production',
        category: 'configuration'
      });

      // Calculate score
      const passCount = checks.filter(c => c.status === 'pass').length;
      const score = Math.round((passCount / checks.length) * 100);
      
      // Generate recommendations
      const recommendations: string[] = [];
      const failures = checks.filter(c => c.status === 'fail');
      const warnings = checks.filter(c => c.status === 'warning');
      
      if (failures.length > 0) {
        recommendations.push(`Fix ${failures.length} critical issue(s) before deploying to production`);
      }
      
      if (warnings.length > 0) {
        recommendations.push(`Address ${warnings.length} warning(s) for optimal production setup`);
      }

      if (config.app.environment !== 'production') {
        recommendations.push('Set VITE_ENVIRONMENT="production" for production deployment');
      }

      if (config.features.enableDebugMode) {
        recommendations.push('Disable debug mode by setting VITE_DEBUG_MODE="false"');
      }

      const productionReport: ProductionReadinessReport = {
        score,
        checks,
        recommendations,
        isReady: failures.length === 0 && score >= 80
      };

      setReport(productionReport);

      // Track the readiness check
      if (config.features.enableAnalytics) {
        analytics.track('production_readiness_check', {
          score,
          total_checks: checks.length,
          pass_count: passCount,
          warning_count: warnings.length,
          fail_count: failures.length,
          is_ready: productionReport.isReady,
        });
      }

    } catch (error) {
      console.error('Production readiness check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Run initial check if in development or debug mode
    if (config.isDevelopment || config.features.enableDebugMode) {
      runChecks();
    }
  }, []);

  return {
    report,
    isLoading,
    runChecks,
  };
};
