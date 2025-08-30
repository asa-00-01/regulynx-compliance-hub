#!/usr/bin/env node

import { writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envTemplate = `# Local environment file for development
# Copy this to .env.local and update with your actual values

# Supabase Configuration
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0

# Environment
VITE_ENVIRONMENT=production
VITE_DEBUG_MODE=false
VITE_USE_MOCK_DATA=false
VITE_LOG_LEVEL=error

# Security Headers
VITE_ENABLE_CSP=true
VITE_ENABLE_HSTS=true
VITE_ENABLE_XSS_PROTECTION=true
VITE_ENABLE_ERROR_REPORTING=true

# Application Configuration
VITE_APP_DOMAIN=https://regulynx.com
VITE_SUPPORT_EMAIL=support@regulynx.com

# Database Configuration
VITE_DB_HOST=localhost
VITE_DB_PORT=5432
VITE_DB_NAME=postgres
VITE_DB_SSL_MODE=disable
VITE_DB_POOL_SIZE=10
VITE_DB_TIMEOUT=30000

# Security Configuration
VITE_JWT_SECRET=your_jwt_secret_here
VITE_ENCRYPTION_KEY=your_encryption_key_here
VITE_API_RATE_LIMIT=1000
VITE_SESSION_TIMEOUT=3600
VITE_PASSWORD_POLICY=strong
VITE_2FA_ENABLED=false

# Notification Configuration
VITE_EMAIL_ENABLED=false
VITE_SLACK_WEBHOOK=
VITE_SMS_ENABLED=false
VITE_ALERT_THRESHOLD=5
VITE_NOTIFICATION_FREQUENCY=immediate

# API Configuration
VITE_API_BASE_URL=https://api.regulynx.com
VITE_API_VERSION=v1
VITE_API_TIMEOUT=30000
VITE_API_RETRY_ATTEMPTS=3
VITE_API_CACHE_ENABLED=true

# Stripe Configuration (for local testing)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_placeholder
STRIPE_SECRET_KEY=sk_test_placeholder
STRIPE_WEBHOOK_SECRET=whsec_placeholder

# Error Reporting (disabled for local development)
VITE_SENTRY_DSN=
VITE_LOGROCKET_APP_ID=
`;

const envPath = join(__dirname, '..', '.env.local');

if (!existsSync(envPath)) {
  try {
    writeFileSync(envPath, envTemplate);
    console.log('✅ Created .env.local template file');
    console.log('📝 Please update the values in .env.local with your actual configuration');
  } catch (error) {
    console.error('❌ Failed to create .env.local file:', error.message);
  }
} else {
  console.log('⚠️  .env.local already exists, skipping creation');
}
