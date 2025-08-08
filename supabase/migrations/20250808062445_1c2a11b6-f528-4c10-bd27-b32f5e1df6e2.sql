
-- Create enums for the new role system
CREATE TYPE platform_role AS ENUM (
  'platform_admin',
  'platform_support'
);

CREATE TYPE customer_role AS ENUM (
  'customer_admin', 
  'customer_compliance',
  'customer_executive',
  'customer_support'
);

-- Create customers table for multi-tenancy
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain TEXT UNIQUE,
  settings JSONB DEFAULT '{}',
  subscription_tier TEXT DEFAULT 'basic',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create platform roles table (Platform Owners)
CREATE TABLE public.platform_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role platform_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Create customer user roles table (Platform Users)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
  role customer_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, customer_id, role)
);

-- Enable RLS on all new tables
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create helper functions for role checking (Security Definer to bypass RLS)
CREATE OR REPLACE FUNCTION public.has_platform_role(_user_id UUID, _role platform_role)
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

CREATE OR REPLACE FUNCTION public.has_customer_role(_user_id UUID, _role customer_role)
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

CREATE OR REPLACE FUNCTION public.is_platform_owner(_user_id UUID)
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

CREATE OR REPLACE FUNCTION public.get_user_customer_roles(_user_id UUID)
RETURNS customer_role[]
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT ARRAY_AGG(role)
  FROM public.user_roles
  WHERE user_id = _user_id
$$;

CREATE OR REPLACE FUNCTION public.get_user_platform_roles(_user_id UUID)
RETURNS platform_role[]
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT ARRAY_AGG(role)
  FROM public.platform_roles
  WHERE user_id = _user_id
$$;

-- RLS Policies for customers table
CREATE POLICY "Platform admins can manage all customers"
  ON public.customers
  FOR ALL
  TO authenticated
  USING (public.has_platform_role(auth.uid(), 'platform_admin'))
  WITH CHECK (public.has_platform_role(auth.uid(), 'platform_admin'));

CREATE POLICY "Customer users can view their customer"
  ON public.customers
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT customer_id 
      FROM public.user_roles 
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for platform_roles table
CREATE POLICY "Platform admins can manage platform roles"
  ON public.platform_roles
  FOR ALL
  TO authenticated
  USING (public.has_platform_role(auth.uid(), 'platform_admin'))
  WITH CHECK (public.has_platform_role(auth.uid(), 'platform_admin'));

CREATE POLICY "Users can view their own platform roles"
  ON public.platform_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for user_roles table
CREATE POLICY "Platform owners can manage all user roles"
  ON public.user_roles
  FOR ALL
  TO authenticated
  USING (public.is_platform_owner(auth.uid()))
  WITH CHECK (public.is_platform_owner(auth.uid()));

CREATE POLICY "Customer admins can manage roles in their organization"
  ON public.user_roles
  FOR ALL
  TO authenticated
  USING (
    customer_id IN (
      SELECT customer_id 
      FROM public.user_roles 
      WHERE user_id = auth.uid() 
        AND role = 'customer_admin'
    )
  )
  WITH CHECK (
    customer_id IN (
      SELECT customer_id 
      FROM public.user_roles 
      WHERE user_id = auth.uid() 
        AND role = 'customer_admin'
    )
  );

CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Update profiles table to include customer_id for multi-tenancy
ALTER TABLE public.profiles 
ADD COLUMN customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL;

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
