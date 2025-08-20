-- Add profiles table alterations and data migration after the profiles table is created

-- Update profiles table to include customer_id for multi-tenancy (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'customer_id') THEN
        ALTER TABLE public.profiles 
        ADD COLUMN customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Create trigger to assign default customer role when profile is created
CREATE OR REPLACE FUNCTION public.assign_default_customer_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only assign default role if no platform role exists
  IF NOT EXISTS (SELECT 1 FROM public.platform_roles WHERE user_id = NEW.id) THEN
    INSERT INTO public.user_roles (user_id, customer_id, role)
    VALUES (NEW.id, NEW.customer_id, 'customer_support')
    ON CONFLICT (user_id, customer_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER assign_default_customer_role_trigger
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_default_customer_role();

-- Create a default customer for existing data migration
INSERT INTO public.customers (id, name, domain, subscription_tier)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Default Customer',
  'default.regulynx.com',
  'enterprise'
) ON CONFLICT DO NOTHING;

-- Migrate existing users to the new role system
-- First, assign all existing admin users as platform admins
INSERT INTO public.platform_roles (user_id, role)
SELECT id, 'platform_admin'::platform_role
FROM public.profiles
WHERE role = 'admin'
ON CONFLICT DO NOTHING;

-- Then assign customer roles based on existing roles
INSERT INTO public.user_roles (user_id, customer_id, role)
SELECT 
  p.id,
  '00000000-0000-0000-0000-000000000001'::UUID,
  CASE 
    WHEN p.role = 'complianceOfficer' THEN 'customer_compliance'::customer_role
    WHEN p.role = 'executive' THEN 'customer_executive'::customer_role
    WHEN p.role = 'support' THEN 'customer_support'::customer_role
    WHEN p.role = 'admin' THEN 'customer_admin'::customer_role
    ELSE 'customer_support'::customer_role
  END
FROM public.profiles p
ON CONFLICT DO NOTHING;

-- Update existing profiles to belong to default customer
UPDATE public.profiles 
SET customer_id = '00000000-0000-0000-0000-000000000001'
WHERE customer_id IS NULL;
