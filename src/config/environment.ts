
export const config = {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  
  // API Configuration
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'https://mqsouubnefdyjyaxjcwr.supabase.co',
    timeout: 30000,
  },
  
  // Supabase Configuration
  supabase: {
    url: 'https://mqsouubnefdyjyaxjcwr.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xc291dWJuZWZkeWp5YXhqY3dyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYzNDg5MzIsImV4cCI6MjA2MTkyNDkzMn0.DwQOtbp3Jzq1f76mbZKPSuNF7tubgIOpbS2qAL3mgtU'
  },
  
  // Feature Flags
  features: {
    enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    enableErrorReporting: import.meta.env.VITE_ENABLE_ERROR_REPORTING === 'true',
    maintenanceMode: import.meta.env.VITE_MAINTENANCE_MODE === 'true',
  },
  
  // Performance Configuration
  performance: {
    enableServiceWorker: import.meta.env.VITE_ENABLE_SW === 'true',
    cacheTimeout: 1000 * 60 * 5, // 5 minutes
  }
};

export default config;
