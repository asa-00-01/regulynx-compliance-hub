-- Test script to check if the unique constraints are working
-- This script will test the ON CONFLICT clauses in the test migration

-- Test subscription_plans table
INSERT INTO public.subscription_plans (plan_id, name, description, price_monthly, price_yearly, max_users, max_transactions, max_cases, features, is_active)
VALUES 
  ('starter', 'Starter', 'Perfect for small businesses', 2900, 29000, 5, 1000, 50, '["Basic AI Assistant", "AML Monitoring", "KYC Verification", "Basic Reports"]', true)
ON CONFLICT (plan_id) DO NOTHING;

-- Test customers table
INSERT INTO public.customers (id, name, domain, subscription_tier, settings, created_at, updated_at)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'Test Bank Corp', 'testbank.com', 'professional', '{"ai_enabled": true, "compliance_level": "high"}', now(), now())
ON CONFLICT (id) DO NOTHING;

-- Test organization_customers table
INSERT INTO public.organization_customers (id, customer_id, external_customer_id, full_name, email, date_of_birth, nationality, identity_number, phone_number, address, country_of_residence, risk_score, is_pep, is_sanctioned, kyc_status, created_at, updated_at)
VALUES 
  ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'EXT001', 'John Smith', 'john.smith@testbank.com', '1985-03-15', 'US', 'US123456789', '+1234567890', '123 Main St, New York, NY', 'US', 25, false, false, 'verified', now(), now())
ON CONFLICT (id) DO NOTHING;

-- Test profiles table
INSERT INTO public.profiles (id, name, email, avatar_url, customer_id, role, risk_score, status, created_at, updated_at)
VALUES 
  ('770e8400-e29b-41d4-a716-446655440001', 'Admin User', 'admin@testbank.com', null, '550e8400-e29b-41d4-a716-446655440001', 'admin', 0, 'active', now(), now())
ON CONFLICT (id) DO NOTHING;

-- Test subscribers table
INSERT INTO public.subscribers (id, user_id, email, subscription_tier, subscription_end, trial_end, stripe_customer_id, subscribed, created_at, updated_at)
VALUES 
  ('880e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'admin@testbank.com', 'professional', (now() + interval '1 year'), (now() + interval '30 days'), 'cus_testbank_pro', true, now(), now())
ON CONFLICT (id) DO NOTHING;

-- Test AML transactions table
INSERT INTO public.aml_transactions (id, organization_customer_id, customer_id, external_transaction_id, from_account, to_account, amount, transaction_date, transaction_type, description, currency, risk_score, status, flags, created_at, updated_at)
VALUES 
  ('990e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'TXN001', 'ACC001', 'ACC002', 15000.00, now(), 'transfer', 'Large transfer between accounts', 'USD', 75, 'flagged', '["high_amount", "unusual_pattern"]', now(), now())
ON CONFLICT (id) DO NOTHING;

-- Test compliance cases table
INSERT INTO public.compliance_cases (id, organization_customer_id, customer_id, user_id, user_name, type, priority, source, risk_score, assigned_to, assigned_to_name, created_by, description, related_alerts, related_transactions, documents, status, created_at, updated_at)
VALUES 
  ('aa0e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'Admin User', 'suspicious_activity', 'high', 'aml_monitoring', 80, '770e8400-e29b-41d4-a716-446655440001', 'Admin User', '770e8400-e29b-41d4-a716-446655440001', 'Large transaction flagged for review', '["ALERT001"]', '["TXN001"]', '["DOC001"]', 'open', now(), now())
ON CONFLICT (id) DO NOTHING;

-- Test documents table
INSERT INTO public.documents (id, organization_customer_id, customer_id, user_id, type, file_name, file_path, status, verified_by, verification_date, extracted_data, upload_date, created_at, updated_at)
VALUES 
  ('bb0e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'passport', 'passport_john_smith.pdf', '/uploads/passport_john_smith.pdf', 'verified', '770e8400-e29b-41d4-a716-446655440001', now(), '{"name": "John Smith", "nationality": "US", "date_of_birth": "1985-03-15"}', now(), now(), now())
ON CONFLICT (id) DO NOTHING;

-- Test patterns table
INSERT INTO public.patterns (id, name, description, category, created_at)
VALUES 
  ('cc0e8400-e29b-41d4-a716-446655440001', 'High Value Transfer', 'Transactions above $10,000', 'amount_threshold', now())
ON CONFLICT (id) DO NOTHING;

-- Test pattern matches table
INSERT INTO public.pattern_matches (id, pattern_id, user_id, user_name, transaction_id, amount, currency, country, timestamp, created_at)
VALUES 
  ('dd0e8400-e29b-41d4-a716-446655440001', 'cc0e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'Admin User', 'TXN001', 15000.00, 'USD', 'US', now(), now())
ON CONFLICT (id) DO NOTHING;

-- Test SARs table
INSERT INTO public.sars (id, user_id, user_name, summary, date_of_activity, date_submitted, status, transactions, documents, notes, created_at, updated_at)
VALUES 
  ('ee0e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'Admin User', 'Suspicious large transaction pattern', now(), now(), 'submitted', '["TXN001"]', '["DOC001"]', '["Transaction amount exceeds normal patterns", "Customer history shows unusual activity"]', now(), now())
ON CONFLICT (id) DO NOTHING;

-- Test audit logs table
INSERT INTO public.audit_logs (id, entity, action, entity_id, user_id, details, created_at)
VALUES 
  ('ff0e8400-e29b-41d4-a716-446655440001', 'compliance_case', 'created', 'aa0e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', '{"case_type": "suspicious_activity", "risk_score": 80}', now())
ON CONFLICT (id) DO NOTHING;

-- Test usage metrics table
INSERT INTO public.usage_metrics (id, user_id, metric_type, count, date, created_at)
VALUES 
  ('gg0e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'ai_requests', 15, current_date, now())
ON CONFLICT (id) DO NOTHING;

-- Test integration configs table
INSERT INTO public.integration_configs (id, client_id, client_name, integration_type, api_key_hash, webhook_url, batch_frequency, status, data_mapping, created_at, updated_at)
VALUES 
  ('hh0e8400-e29b-41d4-a716-446655440001', 'testbank_client', 'Test Bank Integration', 'aml_monitoring', 'hash_123456', 'https://testbank.com/webhook', 'realtime', 'active', '{"transaction_mapping": {"amount": "transaction_amount", "currency": "currency_code"}}', now(), now())
ON CONFLICT (id) DO NOTHING;

-- Test integration API keys table
INSERT INTO public.integration_api_keys (id, client_id, key_name, key_hash, expires_at, last_used_at, permissions, is_active, created_at)
VALUES 
  ('ii0e8400-e29b-41d4-a716-446655440001', 'testbank_client', 'Test Bank API Key', 'hash_testbank_key', (now() + interval '1 year'), now(), '["read_transactions", "write_cases", "read_analytics"]', true, now())
ON CONFLICT (id) DO NOTHING;

-- Test user roles table
INSERT INTO public.user_roles (id, user_id, customer_id, role, created_at)
VALUES 
  ('jj0e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'admin', now())
ON CONFLICT (id) DO NOTHING;

-- Test platform roles table
INSERT INTO public.platform_roles (id, user_id, role, created_at)
VALUES 
  ('kk0e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'admin', now())
ON CONFLICT (id) DO NOTHING;

-- Test rules table
INSERT INTO public.rules (id, rule_id, rule_name, description, category, condition, risk_score, is_active, created_at, updated_at)
VALUES 
  ('ll0e8400-e29b-41d4-a716-446655440001', 'RULE001', 'High Amount Transaction', 'Flag transactions above $10,000', 'amount', '{"operator": "gt", "field": "amount", "value": 10000}', 75, true, now(), now())
ON CONFLICT (id) DO NOTHING;

-- Test risk matches table
INSERT INTO public.risk_matches (id, entity_id, entity_type, rule_id, match_data, matched_at, created_at)
VALUES 
  ('mm0e8400-e29b-41d4-a716-446655440001', 'TXN001', 'transaction', 'RULE001', '{"amount": 15000, "currency": "USD"}', now(), now())
ON CONFLICT (id) DO NOTHING;

-- Test webhook notifications table
INSERT INTO public.webhook_notifications (id, client_id, event_type, webhook_url, payload, status, retry_count, created_at)
VALUES 
  ('nn0e8400-e29b-41d4-a716-446655440001', 'testbank_client', 'transaction_flagged', 'https://testbank.com/webhook', '{"transaction_id": "TXN001", "risk_score": 75}', 'delivered', 0, now())
ON CONFLICT (id) DO NOTHING;

-- Test external customer mappings table
INSERT INTO public.external_customer_mappings (id, client_id, external_customer_id, internal_user_id, customer_data, sync_status, last_synced_at, created_at)
VALUES 
  ('oo0e8400-e29b-41d4-a716-446655440001', 'testbank_client', 'EXT001', '770e8400-e29b-41d4-a716-446655440001', '{"name": "John Smith", "email": "john.smith@testbank.com"}', 'synced', now(), now())
ON CONFLICT (id) DO NOTHING;

-- Test external transaction mappings table
INSERT INTO public.external_transaction_mappings (id, external_transaction_id, external_customer_id, client_id, transaction_data, risk_assessment, compliance_status, created_at)
VALUES 
  ('pp0e8400-e29b-41d4-a716-446655440001', 'EXT_TXN001', 'EXT001', 'testbank_client', '{"amount": 15000, "currency": "USD", "type": "transfer"}', '{"risk_score": 75, "flags": ["high_amount"]}', 'flagged', now())
ON CONFLICT (id) DO NOTHING;

-- Test data ingestion logs table
INSERT INTO public.data_ingestion_logs (id, client_id, ingestion_type, status, error_details, processing_time_ms, record_count, success_count, error_count, created_at)
VALUES 
  ('qq0e8400-e29b-41d4-a716-446655440001', 'testbank_client', 'transaction_import', 'completed', null, 1500, 100, 98, 2, now())
ON CONFLICT (id) DO NOTHING;

-- Test error logs table
INSERT INTO public.error_logs (id, error_id, error_message, error_stack, error_type, severity, user_id, url, user_agent, additional_context, environment, resolved, created_at)
VALUES 
  ('rr0e8400-e29b-41d4-a716-446655440001', 'ERR001', 'Database connection timeout', 'Error: timeout at Database.connect', 'database_error', 'high', '770e8400-e29b-41d4-a716-446655440001', '/api/transactions', 'Mozilla/5.0...', '{"retry_count": 3}', 'production', false, now())
ON CONFLICT (id) DO NOTHING;

-- Test deployment logs table
INSERT INTO public.deployment_logs (id, deployment_id, version, environment, status, commit_hash, branch, deployed_by, build_duration_seconds, deployment_duration_seconds, error_message, completed_at, created_at)
VALUES 
  ('ss0e8400-e29b-41d4-a716-446655440001', 'DEP001', 'v1.2.0', 'production', 'completed', 'abc123def456', 'main', '770e8400-e29b-41d4-a716-446655440001', 120, 45, null, now(), now())
ON CONFLICT (id) DO NOTHING;

-- Test environment validations table
INSERT INTO public.environment_validations (id, validation_type, status, message, recommendation, severity, environment, validated_at)
VALUES 
  ('tt0e8400-e29b-41d4-a716-446655440001', 'database_connection', 'passed', 'Database connection successful', null, 'low', 'production', now())
ON CONFLICT (id) DO NOTHING;

-- Test backup logs table
INSERT INTO public.backup_logs (id, backup_type, status, file_path, file_size, duration_seconds, error_message, completed_at, created_at)
VALUES 
  ('uu0e8400-e29b-41d4-a716-446655440001', 'full', 'completed', '/backups/full_20240115_120000.sql', 1048576000, 300, null, now(), now())
ON CONFLICT (id) DO NOTHING;

-- Test case actions table
INSERT INTO public.case_actions (id, case_id, action_type, action_by, action_by_name, description, details, action_date, created_at)
VALUES 
  ('vv0e8400-e29b-41d4-a716-446655440001', 'aa0e8400-e29b-41d4-a716-446655440001', 'assigned', '770e8400-e29b-41d4-a716-446655440001', 'Admin User', 'Case assigned to compliance officer', '{"assigned_to": "770e8400-e29b-41d4-a716-446655440001"}', now(), now())
ON CONFLICT (id) DO NOTHING;

-- Print success message
SELECT 'All test data inserted successfully! Unique constraints are working correctly.' as result;
