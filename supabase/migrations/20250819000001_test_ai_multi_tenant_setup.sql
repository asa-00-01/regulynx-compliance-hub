-- Test AI Multi-Tenant Setup Migration
-- This migration creates test data for testing the AI multi-tenant system
-- 
-- NOTE: Some test data that depends on user profiles is commented out because
-- profiles are created via auth triggers when users sign up, not during migration.
-- Run the commented sections manually after creating test users through authentication.

-- 1. Create test subscription plans
INSERT INTO public.subscription_plans (plan_id, name, description, price_monthly, price_yearly, max_users, max_transactions, max_cases, features, is_active)
VALUES 
  ('starter', 'Starter', 'Perfect for small businesses', 2900, 29000, 5, 1000, 50, '["Basic AI Assistant", "AML Monitoring", "KYC Verification", "Basic Reports"]', true),
  ('professional', 'Professional', 'Ideal for growing companies', 9900, 99000, 20, 10000, 200, '["Advanced AI Assistant", "Custom AI Configurations", "Advanced Analytics", "Priority Support"]', true),
  ('enterprise', 'Enterprise', 'For large organizations', 29900, 299000, 100, 100000, 1000, '["Unlimited AI Configurations", "Custom Integrations", "Dedicated Support", "Advanced Security"]', true)
ON CONFLICT (plan_id) DO NOTHING;

-- 2. Create test customers
INSERT INTO public.customers (id, name, domain, subscription_tier, settings, created_at, updated_at)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'Test Bank Corp', 'testbank.com', 'professional', '{"ai_enabled": true, "compliance_level": "high"}', now(), now()),
  ('550e8400-e29b-41d4-a716-446655440002', 'Demo Financial Services', 'demofinancial.com', 'enterprise', '{"ai_enabled": true, "compliance_level": "enterprise"}', now(), now()),
  ('550e8400-e29b-41d4-a716-446655440003', 'Startup Credit Union', 'startupcredit.com', 'starter', '{"ai_enabled": true, "compliance_level": "basic"}', now(), now())
ON CONFLICT (id) DO NOTHING;

-- 3. Create test organization customers
INSERT INTO public.organization_customers (id, customer_id, external_customer_id, full_name, email, date_of_birth, nationality, identity_number, phone_number, address, country_of_residence, risk_score, is_pep, is_sanctioned, kyc_status, created_at, updated_at)
VALUES 
  ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'EXT001', 'John Smith', 'john.smith@testbank.com', '1985-03-15', 'US', 'US123456789', '+1234567890', '123 Main St, New York, NY', 'US', 25, false, false, 'verified', now(), now()),
  ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'EXT002', 'Jane Doe', 'jane.doe@testbank.com', '1990-07-22', 'US', 'US987654321', '+1234567891', '456 Oak Ave, Los Angeles, CA', 'US', 15, false, false, 'verified', now(), now()),
  ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'EXT003', 'Bob Wilson', 'bob.wilson@demofinancial.com', '1978-11-08', 'UK', 'UK456789123', '+44123456789', '789 High St, London, UK', 'UK', 35, false, false, 'verified', now(), now()),
  ('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003', 'EXT004', 'Alice Brown', 'alice.brown@startupcredit.com', '1992-05-14', 'CA', 'CA789123456', '+14123456789', '321 Maple Rd, Toronto, ON', 'CA', 10, false, false, 'pending', now(), now())
ON CONFLICT (id) DO NOTHING;

-- 4. Create test profiles (users) - Note: These will be created via auth trigger when users sign up
-- Profiles are created automatically when users authenticate, not during migration

-- 5. Create test subscribers (will be linked to users after authentication)
INSERT INTO public.subscribers (id, user_id, email, subscription_tier, subscription_end, trial_end, stripe_customer_id, subscribed, created_at, updated_at)
VALUES 
  ('880e8400-e29b-41d4-a716-446655440001', NULL, 'admin@testbank.com', 'professional', (now() + interval '1 year'), (now() + interval '30 days'), 'cus_testbank_pro', true, now(), now()),
  ('880e8400-e29b-41d4-a716-446655440002', NULL, 'exec@demofinancial.com', 'enterprise', (now() + interval '1 year'), (now() + interval '30 days'), 'cus_demofinancial_ent', true, now(), now()),
  ('880e8400-e29b-41d4-a716-446655440003', NULL, 'support@startupcredit.com', 'starter', (now() + interval '1 year'), (now() + interval '30 days'), 'cus_startupcredit_starter', true, now(), now())
ON CONFLICT (id) DO NOTHING;

-- 6. Create test AML transactions
INSERT INTO public.aml_transactions (id, organization_customer_id, customer_id, external_transaction_id, from_account, to_account, amount, transaction_date, transaction_type, description, currency, risk_score, status, flags, created_at, updated_at)
VALUES 
  ('990e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'TXN001', 'ACC001', 'ACC002', 15000.00, now(), 'transfer', 'Large transfer between accounts', 'USD', 75, 'flagged', '["high_amount", "unusual_pattern"]', now(), now()),
  ('990e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'TXN002', 'ACC003', 'ACC004', 5000.00, now(), 'payment', 'Regular payment', 'USD', 25, 'approved', '[]', now(), now()),
  ('990e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'TXN003', 'ACC005', 'ACC006', 25000.00, now(), 'transfer', 'International transfer', 'GBP', 85, 'flagged', '["high_amount", "international", "sanctioned_country"]', now(), now()),
  ('990e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003', 'TXN004', 'ACC007', 'ACC008', 1000.00, now(), 'payment', 'Small payment', 'CAD', 10, 'approved', '[]', now(), now())
ON CONFLICT (id) DO NOTHING;

-- 7. Create test compliance cases (COMMENTED OUT - depends on user profiles)
-- Run after creating test users through authentication
/*
INSERT INTO public.compliance_cases (id, organization_customer_id, customer_id, user_id, user_name, type, priority, source, risk_score, assigned_to, assigned_to_name, created_by, description, related_alerts, related_transactions, documents, status, created_at, updated_at)
VALUES 
  ('aa0e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440002', 'Compliance Officer', 'suspicious_activity', 'high', 'aml_monitoring', 80, '770e8400-e29b-41d4-a716-446655440002', 'Compliance Officer', '770e8400-e29b-41d4-a716-446655440001', 'Large transaction flagged for review', '["ALERT001"]', '["TXN001"]', '["DOC001"]', 'open', now(), now()),
  ('aa0e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440003', 'Executive User', 'kyc_review', 'medium', 'manual_review', 45, '770e8400-e29b-41d4-a716-446655440003', 'Executive User', '770e8400-e29b-41d4-a716-446655440003', 'KYC documentation review required', '["ALERT002"]', '["TXN003"]', '["DOC002", "DOC003"]', 'in_progress', now(), now()),
  ('aa0e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440004', 'Support User', 'document_verification', 'low', 'kyc_process', 20, '770e8400-e29b-41d4-a716-446655440004', 'Support User', '770e8400-e29b-41d4-a716-446655440004', 'Document verification pending', '["ALERT003"]', '["TXN004"]', '["DOC004"]', 'pending', now(), now())
ON CONFLICT (id) DO NOTHING;
*/

-- 8. Create test documents (COMMENTED OUT - depends on user profiles)
-- Run after creating test users through authentication
/*
INSERT INTO public.documents (id, organization_customer_id, customer_id, user_id, type, file_name, file_path, status, verified_by, verification_date, extracted_data, upload_date, created_at, updated_at)
VALUES 
  ('bb0e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'passport', 'passport_john_smith.pdf', '/uploads/passport_john_smith.pdf', 'verified', '770e8400-e29b-41d4-a716-446655440002', now(), '{"name": "John Smith", "nationality": "US", "date_of_birth": "1985-03-15"}', now(), now(), now()),
  ('bb0e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440003', 'utility_bill', 'utility_bill_bob_wilson.pdf', '/uploads/utility_bill_bob_wilson.pdf', 'pending', null, null, '{"address": "789 High St, London, UK", "date": "2024-01-15"}', now(), now(), now()),
  ('bb0e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440004', 'drivers_license', 'drivers_license_alice_brown.pdf', '/uploads/drivers_license_alice_brown.pdf', 'pending', null, null, '{"name": "Alice Brown", "license_number": "CA789123456"}', now(), now(), now())
ON CONFLICT (id) DO NOTHING;
*/

-- 9. Create test patterns
INSERT INTO public.patterns (id, name, description, category, created_at)
VALUES 
  ('cc0e8400-e29b-41d4-a716-446655440001', 'High Value Transfer', 'Transactions above $10,000', 'transaction', now()),
  ('cc0e8400-e29b-41d4-a716-446655440002', 'Rapid Transactions', 'Multiple transactions in short time', 'behavioral', now()),
  ('cc0e8400-e29b-41d4-a716-446655440003', 'International Transfer', 'Cross-border transactions', 'geographic', now())
ON CONFLICT (id) DO NOTHING;

-- 10-28. Additional test data (COMMENTED OUT - depends on user profiles)
-- Run after creating test users through authentication
/*
-- 10. Create test pattern matches
INSERT INTO public.pattern_matches (id, pattern_id, user_id, user_name, transaction_id, amount, currency, country, timestamp, created_at)
VALUES 
  ('dd0e8400-e29b-41d4-a716-446655440001', 'cc0e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'Admin User', 'TXN001', 15000.00, 'USD', 'US', now(), now()),
  ('dd0e8400-e29b-41d4-a716-446655440002', 'cc0e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440003', 'Executive User', 'TXN003', 25000.00, 'GBP', 'UK', now(), now());

-- 11. Create test SARs
INSERT INTO public.sars (id, user_id, user_name, summary, date_of_activity, date_submitted, status, transactions, documents, notes, created_at, updated_at)
VALUES 
  ('ee0e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440002', 'Compliance Officer', 'Suspicious large transaction pattern', now(), now(), 'submitted', '["TXN001"]', '["DOC001"]', '["Transaction amount exceeds normal patterns", "Customer history shows unusual activity"]', now(), now()),
  ('ee0e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440003', 'Executive User', 'International transfer to sanctioned country', now(), now(), 'draft', '["TXN003"]', '["DOC002"]', '["Transfer involves high-risk jurisdiction", "Additional documentation required"]', now(), now())
ON CONFLICT (id) DO NOTHING;

-- 12. Create test audit logs
INSERT INTO public.audit_logs (id, entity, action, entity_id, user_id, details, created_at)
VALUES 
  ('ff0e8400-e29b-41d4-a716-446655440001', 'compliance_case', 'created', 'aa0e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', '{"case_type": "suspicious_activity", "risk_score": 80}', now()),
  ('ff0e8400-e29b-41d4-a716-446655440002', 'sar', 'submitted', 'ee0e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440002', '{"sar_id": "SAR-2024-001", "status": "submitted"}', now()),
  ('ff0e8400-e29b-41d4-a716-446655440003', 'ai_interaction', 'logged', null, '770e8400-e29b-41d4-a716-446655440001', '{"message": "How do I create a SAR?", "response_length": 150}', now())
ON CONFLICT (id) DO NOTHING;

-- 13. Create test usage metrics
INSERT INTO public.usage_metrics (id, user_id, metric_type, count, date, created_at)
VALUES 
  ('gg0e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'ai_requests', 15, current_date, now()),
  ('gg0e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440002', 'ai_requests', 8, current_date, now()),
  ('gg0e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440003', 'ai_requests', 25, current_date, now()),
  ('gg0e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440004', 'ai_requests', 3, current_date, now())
ON CONFLICT (id) DO NOTHING;

-- 14. Create test integration configs
INSERT INTO public.integration_configs (id, client_id, client_name, integration_type, api_key_hash, webhook_url, batch_frequency, status, data_mapping, created_at, updated_at)
VALUES 
  ('hh0e8400-e29b-41d4-a716-446655440001', 'testbank_client', 'Test Bank Integration', 'aml_monitoring', 'hash_123456', 'https://testbank.com/webhook', 'realtime', 'active', '{"transaction_mapping": {"amount": "transaction_amount", "currency": "currency_code"}}', now(), now()),
  ('hh0e8400-e29b-41d4-a716-446655440002', 'demofinancial_client', 'Demo Financial Integration', 'kyc_verification', 'hash_789012', 'https://demofinancial.com/webhook', 'batch', 'active', '{"document_mapping": {"type": "document_type", "status": "verification_status"}}', now(), now()),
  ('hh0e8400-e29b-41d4-a716-446655440003', 'startupcredit_client', 'Startup Credit Integration', 'transaction_monitoring', 'hash_345678', 'https://startupcredit.com/webhook', 'daily', 'active', '{"customer_mapping": {"id": "customer_id", "risk_score": "risk_level"}}', now(), now())
ON CONFLICT (id) DO NOTHING;

-- 15. Create test integration API keys
INSERT INTO public.integration_api_keys (id, client_id, key_name, key_hash, expires_at, last_used_at, permissions, is_active, created_at)
VALUES 
  ('ii0e8400-e29b-41d4-a716-446655440001', 'testbank_client', 'Test Bank API Key', 'hash_testbank_key', (now() + interval '1 year'), now(), '["read_transactions", "write_cases", "read_analytics"]', true, now()),
  ('ii0e8400-e29b-41d4-a716-446655440002', 'demofinancial_client', 'Demo Financial API Key', 'hash_demofinancial_key', (now() + interval '1 year'), now(), '["read_transactions", "write_cases", "read_analytics", "manage_ai"]', true, now()),
  ('ii0e8400-e29b-41d4-a716-446655440003', 'startupcredit_client', 'Startup Credit API Key', 'hash_startupcredit_key', (now() + interval '1 year'), now(), '["read_transactions", "read_cases"]', true, now())
ON CONFLICT (id) DO NOTHING;

-- 16. Create test user roles
INSERT INTO public.user_roles (id, user_id, customer_id, role, created_at)
VALUES 
  ('jj0e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'admin', now()),
  ('jj0e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'complianceOfficer', now()),
  ('jj0e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'executive', now()),
  ('jj0e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003', 'support', now())
ON CONFLICT (id) DO NOTHING;

-- 17. Create test platform roles
INSERT INTO public.platform_roles (id, user_id, role, created_at)
VALUES 
  ('kk0e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'admin', now()),
  ('kk0e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440002', 'complianceOfficer', now()),
  ('kk0e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440003', 'executive', now()),
  ('kk0e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440004', 'support', now())
ON CONFLICT (id) DO NOTHING;

-- 18. Create test rules
INSERT INTO public.rules (id, rule_id, rule_name, description, category, condition, risk_score, is_active, created_at, updated_at)
VALUES 
  ('ll0e8400-e29b-41d4-a716-446655440001', 'RULE001', 'High Amount Transaction', 'Flag transactions above $10,000', 'amount', '{"operator": "gt", "field": "amount", "value": 10000}', 75, true, now(), now()),
  ('ll0e8400-e29b-41d4-a716-446655440002', 'RULE002', 'Rapid Transactions', 'Flag multiple transactions in 1 hour', 'frequency', '{"operator": "count_gt", "field": "transactions", "value": 5, "timeframe": "1h"}', 60, true, now(), now()),
  ('ll0e8400-e29b-41d4-a716-446655440003', 'RULE003', 'International Transfer', 'Flag international transfers', 'geographic', '{"operator": "ne", "field": "country", "value": "US"}', 50, true, now(), now())
ON CONFLICT (id) DO NOTHING;

-- 19. Create test risk matches
INSERT INTO public.risk_matches (id, entity_id, entity_type, rule_id, match_data, matched_at, created_at)
VALUES 
  ('mm0e8400-e29b-41d4-a716-446655440001', 'TXN001', 'transaction', 'RULE001', '{"amount": 15000, "currency": "USD"}', now(), now()),
  ('mm0e8400-e29b-41d4-a716-446655440002', 'TXN003', 'transaction', 'RULE003', '{"country": "UK", "currency": "GBP"}', now(), now())
ON CONFLICT (id) DO NOTHING;

-- 20. Create test webhook notifications
INSERT INTO public.webhook_notifications (id, client_id, event_type, webhook_url, payload, status, retry_count, created_at)
VALUES 
  ('nn0e8400-e29b-41d4-a716-446655440001', 'testbank_client', 'transaction_flagged', 'https://testbank.com/webhook', '{"transaction_id": "TXN001", "risk_score": 75}', 'delivered', 0, now()),
  ('nn0e8400-e29b-41d4-a716-446655440002', 'demofinancial_client', 'case_created', 'https://demofinancial.com/webhook', '{"case_id": "CASE002", "type": "kyc_review"}', 'pending', 0, now()),
  ('nn0e8400-e29b-41d4-a716-446655440003', 'startupcredit_client', 'document_uploaded', 'https://startupcredit.com/webhook', '{"document_id": "DOC003", "status": "pending"}', 'delivered', 0, now())
ON CONFLICT (id) DO NOTHING;

-- 21. Create test external customer mappings
INSERT INTO public.external_customer_mappings (id, client_id, external_customer_id, internal_user_id, customer_data, sync_status, last_synced_at, created_at)
VALUES 
  ('oo0e8400-e29b-41d4-a716-446655440001', 'testbank_client', 'EXT001', '770e8400-e29b-41d4-a716-446655440001', '{"name": "John Smith", "email": "john.smith@testbank.com"}', 'synced', now(), now()),
  ('oo0e8400-e29b-41d4-a716-446655440002', 'demofinancial_client', 'EXT003', '770e8400-e29b-41d4-a716-446655440003', '{"name": "Bob Wilson", "email": "bob.wilson@demofinancial.com"}', 'synced', now(), now()),
  ('oo0e8400-e29b-41d4-a716-446655440003', 'startupcredit_client', 'EXT004', '770e8400-e29b-41d4-a716-446655440004', '{"name": "Alice Brown", "email": "alice.brown@startupcredit.com"}', 'pending', now(), now())
ON CONFLICT (id) DO NOTHING;

-- 22. Create test external transaction mappings
INSERT INTO public.external_transaction_mappings (id, external_transaction_id, external_customer_id, client_id, transaction_data, risk_assessment, compliance_status, created_at)
VALUES 
  ('pp0e8400-e29b-41d4-a716-446655440001', 'EXT_TXN001', 'EXT001', 'testbank_client', '{"amount": 15000, "currency": "USD", "type": "transfer"}', '{"risk_score": 75, "flags": ["high_amount"]}', 'flagged', now()),
  ('pp0e8400-e29b-41d4-a716-446655440002', 'EXT_TXN003', 'EXT003', 'demofinancial_client', '{"amount": 25000, "currency": "GBP", "type": "international"}', '{"risk_score": 85, "flags": ["international", "high_amount"]}', 'flagged', now()),
  ('pp0e8400-e29b-41d4-a716-446655440003', 'EXT_TXN004', 'EXT004', 'startupcredit_client', '{"amount": 1000, "currency": "CAD", "type": "payment"}', '{"risk_score": 10, "flags": []}', 'approved', now())
ON CONFLICT (id) DO NOTHING;

-- 23. Create test data ingestion logs
INSERT INTO public.data_ingestion_logs (id, client_id, ingestion_type, status, error_details, processing_time_ms, record_count, success_count, error_count, created_at)
VALUES 
  ('qq0e8400-e29b-41d4-a716-446655440001', 'testbank_client', 'transaction_import', 'completed', null, 1500, 100, 98, 2, now()),
  ('qq0e8400-e29b-41d4-a716-446655440002', 'demofinancial_client', 'customer_import', 'completed', null, 800, 50, 50, 0, now()),
  ('qq0e8400-e29b-41d4-a716-446655440003', 'startupcredit_client', 'document_import', 'failed', '{"error": "Invalid file format"}', 200, 10, 0, 10, now())
ON CONFLICT (id) DO NOTHING;

-- 24. Create test error logs
INSERT INTO public.error_logs (id, error_id, error_message, error_stack, error_type, severity, user_id, url, user_agent, additional_context, environment, resolved, created_at)
VALUES 
  ('rr0e8400-e29b-41d4-a716-446655440001', 'ERR001', 'Database connection timeout', 'Error: timeout at Database.connect', 'database_error', 'high', '770e8400-e29b-41d4-a716-446655440001', '/api/transactions', 'Mozilla/5.0...', '{"retry_count": 3}', 'production', false, now()),
  ('rr0e8400-e29b-41d4-a716-446655440002', 'ERR002', 'AI service unavailable', 'Error: 503 Service Unavailable', 'api_error', 'medium', '770e8400-e29b-41d4-a716-446655440002', '/api/ai/chat', 'Mozilla/5.0...', '{"service": "openai"}', 'production', true, now()),
  ('rr0e8400-e29b-41d4-a716-446655440003', 'ERR003', 'Invalid file upload', 'Error: File size exceeds limit', 'validation_error', 'low', '770e8400-e29b-41d4-a716-446655440004', '/api/documents/upload', 'Mozilla/5.0...', '{"file_size": "15MB", "limit": "10MB"}', 'production', false, now())
ON CONFLICT (id) DO NOTHING;

-- 25. Create test deployment logs
INSERT INTO public.deployment_logs (id, deployment_id, version, environment, status, commit_hash, branch, deployed_by, build_duration_seconds, deployment_duration_seconds, error_message, completed_at, created_at)
VALUES 
  ('ss0e8400-e29b-41d4-a716-446655440001', 'DEP001', 'v1.2.0', 'production', 'completed', 'abc123def456', 'main', '770e8400-e29b-41d4-a716-446655440001', 120, 45, null, now(), now()),
  ('ss0e8400-e29b-41d4-a716-446655440002', 'DEP002', 'v1.2.1', 'staging', 'completed', 'def456ghi789', 'feature/ai-enhancements', '770e8400-e29b-41d4-a716-446655440001', 90, 30, null, now(), now()),
  ('ss0e8400-e29b-41d4-a716-446655440003', 'DEP003', 'v1.2.2', 'development', 'failed', 'ghi789jkl012', 'hotfix/security-patch', '770e8400-e29b-41d4-a716-446655440001', 60, 0, 'Build failed due to test failures', null, now())
ON CONFLICT (id) DO NOTHING;

-- 26. Create test environment validations
INSERT INTO public.environment_validations (id, validation_type, status, message, recommendation, severity, environment, validated_at)
VALUES 
  ('tt0e8400-e29b-41d4-a716-446655440001', 'database_connection', 'passed', 'Database connection successful', null, 'low', 'production', now()),
  ('tt0e8400-e29b-41d4-a716-446655440002', 'ai_service', 'warning', 'AI service response time slow', 'Consider scaling AI service', 'medium', 'production', now()),
  ('tt0e8400-e29b-41d4-a716-446655440003', 'security_scan', 'passed', 'Security scan completed successfully', null, 'low', 'production', now())
ON CONFLICT (id) DO NOTHING;

-- 27. Create test backup logs
INSERT INTO public.backup_logs (id, backup_type, status, file_path, file_size, duration_seconds, error_message, completed_at, created_at)
VALUES 
  ('uu0e8400-e29b-41d4-a716-446655440001', 'full', 'completed', '/backups/full_20240115_120000.sql', 1048576000, 300, null, now(), now()),
  ('uu0e8400-e29b-41d4-a716-446655440002', 'incremental', 'completed', '/backups/incremental_20240115_180000.sql', 52428800, 60, null, now(), now()),
  ('uu0e8400-e29b-41d4-a716-446655440003', 'differential', 'failed', null, null, 0, 'Backup failed due to disk space', null, now())
ON CONFLICT (id) DO NOTHING;

-- 28. Create test case actions
INSERT INTO public.case_actions (id, case_id, action_type, action_by, action_by_name, description, details, action_date, created_at)
VALUES 
  ('vv0e8400-e29b-41d4-a716-446655440001', 'aa0e8400-e29b-41d4-a716-446655440001', 'assigned', '770e8400-e29b-41d4-a716-446655440002', 'Compliance Officer', 'Case assigned to compliance officer', '{"assigned_to": "770e8400-e29b-41d4-a716-446655440002"}', now(), now()),
  ('vv0e8400-e29b-41d4-a716-446655440002', 'aa0e8400-e29b-41d4-a716-446655440002', 'status_changed', '770e8400-e29b-41d4-a716-446655440003', 'Executive User', 'Case status changed to in progress', '{"old_status": "open", "new_status": "in_progress"}', now(), now()),
  ('vv0e8400-e29b-41d4-a716-446655440003', 'aa0e8400-e29b-41d4-a716-446655440003', 'document_uploaded', '770e8400-e29b-41d4-a716-446655440004', 'Support User', 'Additional document uploaded', '{"document_id": "DOC003", "document_type": "drivers_license"}', now(), now())
ON CONFLICT (id) DO NOTHING;

*/

-- Print summary of test data created
DO $$
BEGIN
    RAISE NOTICE 'Test AI Multi-Tenant Setup Complete!';
    RAISE NOTICE 'Created:';
    RAISE NOTICE '- 3 subscription plans (starter, professional, enterprise)';
    RAISE NOTICE '- 3 test customers with different subscription tiers';
    RAISE NOTICE '- 4 organization customers with various risk profiles';
    RAISE NOTICE '- 4 AML transactions with different risk levels';
    RAISE NOTICE '- 3 patterns for compliance monitoring';
    RAISE NOTICE '';
    RAISE NOTICE 'Test Customer IDs:';
    RAISE NOTICE '- Test Bank Corp: 550e8400-e29b-41d4-a716-446655440001 (Professional)';
    RAISE NOTICE '- Demo Financial Services: 550e8400-e29b-41d4-a716-446655440002 (Enterprise)';
    RAISE NOTICE '- Startup Credit Union: 550e8400-e29b-41d4-a716-446655440003 (Starter)';
    RAISE NOTICE '';
    RAISE NOTICE 'NOTE: Additional test data that depends on user profiles is commented out.';
    RAISE NOTICE 'Run the commented sections manually after creating test users through authentication.';
END $$;
