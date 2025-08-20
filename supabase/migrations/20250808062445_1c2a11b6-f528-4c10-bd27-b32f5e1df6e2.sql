
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

-- Note: profiles table alteration, trigger, and data migration will be moved to a later migration after the profiles table is created
