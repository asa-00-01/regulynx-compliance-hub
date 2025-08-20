import { useCallback, useEffect } from 'react';
import { config } from '@/config/environment';

export const useDebugMode = () => {
  const isDebugMode = config.features.enableDebugMode;

  // Enhanced console logging when debug mode is enabled
  const debugLog = useCallback((message: string, data?: any) => {
    if (isDebugMode) {
      console.log(`🐛 [DEBUG] ${message}`, data || '');
    }
  }, [isDebugMode]);

  const debugError = useCallback((message: string, error?: any) => {
    if (isDebugMode) {
      console.error(`🐛 [DEBUG ERROR] ${message}`, error || '');
    }
  }, [isDebugMode]);

  const debugWarn = useCallback((message: string, data?: any) => {
    if (isDebugMode) {
      console.warn(`🐛 [DEBUG WARN] ${message}`, data || '');
    }
  }, [isDebugMode]);

  // Debug mode indicator in development
  useEffect(() => {
    if (isDebugMode && config.isDevelopment) {
      console.log('🐛 Debug mode is ENABLED');
      console.log('🐛 Debug features available:');
      console.log('  - Enhanced logging');
      console.log('  - Performance monitoring');
      console.log('  - Error tracking');
      console.log('  - Component debugging');
    }
  }, [isDebugMode]);

  // Debug mode warning in production
  useEffect(() => {
    if (isDebugMode && config.isProduction) {
      console.warn('⚠️ WARNING: Debug mode is enabled in production!');
      console.warn('⚠️ This may expose sensitive information and impact performance.');
      console.warn('⚠️ Consider disabling debug mode for production environments.');
    }
  }, [isDebugMode]);

  return {
    isDebugMode,
    debugLog,
    debugError,
    debugWarn,
    // Conditional debug features
    showDebugInfo: isDebugMode,
    enableDetailedLogging: isDebugMode,
    enablePerformanceTracking: isDebugMode,
    enableErrorTracking: isDebugMode,
  };
};

export default useDebugMode;
