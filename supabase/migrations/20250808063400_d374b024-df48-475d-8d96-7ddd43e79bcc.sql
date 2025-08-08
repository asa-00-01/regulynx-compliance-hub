
-- Add customer_id to profiles table
ALTER TABLE public.profiles 
ADD COLUMN customer_id UUID;

-- Create customers table
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT,
  settings JSONB DEFAULT '{}',
  subscription_tier TEXT DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on customers table
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Create policy for customers table (platform admins can access all customers)
CREATE POLICY "Platform admins can access customers" 
  ON public.customers 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.platform_roles 
      WHERE user_id = auth.uid() AND role = 'platform_admin'
    )
  );

-- Update case status enum to match application types
ALTER TYPE public.case_status RENAME TO case_status_old;
CREATE TYPE public.case_status AS ENUM ('open', 'under_review', 'escalated', 'pending_info', 'closed');
ALTER TABLE public.compliance_cases ALTER COLUMN status TYPE case_status USING status::text::case_status;
DROP TYPE case_status_old;

-- Update case type enum to match application types
ALTER TYPE public.case_type RENAME TO case_type_old;
CREATE TYPE public.case_type AS ENUM ('kyc', 'aml', 'sanctions');
ALTER TABLE public.compliance_cases ALTER COLUMN type TYPE case_type USING 
  CASE 
    WHEN type::text IN ('transaction', 'document', 'pep') THEN 'aml'::case_type
    ELSE type::text::case_type
  END;
DROP TYPE case_type_old;

-- Update case source enum to match application types
ALTER TYPE public.case_source RENAME TO case_source_old;
CREATE TYPE public.case_source AS ENUM ('manual', 'transaction_alert', 'kyc_flag', 'sanctions_hit', 'system', 'risk_assessment');
ALTER TABLE public.compliance_cases ALTER COLUMN source TYPE case_source USING 
  CASE 
    WHEN source::text = 'api' THEN 'system'::case_source
    WHEN source::text = 'webhook' THEN 'system'::case_source
    ELSE source::text::case_source
  END;
DROP TYPE case_source_old;

-- Update user roles enum in user_roles table to match CustomerRole type
ALTER TYPE public.user_role RENAME TO user_role_old;
CREATE TYPE public.user_role AS ENUM ('customer_admin', 'customer_compliance', 'customer_executive', 'customer_support');
ALTER TABLE public.user_roles ALTER COLUMN role TYPE user_role USING 
  CASE 
    WHEN role::text = 'admin' THEN 'customer_admin'::user_role
    WHEN role::text = 'compliance_officer' THEN 'customer_compliance'::user_role
    WHEN role::text = 'analyst' THEN 'customer_compliance'::user_role
    WHEN role::text = 'support' THEN 'customer_support'::user_role
    WHEN role::text = 'viewer' THEN 'customer_support'::user_role
    ELSE 'customer_support'::user_role
  END;
DROP TYPE user_role_old;
