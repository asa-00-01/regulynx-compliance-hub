-- Add RLS policies for integration tables after get_user_role function is defined

-- Create RLS policies for integration management (admin and compliance officers only)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'integration_configs' AND policyname = 'Integration management for authorized users') THEN
        CREATE POLICY "Integration management for authorized users" ON public.integration_configs
          FOR ALL USING (get_user_role(auth.uid()) IN ('admin', 'complianceOfficer'));
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'data_ingestion_logs' AND policyname = 'Data ingestion logs for authorized users') THEN
        CREATE POLICY "Data ingestion logs for authorized users" ON public.data_ingestion_logs
          FOR ALL USING (get_user_role(auth.uid()) IN ('admin', 'complianceOfficer'));
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'external_customer_mappings' AND policyname = 'Customer mappings for authorized users') THEN
        CREATE POLICY "Customer mappings for authorized users" ON public.external_customer_mappings
          FOR ALL USING (get_user_role(auth.uid()) IN ('admin', 'complianceOfficer'));
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'external_transaction_mappings' AND policyname = 'Transaction mappings for authorized users') THEN
        CREATE POLICY "Transaction mappings for authorized users" ON public.external_transaction_mappings
          FOR ALL USING (get_user_role(auth.uid()) IN ('admin', 'complianceOfficer'));
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'integration_api_keys' AND policyname = 'API keys for authorized users') THEN
        CREATE POLICY "API keys for authorized users" ON public.integration_api_keys
          FOR ALL USING (get_user_role(auth.uid()) IN ('admin', 'complianceOfficer'));
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'webhook_notifications' AND policyname = 'Webhook notifications for authorized users') THEN
        CREATE POLICY "Webhook notifications for authorized users" ON public.webhook_notifications
          FOR ALL USING (get_user_role(auth.uid()) IN ('admin', 'complianceOfficer'));
    END IF;
END $$;
