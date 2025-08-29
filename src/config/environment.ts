
// Environment Configuration
const environment = import.meta.env.VITE_ENVIRONMENT || 'development';
const isDevelopment = environment === 'development';
const isProduction = environment === 'production';

// Helper function to get stored configuration values
const getStoredConfigValue = (key: string, defaultValue: unknown) => {
  try {
    const stored = localStorage.getItem(`dev_${key}`);
    if (stored === null || stored === undefined) {
      return defaultValue;
    }
    return JSON.parse(stored);
  } catch {
    return defaultValue;
  }
};

// Base configuration
export const config = {
  app: {
    name: getStoredConfigValue('app_name', import.meta.env.VITE_APP_NAME || 'AML Compliance Platform'),
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    environment,
    domain: getStoredConfigValue('app_domain', import.meta.env.VITE_APP_DOMAIN || (isProduction ? 'aml-compliance.com' : 'localhost')),
    port: parseInt(import.meta.env.VITE_PORT || '3000'),
    baseUrl: import.meta.env.VITE_BASE_URL || (isProduction ? 'https://aml-compliance.com' : 'http://localhost:3000'),
    supportEmail: getStoredConfigValue('app_supportEmail', import.meta.env.VITE_SUPPORT_EMAIL || 'support@aml-compliance.com'),
  },

  // API Configuration
  api: {
    baseUrl: getStoredConfigValue('api_baseUrl', import.meta.env.VITE_API_BASE_URL || '/api'),
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
    retries: parseInt(import.meta.env.VITE_API_RETRIES || '3'),
  },

  // Supabase Configuration - Use local instance in development, remote in production
  supabase: {
    url: isDevelopment 
      ? (import.meta.env.VITE_SUPABASE_URL || "http://127.0.0.1:54321")
      : "https://mqsouubnefdyjyaxjcwr.supabase.co",
    anonKey: isDevelopment
      ? (import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0")
      : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xc291dWJuZWZkeWp5YXhqY3dyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYzNDg5MzIsImV4cCI6MjA2MTkyNDkzMn0.DwQOtbp3Jzq1f76mbZKPSuNF7tubgIOpbS2qAL3mgtU",
    serviceRoleKey: import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '',
  },

  // Feature Flags - Enhanced with localStorage overrides
  features: {
    enableAnalytics: getStoredConfigValue('features_enableAnalytics', import.meta.env.VITE_ENABLE_ANALYTICS === 'true' || isProduction),
    enableErrorReporting: getStoredConfigValue('features_enableErrorReporting', import.meta.env.VITE_ENABLE_ERROR_REPORTING === 'true' || isProduction),
    enablePerformanceMonitoring: getStoredConfigValue('features_enablePerformanceMonitoring', import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING === 'true' || isProduction),
    enableDebugMode: getStoredConfigValue('features_enableDebugMode', import.meta.env.VITE_DEBUG_MODE === 'true' && !isProduction),
    useMockData: getStoredConfigValue('features_useMockData', false), // Use real data by default
    enableDevTools: getStoredConfigValue('features_enableDevTools', import.meta.env.VITE_ENABLE_DEV_TOOLS === 'true' && !isProduction),
  },

  // Security Configuration - Enhanced for production
  security: {
    enableCSP: import.meta.env.VITE_ENABLE_CSP === 'true' || isProduction,
    enableHSTS: import.meta.env.VITE_ENABLE_HSTS === 'true' || isProduction,
    enableXSSProtection: import.meta.env.VITE_ENABLE_XSS_PROTECTION === 'true' || isProduction,
    enableFrameOptions: import.meta.env.VITE_ENABLE_FRAME_OPTIONS === 'true' || isProduction,
    sessionTimeout: parseInt(import.meta.env.VITE_SESSION_TIMEOUT || '3600000'), // 1 hour
    maxLoginAttempts: parseInt(import.meta.env.VITE_MAX_LOGIN_ATTEMPTS || '5'),
    rateLimitWindow: parseInt(import.meta.env.VITE_RATE_LIMIT_WINDOW || '900000'), // 15 minutes
    rateLimitMax: parseInt(import.meta.env.VITE_RATE_LIMIT_MAX || '100'),
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

  // General validation - Only check if Supabase URL is actually missing or invalid
  if (!config.supabase.url || !config.supabase.url.includes('supabase.co')) {
    errors.push('Supabase URL configuration is invalid');
  }

  if (!config.supabase.anonKey || config.supabase.anonKey.length < 100) {
    errors.push('Supabase anonymous key configuration is invalid');
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

// Reactive configuration getter for dynamic feature flags
export const getConfig = () => {
  return {
    ...config,
    features: {
      ...config.features,
      useMockData: getStoredConfigValue('features_useMockData', false), // Use real data by default
      enableDevTools: getStoredConfigValue('features_enableDevTools', import.meta.env.VITE_ENABLE_DEV_TOOLS === 'true' && !isProduction),
      enableDebugMode: getStoredConfigValue('features_enableDebugMode', import.meta.env.VITE_DEBUG_MODE === 'true' && !isProduction),
    }
  };
};

export default config;
