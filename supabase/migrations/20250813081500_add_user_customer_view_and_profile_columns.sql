-- Add missing columns to profiles table for better customer relationship
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS customer_name text,
ADD COLUMN IF NOT EXISTS customer_domain text;

-- Create a view to easily get user with customer data
CREATE OR REPLACE VIEW public.user_with_customer AS
SELECT 
  p.*,
  c.name as customer_name,
  c.domain as customer_domain,
  c.subscription_tier,
  c.settings as customer_settings
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.id = ur.user_id
LEFT JOIN public.customers c ON ur.customer_id = c.id;

-- Create function to get current user with customer data
CREATE OR REPLACE FUNCTION public.get_current_user_with_customer()
RETURNS TABLE(
  id uuid,
  name text,
  email text,
  role user_role,
  customer_id uuid,
  customer_name text,
  customer_domain text,
  subscription_tier text
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    p.id,
    p.name,
    p.email,
    p.role,
    ur.customer_id,
    c.name as customer_name,
    c.domain as customer_domain,
    c.subscription_tier
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON p.id = ur.user_id
  LEFT JOIN public.customers c ON ur.customer_id = c.id
  WHERE p.id = auth.uid();
$$;

-- Update the handle_new_user function to assign default customer role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    CASE
      WHEN NEW.raw_user_meta_data->>'role' = 'complianceOfficer' THEN 'complianceOfficer'::user_role
      WHEN NEW.raw_user_meta_data->>'role' = 'admin' THEN 'admin'::user_role
      WHEN NEW.raw_user_meta_data->>'role' = 'executive' THEN 'executive'::user_role
      WHEN NEW.raw_user_meta_data->>'role' = 'support' THEN 'support'::user_role
      ELSE 'support'::user_role
    END
  );
  
  -- If customer_id is provided in metadata, assign customer role
  IF NEW.raw_user_meta_data->>'customer_id' IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, customer_id, role)
    VALUES (
      NEW.id, 
      (NEW.raw_user_meta_data->>'customer_id')::uuid,
      COALESCE(
        (NEW.raw_user_meta_data->>'customer_role')::customer_role,
        'customer_support'::customer_role
      )
    )
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Add RLS policy for the user_with_customer view
CREATE POLICY "Users can view their own customer data" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Ensure proper unique constraint on user_roles
ALTER TABLE public.user_roles 
DROP CONSTRAINT IF EXISTS user_roles_user_id_role_key;

ALTER TABLE public.user_roles 
ADD CONSTRAINT user_roles_user_id_customer_id_role_unique 
UNIQUE (user_id, customer_id, role);


