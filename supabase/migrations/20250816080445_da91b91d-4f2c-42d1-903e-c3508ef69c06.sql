
-- Create tables with proper constraints and indexes

-- 1. Ensure customers table exists (may already exist)
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    domain TEXT,
    subscription_tier TEXT DEFAULT 'basic',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Ensure profiles table exists (may already exist)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    avatar_url TEXT,
    customer_id UUID REFERENCES public.customers(id),
    role TEXT DEFAULT 'admin',
    risk_score INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Ensure user_roles table exists (may already exist)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    customer_id UUID REFERENCES public.customers(id),
    role TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Ensure subscription_plans table exists (may already exist)
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price_monthly INTEGER NOT NULL,
    price_yearly INTEGER NOT NULL,
    features JSONB DEFAULT '[]',
    max_users INTEGER,
    max_transactions INTEGER,
    max_cases INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure unique constraint on plan_id exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'subscription_plans_plan_id_key' 
        AND conrelid = 'public.subscription_plans'::regclass
    ) THEN
        ALTER TABLE public.subscription_plans ADD CONSTRAINT subscription_plans_plan_id_key UNIQUE (plan_id);
    END IF;
END $$;

-- 5. Ensure subscribers table exists (may already exist)
CREATE TABLE IF NOT EXISTS public.subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    email TEXT NOT NULL,
    subscribed BOOLEAN DEFAULT false,
    subscription_tier TEXT,
    subscription_end TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,
    stripe_customer_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Ensure integration_configs table exists (may already exist)
CREATE TABLE IF NOT EXISTS public.integration_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id TEXT NOT NULL,
    client_name TEXT NOT NULL,
    integration_type TEXT NOT NULL,
    api_key_hash TEXT,
    webhook_url TEXT,
    data_mapping JSONB DEFAULT '{}',
    batch_frequency TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Ensure integration_api_keys table exists (may already exist)
CREATE TABLE IF NOT EXISTS public.integration_api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id TEXT NOT NULL,
    key_name TEXT NOT NULL,
    key_hash TEXT NOT NULL,
    permissions JSONB DEFAULT '[]',
    expires_at TIMESTAMPTZ,
    last_used_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Create organisation_customer table
CREATE TABLE IF NOT EXISTS public.organisation_customer (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
    external_id TEXT NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT,
    phone_number TEXT,
    date_of_birth DATE,
    nationality TEXT,
    identity_number TEXT,
    address TEXT,
    country_of_residence TEXT,
    risk_score INTEGER DEFAULT 0,
    is_pep BOOLEAN DEFAULT false,
    is_sanctioned BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID,
    UNIQUE(customer_id, external_id)
);

-- 9. Create kyx table
CREATE TABLE IF NOT EXISTS public.kyx (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_customer_id UUID NOT NULL REFERENCES public.organisation_customer(id) ON DELETE RESTRICT,
    version INTEGER NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
    is_active BOOLEAN DEFAULT false,
    data JSONB DEFAULT '{}',
    reviewed_by UUID,
    reviewed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(organisation_customer_id, version)
);

-- 10. Create transaction table
CREATE TABLE IF NOT EXISTS public.transaction (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_customer_id UUID NOT NULL REFERENCES public.organisation_customer(id) ON DELETE RESTRICT,
    external_transaction_id TEXT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    direction TEXT NOT NULL CHECK (direction IN ('in', 'out')),
    counterparty_name TEXT,
    counterparty_account TEXT,
    occurred_at TIMESTAMPTZ NOT NULL,
    risk_score INTEGER DEFAULT 0,
    flags JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 11. Create document table
CREATE TABLE IF NOT EXISTS public.document (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_customer_id UUID NOT NULL REFERENCES public.organisation_customer(id) ON DELETE RESTRICT,
    type TEXT NOT NULL CHECK (type IN ('passport', 'drivers_license', 'national_id', 'utility_bill', 'bank_statement', 'other')),
    file_name TEXT NOT NULL,
    storage_uri TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    file_size_bytes INTEGER,
    status TEXT NOT NULL CHECK (status IN ('pending', 'verified', 'rejected', 'expired')),
    uploaded_by UUID,
    verified_by UUID,
    verified_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 12. Create compliance_case table
CREATE TABLE IF NOT EXISTS public.compliance_case (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_customer_id UUID NOT NULL REFERENCES public.organisation_customer(id) ON DELETE RESTRICT,
    case_type TEXT NOT NULL CHECK (case_type IN ('kyc_review', 'aml_alert', 'sanctions_hit', 'pep_review', 'transaction_monitoring', 'suspicious_activity')),
    status TEXT NOT NULL CHECK (status IN ('open', 'in_progress', 'resolved', 'closed', 'escalated')),
    priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    title TEXT NOT NULL,
    description TEXT,
    assigned_to UUID,
    created_by UUID,
    resolved_by UUID,
    resolved_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 13. Create case_transaction link table
CREATE TABLE IF NOT EXISTS public.case_transaction (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES public.compliance_case(id) ON DELETE CASCADE,
    transaction_id UUID NOT NULL REFERENCES public.transaction(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(case_id, transaction_id)
);

-- 14. Create case_document link table
CREATE TABLE IF NOT EXISTS public.case_document (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES public.compliance_case(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES public.document(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(case_id, document_id)
);

-- 15. Create case_event table
CREATE TABLE IF NOT EXISTS public.case_event (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES public.compliance_case(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('created', 'assigned', 'status_change', 'note_added', 'document_added', 'resolved')),
    description TEXT NOT NULL,
    created_by UUID,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 16. Create ai_interactions table for AI Agent
CREATE TABLE IF NOT EXISTS public.ai_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    tools_used JSONB DEFAULT '[]',
    confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),
    processing_time INTEGER,
    session_id TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_organisation_customer_external_id ON public.organisation_customer(external_id);
CREATE INDEX IF NOT EXISTS idx_transaction_org_customer_occurred ON public.transaction(organisation_customer_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_compliance_case_org_customer_status_priority ON public.compliance_case(organisation_customer_id, status, priority);
CREATE INDEX IF NOT EXISTS idx_document_org_customer_type_status ON public.document(organisation_customer_id, type, status);
CREATE INDEX IF NOT EXISTS idx_kyx_org_customer_active_status ON public.kyx(organisation_customer_id, is_active, status);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_user_created ON public.ai_interactions(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_session ON public.ai_interactions(session_id);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_customers_updated_at ON public.customers;
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscribers_updated_at ON public.subscribers;
CREATE TRIGGER update_subscribers_updated_at BEFORE UPDATE ON public.subscribers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_integration_configs_updated_at ON public.integration_configs;
CREATE TRIGGER update_integration_configs_updated_at BEFORE UPDATE ON public.integration_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_organisation_customer_updated_at ON public.organisation_customer;
CREATE TRIGGER update_organisation_customer_updated_at BEFORE UPDATE ON public.organisation_customer FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_kyx_updated_at ON public.kyx;
CREATE TRIGGER update_kyx_updated_at BEFORE UPDATE ON public.kyx FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_transaction_updated_at ON public.transaction;
CREATE TRIGGER update_transaction_updated_at BEFORE UPDATE ON public.transaction FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_document_updated_at ON public.document;
CREATE TRIGGER update_document_updated_at BEFORE UPDATE ON public.document FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_compliance_case_updated_at ON public.compliance_case;
CREATE TRIGGER update_compliance_case_updated_at BEFORE UPDATE ON public.compliance_case FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ai_interactions_updated_at ON public.ai_interactions;
CREATE TRIGGER update_ai_interactions_updated_at BEFORE UPDATE ON public.ai_interactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create constraint to ensure only one active KYX per organisation_customer
CREATE UNIQUE INDEX IF NOT EXISTS idx_kyx_one_active_per_customer 
ON public.kyx(organisation_customer_id) 
WHERE is_active = true;

-- Seed data following business flow

-- 1. Create Customer (tenant)
INSERT INTO public.customers (id, name, domain, subscription_tier, settings) 
VALUES ('01234567-89ab-cdef-0123-456789abcdef', 'Demo Corp Ltd', 'democorp.com', 'pro', '{"features": ["aml", "kyc", "sanctions"]}')
ON CONFLICT (id) DO NOTHING;

-- 2. Create subscription plan
INSERT INTO public.subscription_plans (id, plan_id, name, description, price_monthly, price_yearly, features, max_users, max_transactions, max_cases, is_active)
VALUES ('11111111-1111-1111-1111-111111111111', 'pro', 'Professional Plan', 'Full compliance suite', 99900, 999900, '["aml_monitoring", "kyc_verification", "sanctions_screening", "case_management"]'::jsonb, 50, 10000, 1000, true)
ON CONFLICT (plan_id) DO NOTHING;

-- Add STARTER and ENTERPRISE plans
INSERT INTO public.subscription_plans (id, plan_id, name, description, price_monthly, price_yearly, features, max_users, max_transactions, max_cases, is_active)
VALUES 
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'starter', 'Starter Plan', 'Essential compliance tools for small teams', 29900, 299900, '["basic_aml_monitoring", "kyc_verification", "basic_reporting"]'::jsonb, 10, 1000, 100, true),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'enterprise', 'Enterprise Plan', 'Enterprise-grade compliance platform', 299900, 2999900, '["aml_monitoring", "kyc_verification", "sanctions_screening", "case_management", "advanced_analytics", "custom_integrations", "dedicated_support"]'::jsonb, -1, -1, -1, true)
ON CONFLICT (plan_id) DO NOTHING;

-- 3. Create platform user (profile will be created via auth trigger when user signs up)
-- Note: Profile will be created automatically when user signs up through auth

-- 4. Assign admin role (will be done after user signs up)
-- Note: User roles will be assigned after user authentication

-- 5. Create subscription (will be linked after user signs up)
-- Note: Subscription will be linked to user after authentication

-- 6. Add integration config
INSERT INTO public.integration_configs (id, client_id, client_name, integration_type, webhook_url, data_mapping, status)
VALUES ('55555555-5555-5555-5555-555555555555', 'democorp_api', 'Demo Corp API', 'webhook', 'https://democorp.com/webhook', '{"customer_mapping": "external_id", "transaction_mapping": "txn_id"}'::jsonb, 'active')
ON CONFLICT (id) DO NOTHING;

-- 7. Add API key
INSERT INTO public.integration_api_keys (id, client_id, key_name, key_hash, permissions, expires_at, is_active)
VALUES ('66666666-6666-6666-6666-666666666666', 'democorp_api', 'main_api_key', 'hashed_key_value_123', '["read", "write", "webhook"]'::jsonb, now() + INTERVAL '1 year', true)
ON CONFLICT (id) DO NOTHING;

-- 8. Create Organisation Customer
INSERT INTO public.organisation_customer (id, customer_id, external_id, full_name, email, phone_number, date_of_birth, nationality, country_of_residence, risk_score, created_by)
VALUES ('77777777-7777-7777-7777-777777777777', '01234567-89ab-cdef-0123-456789abcdef', 'EXT_CUST_001', 'Alice Smith', 'alice.smith@email.com', '+1-555-0123', '1985-06-15', 'American', 'United States', 45, NULL)
ON CONFLICT (customer_id, external_id) DO NOTHING;

-- 9. Create KYX records (v1 inactive, v2 active approved)
INSERT INTO public.kyx (id, organisation_customer_id, version, status, is_active, data, reviewed_by, reviewed_at)
VALUES 
('88888888-8888-8888-8888-888888888888', '77777777-7777-7777-7777-777777777777', 1, 'expired', false, '{"identity_verified": false, "address_verified": false}'::jsonb, NULL, now() - INTERVAL '30 days'),
('99999999-9999-9999-9999-999999999999', '77777777-7777-7777-7777-777777777777', 2, 'approved', true, '{"identity_verified": true, "address_verified": true, "pep_check": "clear", "sanctions_check": "clear"}'::jsonb, NULL, now() - INTERVAL '1 day')
ON CONFLICT (organisation_customer_id, version) DO NOTHING;

-- 10. Create transactions
INSERT INTO public.transaction (id, organisation_customer_id, external_transaction_id, amount, currency, direction, counterparty_name, counterparty_account, occurred_at, risk_score)
VALUES 
('cccccccc-cccc-cccc-cccc-cccccccccccc', '77777777-7777-7777-7777-777777777777', 'TXN_001', 2500.00, 'USD', 'in', 'Employer Corp', 'ACC_12345', now() - INTERVAL '5 days', 20),
('dddddddd-dddd-dddd-dddd-dddddddddddd', '77777777-7777-7777-7777-777777777777', 'TXN_002', 850.75, 'USD', 'out', 'Utility Company', 'ACC_67890', now() - INTERVAL '3 days', 10)
ON CONFLICT (id) DO NOTHING;

-- 11. Create documents
INSERT INTO public.document (id, organisation_customer_id, type, file_name, storage_uri, mime_type, file_size_bytes, status, uploaded_by, verified_by, verified_at)
VALUES 
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '77777777-7777-7777-7777-777777777777', 'passport', 'alice_passport.pdf', '/documents/alice/passport.pdf', 'application/pdf', 1024000, 'verified', NULL, NULL, now() - INTERVAL '2 days'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', '77777777-7777-7777-7777-777777777777', 'utility_bill', 'alice_utility.pdf', '/documents/alice/utility.pdf', 'application/pdf', 512000, 'verified', NULL, NULL, now() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

-- 12. Create compliance case
INSERT INTO public.compliance_case (id, organisation_customer_id, case_type, status, priority, title, description, assigned_to, created_by)
VALUES ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '77777777-7777-7777-7777-777777777777', 'aml_alert', 'in_progress', 'medium', 'Routine AML Review', 'Regular transaction monitoring review for new customer', NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- 13. Link case to transactions
INSERT INTO public.case_transaction (case_id, transaction_id)
VALUES 
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'dddddddd-dddd-dddd-dddd-dddddddddddd')
ON CONFLICT (case_id, transaction_id) DO NOTHING;

-- 14. Link case to document
INSERT INTO public.case_document (case_id, document_id)
VALUES ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee')
ON CONFLICT (case_id, document_id) DO NOTHING;

-- 15. Create case events
INSERT INTO public.case_event (id, case_id, event_type, description, created_by)
VALUES 
('00000000-0000-0000-0000-000000000000', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'created', 'Case opened for routine AML review', NULL),
('11111111-1111-1111-1111-111111111111', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'note_added', 'Initial review completed. All documents verified. Transactions appear legitimate.', NULL)
ON CONFLICT (id) DO NOTHING;

-- 16. Create sample AI interactions
INSERT INTO public.ai_interactions (id, user_id, message, response, tools_used, confidence, processing_time, session_id)
VALUES 
('33333333-3333-3333-3333-333333333333', NULL, 'What are the AML compliance requirements?', 'Based on our compliance database, I can provide guidance on AML compliance. The key areas to focus on include customer due diligence, transaction monitoring, and suspicious activity reporting. Our system flags transactions above $10,000 and monitors for unusual patterns.', '["RAG System", "Compliance Database", "Regulatory Updates"]'::jsonb, 0.92, 1200, 'session-001'),
('44444444-4444-4444-4444-444444444444', NULL, 'How do I verify customer identity?', 'For KYC procedures, you''ll need to verify identity documents, assess risk level, and conduct enhanced due diligence for high-risk customers. Our system supports document verification, risk scoring, and automated compliance checks.', '["KYC Database", "Document Verification", "Risk Assessment"]'::jsonb, 0.89, 950, 'session-001')
ON CONFLICT (id) DO NOTHING;
