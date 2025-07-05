
// Environment Configuration
const environment = import.meta.env.VITE_ENVIRONMENT || 'development';
const isDevelopment = environment === 'development';
const isProduction = environment === 'production';

// Base configuration
export const config = {
  app: {
    name: import.meta.env.VITE_APP_NAME || 'AML Compliance Platform',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    environment,
    domain: import.meta.env.VITE_APP_DOMAIN || (isProduction ? 'aml-compliance.com' : 'localhost'),
    port: parseInt(import.meta.env.VITE_PORT || '3000'),
    baseUrl: import.meta.env.VITE_BASE_URL || (isProduction ? 'https://aml-compliance.com' : 'http://localhost:3000'),
  },

  // API Configuration
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
    retries: parseInt(import.meta.env.VITE_API_RETRIES || '3'),
  },

  // Supabase Configuration
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
    serviceRoleKey: import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '',
  },

  // Feature Flags - Optimized for production
  features: {
    enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true' || isProduction,
    enableErrorReporting: import.meta.env.VITE_ENABLE_ERROR_REPORTING === 'true' || isProduction,
    enablePerformanceMonitoring: import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING === 'true' || isProduction,
    enableDebugMode: import.meta.env.VITE_DEBUG_MODE === 'true' && !isProduction, // Never enabled in production
    useMockData: import.meta.env.VITE_USE_MOCK_DATA === 'true' && !isProduction, // Never enabled in production
    enableDevTools: import.meta.env.VITE_ENABLE_DEV_TOOLS === 'true' && !isProduction,
  },

  // Security Configuration - Enhanced for production
  security: {
    enableCSP: import.meta.env.VITE_ENABLE_CSP === 'true' || isProduction,
    enableHSTS: import.meta.env.VITE_ENABLE_HSTS === 'true' || isProduction,
    enableXSSProtection: import.meta.env.VITE_ENABLE_XSS_PROTECTION === 'true' || isProduction,
    sessionTimeout: parseInt(import.meta.env.VITE_SESSION_TIMEOUT || '3600000'), // 1 hour
    maxLoginAttempts: parseInt(import.meta.env.VITE_MAX_LOGIN_ATTEMPTS || '5'),
    passwordPolicy: {
      minLength: parseInt(import.meta.env.VITE_PASSWORD_MIN_LENGTH || '8'),
      requireUppercase: import.meta.env.VITE_PASSWORD_REQUIRE_UPPERCASE !== 'false',
      requireNumbers: import.meta.env.VITE_PASSWORD_REQUIRE_NUMBERS !== 'false',
      requireSymbols: import.meta.env.VITE_PASSWORD_REQUIRE_SYMBOLS !== 'false',
    },
  },

  // Logging Configuration - Optimized for production
  logging: {
    level: import.meta.env.VITE_LOG_LEVEL || (isProduction ? 'error' : 'debug'),
    enableConsoleLogging: import.meta.env.VITE_ENABLE_CONSOLE_LOGGING !== 'false' && !isProduction, // Disabled in production
    enableRemoteLogging: import.meta.env.VITE_ENABLE_REMOTE_LOGGING === 'true' || isProduction,
  },

  // Performance Configuration
  performance: {
    enableCodeSplitting: import.meta.env.VITE_ENABLE_CODE_SPLITTING !== 'false',
    enableLazyLoading: import.meta.env.VITE_ENABLE_LAZY_LOADING !== 'false',
    enableServiceWorker: import.meta.env.VITE_ENABLE_SERVICE_WORKER === 'true' && isProduction,
    cacheStrategy: import.meta.env.VITE_CACHE_STRATEGY || (isProduction ? 'aggressive' : 'minimal'),
  },

  // Development flags
  isDevelopment,
  isProduction,
  isTest: environment === 'test',
} as const;

// Validation function to check configuration
export const validateEnvironmentConfig = () => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Critical checks for production
  if (isProduction) {
    if (config.features.enableDebugMode) {
      errors.push('Debug mode must be disabled in production (VITE_DEBUG_MODE=false)');
    }
    
    if (config.features.useMockData) {
      errors.push('Mock data must be disabled in production (VITE_USE_MOCK_DATA=false)');
    }
    
    if (config.app.domain === 'localhost') {
      errors.push('Domain must be set to production domain, not localhost');
    }

    if (config.logging.enableConsoleLogging) {
      warnings.push('Console logging should be disabled in production for better performance');
    }

    if (!config.features.enableErrorReporting) {
      warnings.push('Error reporting should be enabled in production for monitoring');
    }

    if (!config.security.enableCSP) {
      warnings.push('Content Security Policy should be enabled for better security');
    }

    if (!config.security.enableHSTS) {
      warnings.push('HSTS should be enabled for better security');
    }
  }

  // General validation
  if (!config.supabase.url || !config.supabase.anonKey) {
    errors.push('Supabase configuration is incomplete');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

// Configuration summary for debugging
export const getConfigurationSummary = () => ({
  environment: config.app.environment,
  version: config.app.version,
  domain: config.app.domain,
  features: {
    analytics: config.features.enableAnalytics,
    errorReporting: config.features.enableErrorReporting,
    mockData: config.features.useMockData,
    debugMode: config.features.enableDebugMode,
  },
  security: {
    csp: config.security.enableCSP,
    hsts: config.security.enableHSTS,
    xssProtection: config.security.enableXSSProtection,
  },
});

export default config;
