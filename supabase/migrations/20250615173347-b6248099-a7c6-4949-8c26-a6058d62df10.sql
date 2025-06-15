
-- Create custom types for SARs and Patterns
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sar_status') THEN
        CREATE TYPE public.sar_status AS ENUM ('draft', 'submitted', 'reviewed');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pattern_category') THEN
        CREATE TYPE public.pattern_category AS ENUM ('structuring', 'high_risk_corridor', 'time_pattern', 'other');
    END IF;
END$$;

-- Create sars table
CREATE TABLE IF NOT EXISTS public.sars (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    date_submitted TIMESTAMPTZ NOT NULL,
    date_of_activity TIMESTAMPTZ NOT NULL,
    status public.sar_status NOT NULL,
    summary TEXT NOT NULL,
    transactions TEXT[] NOT NULL,
    documents TEXT[],
    notes TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add RLS to sars table
ALTER TABLE public.sars ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Compliance and admins can manage SARs" ON public.sars;
CREATE POLICY "Compliance and admins can manage SARs"
ON public.sars
FOR ALL
USING (get_user_role(auth.uid()) IN ('admin', 'complianceOfficer'))
WITH CHECK (get_user_role(auth.uid()) IN ('admin', 'complianceOfficer'));

-- Create patterns table
CREATE TABLE IF NOT EXISTS public.patterns (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category public.pattern_category NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add RLS to patterns table
ALTER TABLE public.patterns ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Compliance and admins can manage patterns" ON public.patterns;
CREATE POLICY "Compliance and admins can manage patterns"
ON public.patterns
FOR ALL
USING (get_user_role(auth.uid()) IN ('admin', 'complianceOfficer'))
WITH CHECK (get_user_role(auth.uid()) IN ('admin', 'complianceOfficer'));

-- Create pattern_matches table
CREATE TABLE IF NOT EXISTS public.pattern_matches (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    pattern_id UUID NOT NULL REFERENCES public.patterns(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    transaction_id TEXT NOT NULL,
    country TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    currency TEXT NOT NULL,
    "timestamp" TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add RLS to pattern_matches table
ALTER TABLE public.pattern_matches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Compliance and admins can manage pattern matches" ON public.pattern_matches;
CREATE POLICY "Compliance and admins can manage pattern matches"
ON public.pattern_matches
FOR ALL
USING (get_user_role(auth.uid()) IN ('admin', 'complianceOfficer'))
WITH CHECK (get_user_role(auth.uid()) IN ('admin', 'complianceOfficer'));

-- Trigger to update 'updated_at' timestamp on SAR update
DROP TRIGGER IF EXISTS handle_sars_updated_at ON public.sars;
CREATE TRIGGER handle_sars_updated_at
BEFORE UPDATE ON public.sars
FOR EACH ROW
EXECUTE FUNCTION public.update_timestamp();
