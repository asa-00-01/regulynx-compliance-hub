
-- Insert demo data into all tables
-- First, ensure we have a customer
INSERT INTO public.customers (id, name, domain, subscription_tier, settings) 
VALUES ('01234567-89ab-cdef-0123-456789abcdef', 'Demo Financial Services', 'demo-finance.com', 'premium', '{"features": ["aml", "kyc", "sanctions"], "webhook_enabled": true}')
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    domain = EXCLUDED.domain,
    subscription_tier = EXCLUDED.subscription_tier,
    settings = EXCLUDED.settings;

-- Create organisation customer
INSERT INTO public.organisation_customer (id, customer_id, external_id, full_name, email, phone_number, date_of_birth, nationality, identity_number, address, country_of_residence, risk_score, is_pep, is_sanctioned, created_by)
VALUES ('77777777-7777-7777-7777-777777777777', '01234567-89ab-cdef-0123-456789abcdef', 'CUST_001', 'John Smith', 'john.smith@email.com', '+1-555-0123', '1985-06-15', 'American', 'US123456789', '123 Main Street, New York, NY 10001', 'United States', 75, false, false, '22222222-2222-2222-2222-222222222222')
ON CONFLICT (customer_id, external_id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    risk_score = EXCLUDED.risk_score;

-- Insert transactions
INSERT INTO public.transaction (id, organisation_customer_id, external_transaction_id, amount, currency, direction, counterparty_name, counterparty_account, occurred_at, risk_score, flags, metadata)
VALUES 
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '77777777-7777-7777-7777-777777777777', 'TXN_15000_001', 15000.00, 'USD', 'out', 'International Wire Service', 'WIRE_ACC_001', now() - INTERVAL '5 days', 85, '["high_amount", "international"]'::jsonb, '{"purpose": "family_support", "destination_country": "Somalia"}'::jsonb),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '77777777-7777-7777-7777-777777777777', 'TXN_8500_002', 8500.00, 'USD', 'out', 'Cross Border Payments Ltd', 'CBP_ACC_002', now() - INTERVAL '2 days', 78, '["high_amount", "frequent_sender"]'::jsonb, '{"purpose": "business_payment", "destination_country": "Egypt"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Insert documents
INSERT INTO public.document (id, organisation_customer_id, type, file_name, storage_uri, mime_type, file_size_bytes, status, uploaded_by, verified_by, verified_at, metadata)
VALUES 
('cccccccc-cccc-cccc-cccc-cccccccccccc', '77777777-7777-7777-7777-777777777777', 'passport', 'john_smith_passport.pdf', '/storage/documents/passport_001.pdf', 'application/pdf', 2048000, 'verified', '22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', now() - INTERVAL '1 day', '{"ocr_confidence": 0.95, "expiry_date": "2030-06-15"}'::jsonb),
('dddddddd-dddd-dddd-dddd-dddddddddddd', '77777777-7777-7777-7777-777777777777', 'utility_bill', 'john_smith_utility.pdf', '/storage/documents/utility_001.pdf', 'application/pdf', 1024000, 'verified', '22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', now(), '{"address_match": true, "issue_date": "2024-07-15"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Insert compliance case
INSERT INTO public.compliance_case (id, organisation_customer_id, case_type, status, priority, title, description, assigned_to, created_by, metadata)
VALUES ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '77777777-7777-7777-7777-777777777777', 'aml_alert', 'open', 'high', 'High-Risk Transaction Pattern Alert', 'Multiple high-value international wire transfers detected. Customer shows pattern of frequent large transactions to high-risk jurisdictions. Requires immediate AML review and enhanced due diligence.', '22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', '{"alert_score": 85, "trigger_rules": ["high_amount", "high_risk_country", "frequent_pattern"]}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Link case to transactions
INSERT INTO public.case_transaction (case_id, transaction_id)
VALUES 
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb')
ON CONFLICT (case_id, transaction_id) DO NOTHING;

-- Link case to passport document
INSERT INTO public.case_document (case_id, document_id)
VALUES ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'cccccccc-cccc-cccc-cccc-cccccccccccc')
ON CONFLICT (case_id, document_id) DO NOTHING;

-- Insert case events for audit trail
INSERT INTO public.case_event (id, case_id, event_type, description, created_by, metadata)
VALUES 
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'created', 'AML alert case opened due to high-risk transaction pattern detection', '22222222-2222-2222-2222-222222222222', '{"system_generated": true, "alert_threshold": 80}'::jsonb),
('00000000-0000-0000-0000-000000000001', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'assigned', 'Case assigned to compliance analyst for review', '22222222-2222-2222-2222-222222222222', '{"assigned_to": "John Admin", "priority": "high"}'::jsonb),
('00000000-0000-0000-0000-000000000002', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'note_added', 'Customer verified identity documents. Transactions appear to be for legitimate family support and business purposes. Monitoring continues.', '22222222-2222-2222-2222-222222222222', '{"action_required": "enhanced_monitoring"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Verify data was inserted
SELECT 
    'Data Summary' as info,
    (SELECT COUNT(*) FROM public.customers) as customers_count,
    (SELECT COUNT(*) FROM public.organisation_customer) as org_customers_count,
    (SELECT COUNT(*) FROM public.transaction) as transactions_count,
    (SELECT COUNT(*) FROM public.document) as documents_count,
    (SELECT COUNT(*) FROM public.compliance_case) as cases_count,
    (SELECT COUNT(*) FROM public.case_event) as case_events_count;
