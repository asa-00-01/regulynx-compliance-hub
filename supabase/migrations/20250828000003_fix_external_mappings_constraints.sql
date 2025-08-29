-- Fix foreign key constraints for external mappings to work with organization_customers

-- Drop the existing foreign key constraint on external_customer_mappings
ALTER TABLE external_customer_mappings 
DROP CONSTRAINT IF EXISTS external_customer_mappings_internal_user_id_fkey;

-- Add a new foreign key constraint that references organization_customers instead of profiles
ALTER TABLE external_customer_mappings 
ADD CONSTRAINT external_customer_mappings_internal_user_id_fkey 
FOREIGN KEY (internal_user_id) REFERENCES organization_customers(id) ON DELETE CASCADE;

-- Add a unique constraint to prevent duplicate mappings
ALTER TABLE external_customer_mappings 
ADD CONSTRAINT external_customer_mappings_unique_client_external 
UNIQUE (client_id, external_customer_id);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_external_customer_mappings_internal_user_id 
ON external_customer_mappings(internal_user_id);

CREATE INDEX IF NOT EXISTS idx_external_transaction_mappings_client_external_customer 
ON external_transaction_mappings(client_id, external_customer_id);
