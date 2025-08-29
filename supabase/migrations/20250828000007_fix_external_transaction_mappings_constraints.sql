-- Fix missing unique constraint on external_transaction_mappings

-- Add unique constraint for external_transaction_mappings
ALTER TABLE external_transaction_mappings 
ADD CONSTRAINT external_transaction_mappings_unique_client_external 
UNIQUE (client_id, external_transaction_id);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_external_transaction_mappings_client_external 
ON external_transaction_mappings(client_id, external_transaction_id);
