
-- Create enum types for platform and customer roles
CREATE TYPE platform_role AS ENUM ('platform_admin', 'platform_support');
CREATE TYPE customer_role AS ENUM ('customer_admin', 'customer_compliance', 'customer_executive', 'customer_support');

-- Create customers table
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT,
  settings JSONB DEFAULT '{}',
  subscription_tier TEXT NOT NULL DEFAULT 'basic',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on customers table
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Create policies for customers table
CREATE POLICY "Platform admins can manage customers" 
  ON public.customers 
  FOR ALL 
  USING (has_platform_role(auth.uid(), 'platform_admin'));

CREATE POLICY "Platform support can view customers" 
  ON public.customers 
  FOR SELECT 
  USING (has_platform_role(auth.uid(), 'platform_support'));

-- Update platform_roles table to use the new enum if not already done
-- (The table already exists, so we just need to ensure it uses the correct type)

-- Update user_roles table to use the new customer_role enum if not already done
-- (The table already exists, so we just need to ensure it uses the correct type)

-- Add customer_id to user_roles table to link customer roles to specific customers
ALTER TABLE public.user_roles ADD COLUMN customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE;

-- Create unique constraint to ensure one role per user per customer
ALTER TABLE public.user_roles ADD CONSTRAINT unique_user_customer_role UNIQUE (user_id, customer_id, role);

-- Update profiles table to include customer_id for linking users to customers
ALTER TABLE public.profiles ADD COLUMN customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL;

-- Create function to get user's customer roles
CREATE OR REPLACE FUNCTION public.get_user_customer_roles(_user_id UUID, _customer_id UUID DEFAULT NULL)
RETURNS customer_role[]
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT ARRAY_AGG(role::customer_role)
  FROM public.user_roles
  WHERE user_id = _user_id
    AND (_customer_id IS NULL OR customer_id = _customer_id)
    AND role::text IN ('customer_admin', 'customer_compliance', 'customer_executive', 'customer_support')
$$;

-- Create function to check if user has customer role
CREATE OR REPLACE FUNCTION public.has_customer_role(_user_id UUID, _role customer_role, _customer_id UUID DEFAULT NULL)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role::text = _role::text
      AND (_customer_id IS NULL OR customer_id = _customer_id)
  )
$$;

-- Update RLS policies for user_roles to handle customer context
DROP POLICY IF EXISTS "Platform admins can manage customer roles" ON public.user_roles;
CREATE POLICY "Platform admins can manage all roles" 
  ON public.user_roles 
  FOR ALL 
  USING (has_platform_role(auth.uid(), 'platform_admin'));

CREATE POLICY "Customer admins can manage customer roles" 
  ON public.user_roles 
  FOR ALL 
  USING (
    customer_id IS NOT NULL 
    AND has_customer_role(auth.uid(), 'customer_admin', customer_id)
  )
  WITH CHECK (
    customer_id IS NOT NULL 
    AND has_customer_role(auth.uid(), 'customer_admin', customer_id)
  );

-- Create trigger to update customers updated_at timestamp
CREATE OR REPLACE FUNCTION update_customers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION update_customers_updated_at();

-- Insert some initial customer data
INSERT INTO public.customers (name, domain, subscription_tier) VALUES
  ('Acme Corporation', 'acme.com', 'enterprise'),
  ('Beta Industries', 'beta.com', 'professional'),
  ('Gamma Tech', 'gamma.tech', 'basic')
ON CONFLICT DO NOTHING;
