
# Environment Variables Configuration

This guide explains how to configure environment variables for the Compliance Management System for production deployment.

## Required for Production (Critical)

These environment variables **MUST** be configured for production deployment:

```bash
# App Configuration (Required)
VITE_APP_NAME="Your Compliance System Name"
VITE_APP_VERSION="1.0.0"
VITE_ENVIRONMENT="production"
VITE_APP_DOMAIN="your-domain.com"
VITE_SUPPORT_EMAIL="support@your-domain.com"
VITE_COMPANY_NAME="Your Company Name"

# Security Configuration (Critical)
VITE_ENABLE_CSP="true"
VITE_ENABLE_HSTS="true"
VITE_ENABLE_XSS_PROTECTION="true"
VITE_ENABLE_FRAME_OPTIONS="true"

# Feature Flags (Critical)
VITE_DEBUG_MODE="false"
VITE_USE_MOCK_DATA="false"
VITE_MAINTENANCE_MODE="false"

# Logging (Critical)
VITE_LOG_LEVEL="error"
VITE_ENABLE_CONSOLE_LOGGING="false"
VITE_ENABLE_REMOTE_LOGGING="true"
```

## Recommended for Production

These environment variables are highly recommended for production:

```bash
# Analytics & Monitoring
VITE_ENABLE_ANALYTICS="true"
VITE_ENABLE_ERROR_REPORTING="true"
VITE_ENABLE_PERFORMANCE_MONITORING="true"

# Performance Optimization
VITE_ENABLE_SW="true"
VITE_ENABLE_PRELOADING="true"
VITE_ENABLE_COMPRESSION="true"
VITE_CACHE_TIMEOUT="300000"
VITE_REQUEST_TIMEOUT="10000"

# Security Enhancement
VITE_RATE_LIMIT_WINDOW="60000"
VITE_RATE_LIMIT_MAX="100"
VITE_SESSION_TIMEOUT="3600000"

# Service Configuration
VITE_EMAIL_SERVICE_ENABLED="true"
VITE_SMS_SERVICE_ENABLED="true"
VITE_BACKUP_SERVICE_ENABLED="true"
```

## Optional Configuration

```bash
# API Configuration (optional - uses Supabase by default)
VITE_API_BASE_URL="https://your-custom-api.com"
VITE_API_TIMEOUT="30000"

# Legal & Compliance
VITE_PRIVACY_POLICY_URL="https://your-domain.com/privacy"
VITE_TERMS_OF_SERVICE_URL="https://your-domain.com/terms"

# News & Updates
VITE_NEWS_API_ENABLED="true"
VITE_NEWS_REFRESH_INTERVAL="300000"

# Logging Configuration
VITE_MAX_LOG_SIZE="1000"
VITE_LOG_RETENTION_DAYS="30"
```

## Environment-Specific Examples

### Production Configuration
```bash
# Minimal production configuration
VITE_ENVIRONMENT="production"
VITE_APP_NAME="ACME Compliance System"
VITE_APP_DOMAIN="compliance.acme.com"
VITE_COMPANY_NAME="ACME Corporation"
VITE_SUPPORT_EMAIL="compliance-support@acme.com"
VITE_DEBUG_MODE="false"
VITE_USE_MOCK_DATA="false"
VITE_LOG_LEVEL="error"
VITE_ENABLE_CONSOLE_LOGGING="false"
VITE_ENABLE_CSP="true"
VITE_ENABLE_HSTS="true"
VITE_ENABLE_PERFORMANCE_MONITORING="true"
VITE_ENABLE_ERROR_REPORTING="true"
```

### Staging Configuration
```bash
# Staging environment configuration
VITE_ENVIRONMENT="staging"
VITE_APP_NAME="ACME Compliance System (Staging)"
VITE_APP_DOMAIN="staging-compliance.acme.com"
VITE_COMPANY_NAME="ACME Corporation"
VITE_SUPPORT_EMAIL="staging-support@acme.com"
VITE_DEBUG_MODE="true"
VITE_USE_MOCK_DATA="false"
VITE_LOG_LEVEL="info"
VITE_ENABLE_CONSOLE_LOGGING="true"
VITE_ENABLE_CSP="true"
VITE_ENABLE_HSTS="true"
```

### Development Configuration
```bash
# Development environment (most are defaults)
VITE_ENVIRONMENT="development"
VITE_DEBUG_MODE="true"
VITE_USE_MOCK_DATA="true"
VITE_LOG_LEVEL="debug"
VITE_ENABLE_CONSOLE_LOGGING="true"
```

## Validation

The application automatically validates environment configuration on startup. Check the browser console for any configuration warnings or errors.

### Critical Errors
These will prevent the application from working properly in production:
- Missing `VITE_APP_DOMAIN`
- Missing `VITE_SUPPORT_EMAIL`
- `VITE_USE_MOCK_DATA="true"` in production
- Missing company information

### Warnings
These should be addressed but won't break the application:
- Debug mode enabled in production
- Console logging enabled in production
- Missing security headers
- Performance optimizations disabled

## Security Considerations

### ⚠️ Important Security Notes
- **NEVER** put sensitive API keys in VITE_ variables (they're public)
- **ALWAYS** use `VITE_DEBUG_MODE="false"` in production
- **ALWAYS** use `VITE_USE_MOCK_DATA="false"` in production
- **ALWAYS** enable security headers (CSP, HSTS, etc.)

### Recommended Security Settings
```bash
VITE_ENABLE_CSP="true"
VITE_ENABLE_HSTS="true"
VITE_ENABLE_XSS_PROTECTION="true"
VITE_ENABLE_FRAME_OPTIONS="true"
VITE_RATE_LIMIT_MAX="100"
VITE_SESSION_TIMEOUT="3600000"
```

## Next Steps

After configuring environment variables:
1. Test the configuration in a staging environment
2. Validate using the built-in validation system
3. Review security settings
4. Set up analytics and monitoring
5. Configure error reporting

For deployment-specific instructions, see the [Deployment Guides](./deployment-guides.md).
