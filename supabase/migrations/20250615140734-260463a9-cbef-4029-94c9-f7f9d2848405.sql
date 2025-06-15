
-- This script will clear all data from your application tables 
-- and then repopulate the user profiles based on existing users in Supabase Auth.

-- WARNING: This will permanently delete all data in the following tables:
-- case_actions, risk_matches, audit_logs, compliance_cases, documents, rules, profiles.

-- Step 1: Truncate all tables to clear existing data.
TRUNCATE 
  public.case_actions,
  public.risk_matches,
  public.audit_logs,
  public.compliance_cases,
  public.documents,
  public.rules,
  public.profiles
RESTART IDENTITY CASCADE;

-- Step 2: Repopulate the profiles table from auth.users.
-- This ensures that all your existing users have a corresponding profile.
-- It prioritizes the role from user metadata, falling back to email-based role detection for demo accounts.
INSERT INTO public.profiles (id, name, email, role, status, avatar_url, risk_score)
SELECT 
    u.id,
    COALESCE(u.raw_user_meta_data->>'name', u.email, 'New User') as name,
    u.email,
    COALESCE(
        (u.raw_user_meta_data->>'role')::user_role,
        CASE
            WHEN u.email ILIKE 'admin@%' THEN 'admin'::user_role
            WHEN u.email ILIKE 'compliance@%' THEN 'complianceOfficer'::user_role
            WHEN u.email ILIKE 'executive@%' THEN 'executive'::user_role
            WHEN u.email ILIKE 'support@%' THEN 'support'::user_role
            ELSE 'support'::user_role
        END
    ) as role,
    'verified'::user_status as status,
    u.raw_user_meta_data->>'avatar_url' as avatar_url,
    (COALESCE(u.raw_user_meta_data->>'risk_score', '0'))::integer as risk_score
FROM auth.users u
ON CONFLICT (id) DO NOTHING;
