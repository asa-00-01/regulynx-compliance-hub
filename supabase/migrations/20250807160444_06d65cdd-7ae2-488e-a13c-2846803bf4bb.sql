
-- Drop all existing tables (in correct order due to foreign key constraints)
DROP TABLE IF EXISTS public.webhook_notifications CASCADE;
DROP TABLE IF EXISTS public.usage_metrics CASCADE;
DROP TABLE IF EXISTS public.integration_api_keys CASCADE;
DROP TABLE IF EXISTS public.platform_roles CASCADE;
DROP TABLE IF EXISTS public.compliance_cases CASCADE;
DROP TABLE IF EXISTS public.data_ingestion_logs CASCADE;
DROP TABLE IF EXISTS public.risk_matches CASCADE;
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.documents CASCADE;
DROP TABLE IF EXISTS public.external_customer_mappings CASCADE;
DROP TABLE IF EXISTS public.patterns CASCADE;
DROP TABLE IF EXISTS public.external_transaction_mappings CASCADE;
DROP TABLE IF EXISTS public.rules CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.case_actions CASCADE;
DROP TABLE IF EXISTS public.pattern_matches CASCADE;
DROP TABLE IF EXISTS public.subscription_plans CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.integration_configs CASCADE;
DROP TABLE IF EXISTS public.sars CASCADE;
DROP TABLE IF EXISTS public.subscribers CASCADE;

-- Drop custom types
DROP TYPE IF EXISTS public.user_role CASCADE;
DROP TYPE IF EXISTS public.user_status CASCADE;
DROP TYPE IF EXISTS public.case_type CASCADE;
DROP TYPE IF EXISTS public.case_status CASCADE;
DROP TYPE IF EXISTS public.case_priority CASCADE;
DROP TYPE IF EXISTS public.case_source CASCADE;
DROP TYPE IF EXISTS public.document_type CASCADE;
DROP TYPE IF EXISTS public.action_type CASCADE;
DROP TYPE IF EXISTS public.sar_status CASCADE;
DROP TYPE IF EXISTS public.pattern_category CASCADE;
DROP TYPE IF EXISTS public.platform_role CASCADE;
DROP TYPE IF EXISTS public.customer_role CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS public.update_integration_timestamp() CASCADE;
DROP FUNCTION IF EXISTS public.track_usage(text) CASCADE;
DROP FUNCTION IF EXISTS public.has_customer_role(uuid, customer_role) CASCADE;
DROP FUNCTION IF EXISTS public.has_platform_role(uuid, platform_role) CASCADE;
DROP FUNCTION IF EXISTS public.is_platform_owner(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_user_customer_roles(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_user_platform_roles(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.assign_default_customer_role() CASCADE;
DROP FUNCTION IF EXISTS public.get_user_role(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_rules_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.update_timestamp() CASCADE;

-- Recreate custom types
CREATE TYPE public.user_role AS ENUM ('admin', 'complianceOfficer', 'executive', 'support');
CREATE TYPE public.user_status AS ENUM ('active', 'pending', 'suspended', 'banned');
CREATE TYPE public.case_type AS ENUM ('kyc', 'aml', 'transaction', 'document', 'sanctions', 'pep');
CREATE TYPE public.case_status AS ENUM ('open', 'investigating', 'escalated', 'resolved', 'closed');
CREATE TYPE public.case_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE public.case_source AS ENUM ('system', 'manual', 'api', 'webhook');
CREATE TYPE public.document_type AS ENUM ('passport', 'id', 'license', 'utility_bill', 'bank_statement', 'other');
CREATE TYPE public.action_type AS ENUM ('created', 'updated', 'assigned', 'escalated', 'resolved', 'closed', 'note_added');
CREATE TYPE public.sar_status AS ENUM ('draft', 'submitted', 'filed', 'rejected');
CREATE TYPE public.pattern_category AS ENUM ('structuring', 'velocity', 'geography', 'amount');
CREATE TYPE public.platform_role AS ENUM ('platform_admin', 'platform_support');
CREATE TYPE public.customer_role AS ENUM ('admin', 'compliance_officer', 'analyst', 'viewer', 'support');

-- Recreate tables

-- Profiles table
CREATE TABLE public.profiles (
  id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  avatar_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  role user_role NOT NULL DEFAULT 'admin'::user_role,
  risk_score integer NOT NULL DEFAULT 0,
  status user_status NOT NULL DEFAULT 'pending'::user_status,
  PRIMARY KEY (id)
);

-- User roles table
CREATE TABLE public.user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role customer_role NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  UNIQUE (user_id, role)
);

-- Platform roles table
CREATE TABLE public.platform_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role platform_role NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Documents table
CREATE TABLE public.documents (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
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
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Compliance cases table
CREATE TABLE public.compliance_cases (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  user_name text,
  description text NOT NULL,
  type case_type NOT NULL,
  status case_status NOT NULL DEFAULT 'open'::case_status,
  priority case_priority NOT NULL,
  source case_source,
  risk_score integer NOT NULL,
  assigned_to uuid,
  assigned_to_name text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  resolved_at timestamp with time zone,
  related_alerts text[],
  related_transactions text[],
  documents text[],
  PRIMARY KEY (id)
);

-- Case actions table
CREATE TABLE public.case_actions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL,
  action_type action_type NOT NULL,
  description text NOT NULL,
  action_by uuid,
  action_by_name text,
  action_date timestamp with time zone NOT NULL DEFAULT now(),
  details jsonb,
  PRIMARY KEY (id)
);

-- Audit logs table
CREATE TABLE public.audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  action text NOT NULL,
  entity text NOT NULL,
  entity_id uuid,
  user_id uuid,
  details jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Rules table
CREATE TABLE public.rules (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  rule_id text NOT NULL,
  rule_name text NOT NULL,
  description text,
  category text NOT NULL,
  condition jsonb NOT NULL,
  risk_score integer NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

-- Risk matches table
CREATE TABLE public.risk_matches (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  entity_id text NOT NULL,
  entity_type text NOT NULL,
  rule_id text NOT NULL,
  match_data jsonb,
  matched_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

-- SARs table
CREATE TABLE public.sars (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  user_name text NOT NULL,
  date_submitted timestamp with time zone NOT NULL,
  date_of_activity timestamp with time zone NOT NULL,
  status sar_status NOT NULL,
  summary text NOT NULL,
  transactions text[] NOT NULL,
  documents text[],
  notes text[],
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Patterns table
CREATE TABLE public.patterns (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  category pattern_category NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Pattern matches table
CREATE TABLE public.pattern_matches (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  pattern_id uuid NOT NULL,
  user_id uuid NOT NULL,
  user_name text NOT NULL,
  transaction_id text NOT NULL,
  country text NOT NULL,
  amount numeric NOT NULL,
  currency text NOT NULL,
  timestamp timestamp with time zone NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Integration configs table
CREATE TABLE public.integration_configs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  client_id text NOT NULL,
  client_name text NOT NULL,
  integration_type text NOT NULL,
  api_key_hash text,
  webhook_url text,
  batch_frequency text,
  status text NOT NULL DEFAULT 'active'::text,
  data_mapping jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Integration API keys table
CREATE TABLE public.integration_api_keys (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  client_id text NOT NULL,
  key_name text NOT NULL,
  key_hash text NOT NULL,
  permissions jsonb NOT NULL DEFAULT '[]'::jsonb,
  expires_at timestamp with time zone,
  last_used_at timestamp with time zone,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Data ingestion logs table
CREATE TABLE public.data_ingestion_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  client_id text NOT NULL,
  ingestion_type text NOT NULL,
  status text NOT NULL,
  record_count integer NOT NULL DEFAULT 0,
  success_count integer NOT NULL DEFAULT 0,
  error_count integer NOT NULL DEFAULT 0,
  error_details jsonb,
  processing_time_ms integer,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- External customer mappings table
CREATE TABLE public.external_customer_mappings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  client_id text NOT NULL,
  external_customer_id text NOT NULL,
  internal_user_id uuid NOT NULL,
  customer_data jsonb NOT NULL,
  sync_status text NOT NULL DEFAULT 'synced'::text,
  last_synced_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- External transaction mappings table
CREATE TABLE public.external_transaction_mappings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  external_transaction_id text NOT NULL,
  external_customer_id text NOT NULL,
  client_id text NOT NULL,
  transaction_data jsonb NOT NULL,
  risk_assessment jsonb,
  compliance_status text DEFAULT 'pending'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Webhook notifications table
CREATE TABLE public.webhook_notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  client_id text NOT NULL,
  event_type text NOT NULL,
  webhook_url text NOT NULL,
  payload jsonb NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text,
  retry_count integer NOT NULL DEFAULT 0,
  last_attempt_at timestamp with time zone,
  delivered_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Usage metrics table
CREATE TABLE public.usage_metrics (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  metric_type text NOT NULL,
  count integer NOT NULL DEFAULT 1,
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  UNIQUE (user_id, metric_type, date)
);

-- Subscription plans table
CREATE TABLE public.subscription_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  plan_id text NOT NULL,
  name text NOT NULL,
  description text,
  price_monthly integer NOT NULL,
  price_yearly integer NOT NULL,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  max_users integer,
  max_transactions integer,
  max_cases integer,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Subscribers table
CREATE TABLE public.subscribers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  email text NOT NULL,
  subscribed boolean NOT NULL DEFAULT false,
  subscription_tier text,
  subscription_end timestamp with time zone,
  trial_end timestamp with time zone,
  stripe_customer_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Recreate functions
CREATE OR REPLACE FUNCTION public.update_integration_timestamp()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.track_usage(metric_type text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.usage_metrics (user_id, metric_type)
  VALUES (auth.uid(), metric_type)
  ON CONFLICT (user_id, metric_type, date)
  DO UPDATE SET count = usage_metrics.count + 1;
END;
$function$;

CREATE OR REPLACE FUNCTION public.has_customer_role(_user_id uuid, _role customer_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$function$;

CREATE OR REPLACE FUNCTION public.has_platform_role(_user_id uuid, _role platform_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.platform_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$function$;

CREATE OR REPLACE FUNCTION public.is_platform_owner(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.platform_roles
    WHERE user_id = _user_id
  )
$function$;

CREATE OR REPLACE FUNCTION public.get_user_customer_roles(_user_id uuid)
RETURNS customer_role[]
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  SELECT ARRAY_AGG(role)
  FROM public.user_roles
  WHERE user_id = _user_id
$function$;

CREATE OR REPLACE FUNCTION public.get_user_platform_roles(_user_id uuid)
RETURNS platform_role[]
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  SELECT ARRAY_AGG(role)
  FROM public.platform_roles
  WHERE user_id = _user_id
$function$;

CREATE OR REPLACE FUNCTION public.assign_default_customer_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Only assign default role if no platform role exists
  IF NOT EXISTS (SELECT 1 FROM public.platform_roles WHERE user_id = NEW.id) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'support')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  SELECT role::text FROM public.profiles WHERE id = user_id;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.update_rules_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pattern_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_ingestion_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_customer_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_transaction_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Recreate RLS policies for profiles table
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Profiles are viewable by authenticated users" ON public.profiles
  FOR SELECT USING (auth.role() = 'authenticated'::text);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING ((get_user_role(auth.uid()) = 'admin'::text) OR (get_user_role(auth.uid()) = 'complianceOfficer'::text));

-- Recreate RLS policies for other tables
CREATE POLICY "Users can view their own customer roles" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Platform admins can manage customer roles" ON public.user_roles
  FOR ALL USING (has_platform_role(auth.uid(), 'platform_admin'::platform_role));

CREATE POLICY "Users can view their own platform roles" ON public.platform_roles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Platform admins can manage platform roles" ON public.platform_roles
  FOR ALL USING (has_platform_role(auth.uid(), 'platform_admin'::platform_role));

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
  FOR SELECT USING (auth.role() = 'authenticated'::text);

CREATE POLICY "Documents can be inserted by authenticated users" ON public.documents
  FOR INSERT WITH CHECK (auth.role() = 'authenticated'::text);

CREATE POLICY "Documents can be updated by authenticated users" ON public.documents
  FOR UPDATE USING (auth.role() = 'authenticated'::text);

CREATE POLICY "Compliance officers can view all documents" ON public.documents
  FOR SELECT USING ((get_user_role(auth.uid()) = 'complianceOfficer'::text) OR (get_user_role(auth.uid()) = 'admin'::text));

CREATE POLICY "Compliance officers can insert documents for any user" ON public.documents
  FOR INSERT WITH CHECK ((get_user_role(auth.uid()) = 'complianceOfficer'::text) OR (get_user_role(auth.uid()) = 'admin'::text));

CREATE POLICY "Compliance officers can update all documents" ON public.documents
  FOR UPDATE USING ((get_user_role(auth.uid()) = 'complianceOfficer'::text) OR (get_user_role(auth.uid()) = 'admin'::text));

-- Compliance cases policies
CREATE POLICY "Allow full access for admins and compliance officers" ON public.compliance_cases
  FOR ALL USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::text, 'complianceOfficer'::text]))
  WITH CHECK (get_user_role(auth.uid()) = ANY (ARRAY['admin'::text, 'complianceOfficer'::text]));

CREATE POLICY "Allow read-only access for executives" ON public.compliance_cases
  FOR SELECT USING (get_user_role(auth.uid()) = 'executive'::text);

-- Case actions policies
CREATE POLICY "Allow read access for authorized roles on case actions" ON public.case_actions
  FOR SELECT USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::text, 'complianceOfficer'::text, 'executive'::text]));

CREATE POLICY "Allow insert for admins and compliance officers on case actions" ON public.case_actions
  FOR INSERT WITH CHECK (get_user_role(auth.uid()) = ANY (ARRAY['admin'::text, 'complianceOfficer'::text]));

-- Audit logs policies
CREATE POLICY "Audit logs are viewable by authenticated users" ON public.audit_logs
  FOR SELECT USING (auth.role() = 'authenticated'::text);

CREATE POLICY "Audit logs can be inserted by authenticated users" ON public.audit_logs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated'::text);

-- Rules policies
CREATE POLICY "Rules are viewable by authenticated users" ON public.rules
  FOR SELECT USING (true);

-- Risk matches policies
CREATE POLICY "Risk matches are viewable by authenticated users" ON public.risk_matches
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert risk matches" ON public.risk_matches
  FOR INSERT WITH CHECK (true);

-- SARs policies
CREATE POLICY "Compliance and admins can manage SARs" ON public.sars
  FOR ALL USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::text, 'complianceOfficer'::text]))
  WITH CHECK (get_user_role(auth.uid()) = ANY (ARRAY['admin'::text, 'complianceOfficer'::text]));

-- Patterns policies
CREATE POLICY "Compliance and admins can manage patterns" ON public.patterns
  FOR ALL USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::text, 'complianceOfficer'::text]))
  WITH CHECK (get_user_role(auth.uid()) = ANY (ARRAY['admin'::text, 'complianceOfficer'::text]));

-- Pattern matches policies
CREATE POLICY "Compliance and admins can manage pattern matches" ON public.pattern_matches
  FOR ALL USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::text, 'complianceOfficer'::text]))
  WITH CHECK (get_user_role(auth.uid()) = ANY (ARRAY['admin'::text, 'complianceOfficer'::text]));

-- Integration configs policies
CREATE POLICY "Integration management for authorized users" ON public.integration_configs
  FOR ALL USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::text, 'complianceOfficer'::text]));

-- Integration API keys policies
CREATE POLICY "API keys for authorized users" ON public.integration_api_keys
  FOR ALL USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::text, 'complianceOfficer'::text]));

-- Data ingestion logs policies
CREATE POLICY "Data ingestion logs for authorized users" ON public.data_ingestion_logs
  FOR ALL USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::text, 'complianceOfficer'::text]));

-- External customer mappings policies
CREATE POLICY "Customer mappings for authorized users" ON public.external_customer_mappings
  FOR ALL USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::text, 'complianceOfficer'::text]));

-- External transaction mappings policies
CREATE POLICY "Transaction mappings for authorized users" ON public.external_transaction_mappings
  FOR ALL USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::text, 'complianceOfficer'::text]));

-- Webhook notifications policies
CREATE POLICY "Webhook notifications for authorized users" ON public.webhook_notifications
  FOR ALL USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::text, 'complianceOfficer'::text]));

-- Usage metrics policies
CREATE POLICY "view_own_usage" ON public.usage_metrics
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "insert_own_usage" ON public.usage_metrics
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "update_own_usage" ON public.usage_metrics
  FOR UPDATE USING (user_id = auth.uid());

-- Subscription plans policies
CREATE POLICY "view_active_plans" ON public.subscription_plans
  FOR SELECT USING (is_active = true);

-- Subscribers policies
CREATE POLICY "select_own_subscription" ON public.subscribers
  FOR SELECT USING ((user_id = auth.uid()) OR (email = auth.email()));

CREATE POLICY "update_own_subscription" ON public.subscribers
  FOR UPDATE USING ((user_id = auth.uid()) OR (email = auth.email()));

CREATE POLICY "insert_subscription" ON public.subscribers
  FOR INSERT WITH CHECK (true);

-- Create triggers
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

CREATE TRIGGER update_rules_updated_at_trigger
  BEFORE UPDATE ON public.rules
  FOR EACH ROW EXECUTE FUNCTION public.update_rules_updated_at();

CREATE TRIGGER update_integration_configs_updated_at
  BEFORE UPDATE ON public.integration_configs
  FOR EACH ROW EXECUTE FUNCTION public.update_integration_timestamp();
