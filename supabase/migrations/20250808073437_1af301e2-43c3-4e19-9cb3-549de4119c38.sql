
-- WARNING: This will drop ALL tables and data. Make sure you have backups if needed!

-- Drop all tables in the correct order (respecting foreign key dependencies)
DROP TABLE IF EXISTS public.pattern_matches CASCADE;
DROP TABLE IF EXISTS public.case_actions CASCADE;
DROP TABLE IF EXISTS public.compliance_cases CASCADE;
DROP TABLE IF EXISTS public.documents CASCADE;
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.platform_roles CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;
DROP TABLE IF EXISTS public.patterns CASCADE;
DROP TABLE IF EXISTS public.sars CASCADE;
DROP TABLE IF EXISTS public.rules CASCADE;
DROP TABLE IF EXISTS public.risk_matches CASCADE;
DROP TABLE IF EXISTS public.external_customer_mappings CASCADE;
DROP TABLE IF EXISTS public.external_transaction_mappings CASCADE;
DROP TABLE IF EXISTS public.integration_configs CASCADE;
DROP TABLE IF EXISTS public.integration_api_keys CASCADE;
DROP TABLE IF EXISTS public.webhook_notifications CASCADE;
DROP TABLE IF EXISTS public.data_ingestion_logs CASCADE;
DROP TABLE IF EXISTS public.subscription_plans CASCADE;
DROP TABLE IF EXISTS public.subscribers CASCADE;
DROP TABLE IF EXISTS public.usage_metrics CASCADE;

-- Drop all custom types/enums
DROP TYPE IF EXISTS public.platform_role CASCADE;
DROP TYPE IF EXISTS public.customer_role CASCADE;
DROP TYPE IF EXISTS public.user_role CASCADE;
DROP TYPE IF EXISTS public.user_status CASCADE;
DROP TYPE IF EXISTS public.case_type CASCADE;
DROP TYPE IF EXISTS public.case_status CASCADE;
DROP TYPE IF EXISTS public.document_type CASCADE;
DROP TYPE IF EXISTS public.case_source CASCADE;
DROP TYPE IF EXISTS public.action_type CASCADE;
DROP TYPE IF EXISTS public.pattern_category CASCADE;
DROP TYPE IF EXISTS public.sar_status CASCADE;

-- Drop all functions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.assign_default_customer_role() CASCADE;
DROP FUNCTION IF EXISTS public.get_user_role(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_user_platform_roles(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_user_customer_roles(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.has_platform_role(uuid, platform_role) CASCADE;
DROP FUNCTION IF EXISTS public.has_customer_role(uuid, customer_role) CASCADE;
DROP FUNCTION IF EXISTS public.is_platform_owner(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.track_usage(text) CASCADE;
DROP FUNCTION IF EXISTS public.update_timestamp() CASCADE;
DROP FUNCTION IF EXISTS public.update_rules_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.update_customers_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.update_integration_timestamp() CASCADE;

-- Now recreate everything from scratch

-- Create custom types/enums
CREATE TYPE public.platform_role AS ENUM ('platform_admin', 'platform_support');
CREATE TYPE public.customer_role AS ENUM ('customer_admin', 'customer_compliance', 'customer_executive', 'customer_support');
CREATE TYPE public.user_role AS ENUM ('admin', 'complianceOfficer', 'executive', 'support');
CREATE TYPE public.user_status AS ENUM ('active', 'pending', 'suspended', 'banned');
CREATE TYPE public.case_type AS ENUM ('kyc', 'aml', 'sanctions', 'fraud', 'other');
CREATE TYPE public.case_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
CREATE TYPE public.document_type AS ENUM ('passport', 'drivers_license', 'utility_bill', 'bank_statement', 'other');
CREATE TYPE public.case_source AS ENUM ('manual', 'system', 'external');
CREATE TYPE public.action_type AS ENUM ('created', 'updated', 'assigned', 'resolved', 'closed', 'commented');
CREATE TYPE public.pattern_category AS ENUM ('structuring', 'round_amounts', 'velocity', 'geographic', 'time_based');
CREATE TYPE public.sar_status AS ENUM ('draft', 'submitted', 'filed', 'rejected');

-- Create customers table
CREATE TABLE public.customers (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    domain text,
    subscription_tier text NOT NULL DEFAULT 'basic',
    settings jsonb NOT NULL DEFAULT '{}',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create profiles table
CREATE TABLE public.profiles (
    id uuid NOT NULL PRIMARY KEY,
    name text NOT NULL,
    email text NOT NULL,
    avatar_url text,
    customer_id uuid REFERENCES public.customers(id),
    role public.user_role NOT NULL DEFAULT 'admin',
    risk_score integer NOT NULL DEFAULT 0,
    status public.user_status NOT NULL DEFAULT 'pending',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create platform_roles table
CREATE TABLE public.platform_roles (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL,
    role public.platform_role NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE(user_id, role)
);

-- Create user_roles table
CREATE TABLE public.user_roles (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL,
    customer_id uuid REFERENCES public.customers(id),
    role public.customer_role NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE(user_id, role)
);

-- Create compliance_cases table
CREATE TABLE public.compliance_cases (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid,
    user_name text,
    type public.case_type NOT NULL,
    status public.case_status NOT NULL DEFAULT 'open',
    priority text NOT NULL,
    source public.case_source,
    risk_score integer NOT NULL,
    assigned_to uuid,
    assigned_to_name text,
    created_by uuid,
    description text NOT NULL,
    related_alerts text[],
    related_transactions text[],
    documents text[],
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    resolved_at timestamp with time zone
);

-- Create case_actions table
CREATE TABLE public.case_actions (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    case_id uuid NOT NULL,
    action_type public.action_type NOT NULL,
    action_by uuid,
    action_by_name text,
    description text NOT NULL,
    details jsonb,
    action_date timestamp with time zone NOT NULL DEFAULT now()
);

-- Create documents table
CREATE TABLE public.documents (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL,
    type text NOT NULL,
    file_name text NOT NULL,
    file_path text NOT NULL,
    status text NOT NULL,
    upload_date timestamp with time zone NOT NULL DEFAULT now(),
    verified_by uuid,
    verification_date timestamp with time zone,
    extracted_data jsonb,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create audit_logs table
CREATE TABLE public.audit_logs (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    entity text NOT NULL,
    action text NOT NULL,
    entity_id uuid,
    user_id uuid,
    details jsonb,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create rules table
CREATE TABLE public.rules (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    rule_id text NOT NULL,
    rule_name text NOT NULL,
    description text,
    category text NOT NULL,
    condition jsonb NOT NULL,
    risk_score integer NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create patterns table
CREATE TABLE public.patterns (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    description text NOT NULL,
    category public.pattern_category NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create pattern_matches table
CREATE TABLE public.pattern_matches (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    pattern_id uuid NOT NULL REFERENCES public.patterns(id),
    user_id uuid NOT NULL,
    user_name text NOT NULL,
    transaction_id text NOT NULL,
    amount numeric NOT NULL,
    currency text NOT NULL,
    country text NOT NULL,
    timestamp timestamp with time zone NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create sars table
CREATE TABLE public.sars (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL,
    user_name text NOT NULL,
    summary text NOT NULL,
    date_of_activity timestamp with time zone NOT NULL,
    date_submitted timestamp with time zone NOT NULL,
    status public.sar_status NOT NULL,
    transactions text[] NOT NULL,
    documents text[],
    notes text[],
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create risk_matches table
CREATE TABLE public.risk_matches (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    entity_id text NOT NULL,
    entity_type text NOT NULL,
    rule_id text NOT NULL,
    match_data jsonb,
    matched_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);

-- Create subscribers table
CREATE TABLE public.subscribers (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid,
    email text NOT NULL,
    subscribed boolean NOT NULL DEFAULT false,
    subscription_tier text,
    subscription_end timestamp with time zone,
    trial_end timestamp with time zone,
    stripe_customer_id text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create subscription_plans table
CREATE TABLE public.subscription_plans (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    plan_id text NOT NULL,
    name text NOT NULL,
    description text,
    price_monthly integer NOT NULL,
    price_yearly integer NOT NULL,
    features jsonb NOT NULL DEFAULT '[]',
    max_users integer,
    max_transactions integer,
    max_cases integer,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create usage_metrics table
CREATE TABLE public.usage_metrics (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid,
    metric_type text NOT NULL,
    count integer NOT NULL DEFAULT 1,
    date date NOT NULL DEFAULT CURRENT_DATE,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE(user_id, metric_type, date)
);

-- Create integration tables
CREATE TABLE public.integration_configs (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id text NOT NULL,
    client_name text NOT NULL,
    integration_type text NOT NULL,
    api_key_hash text,
    webhook_url text,
    batch_frequency text,
    status text NOT NULL DEFAULT 'active',
    data_mapping jsonb NOT NULL DEFAULT '{}',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.integration_api_keys (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id text NOT NULL,
    key_name text NOT NULL,
    key_hash text NOT NULL,
    permissions jsonb NOT NULL DEFAULT '[]',
    expires_at timestamp with time zone,
    last_used_at timestamp with time zone,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.external_customer_mappings (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id text NOT NULL,
    external_customer_id text NOT NULL,
    internal_user_id uuid NOT NULL,
    customer_data jsonb NOT NULL,
    sync_status text NOT NULL DEFAULT 'synced',
    last_synced_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.external_transaction_mappings (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    external_transaction_id text NOT NULL,
    external_customer_id text NOT NULL,
    client_id text NOT NULL,
    transaction_data jsonb NOT NULL,
    compliance_status text DEFAULT 'pending',
    risk_assessment jsonb,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.webhook_notifications (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id text NOT NULL,
    event_type text NOT NULL,
    webhook_url text NOT NULL,
    payload jsonb NOT NULL,
    status text NOT NULL DEFAULT 'pending',
    retry_count integer NOT NULL DEFAULT 0,
    last_attempt_at timestamp with time zone,
    delivered_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.data_ingestion_logs (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id text NOT NULL,
    ingestion_type text NOT NULL,
    record_count integer NOT NULL DEFAULT 0,
    success_count integer NOT NULL DEFAULT 0,
    error_count integer NOT NULL DEFAULT 0,
    status text NOT NULL,
    error_details jsonb,
    processing_time_ms integer,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pattern_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_customer_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_transaction_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_ingestion_logs ENABLE ROW LEVEL SECURITY;

-- Create helper functions
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT role::text FROM public.profiles WHERE id = user_id;
$$;

CREATE OR REPLACE FUNCTION public.has_platform_role(_user_id uuid, _role platform_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.platform_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.has_customer_role(_user_id uuid, _role customer_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_platform_owner(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.platform_roles
    WHERE user_id = _user_id
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_platform_roles(_user_id uuid)
RETURNS platform_role[]
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT ARRAY_AGG(role)
  FROM public.platform_roles
  WHERE user_id = _user_id
$$;

CREATE OR REPLACE FUNCTION public.get_user_customer_roles(_user_id uuid)
RETURNS customer_role[]
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT ARRAY_AGG(role)
  FROM public.user_roles
  WHERE user_id = _user_id
$$;

CREATE OR REPLACE FUNCTION public.track_usage(metric_type text)
RETURNS void
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

-- Update timestamp functions
CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_customers_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_rules_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_integration_timestamp()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- User management functions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    CASE
      WHEN NEW.raw_user_meta_data->>'role' = 'complianceOfficer' THEN 'complianceOfficer'::user_role
      WHEN NEW.raw_user_meta_data->>'role' = 'admin' THEN 'admin'::user_role
      WHEN NEW.raw_user_meta_data->>'role' = 'executive' THEN 'executive'::user_role
      WHEN NEW.raw_user_meta_data->>'role' = 'support' THEN 'support'::user_role
      ELSE 'support'::user_role
    END
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.assign_default_customer_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only assign default role if no platform role exists
  IF NOT EXISTS (SELECT 1 FROM public.platform_roles WHERE user_id = NEW.id) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'customer_support')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- Create triggers
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

CREATE TRIGGER update_customers_updated_at_trigger
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE PROCEDURE public.update_customers_updated_at();

CREATE TRIGGER update_rules_updated_at_trigger
  BEFORE UPDATE ON public.rules
  FOR EACH ROW EXECUTE PROCEDURE public.update_rules_updated_at();

CREATE TRIGGER update_integration_configs_timestamp
  BEFORE UPDATE ON public.integration_configs
  FOR EACH ROW EXECUTE PROCEDURE public.update_integration_timestamp();

-- Create RLS Policies

-- Customers policies
CREATE POLICY "Platform admins can manage customers" ON public.customers
  FOR ALL USING (has_platform_role(auth.uid(), 'platform_admin'));

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Profiles are viewable by authenticated users" ON public.profiles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (get_user_role(auth.uid()) IN ('admin', 'complianceOfficer'));

-- Platform roles policies
CREATE POLICY "Platform admins can manage platform roles" ON public.platform_roles
  FOR ALL USING (has_platform_role(auth.uid(), 'platform_admin'));

CREATE POLICY "Users can view their own platform roles" ON public.platform_roles
  FOR SELECT USING (user_id = auth.uid());

-- User roles policies
CREATE POLICY "Platform admins can manage customer roles" ON public.user_roles
  FOR ALL USING (has_platform_role(auth.uid(), 'platform_admin'));

CREATE POLICY "Users can view their own customer roles" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid());

-- Compliance cases policies
CREATE POLICY "Allow full access for admins and compliance officers" ON public.compliance_cases
  FOR ALL USING (get_user_role(auth.uid()) IN ('admin', 'complianceOfficer'))
  WITH CHECK (get_user_role(auth.uid()) IN ('admin', 'complianceOfficer'));

CREATE POLICY "Allow read-only access for executives" ON public.compliance_cases
  FOR SELECT USING (get_user_role(auth.uid()) = 'executive');

-- Case actions policies
CREATE POLICY "Allow read access for authorized roles on case actions" ON public.case_actions
  FOR SELECT USING (get_user_role(auth.uid()) IN ('admin', 'complianceOfficer', 'executive'));

CREATE POLICY "Allow insert for admins and compliance officers on case actions" ON public.case_actions
  FOR INSERT WITH CHECK (get_user_role(auth.uid()) IN ('admin', 'complianceOfficer'));

-- Documents policies
CREATE POLICY "Users can view their own documents" ON public.documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents" ON public.documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents" ON public.documents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents" ON public.documents
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Documents are viewable by authenticated users" ON public.documents
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Documents can be inserted by authenticated users" ON public.documents
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Documents can be updated by authenticated users" ON public.documents
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Compliance officers can view all documents" ON public.documents
  FOR SELECT USING (get_user_role(auth.uid()) IN ('complianceOfficer', 'admin'));

CREATE POLICY "Compliance officers can update all documents" ON public.documents
  FOR UPDATE USING (get_user_role(auth.uid()) IN ('complianceOfficer', 'admin'));

CREATE POLICY "Compliance officers can insert documents for any user" ON public.documents
  FOR INSERT WITH CHECK (get_user_role(auth.uid()) IN ('complianceOfficer', 'admin'));

-- Audit logs policies
CREATE POLICY "Audit logs are viewable by authenticated users" ON public.audit_logs
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Audit logs can be inserted by authenticated users" ON public.audit_logs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Rules policies
CREATE POLICY "Rules are viewable by authenticated users" ON public.rules
  FOR SELECT USING (true);

-- Patterns policies
CREATE POLICY "Compliance and admins can manage patterns" ON public.patterns
  FOR ALL USING (get_user_role(auth.uid()) IN ('admin', 'complianceOfficer'))
  WITH CHECK (get_user_role(auth.uid()) IN ('admin', 'complianceOfficer'));

-- Pattern matches policies
CREATE POLICY "Compliance and admins can manage pattern matches" ON public.pattern_matches
  FOR ALL USING (get_user_role(auth.uid()) IN ('admin', 'complianceOfficer'))
  WITH CHECK (get_user_role(auth.uid()) IN ('admin', 'complianceOfficer'));

-- SARs policies
CREATE POLICY "Compliance and admins can manage SARs" ON public.sars
  FOR ALL USING (get_user_role(auth.uid()) IN ('admin', 'complianceOfficer'))
  WITH CHECK (get_user_role(auth.uid()) IN ('admin', 'complianceOfficer'));

-- Risk matches policies
CREATE POLICY "Risk matches are viewable by authenticated users" ON public.risk_matches
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert risk matches" ON public.risk_matches
  FOR INSERT WITH CHECK (true);

-- Subscribers policies
CREATE POLICY "select_own_subscription" ON public.subscribers
  FOR SELECT USING (user_id = auth.uid() OR email = auth.email());

CREATE POLICY "update_own_subscription" ON public.subscribers
  FOR UPDATE USING (user_id = auth.uid() OR email = auth.email());

CREATE POLICY "insert_subscription" ON public.subscribers
  FOR INSERT WITH CHECK (true);

-- Subscription plans policies
CREATE POLICY "view_active_plans" ON public.subscription_plans
  FOR SELECT USING (is_active = true);

-- Usage metrics policies
CREATE POLICY "view_own_usage" ON public.usage_metrics
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "insert_own_usage" ON public.usage_metrics
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "update_own_usage" ON public.usage_metrics
  FOR UPDATE USING (user_id = auth.uid());

-- Integration policies
CREATE POLICY "Integration management for authorized users" ON public.integration_configs
  FOR ALL USING (get_user_role(auth.uid()) IN ('admin', 'complianceOfficer'));

CREATE POLICY "API keys for authorized users" ON public.integration_api_keys
  FOR ALL USING (get_user_role(auth.uid()) IN ('admin', 'complianceOfficer'));

CREATE POLICY "Customer mappings for authorized users" ON public.external_customer_mappings
  FOR ALL USING (get_user_role(auth.uid()) IN ('admin', 'complianceOfficer'));

CREATE POLICY "Transaction mappings for authorized users" ON public.external_transaction_mappings
  FOR ALL USING (get_user_role(auth.uid()) IN ('admin', 'complianceOfficer'));

CREATE POLICY "Webhook notifications for authorized users" ON public.webhook_notifications
  FOR ALL USING (get_user_role(auth.uid()) IN ('admin', 'complianceOfficer'));

CREATE POLICY "Data ingestion logs for authorized users" ON public.data_ingestion_logs
  FOR ALL USING (get_user_role(auth.uid()) IN ('admin', 'complianceOfficer'));
