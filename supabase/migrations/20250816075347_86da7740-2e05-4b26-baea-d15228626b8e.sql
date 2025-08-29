
-- Insert demo customer (SaaS customer)
INSERT INTO public.customers (id, name, domain, subscription_tier, settings) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Demo Financial Services', 'demo-finserv.com', 'premium', '{"features": ["aml_monitoring", "kyc_verification", "sanctions_screening"]}')
ON CONFLICT (id) DO NOTHING;

-- Note: Demo platform user will be created when user signs up through auth
-- The trigger will automatically create the profile

-- Insert demo organization customer (the end-user being monitored)
INSERT INTO public.organization_customers (
  id, customer_id, external_customer_id, full_name, email, phone_number, 
  date_of_birth, nationality, identity_number, address, country_of_residence,
  kyc_status, risk_score, is_pep, is_sanctioned, created_by
) VALUES (
  '550e8400-e29b-41d4-a716-446655440020',
  '550e8400-e29b-41d4-a716-446655440001',
  'EXT_CUST_001',
  'John Smith',
  'john.smith@email.com',
  '+1-555-0123',
  '1985-03-15',
  'American',
  'SSN123456789',
  '123 Main Street, New York, NY 10001',
  'United States',
  'verified',
  75,
  false,
  false,
  NULL
)
ON CONFLICT (id) DO NOTHING;

-- Insert 2 AML transactions
INSERT INTO public.aml_transactions (
  id, organization_customer_id, customer_id, external_transaction_id,
  from_account, to_account, amount, currency, transaction_type,
  transaction_date, description, risk_score, flags, status
) VALUES 
(
  '550e8400-e29b-41d4-a716-446655440030',
  '550e8400-e29b-41d4-a716-446655440020',
  '550e8400-e29b-41d4-a716-446655440001',
  'TXN_001',
  'ACC_12345',
  'ACC_67890',
  15000.00,
  'USD',
  'wire_transfer',
  now() - INTERVAL '3 days',
  'Large wire transfer to foreign account',
  85,
  '["high_amount", "cross_border", "high_risk_country"]'::jsonb,
  'flagged'
),
(
  '550e8400-e29b-41d4-a716-446655440031',
  '550e8400-e29b-41d4-a716-446655440020',
  '550e8400-e29b-41d4-a716-446655440001',
  'TXN_002',
  'ACC_12345',
  'ACC_11111',
  8500.00,
  'USD',
  'wire_transfer',
  now() - INTERVAL '1 day',
  'Wire transfer to business account',
  70,
  '["high_amount", "frequent_transactions"]'::jsonb,
  'flagged'
)
ON CONFLICT (id) DO NOTHING;

-- Insert 2 documents
INSERT INTO public.documents (
  id, organization_customer_id, customer_id, type, file_name, file_path,
  status, upload_date, verified_by, verification_date, extracted_data, user_id
) VALUES
(
  '550e8400-e29b-41d4-a716-446655440040',
  '550e8400-e29b-41d4-a716-446655440020',
  '550e8400-e29b-41d4-a716-446655440001',
  'passport',
  'john_smith_passport.pdf',
  '/documents/john_smith/passport.pdf',
  'verified',
  now() - INTERVAL '10 days',
  NULL,
  now() - INTERVAL '8 days',
  '{"name": "John Smith", "passport_number": "123456789", "expiry_date": "2030-03-15", "nationality": "American"}'::jsonb,
  NULL
),
(
  '550e8400-e29b-41d4-a716-446655440041',
  '550e8400-e29b-41d4-a716-446655440020',
  '550e8400-e29b-41d4-a716-446655440001',
  'utility_bill',
  'john_smith_utility_bill.pdf',
  '/documents/john_smith/utility_bill.pdf',
  'verified',
  now() - INTERVAL '7 days',
  NULL,
  now() - INTERVAL '5 days',
  '{"name": "John Smith", "address": "123 Main Street, New York, NY 10001", "bill_date": "2024-01-15"}'::jsonb,
  NULL
)
ON CONFLICT (id) DO NOTHING;

-- Insert 1 AML compliance case linking both transactions and one document
INSERT INTO public.compliance_cases (
  id, organization_customer_id, customer_id, type, status, priority,
  source, user_name, description, risk_score, assigned_to, assigned_to_name,
  created_by, related_alerts, related_transactions, documents
) VALUES (
  '550e8400-e29b-41d4-a716-446655440050',
  '550e8400-e29b-41d4-a716-446655440020',
  '550e8400-e29b-41d4-a716-446655440001',
  'aml_alert',
  'open',
  'high',
  'system_alert',
  'John Smith',
  'High-risk transaction pattern detected: Multiple large wire transfers to foreign accounts within short timeframe. Customer risk score elevated due to transaction behavior.',
  85,
  NULL,
  'Demo Compliance Officer',
  NULL,
  '["ALERT_001", "ALERT_002"]'::jsonb,
  '["550e8400-e29b-41d4-a716-446655440030", "550e8400-e29b-41d4-a716-446655440031"]'::jsonb,
  '["550e8400-e29b-41d4-a716-446655440040"]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- Insert case action events
INSERT INTO public.case_actions (
  id, case_id, action_type, description, action_by, action_by_name, details
) VALUES
(
  '550e8400-e29b-41d4-a716-446655440060',
  '550e8400-e29b-41d4-a716-446655440050',
  'status_change',
  'Case automatically created due to AML alert triggered by high-risk transaction pattern',
  NULL,
  'Demo Compliance Officer',
  '{"previous_status": null, "new_status": "open", "trigger": "system_alert", "alert_ids": ["ALERT_001", "ALERT_002"]}'::jsonb
),
(
  '550e8400-e29b-41d4-a716-446655440061',
  '550e8400-e29b-41d4-a716-446655440050',
  'assignment',
  'Case assigned to compliance officer for detailed review',
  NULL,
  'Demo Compliance Officer',
  '{"assigned_to": null, "assigned_to_name": "Demo Compliance Officer", "reason": "AML specialist review required"}'::jsonb
),
(
  '550e8400-e29b-41d4-a716-446655440062',
  '550e8400-e29b-41d4-a716-446655440050',
  'comment',
  'Initial assessment: Customer has legitimate business reasons for transfers. Passport verified. Utility bill confirms address. Proceeding with enhanced due diligence.',
  NULL,
  'Demo Compliance Officer',
  '{"comment_type": "assessment", "documents_reviewed": ["passport", "utility_bill"], "next_steps": ["enhanced_due_diligence", "source_of_funds_verification"]}'::jsonb
)
ON CONFLICT (id) DO NOTHING;
