
-- Create the customers table for the platform role system
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT,
  settings JSONB NOT NULL DEFAULT '{}',
  subscription_tier TEXT NOT NULL DEFAULT 'basic',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Create policies for customers table
CREATE POLICY "Platform admins can manage customers"
ON public.customers
FOR ALL
USING (has_platform_role(auth.uid(), 'platform_admin'::platform_role));

-- Add customer_id column to profiles table to link users to customers
ALTER TABLE public.profiles 
ADD COLUMN customer_id UUID REFERENCES public.customers(id);

-- Update the user_roles table to include customer_id reference
ALTER TABLE public.user_roles 
ADD COLUMN customer_id UUID REFERENCES public.customers(id);

-- Create trigger to update timestamps
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
