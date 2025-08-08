
-- First, let's clean up any existing platform roles for your user to avoid duplicates
DELETE FROM public.platform_roles 
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'anwar20xx@gmail.com'
);

-- Now assign the platform_admin role to your user
INSERT INTO public.platform_roles (user_id, role)
SELECT id, 'platform_admin'::platform_role
FROM auth.users 
WHERE email = 'anwar20xx@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Verify the role was assigned correctly
SELECT 
  u.email,
  pr.role,
  pr.created_at
FROM auth.users u
JOIN public.platform_roles pr ON u.id = pr.user_id
WHERE u.email = 'anwar20xx@gmail.com';
