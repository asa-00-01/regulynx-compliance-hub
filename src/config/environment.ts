
export const config = {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  
  // API Configuration
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'https://mqsouubnefdyjyaxjcwr.supabase.co',
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
  },
  
  // Supabase Configuration
  supabase: {
    url: 'https://mqsouubnefdyjyaxjcwr.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xc291dWJuZWZkeWp5YXhqY3dyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYzNDg5MzIsImV4cCI6MjA2MTkyNDkzMn0.DwQOtbp3Jzq1f76mbZKPSuNF7tubgIOpbS2qAL3mgtU'
  },
  
  // App Configuration
  app: {
    name: import.meta.env.VITE_APP_NAME || 'Compliance Management System',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    environment: import.meta.env.VITE_ENVIRONMENT || (import.meta.env.PROD ? 'production' : 'development'),
    domain: import.meta.env.VITE_APP_DOMAIN || 'localhost:8080',
    supportEmail: import.meta.env.VITE_SUPPORT_EMAIL || 'support@example.com',
  },
  
  // Feature Flags
  features: {
    enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    enableErrorReporting: import.meta.env.VITE_ENABLE_ERROR_REPORTING === 'true',
    maintenanceMode: import.meta.env.VITE_MAINTENANCE_MODE === 'true',
    enableDebugMode: import.meta.env.VITE_DEBUG_MODE === 'true' || import.meta.env.DEV,
    enablePerformanceMonitoring: import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING === 'true',
  },
  
  // Performance Configuration
  performance: {
    enableServiceWorker: import.meta.env.VITE_ENABLE_SW === 'true',
    cacheTimeout: parseInt(import.meta.env.VITE_CACHE_TIMEOUT || '300000'), // 5 minutes
    requestTimeout: parseInt(import.meta.env.VITE_REQUEST_TIMEOUT || '10000'), // 10 seconds
  },
  
  // Security Configuration
  security: {
    enableCSP: import.meta.env.VITE_ENABLE_CSP === 'true',
    enableHSTS: import.meta.env.VITE_ENABLE_HSTS === 'true',
    rateLimitWindow: parseInt(import.meta.env.VITE_RATE_LIMIT_WINDOW || '60000'), // 1 minute
    rateLimitMax: parseInt(import.meta.env.VITE_RATE_LIMIT_MAX || '100'),
  },
  
  // Logging Configuration
  logging: {
    level: import.meta.env.VITE_LOG_LEVEL || (import.meta.env.PROD ? 'error' : 'debug'),
    enableConsoleLogging: import.meta.env.VITE_ENABLE_CONSOLE_LOGGING !== 'false',
    enableRemoteLogging: import.meta.env.VITE_ENABLE_REMOTE_LOGGING === 'true',
  },
  
  // External Services Configuration
  services: {
    // Placeholder for external service configurations
    // These would typically use Supabase secrets in production
    newsApiEnabled: import.meta.env.VITE_NEWS_API_ENABLED === 'true',
    newsApiRefreshInterval: parseInt(import.meta.env.VITE_NEWS_REFRESH_INTERVAL || '300000'), // 5 minutes
  }
};

// Validation function to ensure required environment variables are set
export const validateEnvironmentConfig = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Check required configurations for production
  if (config.isProduction) {
    if (!config.app.domain || config.app.domain === 'localhost:8080') {
      errors.push('VITE_APP_DOMAIN must be set for production deployment');
    }
    
    if (!config.app.supportEmail || config.app.supportEmail === 'support@example.com') {
      errors.push('VITE_SUPPORT_EMAIL must be set for production deployment');
    }
    
    if (config.features.enableDebugMode) {
      console.warn('Debug mode is enabled in production - consider disabling');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Helper function to get environment-specific URLs
export const getEnvironmentUrls = () => ({
  api: config.api.baseUrl,
  app: config.isProduction ? `https://${config.app.domain}` : `http://${config.app.domain}`,
  supabase: config.supabase.url,
});

export default config;
