-- Add missing unique constraints for ON CONFLICT clauses
-- This migration adds the unique constraints that are referenced in the test data migration

-- 1. Add unique constraint on subscription_plans.plan_id
ALTER TABLE public.subscription_plans 
ADD CONSTRAINT subscription_plans_plan_id_unique UNIQUE (plan_id);

-- 2. Add unique constraint on subscribers.email (if not already exists)
-- Check if the constraint already exists first
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'subscribers_email_unique' 
        AND conrelid = 'public.subscribers'::regclass
    ) THEN
        ALTER TABLE public.subscribers 
        ADD CONSTRAINT subscribers_email_unique UNIQUE (email);
    END IF;
END $$;

-- 3. Add unique constraint on integration_configs.client_id
ALTER TABLE public.integration_configs 
ADD CONSTRAINT integration_configs_client_id_unique UNIQUE (client_id);

-- 4. Add unique constraint on integration_api_keys.key_hash
ALTER TABLE public.integration_api_keys 
ADD CONSTRAINT integration_api_keys_key_hash_unique UNIQUE (key_hash);

-- 5. Add unique constraint on rules.rule_id
ALTER TABLE public.rules 
ADD CONSTRAINT rules_rule_id_unique UNIQUE (rule_id);

-- 6. Add unique constraint on webhook_notifications (id is already primary key, but ensure it's unique)
-- This is already handled by the primary key constraint

-- 7. Add unique constraint on external_customer_mappings (client_id, external_customer_id)
ALTER TABLE public.external_customer_mappings 
ADD CONSTRAINT external_customer_mappings_client_external_unique UNIQUE (client_id, external_customer_id);

-- 8. Add unique constraint on external_transaction_mappings.external_transaction_id
ALTER TABLE public.external_transaction_mappings 
ADD CONSTRAINT external_transaction_mappings_external_id_unique UNIQUE (external_transaction_id);

-- 9. Add unique constraint on data_ingestion_logs (id is already primary key)
-- This is already handled by the primary key constraint

-- 10. Add unique constraint on error_logs.error_id
ALTER TABLE public.error_logs 
ADD CONSTRAINT error_logs_error_id_unique UNIQUE (error_id);

-- 11. Add unique constraint on deployment_logs.deployment_id
ALTER TABLE public.deployment_logs 
ADD CONSTRAINT deployment_logs_deployment_id_unique UNIQUE (deployment_id);

-- 12. Add unique constraint on environment_validations (id is already primary key)
-- This is already handled by the primary key constraint

-- 13. Add unique constraint on backup_logs (id is already primary key)
-- This is already handled by the primary key constraint

-- 14. Add unique constraint on case_actions (id is already primary key)
-- This is already handled by the primary key constraint

-- Print confirmation
DO $$
BEGIN
    RAISE NOTICE 'Added missing unique constraints for ON CONFLICT clauses';
    RAISE NOTICE 'All tables should now support the ON CONFLICT clauses in the test data migration';
END $$;
