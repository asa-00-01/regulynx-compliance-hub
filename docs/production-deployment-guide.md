# Production Deployment Guide

This guide provides step-by-step instructions for deploying the Compliance Management System to production.

## 🚀 Pre-Deployment Checklist

Before deploying to production, ensure you have completed all items in the [Production Readiness Checklist](./production-readiness-checklist.md).

### Quick Pre-Deployment Check

```bash
# Run comprehensive production readiness check
npm run check:production

# Run security audit
npm run audit:security

# Run performance tests
npm run test:performance

# Run health check
npm run health:check
```

## 📋 Deployment Options

### Option 1: Lovable Deployment (Recommended)

Lovable provides the easiest deployment experience with automatic optimization.

#### Step 1: Prepare for Deployment

```bash
# Build for production
npm run build:prod

# Verify build
npm run preview
```

#### Step 2: Deploy via Lovable

1. **Click Publish**: Use the Publish button in the Lovable editor
2. **Configure Domain**: Set up custom domain in Project > Settings > Domains
3. **Environment Variables**: Configure production environment variables in the deployment interface
4. **Go Live**: Automatic deployment with CDN optimization

#### Step 3: Configure Environment Variables

In the Lovable deployment interface, set these critical environment variables:

```env
# Production Configuration
VITE_ENVIRONMENT=production
VITE_APP_NAME="Regulynx Compliance Hub"
VITE_APP_DOMAIN=your-domain.com
VITE_SUPPORT_EMAIL=support@your-domain.com
VITE_COMPANY_NAME="Your Company Name"

# Security Configuration
VITE_DEBUG_MODE=false
VITE_USE_MOCK_DATA=false
VITE_ENABLE_CSP=true
VITE_ENABLE_HSTS=true
VITE_ENABLE_XSS_PROTECTION=true
VITE_ENABLE_FRAME_OPTIONS=true

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Monitoring Configuration
VITE_LOG_LEVEL=error
VITE_ENABLE_ERROR_REPORTING=true
VITE_ENABLE_PERFORMANCE_MONITORING=true
VITE_ENABLE_ANALYTICS=true
```

### Option 2: Vercel Deployment

#### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

#### Step 2: Deploy to Vercel

```bash
# Login to Vercel
vercel login

# Deploy
vercel --prod

# Follow the prompts to configure your project
```

#### Step 3: Configure Environment Variables

In the Vercel dashboard:

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add all production environment variables listed above

#### Step 4: Configure Custom Domain

1. Go to "Domains" in your project settings
2. Add your custom domain
3. Configure DNS records as instructed

### Option 3: Netlify Deployment

#### Step 1: Deploy to Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod --dir=dist
```

#### Step 2: Configure Environment Variables

In the Netlify dashboard:

1. Go to Site settings > Environment variables
2. Add all production environment variables

### Option 4: Docker Deployment

#### Step 1: Build Docker Image

```bash
# Build production image
docker build -t regulynx-compliance-hub . \
  --build-arg VITE_ENVIRONMENT=production \
  --build-arg VITE_APP_NAME="Regulynx Compliance Hub" \
  --build-arg VITE_APP_DOMAIN=your-domain.com \
  --build-arg VITE_SUPPORT_EMAIL=support@your-domain.com \
  --build-arg VITE_SUPABASE_URL=https://your-project-ref.supabase.co \
  --build-arg VITE_SUPABASE_ANON_KEY=your-supabase-anon-key \
  --build-arg VITE_DEBUG_MODE=false \
  --build-arg VITE_USE_MOCK_DATA=false \
  --build-arg VITE_ENABLE_ERROR_REPORTING=true
```

#### Step 2: Run Container

```bash
# Run the container
docker run -p 8080:80 regulynx-compliance-hub

# Access at http://localhost:8080
```

## 🗄️ Database Setup

### Step 1: Production Supabase Setup

1. **Create Production Project**: Create a new Supabase project for production
2. **Configure Environment**: Set up production environment variables
3. **Apply Migrations**: Run all database migrations

```bash
# Link to production project
supabase link --project-ref your-production-project-ref

# Apply migrations
supabase db push

# Verify migration status
supabase migration list
```

### Step 2: Configure RLS Policies

Ensure all Row Level Security policies are properly configured for production:

```sql
-- Example: Ensure proper RLS policies are in place
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE aml_transactions ENABLE ROW LEVEL SECURITY;
-- ... other tables
```

### Step 3: Set Up Backups

Configure automated database backups:

```bash
# Set up backup schedule (if using Supabase)
# This is typically handled automatically by Supabase
```

## 🔒 Security Configuration

### Step 1: SSL Certificate

Ensure HTTPS is enabled:

- **Lovable**: Automatic SSL certificate
- **Vercel**: Automatic SSL certificate
- **Netlify**: Automatic SSL certificate
- **Docker**: Configure reverse proxy with SSL

### Step 2: Security Headers

Verify security headers are properly configured:

```bash
# Test security headers
curl -I https://your-domain.com

# Should include:
# Strict-Transport-Security: max-age=31536000; includeSubDomains
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# X-XSS-Protection: 1; mode=block
# Content-Security-Policy: default-src 'self'
```

### Step 3: Environment Variable Security

- ✅ **DO** use environment variables for all sensitive data
- ❌ **DON'T** commit secrets to version control
- ✅ **DO** rotate secrets regularly
- ✅ **DO** use different secrets for each environment

## 📊 Monitoring Setup

### Step 1: Error Monitoring

Configure error reporting services:

```env
# Sentry (optional)
VITE_SENTRY_DSN=your-sentry-dsn

# LogRocket (optional)
VITE_LOGROCKET_APP_ID=your-logrocket-app-id
```

### Step 2: Performance Monitoring

Set up performance monitoring:

```env
# Google Analytics (optional)
VITE_GA_TRACKING_ID=your-ga-tracking-id

# Custom analytics
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_PERFORMANCE_MONITORING=true
```

### Step 3: Health Checks

Configure health check endpoints:

```bash
# Test application health
curl https://your-domain.com/health

# Should return 200 OK with health status
```

## 🔄 Post-Deployment Verification

### Step 1: Functionality Testing

Test all critical features:

```bash
# Run automated tests
npm run test:run

# Test production build locally
npm run preview
```

### Step 2: Performance Verification

```bash
# Run performance tests
npm run test:performance

# Check Core Web Vitals
# Use Lighthouse or PageSpeed Insights
```

### Step 3: Security Verification

```bash
# Run security audit
npm run audit:security

# Test for common vulnerabilities
# Use tools like OWASP ZAP or Burp Suite
```

### Step 4: User Acceptance Testing

1. **Test User Registration/Login**
2. **Test Core Compliance Features**
3. **Test Data Import/Export**
4. **Test Document Upload**
5. **Test KYC Verification Flow**
6. **Test Transaction Monitoring**
7. **Test Escalation Management**

## 🚨 Troubleshooting

### Common Issues

#### Issue: Build Fails
```bash
# Check for build errors
npm run build:prod

# Common solutions:
# - Update dependencies: npm update
# - Clear cache: npm run clean
# - Check TypeScript errors: npm run lint
```

#### Issue: Environment Variables Not Working
```bash
# Verify environment variables are set
echo $VITE_ENVIRONMENT

# Check if variables are accessible in the app
# Look for undefined values in browser console
```

#### Issue: Database Connection Fails
```bash
# Check Supabase connection
supabase status

# Verify environment variables
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# Test connection
curl https://your-project-ref.supabase.co/rest/v1/
```

#### Issue: Performance Issues
```bash
# Analyze bundle size
npm run build:analyze

# Check for large dependencies
npm ls --depth=0

# Optimize images and assets
# Consider using a CDN
```

### Emergency Rollback

If you need to rollback quickly:

```bash
# For Vercel/Netlify: Use deployment history
# For Docker: Use previous image tag
# For Lovable: Use version control

# Database rollback (if needed)
supabase db reset --linked
```

## 📈 Production Monitoring

### Daily Monitoring

- [ ] Application health status
- [ ] Error rate monitoring
- [ ] Performance metrics review
- [ ] Security alert review
- [ ] Backup verification

### Weekly Monitoring

- [ ] Performance trend analysis
- [ ] Security vulnerability scan
- [ ] Database performance review
- [ ] User feedback review
- [ ] System capacity planning

### Monthly Monitoring

- [ ] Full security audit
- [ ] Performance optimization review
- [ ] Backup restoration test
- [ ] Disaster recovery drill
- [ ] Compliance review

## 📞 Support Contacts

### Technical Support
- **Primary Contact**: [Your Name] - [Email/Phone]
- **Backup Contact**: [Backup Name] - [Email/Phone]
- **Database Admin**: [DBA Name] - [Email/Phone]

### Emergency Contacts
- **24/7 Support**: [Emergency Contact] - [Phone]
- **Escalation Manager**: [Manager Name] - [Phone]

## 📝 Deployment Log

Keep a record of each deployment:

### Deployment Information
- **Version**: [Version Number]
- **Date**: [Deployment Date]
- **Deployed By**: [Name]
- **Environment**: Production
- **Changes**: [List of changes]

### Post-Deployment Checklist
- [ ] All tests passing
- [ ] Performance metrics acceptable
- [ ] Security scan clean
- [ ] User acceptance testing complete
- [ ] Monitoring alerts configured
- [ ] Documentation updated

---

**Last Updated**: [Date]
**Next Review**: [Date]
**Reviewed By**: [Name]
