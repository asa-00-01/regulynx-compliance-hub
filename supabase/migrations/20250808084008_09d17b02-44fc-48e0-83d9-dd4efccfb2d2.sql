
-- Assign platform admin role to the current user
-- This will give you full platform-level access including integration management
INSERT INTO public.platform_roles (user_id, role)
SELECT auth.uid(), 'platform_admin'::platform_role
WHERE NOT EXISTS (
  SELECT 1 FROM public.platform_roles 
  WHERE user_id = auth.uid() AND role = 'platform_admin'::platform_role
);

-- Update the user's profile to reflect platform ownership status
-- This ensures the isPlatformOwner flag is set correctly
UPDATE public.profiles 
SET updated_at = now()
WHERE id = auth.uid();
