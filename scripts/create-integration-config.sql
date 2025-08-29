-- Create proper integration configuration for data ingestion
-- Run this in Supabase Studio SQL editor

-- STEP 1: Create integration config for test-org
INSERT INTO public.integration_configs (
    id,
    client_id,
    client_name,
    integration_type,
    api_key_hash,
    webhook_url,
    batch_frequency,
    data_mapping,
    status,
    created_at,
    updated_at
)
VALUES (
    gen_random_uuid(),
    'test-org',
    'Test Organization',
    'api_realtime',
    'YWtfTDZEYUhHd3pSeHhua1FnZHpyNTdjM2M4Y3hyVEpYdUY=', -- Your API key hash
    NULL,
    'realtime',
    '{}',
    'active',
    now(),
    now()
)
ON CONFLICT (client_id) DO UPDATE SET
    client_name = EXCLUDED.client_name,
    integration_type = EXCLUDED.integration_type,
    api_key_hash = EXCLUDED.api_key_hash,
    status = EXCLUDED.status,
    updated_at = now();

-- STEP 2: Create API key record
INSERT INTO public.integration_api_keys (
    id,
    client_id,
    key_name,
    key_hash,
    permissions,
    expires_at,
    last_used_at,
    is_active,
    created_at
)
VALUES (
    gen_random_uuid(),
    'test-org',
    'Test API Key',
    'YWtfTDZEYUhHd3pSeHhua1FnZHpyNTdjM2M4Y3hyVEpYdUY=',
    '["read:customers", "write:customers", "read:transactions", "write:transactions"]',
    NULL,
    now(),
    true,
    now()
)
ON CONFLICT (client_id, key_hash) DO UPDATE SET
    last_used_at = now();

-- STEP 3: Verify the integration config
SELECT 
    ic.client_id,
    ic.client_name,
    ic.integration_type,
    ic.status,
    ick.key_name,
    ick.is_active
FROM public.integration_configs ic
LEFT JOIN public.integration_api_keys ick ON ic.client_id = ick.client_id
WHERE ic.client_id = 'test-org';

-- STEP 4: Check if Test Organization customer exists
SELECT 
    id,
    name,
    domain,
    subscription_tier
FROM public.customers 
WHERE name = 'Test Organization' OR domain = 'test-org.com';

-- STEP 5: If Test Organization doesn't exist, create it
INSERT INTO public.customers (
    id,
    name,
    domain,
    subscription_tier,
    settings,
    created_at,
    updated_at
)
SELECT 
    gen_random_uuid(),
    'Test Organization',
    'test-org.com',
    'pro',
    '{"features": ["aml", "kyc", "sanctions", "data_ingestion"]}',
    now(),
    now()
WHERE NOT EXISTS (
    SELECT 1 FROM public.customers 
    WHERE name = 'Test Organization' OR domain = 'test-org.com'
);

-- STEP 6: Verify everything is set up correctly
SELECT 
    'Integration Config' as type,
    client_id,
    client_name,
    status
FROM public.integration_configs 
WHERE client_id = 'test-org'

UNION ALL

SELECT 
    'API Key' as type,
    client_id,
    key_name as client_name,
    CASE WHEN is_active THEN 'active' ELSE 'inactive' END as status
FROM public.integration_api_keys 
WHERE client_id = 'test-org'

UNION ALL

SELECT 
    'Customer' as type,
    id::text as client_id,
    name as client_name,
    subscription_tier as status
FROM public.customers 
WHERE name = 'Test Organization' OR domain = 'test-org.com';
