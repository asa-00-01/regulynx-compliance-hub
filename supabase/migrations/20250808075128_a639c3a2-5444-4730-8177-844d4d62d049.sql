
-- First, create a profile entry for the platform admin user
-- We'll use a generated UUID for the user ID since we don't have the actual auth.users ID yet
INSERT INTO public.profiles (id, name, email, role, status, risk_score)
VALUES (
  gen_random_uuid(),
  'Platform Admin',
  'anwar20xx@gmail.com',
  'admin',
  'active',
  0
);

-- Get the user ID we just created so we can assign the platform role
-- We'll need to run this as a separate command after the insert
WITH new_user AS (
  SELECT id FROM public.profiles WHERE email = 'anwar20xx@gmail.com'
)
INSERT INTO public.platform_roles (user_id, role)
SELECT id, 'platform_admin'::platform_role
FROM new_user;
