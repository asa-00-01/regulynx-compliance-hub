-- Add flexible transaction support for different financial institutions
-- This migration creates a new flexible_transactions table that can handle
-- different transaction structures for remittance, banks, payment providers, etc.

-- Create enum for financial institution types
CREATE TYPE public.financial_institution_type AS ENUM (
  'remittance',
  'bank', 
  'payment_service_provider',
  'crypto_exchange',
  'fintech',
  'money_service_business',
  'credit_union',
  'investment_firm'
);

-- Create flexible transactions table
CREATE TABLE public.flexible_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_transaction_id TEXT NOT NULL,
  organization_customer_id UUID NOT NULL REFERENCES public.organization_customers(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  institution_type financial_institution_type NOT NULL,
  
  -- Base transaction fields (common to all types)
  amount NUMERIC(15,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  transaction_date TIMESTAMPTZ NOT NULL,
  risk_score INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'flagged', 'completed', 'failed')),
  flags JSONB DEFAULT '[]'::jsonb,
  
  -- Institution-specific data stored as JSONB
  institution_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Constraints
  UNIQUE(customer_id, external_transaction_id),
  CONSTRAINT valid_institution_data CHECK (
    CASE institution_type
      WHEN 'remittance' THEN 
        institution_data ? 'sender_name' AND 
        institution_data ? 'receiver_name' AND
        institution_data ? 'exchange_rate'
      WHEN 'bank' THEN 
        institution_data ? 'from_account' AND 
        institution_data ? 'to_account' AND
        institution_data ? 'transaction_type'
      WHEN 'payment_service_provider' THEN 
        institution_data ? 'merchant_id' AND 
        institution_data ? 'customer_id' AND
        institution_data ? 'payment_method'
      WHEN 'crypto_exchange' THEN 
        institution_data ? 'from_currency' AND 
        institution_data ? 'to_currency' AND
        institution_data ? 'blockchain_network'
      WHEN 'fintech' THEN 
        institution_data ? 'app_user_id' AND 
        institution_data ? 'transaction_category'
      ELSE true
    END
  )
);

-- Create institution configurations table
CREATE TABLE public.institution_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  institution_type financial_institution_type NOT NULL,
  institution_name TEXT NOT NULL,
  supported_currencies TEXT[] NOT NULL DEFAULT ARRAY['USD'],
  supported_countries TEXT[] NOT NULL DEFAULT ARRAY['US'],
  
  -- Configuration data
  transaction_schema JSONB NOT NULL DEFAULT '{}'::jsonb,
  risk_rules JSONB NOT NULL DEFAULT '[]'::jsonb,
  compliance_requirements JSONB NOT NULL DEFAULT '[]'::jsonb,
  custom_fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Settings
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(customer_id, institution_type)
);

-- Create transaction adapters table for mapping external formats
CREATE TABLE public.transaction_adapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  adapter_name TEXT NOT NULL,
  institution_type financial_institution_type NOT NULL,
  
  -- Adapter configuration
  source_format TEXT NOT NULL, -- 'csv', 'json', 'xml', 'api'
  field_mappings JSONB NOT NULL DEFAULT '{}'::jsonb,
  transformation_rules JSONB NOT NULL DEFAULT '[]'::jsonb,
  validation_rules JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Settings
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(customer_id, adapter_name)
);

-- Create indexes for performance
CREATE INDEX idx_flexible_transactions_customer_id ON public.flexible_transactions(customer_id);
CREATE INDEX idx_flexible_transactions_organization_customer_id ON public.flexible_transactions(organization_customer_id);
CREATE INDEX idx_flexible_transactions_institution_type ON public.flexible_transactions(institution_type);
CREATE INDEX idx_flexible_transactions_date ON public.flexible_transactions(transaction_date);
CREATE INDEX idx_flexible_transactions_status ON public.flexible_transactions(status);
CREATE INDEX idx_flexible_transactions_risk_score ON public.flexible_transactions(risk_score);
CREATE INDEX idx_flexible_transactions_institution_data ON public.flexible_transactions USING GIN (institution_data);

-- Create indexes for institution configs
CREATE INDEX idx_institution_configs_customer_id ON public.institution_configs(customer_id);
CREATE INDEX idx_institution_configs_type ON public.institution_configs(institution_type);

-- Create indexes for transaction adapters
CREATE INDEX idx_transaction_adapters_customer_id ON public.transaction_adapters(customer_id);
CREATE INDEX idx_transaction_adapters_type ON public.transaction_adapters(institution_type);

-- Enable RLS
ALTER TABLE public.flexible_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_adapters ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for flexible_transactions
CREATE POLICY "Users can view flexible transactions in their organization" ON public.flexible_transactions
  FOR SELECT USING (
    customer_id IN (
      SELECT customer_id FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('customer_admin', 'customer_compliance', 'customer_support')
    )
  );

CREATE POLICY "Users can insert flexible transactions in their organization" ON public.flexible_transactions
  FOR INSERT WITH CHECK (
    customer_id IN (
      SELECT customer_id FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('customer_admin', 'customer_compliance', 'customer_support')
    )
  );

CREATE POLICY "Users can update flexible transactions in their organization" ON public.flexible_transactions
  FOR UPDATE USING (
    customer_id IN (
      SELECT customer_id FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('customer_admin', 'customer_compliance', 'customer_support')
    )
  );

CREATE POLICY "Users can delete flexible transactions in their organization" ON public.flexible_transactions
  FOR DELETE USING (
    customer_id IN (
      SELECT customer_id FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('customer_admin', 'customer_compliance', 'customer_support')
    )
  );

-- Create RLS policies for institution_configs
CREATE POLICY "Users can manage institution configs in their organization" ON public.institution_configs
  FOR ALL USING (
    customer_id IN (
      SELECT customer_id FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('customer_admin', 'customer_compliance', 'customer_support')
    )
  );

-- Create RLS policies for transaction_adapters
CREATE POLICY "Users can manage transaction adapters in their organization" ON public.transaction_adapters
  FOR ALL USING (
    customer_id IN (
      SELECT customer_id FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('customer_admin', 'customer_compliance', 'customer_support')
    )
  );

-- Create triggers for updated_at
CREATE TRIGGER update_flexible_transactions_updated_at
  BEFORE UPDATE ON public.flexible_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER update_institution_configs_updated_at
  BEFORE UPDATE ON public.institution_configs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER update_transaction_adapters_updated_at
  BEFORE UPDATE ON public.transaction_adapters
  FOR EACH ROW
  EXECUTE FUNCTION public.update_timestamp();

-- Create functions for flexible transaction operations

-- Function to validate institution data based on type
CREATE OR REPLACE FUNCTION validate_institution_data(
  p_institution_type financial_institution_type,
  p_institution_data JSONB
) RETURNS BOOLEAN AS $$
BEGIN
  CASE p_institution_type
    WHEN 'remittance' THEN
      RETURN p_institution_data ? 'sender_name' AND 
             p_institution_data ? 'receiver_name' AND
             p_institution_data ? 'exchange_rate';
    WHEN 'bank' THEN
      RETURN p_institution_data ? 'from_account' AND 
             p_institution_data ? 'to_account' AND
             p_institution_data ? 'transaction_type';
    WHEN 'payment_service_provider' THEN
      RETURN p_institution_data ? 'merchant_id' AND 
             p_institution_data ? 'customer_id' AND
             p_institution_data ? 'payment_method';
    WHEN 'crypto_exchange' THEN
      RETURN p_institution_data ? 'from_currency' AND 
             p_institution_data ? 'to_currency' AND
             p_institution_data ? 'blockchain_network';
    WHEN 'fintech' THEN
      RETURN p_institution_data ? 'app_user_id' AND 
             p_institution_data ? 'transaction_category';
    ELSE
      RETURN true;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate risk score based on institution type and data
CREATE OR REPLACE FUNCTION calculate_transaction_risk_score(
  p_institution_type financial_institution_type,
  p_institution_data JSONB,
  p_amount NUMERIC,
  p_currency TEXT
) RETURNS INTEGER AS $$
DECLARE
  base_risk INTEGER := 0;
  risk_adjustment INTEGER := 0;
BEGIN
  -- Base risk based on amount
  IF p_amount > 10000 THEN
    base_risk := base_risk + 20;
  ELSIF p_amount > 5000 THEN
    base_risk := base_risk + 10;
  END IF;
  
  -- Institution-specific risk calculations
  CASE p_institution_type
    WHEN 'remittance' THEN
      -- High risk for international remittances
      IF (p_institution_data->>'sender_country') != (p_institution_data->>'receiver_country') THEN
        risk_adjustment := risk_adjustment + 30;
      END IF;
      
      -- Risk for cash pickup
      IF p_institution_data->>'payment_method' = 'cash_pickup' THEN
        risk_adjustment := risk_adjustment + 15;
      END IF;
      
    WHEN 'crypto_exchange' THEN
      -- High risk for external wallet transfers
      IF p_institution_data->>'from_wallet_type' = 'external' OR 
         p_institution_data->>'to_wallet_type' = 'external' THEN
        risk_adjustment := risk_adjustment + 40;
      END IF;
      
      -- Risk for high-value crypto transactions
      IF p_amount > 50000 THEN
        risk_adjustment := risk_adjustment + 25;
      END IF;
      
    WHEN 'payment_service_provider' THEN
      -- Risk for high fraud score
      IF (p_institution_data->>'fraud_score')::INTEGER > 80 THEN
        risk_adjustment := risk_adjustment + 35;
      END IF;
      
      -- Risk for international transactions
      IF p_institution_data->>'merchant_country' != 'US' THEN
        risk_adjustment := risk_adjustment + 20;
      END IF;
      
    ELSE
      -- Default risk calculation for other types
      risk_adjustment := 0;
  END CASE;
  
  RETURN LEAST(100, GREATEST(0, base_risk + risk_adjustment));
END;
$$ LANGUAGE plpgsql;

-- Function to generate transaction flags based on institution type and data
CREATE OR REPLACE FUNCTION generate_transaction_flags(
  p_institution_type financial_institution_type,
  p_institution_data JSONB,
  p_risk_score INTEGER
) RETURNS JSONB AS $$
DECLARE
  flags JSONB := '[]'::jsonb;
BEGIN
  -- Add risk-based flags
  IF p_risk_score >= 80 THEN
    flags := flags || '"high_risk"'::jsonb;
    flags := flags || '"suspicious_pattern"'::jsonb;
  ELSIF p_risk_score >= 60 THEN
    flags := flags || '"medium_risk"'::jsonb;
    flags := flags || '"unusual_frequency"'::jsonb;
  END IF;
  
  -- Institution-specific flags
  CASE p_institution_type
    WHEN 'remittance' THEN
      IF (p_institution_data->>'sender_country') != (p_institution_data->>'receiver_country') THEN
        flags := flags || '"international_transfer"'::jsonb;
      END IF;
      IF p_institution_data->>'payment_method' = 'cash_pickup' THEN
        flags := flags || '"cash_pickup"'::jsonb;
      END IF;
      
    WHEN 'crypto_exchange' THEN
      IF p_institution_data->>'from_wallet_type' = 'external' OR 
         p_institution_data->>'to_wallet_type' = 'external' THEN
        flags := flags || '"external_wallet"'::jsonb;
      END IF;
      IF p_institution_data->>'kyc_level' = 'none' THEN
        flags := flags || '"no_kyc"'::jsonb;
      END IF;
      
    WHEN 'payment_service_provider' THEN
      IF (p_institution_data->>'fraud_score')::INTEGER > 80 THEN
        flags := flags || '"high_fraud_score"'::jsonb;
      END IF;
      IF p_institution_data->>'avs_result' = 'N' THEN
        flags := flags || '"avs_mismatch"'::jsonb;
      END IF;
      
    ELSE
      -- Default flags for other types
      NULL;
  END CASE;
  
  RETURN flags;
END;
$$ LANGUAGE plpgsql;

-- Insert sample institution configurations
INSERT INTO public.institution_configs (
  customer_id,
  institution_type,
  institution_name,
  supported_currencies,
  supported_countries,
  transaction_schema,
  risk_rules,
  compliance_requirements,
  custom_fields
) VALUES 
-- Remittance business configuration
(
  (SELECT id FROM public.customers WHERE name = 'Test Organization' LIMIT 1),
  'remittance',
  'Global Remittance Services',
  ARRAY['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'SEK'],
  ARRAY['US', 'UK', 'CA', 'AU', 'JP', 'CH', 'SE', 'DE', 'FR', 'MX', 'BR', 'IN'],
  '{
    "required_fields": ["sender_name", "sender_phone", "receiver_name", "receiver_phone", "exchange_rate"],
    "optional_fields": ["pickup_location", "pickup_code", "agent_id"]
  }'::jsonb,
  '[
    {
      "id": "remittance_high_value",
      "name": "High Value Remittance",
      "description": "Flag transactions over $10,000",
      "conditions": [{"field": "amount", "operator": "greater_than", "value": 10000}],
      "risk_score_adjustment": 20,
      "flags": ["high_value", "ctr_required"],
      "enabled": true
    },
    {
      "id": "remittance_international",
      "name": "International Remittance",
      "description": "Flag cross-border transactions",
      "conditions": [{"field": "sender_country", "operator": "not_equals", "value": "receiver_country"}],
      "risk_score_adjustment": 15,
      "flags": ["international", "enhanced_due_diligence"],
      "enabled": true
    }
  ]'::jsonb,
  '[
    {
      "id": "ctr_reporting",
      "name": "Currency Transaction Reporting",
      "description": "Report transactions over $10,000",
      "required_fields": ["sender_name", "sender_id_number", "receiver_name", "amount"],
      "validation_rules": [],
      "reporting_requirements": [
        {
          "report_type": "ctr",
          "threshold_amount": 10000,
          "frequency": "immediate",
          "fields_to_report": ["sender_name", "sender_id_number", "receiver_name", "amount", "transaction_date"]
        }
      ]
    }
  ]'::jsonb,
  '[
    {
      "id": "purpose_of_remittance",
      "name": "purpose_of_remittance",
      "display_name": "Purpose of Remittance",
      "field_type": "select",
      "required": true,
      "options": ["family_support", "education", "medical", "business", "investment", "other"],
      "help_text": "Select the primary purpose of this remittance"
    },
    {
      "id": "source_of_funds",
      "name": "source_of_funds",
      "display_name": "Source of Funds",
      "field_type": "select",
      "required": true,
      "options": ["salary", "business_income", "investment", "gift", "loan", "other"],
      "help_text": "Select the source of funds for this transaction"
    }
  ]'::jsonb
),
-- Bank configuration
(
  (SELECT id FROM public.customers WHERE name = 'Test Organization' LIMIT 1),
  'bank',
  'Community Bank',
  ARRAY['USD'],
  ARRAY['US'],
  '{
    "required_fields": ["from_account", "to_account", "transaction_type"],
    "optional_fields": ["reference_number", "batch_id", "clearing_house"]
  }'::jsonb,
  '[
    {
      "id": "bank_wire_transfer",
      "name": "Wire Transfer Monitoring",
      "description": "Monitor wire transfers for suspicious activity",
      "conditions": [{"field": "transaction_type", "operator": "equals", "value": "wire_transfer"}],
      "risk_score_adjustment": 10,
      "flags": ["wire_transfer", "enhanced_monitoring"],
      "enabled": true
    }
  ]'::jsonb,
  '[
    {
      "id": "wire_transfer_reporting",
      "name": "Wire Transfer Reporting",
      "description": "Report wire transfers over $3,000",
      "required_fields": ["from_account", "to_account", "amount", "transaction_type"],
      "validation_rules": [],
      "reporting_requirements": [
        {
          "report_type": "str",
          "threshold_amount": 3000,
          "frequency": "immediate",
          "fields_to_report": ["from_account", "to_account", "amount", "transaction_date"]
        }
      ]
    }
  ]'::jsonb,
  '[]'::jsonb
);

-- Add comments
COMMENT ON TABLE public.flexible_transactions IS 'Flexible transaction table supporting different financial institution types';
COMMENT ON TABLE public.institution_configs IS 'Configuration for different financial institution types';
COMMENT ON TABLE public.transaction_adapters IS 'Adapters for converting external transaction formats';
COMMENT ON COLUMN public.flexible_transactions.institution_data IS 'JSONB field containing institution-specific transaction data';
COMMENT ON COLUMN public.flexible_transactions.institution_type IS 'Type of financial institution (remittance, bank, etc.)';
