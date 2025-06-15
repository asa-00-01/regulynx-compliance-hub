
# Environment Variables Configuration

This guide explains how to configure environment variables for the Compliance Management System.

## Required for Production

These environment variables must be configured for production deployment:

```bash
# App Configuration
VITE_APP_NAME="Your Compliance System Name"
VITE_APP_VERSION="1.0.0"
VITE_ENVIRONMENT="production"
VITE_APP_DOMAIN="your-domain.com"
VITE_SUPPORT_EMAIL="support@your-domain.com"

# API Configuration
VITE_API_TIMEOUT="30000"

# Feature Flags
VITE_ENABLE_ANALYTICS="true"
VITE_ENABLE_ERROR_REPORTING="true"
VITE_MAINTENANCE_MODE="false"
VITE_DEBUG_MODE="false"
VITE_ENABLE_PERFORMANCE_MONITORING="true"

# Performance
VITE_ENABLE_SW="true"
VITE_CACHE_TIMEOUT="300000"
VITE_REQUEST_TIMEOUT="10000"

# Security
VITE_ENABLE_CSP="true"
VITE_ENABLE_HSTS="true"
VITE_RATE_LIMIT_WINDOW="60000"
VITE_RATE_LIMIT_MAX="100"

# Logging
VITE_LOG_LEVEL="error"
VITE_ENABLE_CONSOLE_LOGGING="false"
VITE_ENABLE_REMOTE_LOGGING="true"

# Services
VITE_NEWS_API_ENABLED="true"
VITE_NEWS_REFRESH_INTERVAL="300000"

# Analytics & Monitoring (Production)
VITE_ANALYTICS_PROVIDER="google" # or "mixpanel", "amplitude"
VITE_ERROR_REPORTING_PROVIDER="sentry" # or "bugsnag", "rollbar"
VITE_PERFORMANCE_MONITORING_PROVIDER="newrelic" # or "datadog"
```

## Optional Environment Variables

```bash
# API Configuration (optional)
VITE_API_BASE_URL="https://your-custom-api.com"

# Performance (optional)
VITE_ENABLE_SW="true"

# Development/Staging only
VITE_DEBUG_MODE="true"
VITE_ENABLE_CONSOLE_LOGGING="true"
```

## Example Production Configuration

```bash
# Minimal production configuration
VITE_ENVIRONMENT="production"
VITE_APP_NAME="ACME Compliance System"
VITE_APP_DOMAIN="compliance.acme.com"
VITE_SUPPORT_EMAIL="compliance-support@acme.com"
VITE_DEBUG_MODE="false"
VITE_LOG_LEVEL="error"
VITE_ENABLE_PERFORMANCE_MONITORING="true"
VITE_ENABLE_ERROR_REPORTING="true"
VITE_ENABLE_CSP="true"
VITE_ENABLE_HSTS="true"
```
