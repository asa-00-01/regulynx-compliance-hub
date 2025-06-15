
# Production Deployment Configuration

This guide explains how to configure environment variables for production deployment of the Compliance Management System.

## Environment Variables

### Required for Production

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
```

### Optional Environment Variables

```bash
# API Configuration (optional)
VITE_API_BASE_URL="https://your-custom-api.com"

# Performance (optional)
VITE_ENABLE_SW="true"

# Development/Staging only
VITE_DEBUG_MODE="true"
VITE_ENABLE_CONSOLE_LOGGING="true"
```

## Deployment Platforms

### Lovable Deployment

When deploying through Lovable:

1. Click the "Publish" button in the top right
2. Configure your custom domain in Project > Settings > Domains
3. Environment variables are managed through the deployment interface

### Vercel Deployment

1. Add environment variables in the Vercel dashboard under "Environment Variables"
2. Set the build command: `npm run build`
3. Set the output directory: `dist`

### Netlify Deployment

1. Add environment variables in Site settings > Environment variables
2. Set the build command: `npm run build`
3. Set the publish directory: `dist`

### Docker Deployment

```dockerfile
# Example Dockerfile with environment variables
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Build with environment variables
ARG VITE_APP_NAME
ARG VITE_APP_DOMAIN
ARG VITE_SUPPORT_EMAIL
ARG VITE_ENVIRONMENT=production

ENV VITE_APP_NAME=$VITE_APP_NAME
ENV VITE_APP_DOMAIN=$VITE_APP_DOMAIN
ENV VITE_SUPPORT_EMAIL=$VITE_SUPPORT_EMAIL
ENV VITE_ENVIRONMENT=$VITE_ENVIRONMENT

RUN npm run build

FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Supabase Configuration

For backend functionality, use Supabase Edge Functions with environment variables stored as Supabase secrets:

1. Go to your Supabase dashboard
2. Navigate to Edge Functions > Settings
3. Add secrets for sensitive data (API keys, etc.)
4. Reference them in your edge functions

## Security Considerations

### Production Environment Variables

- ✅ **DO** set `VITE_ENVIRONMENT="production"`
- ✅ **DO** set `VITE_DEBUG_MODE="false"`
- ✅ **DO** set `VITE_LOG_LEVEL="error"`
- ✅ **DO** use your actual domain for `VITE_APP_DOMAIN`
- ✅ **DO** enable CSP and HSTS in production

### Sensitive Data

- ❌ **DON'T** put sensitive API keys in VITE_ variables (they're public)
- ✅ **DO** use Supabase secrets for sensitive backend data
- ✅ **DO** use environment-specific configurations
- ✅ **DO** validate environment configuration on startup

## Monitoring and Logging

The app includes built-in monitoring that can be configured through environment variables:

- **Performance Monitoring**: Set `VITE_ENABLE_PERFORMANCE_MONITORING="true"`
- **Error Reporting**: Set `VITE_ENABLE_ERROR_REPORTING="true"`
- **Analytics**: Set `VITE_ENABLE_ANALYTICS="true"`
- **Remote Logging**: Set `VITE_ENABLE_REMOTE_LOGGING="true"`

## Validation

The app automatically validates environment configuration on startup. Check the browser console for any configuration warnings or errors.

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
