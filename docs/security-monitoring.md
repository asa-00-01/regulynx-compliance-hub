
# Security, Monitoring, and Logging

This document covers security best practices, monitoring, logging, and analytics configuration for the application.

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

## Analytics and Error Reporting Integration

The application includes comprehensive analytics and error reporting capabilities:

### Analytics Features
- **Page View Tracking**: Automatically tracks page navigation
- **User Action Tracking**: Monitors user interactions and compliance actions
- **Compliance Event Tracking**: Specialized tracking for compliance-related activities
- **Performance Monitoring**: Core Web Vitals and custom performance metrics

### Error Reporting Features
- **Global Error Handling**: Catches and reports unhandled errors
- **Promise Rejection Handling**: Monitors unhandled promise rejections
- **Context-Aware Reporting**: Includes user context and application state
- **Development Mode Logging**: Console logging for debugging

### Supported Analytics Providers
The analytics service is designed to integrate with popular providers:
- **Google Analytics 4**: Web analytics and user behavior tracking
- **Mixpanel**: Event tracking and user analytics
- **Amplitude**: Product analytics and user journey tracking

### Supported Error Reporting Providers
- **Sentry**: Error monitoring and performance tracking
- **Bugsnag**: Error monitoring and stability management
- **Rollbar**: Real-time error tracking and debugging

### Integration Examples

#### Google Analytics 4
```javascript
// In production, extend the analytics service:
private async initializeAnalytics() {
  if (process.env.VITE_GA4_MEASUREMENT_ID) {
    gtag('config', process.env.VITE_GA4_MEASUREMENT_ID);
  }
}
```

#### Sentry Integration
```javascript
// In production, extend the error reporting service:
private async initializeErrorReporting() {
  if (process.env.VITE_SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.VITE_SENTRY_DSN,
      environment: config.app.environment,
    });
  }
}
```

### Development Mode Features
- **Analytics Dashboard**: Visual dashboard showing tracked events
- **Console Logging**: All events logged to browser console
- **Real-time Monitoring**: Live view of analytics and errors

### Production Configuration Checklist
- [ ] Set `VITE_ENABLE_ANALYTICS="true"`
- [ ] Set `VITE_ENABLE_ERROR_REPORTING="true"`
- [ ] Set `VITE_ENABLE_PERFORMANCE_MONITORING="true"`
- [ ] Configure analytics provider credentials (via Supabase secrets)
- [ ] Configure error reporting provider credentials (via Supabase secrets)
- [ ] Test analytics and error reporting in staging environment
- [ ] Verify GDPR/privacy compliance for analytics tracking
