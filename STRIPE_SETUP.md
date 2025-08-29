# 🏦 Stripe Setup Guide for Production Subscriptions

## Overview
This guide will help you set up Stripe for production subscription management in the Regulynx Compliance Hub.

## 🔧 Prerequisites
1. Stripe account (https://stripe.com)
2. Supabase project with Edge Functions enabled
3. Access to Supabase dashboard

## 📋 Step-by-Step Setup

### 1. Create Stripe Account & Get API Keys

1. **Sign up for Stripe** at https://stripe.com
2. **Navigate to Developers > API keys** in your Stripe dashboard
3. **Copy your API keys**:
   - **Publishable key** (starts with `pk_`)
   - **Secret key** (starts with `sk_`)

### 2. Configure Stripe Products & Prices

1. **Go to Products** in your Stripe dashboard
2. **Create three products**:

#### Starter Plan
- **Name**: "Starter Plan"
- **Description**: "Essential compliance tools for small teams"
- **Pricing**:
  - Monthly: $29.99/month
  - Yearly: $299.99/year

#### Professional Plan
- **Name**: "Professional Plan"
- **Description**: "Full compliance suite for growing organizations"
- **Pricing**:
  - Monthly: $99.99/month
  - Yearly: $999.99/year

#### Enterprise Plan
- **Name**: "Enterprise Plan"
- **Description**: "Enterprise-grade compliance platform"
- **Pricing**:
  - Monthly: $299.99/month
  - Yearly: $2,999.99/year

### 3. Set Up Supabase Environment Variables

1. **Go to your Supabase dashboard**
2. **Navigate to Settings > API**
3. **Add the following environment variables**:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# Webhook Configuration (optional for production)
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### 4. Configure Stripe Webhooks (Production)

1. **Go to Developers > Webhooks** in Stripe dashboard
2. **Add endpoint**: `https://your-project.supabase.co/functions/v1/stripe-webhook`
3. **Select events**:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

### 5. Update Database with Subscription Plans

Run the following SQL in your Supabase SQL editor:

```sql
-- Insert subscription plans
INSERT INTO subscription_plans (
  id,
  plan_id,
  name,
  description,
  price_monthly,
  price_yearly,
  features,
  max_users,
  max_transactions,
  max_cases,
  is_active,
  created_at,
  updated_at
) VALUES 
(
  gen_random_uuid(),
  'starter',
  'Starter Plan',
  'Essential compliance tools for small teams',
  2999, -- $29.99 in cents
  29999, -- $299.99 in cents
  '["basic_aml_monitoring", "kyc_verification", "basic_reporting"]',
  10,
  1000,
  100,
  true,
  now(),
  now()
),
(
  gen_random_uuid(),
  'pro',
  'Professional Plan',
  'Full compliance suite for growing organizations',
  9999, -- $99.99 in cents
  99999, -- $999.99 in cents
  '["aml_monitoring", "kyc_verification", "sanctions_screening", "case_management", "advanced_analytics"]',
  50,
  10000,
  1000,
  true,
  now(),
  now()
),
(
  gen_random_uuid(),
  'enterprise',
  'Enterprise Plan',
  'Enterprise-grade compliance platform',
  29999, -- $299.99 in cents
  299999, -- $2,999.99 in cents
  '["aml_monitoring", "kyc_verification", "sanctions_screening", "case_management", "advanced_analytics", "custom_integrations", "dedicated_support"]',
  -1, -- Unlimited
  -1, -- Unlimited
  -1, -- Unlimited
  true,
  now(),
  now()
);
```

### 6. Deploy Edge Functions

1. **Make sure you're in your project directory**
2. **Deploy the functions**:

```bash
npx supabase functions deploy check-subscription
npx supabase functions deploy create-checkout
npx supabase functions deploy customer-portal
```

### 7. Test the Integration

1. **Start your development server**:
```bash
npm run dev
```

2. **Test subscription flow**:
   - Go to `/pricing` page
   - Click "Subscribe" on any plan
   - Complete Stripe checkout
   - Verify subscription status updates

## 🔍 Troubleshooting

### Common Issues

#### 1. "STRIPE_SECRET_KEY is not set"
- **Solution**: Add the environment variable in Supabase dashboard
- **Location**: Settings > API > Environment Variables

#### 2. Edge Functions not working
- **Solution**: Deploy functions using `npx supabase functions deploy`
- **Check**: Verify functions are listed in Supabase dashboard

#### 3. Subscription not updating
- **Solution**: Check webhook configuration
- **Alternative**: Use manual subscription check via Edge Function

#### 4. CORS errors
- **Solution**: Verify CORS headers in Edge Functions
- **Check**: Ensure proper origin configuration

### Testing in Development

For development testing, you can use Stripe's test mode:

1. **Use test API keys** (start with `sk_test_` and `pk_test_`)
2. **Use test card numbers**:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - 3D Secure: `4000 0025 0000 3155`

## 🚀 Production Checklist

Before going live:

- [ ] Switch to live Stripe keys
- [ ] Configure production webhooks
- [ ] Test subscription flows
- [ ] Verify webhook security
- [ ] Set up monitoring and alerts
- [ ] Configure proper error handling
- [ ] Test customer portal access
- [ ] Verify subscription tier logic

## 📞 Support

If you encounter issues:

1. **Check Stripe logs** in your Stripe dashboard
2. **Check Supabase logs** in your project dashboard
3. **Review Edge Function logs** for specific errors
4. **Contact support** with specific error messages

## 🔐 Security Notes

- **Never commit API keys** to version control
- **Use environment variables** for all sensitive data
- **Enable webhook signature verification** in production
- **Monitor for suspicious activity** in Stripe dashboard
- **Regularly rotate API keys** for security
