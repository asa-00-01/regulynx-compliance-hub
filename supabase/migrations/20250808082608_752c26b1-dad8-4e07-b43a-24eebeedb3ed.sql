
-- Create a dedicated table for organization's customers (end-users/subjects of compliance monitoring)
CREATE TABLE public.organization_customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
  external_customer_id TEXT, -- Customer's internal ID for this person
  full_name TEXT NOT NULL,
  email TEXT,
  date_of_birth DATE,
  nationality TEXT,
  identity_number TEXT,
  phone_number TEXT,
  address TEXT,
  country_of_residence TEXT,
  risk_score INTEGER NOT NULL DEFAULT 0,
  is_pep BOOLEAN NOT NULL DEFAULT FALSE,
  is_sanctioned BOOLEAN NOT NULL DEFAULT FALSE,
  kyc_status TEXT NOT NULL DEFAULT 'pending' CHECK (kyc_status IN ('verified', 'pending', 'rejected', 'information_requested')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id),
  
  -- Ensure uniqueness within a customer organization
  UNIQUE(customer_id, external_customer_id)
);

-- Enable RLS for organization customers
ALTER TABLE public.organization_customers ENABLE ROW LEVEL SECURITY;

-- Create policies for organization customers
CREATE POLICY "Customer users can manage their organization's customers"
  ON public.organization_customers
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.profiles p ON p.id = ur.user_id
      WHERE ur.user_id = auth.uid() 
      AND ur.customer_id = organization_customers.customer_id
      AND ur.role IN ('customer_admin', 'customer_compliance', 'customer_support')
    )
  );

-- Platform admins can view all organization customers
CREATE POLICY "Platform admins can view all organization customers"
  ON public.organization_customers
  FOR SELECT
  USING (has_platform_role(auth.uid(), 'platform_admin'));

-- Update existing tables to reference organization customers instead of profiles
-- First, add organization_customer_id to relevant tables

-- Update compliance_cases to reference organization customers
ALTER TABLE public.compliance_cases 
ADD COLUMN organization_customer_id UUID REFERENCES public.organization_customers(id),
ADD COLUMN customer_id UUID REFERENCES public.customers(id);

-- Update documents to reference organization customers
ALTER TABLE public.documents 
ADD COLUMN organization_customer_id UUID REFERENCES public.organization_customers(id),
ADD COLUMN customer_id UUID REFERENCES public.customers(id);

-- Create AML transactions table for organization customers
CREATE TABLE public.aml_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_customer_id UUID REFERENCES public.organization_customers(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
  external_transaction_id TEXT NOT NULL,
  from_account TEXT NOT NULL,
  to_account TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  transaction_date TIMESTAMP WITH TIME ZONE NOT NULL,
  transaction_type TEXT NOT NULL,
  description TEXT,
  risk_score INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('completed', 'pending', 'failed', 'flagged')),
  flags JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(customer_id, external_transaction_id)
);

-- Enable RLS for AML transactions
ALTER TABLE public.aml_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for AML transactions
CREATE POLICY "Customer users can manage their organization's transactions"
  ON public.aml_transactions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() 
      AND ur.customer_id = aml_transactions.customer_id
      AND ur.role IN ('customer_admin', 'customer_compliance', 'customer_support')
    )
  );

-- Platform admins can view all transactions
CREATE POLICY "Platform admins can view all transactions"
  ON public.aml_transactions
  FOR SELECT
  USING (has_platform_role(auth.uid(), 'platform_admin'));

-- Update triggers for timestamps
CREATE TRIGGER update_organization_customers_updated_at
  BEFORE UPDATE ON public.organization_customers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER update_aml_transactions_updated_at
  BEFORE UPDATE ON public.aml_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_timestamp();

-- Create indexes for performance
CREATE INDEX idx_organization_customers_customer_id ON public.organization_customers(customer_id);
CREATE INDEX idx_organization_customers_kyc_status ON public.organization_customers(kyc_status);
CREATE INDEX idx_organization_customers_risk_score ON public.organization_customers(risk_score);
CREATE INDEX idx_aml_transactions_customer_id ON public.aml_transactions(customer_id);
CREATE INDEX idx_aml_transactions_organization_customer_id ON public.aml_transactions(organization_customer_id);
CREATE INDEX idx_aml_transactions_date ON public.aml_transactions(transaction_date);
