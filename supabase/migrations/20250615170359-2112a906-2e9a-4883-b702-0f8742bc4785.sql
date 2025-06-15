
-- To ensure a clean setup, we will first drop existing objects if they exist.
-- This is safe because we are migrating from mock data.

-- Drop policies if they exist
DROP POLICY IF EXISTS "Allow full access for admins and compliance officers" ON public.compliance_cases;
DROP POLICY IF EXISTS "Allow read-only access for executives" ON public.compliance_cases;
DROP POLICY IF EXISTS "Allow read access for authorized roles on case actions" ON public.case_actions;
DROP POLICY IF EXISTS "Allow insert for admins and compliance officers on case actions" ON public.case_actions;

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS handle_compliance_cases_updated_at ON public.compliance_cases;

-- Drop tables if they exist, in the correct order to respect foreign keys
DROP TABLE IF EXISTS public.case_actions;
DROP TABLE IF EXISTS public.compliance_cases;

-- Drop types if they exist
DROP TYPE IF EXISTS public.case_action_type;
DROP TYPE IF EXISTS public.case_source;
DROP TYPE IF EXISTS public.case_priority;
DROP TYPE IF EXISTS public.case_type;
DROP TYPE IF EXISTS public.case_status;

-- Now, recreate everything from scratch to match the application's type definitions.

-- Create custom types for case properties
CREATE TYPE public.case_status AS ENUM ('open', 'under_review', 'escalated', 'pending_info', 'closed');
CREATE TYPE public.case_type AS ENUM ('kyc', 'aml', 'sanctions');
CREATE TYPE public.case_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE public.case_source AS ENUM ('manual', 'transaction_alert', 'kyc_flag', 'sanctions_hit', 'system', 'risk_assessment');
CREATE TYPE public.case_action_type AS ENUM ('note', 'status_change', 'assignment', 'document_request', 'escalation', 'resolution');

-- Create the main table for compliance cases
CREATE TABLE public.compliance_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    user_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    type public.case_type NOT NULL,
    status public.case_status NOT NULL DEFAULT 'open',
    risk_score INT NOT NULL,
    description TEXT NOT NULL,
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    assigned_to_name TEXT,
    priority public.case_priority NOT NULL,
    source public.case_source,
    related_transactions TEXT[],
    related_alerts TEXT[],
    documents TEXT[],
    resolved_at TIMESTAMPTZ
);

COMMENT ON TABLE public.compliance_cases IS 'Stores all compliance case details.';

-- Create a trigger to automatically update the updated_at timestamp on any change
CREATE TRIGGER handle_compliance_cases_updated_at
BEFORE UPDATE ON public.compliance_cases
FOR EACH ROW
EXECUTE FUNCTION public.update_timestamp();

-- Create a table to log actions and history for each case
CREATE TABLE public.case_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES public.compliance_cases(id) ON DELETE CASCADE,
    action_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action_by_name TEXT,
    action_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    action_type public.case_action_type NOT NULL,
    description TEXT NOT NULL,
    details JSONB
);

COMMENT ON TABLE public.case_actions IS 'Logs all actions and history related to a compliance case.';

-- Enable Row-Level Security on both tables to protect data
ALTER TABLE public.compliance_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_actions ENABLE ROW LEVEL SECURITY;

-- Define RLS policies for the compliance_cases table
CREATE POLICY "Allow full access for admins and compliance officers"
ON public.compliance_cases
FOR ALL
USING (get_user_role(auth.uid()) IN ('admin', 'complianceOfficer'))
WITH CHECK (get_user_role(auth.uid()) IN ('admin', 'complianceOfficer'));

CREATE POLICY "Allow read-only access for executives"
ON public.compliance_cases
FOR SELECT
USING (get_user_role(auth.uid()) = 'executive');

-- Define RLS policies for the case_actions table
CREATE POLICY "Allow read access for authorized roles on case actions"
ON public.case_actions
FOR SELECT
USING (get_user_role(auth.uid()) IN ('admin', 'complianceOfficer', 'executive'));

CREATE POLICY "Allow insert for admins and compliance officers on case actions"
ON public.case_actions
FOR INSERT
WITH CHECK (get_user_role(auth.uid()) IN ('admin', 'complianceOfficer'));

