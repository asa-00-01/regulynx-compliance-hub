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

# Analytics & Monitoring (Production)
VITE_ANALYTICS_PROVIDER="google" # or "mixpanel", "amplitude"
VITE_ERROR_REPORTING_PROVIDER="sentry" # or "bugsnag", "rollbar"
VITE_PERFORMANCE_MONITORING_PROVIDER="newrelic" # or "datadog"
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

This project includes a `Dockerfile` and `nginx.conf` for creating a production-ready Docker image.

#### Building the Image

To build the Docker image, use the `docker build` command. You can pass environment variables required by the application at build time using `--build-arg`.

**Example Build Command:**
```bash
docker build -t your-app-name . \
  --build-arg VITE_APP_NAME="Compliance Management System" \
  --build-arg VITE_APP_DOMAIN="app.example.com" \
  --build-arg VITE_SUPPORT_EMAIL="support@example.com" \
  --build-arg VITE_SUPABASE_URL="https://your-supabase-url.supabase.co" \
  --build-arg VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"
```

Refer to the `Dockerfile` and `src/config/environment.ts` for all available build arguments.

#### Running the Container

Once the image is built, you can run it as a container:

```bash
docker run -p 8080:80 your-app-name
```

The application will be accessible at `http://localhost:8080`.

The `Dockerfile` uses a multi-stage build process to create a small and secure Nginx image for serving the built React application.

## CI/CD with GitHub Actions

This section explains how to set up a Continuous Integration and Continuous Deployment (CI/CD) pipeline using GitHub Actions. This allows you to automate testing and deployment whenever you push changes to your repository.

To use this, your project must be connected to a GitHub repository. You can do this from the Lovable editor by clicking the GitHub icon in the top right.

### 1. Create the Workflow File

In your GitHub repository, create a new file at the following path: `.github/workflows/ci.yml`.

### 2. Add Workflow Content

Paste the following content into the `ci.yml` file. This workflow will test your application and then build and publish a Docker image to the GitHub Container Registry.

```yaml
name: Regulynx CI/CD

on:
  push:
    branches: [ "main" ]
  pull_request:
    branches: [ "main" ]

jobs:
  build_and_test:
    name: Build and Test
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Run tests
        run: bun test

      - name: Build application
        run: bun run build

  build_and_push_docker:
    name: Build and Push Docker Image
    needs: build_and_test
    # Only run on push to the main branch
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: 'Get repo owner and name'
        uses: ASzc/slug-action@v2.2.0
        id: slug

      - name: Log in to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./Dockerfile
          push: true
          tags: ghcr.io/${{ steps.slug.outputs.owner_slug }}/${{ steps.slug.outputs.repo_slug }}:latest
          build-args: |
            VITE_APP_NAME=${{ vars.VITE_APP_NAME || 'Regulynx' }}
            VITE_APP_DOMAIN=${{ vars.VITE_APP_DOMAIN || 'app.example.com' }}
            VITE_SUPPORT_EMAIL=${{ vars.VITE_SUPPORT_EMAIL || 'support@example.com' }}
            VITE_SUPABASE_URL=${{ vars.VITE_SUPABASE_URL }}
            VITE_SUPABASE_ANON_KEY=${{ secrets.VITE_SUPABASE_ANON_KEY }}
            VITE_ENVIRONMENT=production
```

### 3. Configure Repository Secrets and Variables

This workflow requires you to configure secrets and variables in your GitHub repository settings. Go to `Settings > Secrets and variables > Actions`.

**Secrets (for sensitive data):**
-   `VITE_SUPABASE_ANON_KEY`: Your Supabase public anon key.

**Variables (for non-sensitive data):**
-   `VITE_SUPABASE_URL`: Your Supabase project URL.
-   `VITE_APP_NAME`: The name of your application.
-   `VITE_APP_DOMAIN`: The domain where your app is hosted.
-   `VITE_SUPPORT_EMAIL`: Your support email address.

### How it Works

-   **`on`**: This workflow triggers on any push or pull request to the `main` branch.
-   **`build_and_test` job**: This job checks out your code, installs dependencies, runs your Vitest tests, and builds the React application. This ensures your code is always in a working state.
-   **`build_and_push_docker` job**: This job only runs after `build_and_test` succeeds on a push to `main`. It builds a Docker image using your `Dockerfile` and pushes it to the GitHub Container Registry (GHCR). From there, you can deploy it to any hosting service that supports Docker containers.

The `GITHUB_TOKEN` is automatically provided by GitHub Actions and has the necessary permissions to push to your repository's container registry.

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
