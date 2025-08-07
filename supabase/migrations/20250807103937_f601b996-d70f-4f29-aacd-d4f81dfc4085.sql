
-- Create integration management tables
CREATE TABLE public.integration_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id TEXT NOT NULL UNIQUE,
  client_name TEXT NOT NULL,
  integration_type TEXT NOT NULL CHECK (integration_type IN ('api_realtime', 'batch_processing', 'hybrid')),
  api_key_hash TEXT,
  webhook_url TEXT,
  batch_frequency TEXT,
  data_mapping JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create data ingestion log table
CREATE TABLE public.data_ingestion_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES public.integration_configs(client_id),
  ingestion_type TEXT NOT NULL CHECK (ingestion_type IN ('customer', 'transaction', 'document')),
  record_count INTEGER NOT NULL DEFAULT 0,
  success_count INTEGER NOT NULL DEFAULT 0,
  error_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('processing', 'completed', 'failed', 'partial')),
  error_details JSONB,
  processing_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create external customer mapping table
CREATE TABLE public.external_customer_mappings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES public.integration_configs(client_id),
  external_customer_id TEXT NOT NULL,
  internal_user_id UUID NOT NULL,
  customer_data JSONB NOT NULL,
  sync_status TEXT NOT NULL DEFAULT 'synced' CHECK (sync_status IN ('synced', 'pending', 'error')),
  last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(client_id, external_customer_id)
);

-- Create external transaction mappings table
CREATE TABLE public.external_transaction_mappings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES public.integration_configs(client_id),
  external_transaction_id TEXT NOT NULL,
  external_customer_id TEXT NOT NULL,
  transaction_data JSONB NOT NULL,
  risk_assessment JSONB,
  compliance_status TEXT DEFAULT 'pending' CHECK (compliance_status IN ('pending', 'approved', 'flagged', 'requires_review')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(client_id, external_transaction_id)
);

-- Create integration API keys table
CREATE TABLE public.integration_api_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES public.integration_configs(client_id),
  key_name TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  permissions JSONB NOT NULL DEFAULT '[]',
  expires_at TIMESTAMP WITH TIME ZONE,
  last_used_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.integration_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_ingestion_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_customer_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_transaction_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_api_keys ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for integration management (admin and compliance officers only)
CREATE POLICY "Integration management for authorized users" ON public.integration_configs
  FOR ALL USING (get_user_role(auth.uid()) IN ('admin', 'complianceOfficer'));

CREATE POLICY "Data ingestion logs for authorized users" ON public.data_ingestion_logs
  FOR ALL USING (get_user_role(auth.uid()) IN ('admin', 'complianceOfficer'));

CREATE POLICY "Customer mappings for authorized users" ON public.external_customer_mappings
  FOR ALL USING (get_user_role(auth.uid()) IN ('admin', 'complianceOfficer'));

CREATE POLICY "Transaction mappings for authorized users" ON public.external_transaction_mappings
  FOR ALL USING (get_user_role(auth.uid()) IN ('admin', 'complianceOfficer'));

CREATE POLICY "API keys for authorized users" ON public.integration_api_keys
  FOR ALL USING (get_user_role(auth.uid()) IN ('admin', 'complianceOfficer'));

-- Create indexes for performance
CREATE INDEX idx_integration_configs_client_id ON public.integration_configs(client_id);
CREATE INDEX idx_data_ingestion_logs_client_id ON public.data_ingestion_logs(client_id);
CREATE INDEX idx_external_customer_mappings_client_external ON public.external_customer_mappings(client_id, external_customer_id);
CREATE INDEX idx_external_transaction_mappings_client_external ON public.external_transaction_mappings(client_id, external_transaction_id);
CREATE INDEX idx_integration_api_keys_client_id ON public.integration_api_keys(client_id);

-- Create trigger for updating timestamps
CREATE OR REPLACE FUNCTION update_integration_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_integration_configs_timestamp
  BEFORE UPDATE ON public.integration_configs
  FOR EACH ROW EXECUTE FUNCTION update_integration_timestamp();
