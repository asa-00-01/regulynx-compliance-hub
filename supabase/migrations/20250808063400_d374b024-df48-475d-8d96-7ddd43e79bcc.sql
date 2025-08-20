-- Note: profiles table alteration will be moved to a later migration after the profiles table is created

-- Create customers table
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT,
  settings JSONB DEFAULT '{}',
  subscription_tier TEXT DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on customers table
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Create policy for customers table (platform admins can access all customers)
CREATE POLICY "Platform admins can access customers" 
  ON public.customers 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.platform_roles 
      WHERE user_id = auth.uid() AND role = 'platform_admin'
    )
  );

-- Note: Case status, case type, case source, and user role enum updates will be moved to a later migration after the relevant tables are created
