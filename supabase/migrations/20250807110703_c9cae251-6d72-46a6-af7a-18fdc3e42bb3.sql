
-- Add triggers for automatic timestamp updates on integration tables
-- Note: update_integration_timestamp function will be defined in a later migration

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_integration_configs_client_id ON integration_configs(client_id);
CREATE INDEX IF NOT EXISTS idx_integration_configs_status ON integration_configs(status);
CREATE INDEX IF NOT EXISTS idx_data_ingestion_logs_client_id ON data_ingestion_logs(client_id);
CREATE INDEX IF NOT EXISTS idx_data_ingestion_logs_created_at ON data_ingestion_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_external_customer_mappings_client_id ON external_customer_mappings(client_id);
CREATE INDEX IF NOT EXISTS idx_external_customer_mappings_external_id ON external_customer_mappings(external_customer_id);
CREATE INDEX IF NOT EXISTS idx_external_transaction_mappings_client_id ON external_transaction_mappings(client_id);
CREATE INDEX IF NOT EXISTS idx_external_transaction_mappings_external_id ON external_transaction_mappings(external_transaction_id);

-- Create a webhook notifications table for real-time updates
CREATE TABLE IF NOT EXISTS webhook_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  webhook_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  retry_count INTEGER NOT NULL DEFAULT 0,
  last_attempt_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  delivered_at TIMESTAMP WITH TIME ZONE
);

-- RLS for webhook notifications
ALTER TABLE webhook_notifications ENABLE ROW LEVEL SECURITY;

-- Note: RLS policy will be added in a later migration after get_user_role function is defined

-- Index for webhook notifications
CREATE INDEX IF NOT EXISTS idx_webhook_notifications_client_id ON webhook_notifications(client_id);
CREATE INDEX IF NOT EXISTS idx_webhook_notifications_status ON webhook_notifications(status);
CREATE INDEX IF NOT EXISTS idx_webhook_notifications_created_at ON webhook_notifications(created_at DESC);
