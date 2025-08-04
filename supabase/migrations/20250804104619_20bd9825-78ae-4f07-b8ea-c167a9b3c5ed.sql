
-- Create subscribers table for subscription management
CREATE TABLE public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  subscribed BOOLEAN NOT NULL DEFAULT false,
  subscription_tier TEXT,
  subscription_end TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Create policies for subscribers table
CREATE POLICY "select_own_subscription" ON public.subscribers
FOR SELECT
USING (user_id = auth.uid() OR email = auth.email());

CREATE POLICY "update_own_subscription" ON public.subscribers
FOR UPDATE
USING (user_id = auth.uid() OR email = auth.email());

CREATE POLICY "insert_subscription" ON public.subscribers
FOR INSERT
WITH CHECK (true);

-- Create plans table for subscription tiers
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  price_monthly INTEGER NOT NULL, -- in cents
  price_yearly INTEGER NOT NULL, -- in cents
  features JSONB NOT NULL DEFAULT '[]',
  max_users INTEGER,
  max_transactions INTEGER,
  max_cases INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default subscription plans
INSERT INTO public.subscription_plans (plan_id, name, description, price_monthly, price_yearly, features, max_users, max_transactions, max_cases) VALUES
('starter', 'Starter', 'Perfect for small compliance teams', 9900, 99000, '["Basic KYC verification", "Transaction monitoring", "Document management", "Email support"]', 5, 1000, 50),
('professional', 'Professional', 'For growing compliance operations', 29900, 299000, '["Advanced KYC verification", "Real-time transaction monitoring", "Advanced document OCR", "Case management", "Priority support", "Custom reports"]', 25, 10000, 500),
('enterprise', 'Enterprise', 'For large organizations with complex needs', 99900, 999000, '["Full compliance suite", "AI-powered risk assessment", "Advanced analytics", "Custom integrations", "Dedicated support", "SLA guarantee", "White-label options"]', -1, -1, -1);

-- Enable RLS on plans table
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view active plans
CREATE POLICY "view_active_plans" ON public.subscription_plans
FOR SELECT
USING (is_active = true);

-- Create usage tracking table
CREATE TABLE public.usage_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 1,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, metric_type, date)
);

-- Enable RLS on usage metrics
ALTER TABLE public.usage_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "view_own_usage" ON public.usage_metrics
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "insert_own_usage" ON public.usage_metrics
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "update_own_usage" ON public.usage_metrics
FOR UPDATE
USING (user_id = auth.uid());

-- Function to track usage
CREATE OR REPLACE FUNCTION public.track_usage(metric_type TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.usage_metrics (user_id, metric_type)
  VALUES (auth.uid(), metric_type)
  ON CONFLICT (user_id, metric_type, date)
  DO UPDATE SET count = usage_metrics.count + 1;
END;
$$;
