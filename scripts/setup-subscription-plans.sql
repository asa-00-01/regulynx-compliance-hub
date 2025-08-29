-- Setup Subscription Plans for Regulynx Compliance Hub
-- This script creates the subscription plans in the database

-- Clear existing plans (optional - uncomment if you want to reset)
-- DELETE FROM subscription_plans WHERE is_active = true;

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
)
ON CONFLICT (plan_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly,
  features = EXCLUDED.features,
  max_users = EXCLUDED.max_users,
  max_transactions = EXCLUDED.max_transactions,
  max_cases = EXCLUDED.max_cases,
  is_active = EXCLUDED.is_active,
  updated_at = now();

-- Verify the plans were created
SELECT 
  plan_id,
  name,
  price_monthly,
  price_yearly,
  is_active,
  created_at
FROM subscription_plans 
WHERE is_active = true 
ORDER BY price_monthly ASC;
