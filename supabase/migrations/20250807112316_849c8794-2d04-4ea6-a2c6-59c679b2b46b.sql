-- Create enum for SaaS customer roles
CREATE TYPE public.customer_role AS ENUM ('compliance_officer', 'executive', 'analyst', 'support');

-- Create enum for platform owner roles  
CREATE TYPE public.platform_role AS ENUM ('platform_admin', 'developer', 'system_admin');

-- Create user_roles table for SaaS customers
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role customer_role NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Create platform_roles table for platform owners
CREATE TABLE public.platform_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role platform_role NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check customer roles
CREATE OR REPLACE FUNCTION public.has_customer_role(_user_id UUID, _role customer_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Security definer function to check platform roles
CREATE OR REPLACE FUNCTION public.has_platform_role(_user_id UUID, _role platform_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.platform_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to check if user is platform owner (any platform role)
CREATE OR REPLACE FUNCTION public.is_platform_owner(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.platform_roles
    WHERE user_id = _user_id
  )
$$;

-- Function to get user's customer roles
CREATE OR REPLACE FUNCTION public.get_user_customer_roles(_user_id UUID)
RETURNS customer_role[]
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT ARRAY_AGG(role)
  FROM public.user_roles
  WHERE user_id = _user_id
$$;

-- Function to get user's platform roles
CREATE OR REPLACE FUNCTION public.get_user_platform_roles(_user_id UUID)
RETURNS platform_role[]
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT ARRAY_AGG(role)
  FROM public.platform_roles
  WHERE user_id = _user_id
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own customer roles"
ON public.user_roles
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Platform admins can manage customer roles"
ON public.user_roles
FOR ALL
USING (has_platform_role(auth.uid(), 'platform_admin'));

-- RLS Policies for platform_roles
CREATE POLICY "Users can view their own platform roles"
ON public.platform_roles
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Platform admins can manage platform roles"
ON public.platform_roles
FOR ALL
USING (has_platform_role(auth.uid(), 'platform_admin'));

-- Trigger function to create default customer role
CREATE OR REPLACE FUNCTION public.assign_default_customer_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only assign default role if no platform role exists
  IF NOT EXISTS (SELECT 1 FROM public.platform_roles WHERE user_id = NEW.id) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'support')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger to assign default role on user creation
CREATE TRIGGER assign_default_customer_role_trigger
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.assign_default_customer_role();