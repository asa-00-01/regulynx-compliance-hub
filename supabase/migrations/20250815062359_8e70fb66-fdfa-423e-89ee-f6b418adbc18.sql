
-- Drop all existing tables (in correct order due to foreign key constraints)
DROP TABLE IF EXISTS public.pattern_matches CASCADE;
DROP TABLE IF EXISTS public.case_actions CASCADE;
DROP TABLE IF EXISTS public.compliance_cases CASCADE;
DROP TABLE IF EXISTS public.aml_transactions CASCADE;
DROP TABLE IF EXISTS public.documents CASCADE;
DROP TABLE IF EXISTS public.organization_customers CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.platform_roles CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;
DROP TABLE IF EXISTS public.patterns CASCADE;
DROP TABLE IF EXISTS public.rules CASCADE;
DROP TABLE IF EXISTS public.risk_matches CASCADE;
DROP TABLE IF EXISTS public.sars CASCADE;
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.subscribers CASCADE;
DROP TABLE IF EXISTS public.subscription_plans CASCADE;
DROP TABLE IF EXISTS public.webhook_notifications CASCADE;
DROP TABLE IF EXISTS public.integration_configs CASCADE;
DROP TABLE IF EXISTS public.integration_api_keys CASCADE;
DROP TABLE IF EXISTS public.external_customer_mappings CASCADE;
DROP TABLE IF EXISTS public.external_transaction_mappings CASCADE;
DROP TABLE IF EXISTS public.data_ingestion_logs CASCADE;
DROP TABLE IF EXISTS public.usage_metrics CASCADE;
DROP TABLE IF EXISTS public.error_logs CASCADE;
DROP TABLE IF EXISTS public.backup_logs CASCADE;
DROP TABLE IF EXISTS public.deployment_logs CASCADE;
DROP TABLE IF EXISTS public.environment_validations CASCADE;
DROP VIEW IF EXISTS public.user_with_customer CASCADE;

-- Drop existing enums
DROP TYPE IF EXISTS public.platform_role CASCADE;
DROP TYPE IF EXISTS public.customer_role CASCADE;
DROP TYPE IF EXISTS public.user_role CASCADE;
DROP TYPE IF EXISTS public.user_status CASCADE;
DROP TYPE IF EXISTS public.case_type CASCADE;
DROP TYPE IF EXISTS public.case_status CASCADE;
DROP TYPE IF EXISTS public.case_source CASCADE;
DROP TYPE IF EXISTS public.action_type CASCADE;
DROP TYPE IF EXISTS public.document_type CASCADE;
DROP TYPE IF EXISTS public.pattern_category CASCADE;
DROP TYPE IF EXISTS public.sar_status CASCADE;

-- Create enums
CREATE TYPE public.platform_role AS ENUM ('platform_admin', 'platform_support');
CREATE TYPE public.customer_role AS ENUM ('customer_admin', 'customer_compliance', 'customer_executive', 'customer_support');
CREATE TYPE public.user_role AS ENUM ('admin', 'complianceOfficer', 'executive', 'support');
CREATE TYPE public.user_status AS ENUM ('verified', 'pending', 'rejected', 'information_requested');
CREATE TYPE public.case_type AS ENUM ('kyc_review', 'aml_alert', 'sanctions_hit', 'pep_review', 'transaction_monitoring', 'suspicious_activity', 'document_review', 'compliance_breach');
CREATE TYPE public.case_status AS ENUM ('open', 'in_progress', 'resolved', 'closed', 'escalated');
CREATE TYPE public.case_source AS ENUM ('system_alert', 'manual_review', 'external_report', 'regulatory_request');
CREATE TYPE public.action_type AS ENUM ('status_change', 'assignment', 'comment', 'document_upload', 'escalation', 'resolution');
CREATE TYPE public.document_type AS ENUM ('passport', 'drivers_license', 'national_id', 'utility_bill', 'bank_statement', 'proof_of_income', 'other');
CREATE TYPE public.pattern_category AS ENUM ('transaction', 'behavioral', 'geographic', 'temporal');
CREATE TYPE public.sar_status AS ENUM ('draft', 'submitted', 'acknowledged', 'rejected');

-- 1. Core Platform Tables

-- Customers (SaaS customers - the organizations using the compliance platform)
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain TEXT,
  subscription_tier TEXT NOT NULL DEFAULT 'basic',
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User profiles (platform users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  role public.user_role NOT NULL DEFAULT 'admin',
  risk_score INTEGER NOT NULL DEFAULT 0,
  status public.user_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Platform roles (for multi-tenant platform management)
CREATE TABLE public.platform_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role public.platform_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Customer roles (roles within specific customer organizations)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  role public.customer_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, customer_id, role)
);

-- 2. Central Entity: Organization Customers (end-users that SaaS customers monitor)
CREATE TABLE public.organization_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  external_customer_id TEXT, -- Reference to customer's system
  full_name TEXT NOT NULL,
  email TEXT,
  phone_number TEXT,
  date_of_birth DATE,
  nationality TEXT,
  identity_number TEXT,
  address TEXT,
  country_of_residence TEXT,
  kyc_status TEXT NOT NULL DEFAULT 'pending' CHECK (kyc_status IN ('verified', 'pending', 'rejected', 'information_requested')),
  risk_score INTEGER NOT NULL DEFAULT 0,
  is_pep BOOLEAN NOT NULL DEFAULT false,
  is_sanctioned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  UNIQUE(customer_id, external_customer_id)
);

-- 3. Related Entities linked to Organization Customers

-- AML Transactions
CREATE TABLE public.aml_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_customer_id UUID NOT NULL REFERENCES public.organization_customers(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  external_transaction_id TEXT NOT NULL,
  from_account TEXT NOT NULL,
  to_account TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  transaction_type TEXT NOT NULL,
  transaction_date TIMESTAMPTZ NOT NULL,
  description TEXT,
  risk_score INTEGER NOT NULL DEFAULT 0,
  flags JSONB DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'flagged')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(customer_id, external_transaction_id)
);

-- Documents
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_customer_id UUID REFERENCES public.organization_customers(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- For backward compatibility
  type public.document_type NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected', 'information_requested')),
  upload_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  verification_date TIMESTAMPTZ,
  extracted_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Compliance Cases (central to compliance workflow)
CREATE TABLE public.compliance_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_customer_id UUID REFERENCES public.organization_customers(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- For backward compatibility
  type public.case_type NOT NULL,
  status public.case_status NOT NULL DEFAULT 'open',
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  source public.case_source,
  user_name TEXT, -- Denormalized for performance
  description TEXT NOT NULL,
  risk_score INTEGER NOT NULL,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_to_name TEXT, -- Denormalized for performance
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  related_alerts JSONB DEFAULT '[]',
  related_transactions JSONB DEFAULT '[]',
  documents JSONB DEFAULT '[]'
);

-- Case Actions (audit trail for compliance cases)
CREATE TABLE public.case_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.compliance_cases(id) ON DELETE CASCADE,
  action_type public.action_type NOT NULL,
  description TEXT NOT NULL,
  action_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action_by_name TEXT, -- Denormalized for performance
  details JSONB,
  action_date TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Risk Management Tables

-- Rules for risk assessment
CREATE TABLE public.rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id TEXT NOT NULL UNIQUE,
  rule_name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  condition JSONB NOT NULL,
  risk_score INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Risk matches
CREATE TABLE public.risk_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  rule_id TEXT NOT NULL,
  match_data JSONB,
  matched_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Patterns for transaction monitoring
CREATE TABLE public.patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category public.pattern_category NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Pattern matches
CREATE TABLE public.pattern_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_id UUID NOT NULL REFERENCES public.patterns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  transaction_id TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL,
  country TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Reporting Tables

-- SARs (Suspicious Activity Reports)
CREATE TABLE public.sars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  summary TEXT NOT NULL,
  date_of_activity TIMESTAMPTZ NOT NULL,
  date_submitted TIMESTAMPTZ NOT NULL,
  status public.sar_status NOT NULL,
  transactions JSONB NOT NULL,
  documents JSONB,
  notes JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. System Tables

-- Audit logs
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity TEXT NOT NULL,
  entity_id UUID,
  action TEXT NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Usage metrics
CREATE TABLE public.usage_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 1,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, metric_type, date)
);

-- Error logs
CREATE TABLE public.error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_id TEXT NOT NULL,
  error_message TEXT NOT NULL,
  error_stack TEXT,
  error_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  url TEXT,
  user_agent TEXT,
  environment TEXT DEFAULT 'production',
  additional_context JSONB,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Integration and System Management Tables

-- Integration configurations
CREATE TABLE public.integration_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL,
  client_name TEXT NOT NULL,
  integration_type TEXT NOT NULL,
  api_key_hash TEXT,
  webhook_url TEXT,
  data_mapping JSONB NOT NULL DEFAULT '{}',
  batch_frequency TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Integration API keys
CREATE TABLE public.integration_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL,
  key_name TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  permissions JSONB NOT NULL DEFAULT '[]',
  expires_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Data ingestion logs
CREATE TABLE public.data_ingestion_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL,
  ingestion_type TEXT NOT NULL,
  status TEXT NOT NULL,
  record_count INTEGER NOT NULL DEFAULT 0,
  success_count INTEGER NOT NULL DEFAULT 0,
  error_count INTEGER NOT NULL DEFAULT 0,
  error_details JSONB,
  processing_time_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- External mappings
CREATE TABLE public.external_customer_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL,
  external_customer_id TEXT NOT NULL,
  internal_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  customer_data JSONB NOT NULL,
  sync_status TEXT NOT NULL DEFAULT 'synced',
  last_synced_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.external_transaction_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_transaction_id TEXT NOT NULL,
  external_customer_id TEXT NOT NULL,
  client_id TEXT NOT NULL,
  transaction_data JSONB NOT NULL,
  risk_assessment JSONB,
  compliance_status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Webhook notifications
CREATE TABLE public.webhook_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  webhook_url TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  retry_count INTEGER NOT NULL DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Subscription management
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price_monthly INTEGER NOT NULL,
  price_yearly INTEGER NOT NULL,
  features JSONB NOT NULL DEFAULT '[]',
  max_users INTEGER,
  max_transactions INTEGER,
  max_cases INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  subscribed BOOLEAN NOT NULL DEFAULT false,
  subscription_tier TEXT,
  stripe_customer_id TEXT,
  subscription_end TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- System monitoring
CREATE TABLE public.backup_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_type TEXT NOT NULL,
  status TEXT NOT NULL,
  file_path TEXT,
  file_size BIGINT,
  duration_seconds INTEGER,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE public.deployment_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deployment_id TEXT NOT NULL,
  version TEXT NOT NULL,
  environment TEXT NOT NULL,
  status TEXT NOT NULL,
  commit_hash TEXT,
  branch TEXT,
  deployed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  build_duration_seconds INTEGER,
  deployment_duration_seconds INTEGER,
  error_message TEXT,
  rollback_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE public.environment_validations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  validation_type TEXT NOT NULL,
  status TEXT NOT NULL,
  message TEXT NOT NULL,
  recommendation TEXT,
  severity TEXT NOT NULL,
  environment TEXT NOT NULL,
  validated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_organization_customers_customer_id ON public.organization_customers(customer_id);
CREATE INDEX idx_organization_customers_kyc_status ON public.organization_customers(kyc_status);
CREATE INDEX idx_organization_customers_risk_score ON public.organization_customers(risk_score);
CREATE INDEX idx_aml_transactions_org_customer_id ON public.aml_transactions(organization_customer_id);
CREATE INDEX idx_aml_transactions_customer_id ON public.aml_transactions(customer_id);
CREATE INDEX idx_aml_transactions_date ON public.aml_transactions(transaction_date);
CREATE INDEX idx_documents_org_customer_id ON public.documents(organization_customer_id);
CREATE INDEX idx_documents_customer_id ON public.documents(customer_id);
CREATE INDEX idx_compliance_cases_org_customer_id ON public.compliance_cases(organization_customer_id);
CREATE INDEX idx_compliance_cases_customer_id ON public.compliance_cases(customer_id);
CREATE INDEX idx_compliance_cases_status ON public.compliance_cases(status);
CREATE INDEX idx_case_actions_case_id ON public.case_actions(case_id);
CREATE INDEX idx_profiles_customer_id ON public.profiles(customer_id);
CREATE INDEX idx_user_roles_user_customer ON public.user_roles(user_id, customer_id);

-- Create view for user with customer info
CREATE VIEW public.user_with_customer AS
SELECT 
  p.id,
  p.name,
  p.email,
  p.avatar_url,
  p.customer_id,
  p.role,
  p.risk_score,
  p.status,
  p.created_at,
  p.updated_at,
  c.name as customer_full_name,
  c.domain as customer_domain,
  c.subscription_tier,
  c.settings as customer_settings
FROM public.profiles p
LEFT JOIN public.customers c ON p.customer_id = c.id;

-- Enable RLS on all tables
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aml_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pattern_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_ingestion_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_customer_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_transaction_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backup_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deployment_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.environment_validations ENABLE ROW LEVEL SECURITY;

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

-- Create RLS policies

-- Platform roles policies
CREATE POLICY "Platform admins can manage platform roles" ON public.platform_roles
  FOR ALL USING (has_platform_role(auth.uid(), 'platform_admin'::platform_role));

CREATE POLICY "Users can view their own platform roles" ON public.platform_roles
  FOR SELECT USING (user_id = auth.uid());

-- Customer roles policies
CREATE POLICY "Platform admins can manage customer roles" ON public.user_roles
  FOR ALL USING (has_platform_role(auth.uid(), 'platform_admin'::platform_role));

CREATE POLICY "Users can view their own customer roles" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid());

-- Customers policies
CREATE POLICY "Platform admins can manage customers" ON public.customers
  FOR ALL USING (has_platform_role(auth.uid(), 'platform_admin'::platform_role));

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Platform admins can view all profiles" ON public.profiles
  FOR SELECT USING (has_platform_role(auth.uid(), 'platform_admin'::platform_role));

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (get_user_role(auth.uid()) = ANY(ARRAY['admin', 'complianceOfficer']));

CREATE POLICY "Customer users can view profiles within their organization" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur1
      JOIN public.user_roles ur2 ON ur1.customer_id = ur2.customer_id
      WHERE ur1.user_id = auth.uid() 
        AND ur2.user_id = profiles.id 
        AND ur1.customer_id IS NOT NULL
    )
  );

-- Organization customers policies (central entity)
CREATE POLICY "Customer users can manage their organization's customers" ON public.organization_customers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.profiles p ON p.id = ur.user_id
      WHERE ur.user_id = auth.uid() 
        AND ur.customer_id = organization_customers.customer_id
        AND ur.role IN ('customer_admin', 'customer_compliance', 'customer_support')
    )
  );

CREATE POLICY "Platform admins can view all organization customers" ON public.organization_customers
  FOR SELECT USING (has_platform_role(auth.uid(), 'platform_admin'::platform_role));

-- AML transactions policies
CREATE POLICY "Customer users can manage their organization's transactions" ON public.aml_transactions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() 
        AND ur.customer_id = aml_transactions.customer_id
        AND ur.role IN ('customer_admin', 'customer_compliance', 'customer_support')
    )
  );

CREATE POLICY "Platform admins can view all transactions" ON public.aml_transactions
  FOR SELECT USING (has_platform_role(auth.uid(), 'platform_admin'::platform_role));

-- Documents policies
CREATE POLICY "Users can view their own documents" ON public.documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents" ON public.documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents" ON public.documents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents" ON public.documents
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Compliance officers can view all documents" ON public.documents
  FOR SELECT USING (get_user_role(auth.uid()) = ANY(ARRAY['complianceOfficer', 'admin']));

CREATE POLICY "Compliance officers can insert documents for any user" ON public.documents
  FOR INSERT WITH CHECK (get_user_role(auth.uid()) = ANY(ARRAY['complianceOfficer', 'admin']));

CREATE POLICY "Compliance officers can update all documents" ON public.documents
  FOR UPDATE USING (get_user_role(auth.uid()) = ANY(ARRAY['complianceOfficer', 'admin']));

CREATE POLICY "Documents are viewable by authenticated users" ON public.documents
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Documents can be inserted by authenticated users" ON public.documents
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Documents can be updated by authenticated users" ON public.documents
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Compliance cases policies
CREATE POLICY "Allow full access for admins and compliance officers" ON public.compliance_cases
  FOR ALL USING (get_user_role(auth.uid()) = ANY(ARRAY['admin', 'complianceOfficer']))
  WITH CHECK (get_user_role(auth.uid()) = ANY(ARRAY['admin', 'complianceOfficer']));

CREATE POLICY "Allow read-only access for executives" ON public.compliance_cases
  FOR SELECT USING (get_user_role(auth.uid()) = 'executive');

-- Case actions policies
CREATE POLICY "Allow read access for authorized roles on case actions" ON public.case_actions
  FOR SELECT USING (get_user_role(auth.uid()) = ANY(ARRAY['admin', 'complianceOfficer', 'executive']));

CREATE POLICY "Allow insert for admins and compliance officers on case actions" ON public.case_actions
  FOR INSERT WITH CHECK (get_user_role(auth.uid()) = ANY(ARRAY['admin', 'complianceOfficer']));

-- Rules policies
CREATE POLICY "Compliance and admins can view rules" ON public.rules
  FOR SELECT USING (get_user_role(auth.uid()) = ANY(ARRAY['admin', 'complianceOfficer']));

CREATE POLICY "Compliance and admins can create rules" ON public.rules
  FOR INSERT WITH CHECK (get_user_role(auth.uid()) = ANY(ARRAY['admin', 'complianceOfficer']));

CREATE POLICY "Compliance and admins can update rules" ON public.rules
  FOR UPDATE USING (get_user_role(auth.uid()) = ANY(ARRAY['admin', 'complianceOfficer']))
  WITH CHECK (get_user_role(auth.uid()) = ANY(ARRAY['admin', 'complianceOfficer']));

CREATE POLICY "Compliance and admins can delete rules" ON public.rules
  FOR DELETE USING (get_user_role(auth.uid()) = ANY(ARRAY['admin', 'complianceOfficer']));

-- Risk matches policies
CREATE POLICY "Compliance and admins can view risk matches" ON public.risk_matches
  FOR SELECT USING (get_user_role(auth.uid()) = ANY(ARRAY['admin', 'complianceOfficer']));

CREATE POLICY "Compliance and admins can insert risk matches" ON public.risk_matches
  FOR INSERT WITH CHECK (get_user_role(auth.uid()) = ANY(ARRAY['admin', 'complianceOfficer']));

CREATE POLICY "Compliance and admins can update risk matches" ON public.risk_matches
  FOR UPDATE USING (get_user_role(auth.uid()) = ANY(ARRAY['admin', 'complianceOfficer']));

CREATE POLICY "Compliance and admins can delete risk matches" ON public.risk_matches
  FOR DELETE USING (get_user_role(auth.uid()) = ANY(ARRAY['admin', 'complianceOfficer']));

-- Patterns policies
CREATE POLICY "Compliance and admins can manage patterns" ON public.patterns
  FOR ALL USING (get_user_role(auth.uid()) = ANY(ARRAY['admin', 'complianceOfficer']))
  WITH CHECK (get_user_role(auth.uid()) = ANY(ARRAY['admin', 'complianceOfficer']));

-- Pattern matches policies
CREATE POLICY "Compliance and admins can manage pattern matches" ON public.pattern_matches
  FOR ALL USING (get_user_role(auth.uid()) = ANY(ARRAY['admin', 'complianceOfficer']))
  WITH CHECK (get_user_role(auth.uid()) = ANY(ARRAY['admin', 'complianceOfficer']));

-- SARs policies
CREATE POLICY "Compliance and admins can manage SARs" ON public.sars
  FOR ALL USING (get_user_role(auth.uid()) = ANY(ARRAY['admin', 'complianceOfficer']))
  WITH CHECK (get_user_role(auth.uid()) = ANY(ARRAY['admin', 'complianceOfficer']));

-- Audit logs policies
CREATE POLICY "Audit logs are viewable by authenticated users" ON public.audit_logs
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Audit logs can be inserted by authenticated users" ON public.audit_logs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Usage metrics policies
CREATE POLICY "view_own_usage" ON public.usage_metrics
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "insert_own_usage" ON public.usage_metrics
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "update_own_usage" ON public.usage_metrics
  FOR UPDATE USING (user_id = auth.uid());

-- Error logs policies
CREATE POLICY "Admin and support can view error logs" ON public.error_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('admin', 'support')
    )
  );

CREATE POLICY "Admin and support can update error logs" ON public.error_logs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('admin', 'support')
    )
  );

-- Integration policies
CREATE POLICY "Integration management for authorized users" ON public.integration_configs
  FOR ALL USING (get_user_role(auth.uid()) = ANY(ARRAY['admin', 'complianceOfficer']));

CREATE POLICY "API keys for authorized users" ON public.integration_api_keys
  FOR ALL USING (get_user_role(auth.uid()) = ANY(ARRAY['admin', 'complianceOfficer']));

CREATE POLICY "Data ingestion logs for authorized users" ON public.data_ingestion_logs
  FOR ALL USING (get_user_role(auth.uid()) = ANY(ARRAY['admin', 'complianceOfficer']));

CREATE POLICY "Customer mappings for authorized users" ON public.external_customer_mappings
  FOR ALL USING (get_user_role(auth.uid()) = ANY(ARRAY['admin', 'complianceOfficer']));

CREATE POLICY "Transaction mappings for authorized users" ON public.external_transaction_mappings
  FOR ALL USING (get_user_role(auth.uid()) = ANY(ARRAY['admin', 'complianceOfficer']));

CREATE POLICY "Webhook notifications for authorized users" ON public.webhook_notifications
  FOR ALL USING (get_user_role(auth.uid()) = ANY(ARRAY['admin', 'complianceOfficer']));

-- Subscription policies
CREATE POLICY "view_active_plans" ON public.subscription_plans
  FOR SELECT USING (is_active = true);

CREATE POLICY "select_own_subscription" ON public.subscribers
  FOR SELECT USING (user_id = auth.uid() OR email = auth.email());

CREATE POLICY "insert_subscription" ON public.subscribers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "update_own_subscription" ON public.subscribers
  FOR UPDATE USING (user_id = auth.uid() OR email = auth.email());

-- System monitoring policies
CREATE POLICY "Admin users can view backup logs" ON public.backup_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin users can view deployment logs" ON public.deployment_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin users can view environment validations" ON public.environment_validations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
  );

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER update_organization_customers_updated_at BEFORE UPDATE ON public.organization_customers
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER update_aml_transactions_updated_at BEFORE UPDATE ON public.aml_transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER update_compliance_cases_updated_at BEFORE UPDATE ON public.compliance_cases
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER update_sars_updated_at BEFORE UPDATE ON public.sars
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER update_rules_updated_at BEFORE UPDATE ON public.rules
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER update_integration_configs_updated_at BEFORE UPDATE ON public.integration_configs
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER update_subscribers_updated_at BEFORE UPDATE ON public.subscribers
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

-- Create trigger for new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create trigger to assign default customer role
CREATE OR REPLACE FUNCTION public.assign_default_customer_role()
RETURNS TRIGGER
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

DROP TRIGGER IF EXISTS assign_default_role ON public.profiles;
CREATE TRIGGER assign_default_role
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.assign_default_customer_role();
