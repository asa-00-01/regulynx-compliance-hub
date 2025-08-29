
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
);

-- Insert older KYC record (for history)
UPDATE public.organization_customers 
SET 
  kyc_status = 'pending',
  risk_score = 45,
  updated_at = now() - INTERVAL '30 days'
WHERE id = '550e8400-e29b-41d4-a716-446655440020';

-- Insert current KYC record (active)
UPDATE public.organization_customers 
SET 
  kyc_status = 'verified',
  risk_score = 75,
  updated_at = now() - INTERVAL '5 days'
WHERE id = '550e8400-e29b-41d4-a716-446655440020';

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
);

-- Insert 2 documents
INSERT INTO public.documents (
  id, organization_customer_id, customer_id, type, file_name, file_path,
  status, upload_date, verified_by, verification_date, extracted_data
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
  '{"name": "John Smith", "passport_number": "123456789", "expiry_date": "2030-03-15", "nationality": "American"}'::jsonb
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
  '{"name": "John Smith", "address": "123 Main Street, New York, NY 10001", "bill_date": "2024-01-15"}'::jsonb
);

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
);

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
  '{"assigned_to": "550e8400-e29b-41d4-a716-446655440010", "assigned_to_name": "Demo Compliance Officer", "reason": "AML specialist review required"}'::jsonb
),
(
  '550e8400-e29b-41d4-a716-446655440062',
  '550e8400-e29b-41d4-a716-446655440050',
  'comment',
  'Initial assessment: Customer has legitimate business reasons for transfers. Passport verified. Utility bill confirms address. Proceeding with enhanced due diligence.',
  NULL,
  'Demo Compliance Officer',
  '{"comment_type": "assessment", "documents_reviewed": ["passport", "utility_bill"], "next_steps": ["enhanced_due_diligence", "source_of_funds_verification"]}'::jsonb
);

-- Example Queries to demonstrate hub-and-spoke relationships:

-- Query 1: Find all open AML cases with their transactions for a given customer
SELECT 
  cc.id as case_id,
  cc.description as case_description,
  cc.status,
  cc.priority,
  cc.risk_score as case_risk_score,
  oc.full_name as customer_name,
  oc.email as customer_email,
  t.id as transaction_id,
  t.external_transaction_id,
  t.amount,
  t.currency,
  t.transaction_date,
  t.risk_score as transaction_risk_score,
  t.flags as transaction_flags
FROM public.compliance_cases cc
JOIN public.organization_customers oc ON cc.organization_customer_id = oc.id
JOIN public.aml_transactions t ON t.organization_customer_id = oc.id
WHERE cc.customer_id = '550e8400-e29b-41d4-a716-446655440001'
  AND cc.type = 'aml_alert'
  AND cc.status = 'open'
  AND t.id::text = ANY(SELECT jsonb_array_elements_text(cc.related_transactions))
ORDER BY cc.created_at DESC, t.transaction_date DESC;

-- Query 2: Get organization customer profile with all related compliance data
SELECT 
  oc.id as customer_id,
  oc.full_name,
  oc.email,
  oc.kyc_status,
  oc.risk_score,
  oc.is_pep,
  oc.is_sanctioned,
  COUNT(DISTINCT t.id) as total_transactions,
  COUNT(DISTINCT d.id) as total_documents,
  COUNT(DISTINCT cc.id) as total_cases,
  COUNT(DISTINCT CASE WHEN cc.status = 'open' THEN cc.id END) as open_cases,
  MAX(t.transaction_date) as last_transaction_date,
  AVG(t.risk_score) as avg_transaction_risk_score
FROM public.organization_customers oc
LEFT JOIN public.aml_transactions t ON t.organization_customer_id = oc.id
LEFT JOIN public.documents d ON d.organization_customer_id = oc.id
LEFT JOIN public.compliance_cases cc ON cc.organization_customer_id = oc.id
WHERE oc.customer_id = '550e8400-e29b-41d4-a716-446655440001'
GROUP BY oc.id, oc.full_name, oc.email, oc.kyc_status, oc.risk_score, oc.is_pep, oc.is_sanctioned
ORDER BY oc.risk_score DESC;

-- Query 3: Find all high-risk transactions with associated cases and documents
SELECT 
  t.id as transaction_id,
  t.external_transaction_id,
  t.amount,
  t.currency,
  t.transaction_date,
  t.risk_score as transaction_risk_score,
  t.status as transaction_status,
  oc.full_name as customer_name,
  cc.id as related_case_id,
  cc.type as case_type,
  cc.status as case_status,
  cc.priority as case_priority,
  d.id as document_id,
  d.type as document_type,
  d.status as document_status
FROM public.aml_transactions t
JOIN public.organization_customers oc ON t.organization_customer_id = oc.id
LEFT JOIN public.compliance_cases cc ON cc.organization_customer_id = oc.id 
  AND t.id::text = ANY(SELECT jsonb_array_elements_text(cc.related_transactions))
LEFT JOIN public.documents d ON d.organization_customer_id = oc.id
  AND d.id::text = ANY(SELECT jsonb_array_elements_text(cc.documents))
WHERE t.customer_id = '550e8400-e29b-41d4-a716-446655440001'
  AND t.risk_score > 70
ORDER BY t.risk_score DESC, t.transaction_date DESC;

-- Query 4: Case audit trail with all actions and related entities
SELECT 
  cc.id as case_id,
  cc.description as case_description,
  cc.type as case_type,
  cc.status as current_status,
  oc.full_name as customer_name,
  ca.id as action_id,
  ca.action_type,
  ca.description as action_description,
  ca.action_date,
  ca.action_by_name,
  ca.details as action_details,
  COUNT(t.id) as related_transactions_count,
  COUNT(d.id) as related_documents_count
FROM public.compliance_cases cc
JOIN public.organization_customers oc ON cc.organization_customer_id = oc.id
LEFT JOIN public.case_actions ca ON ca.case_id = cc.id
LEFT JOIN public.aml_transactions t ON t.organization_customer_id = oc.id 
  AND t.id::text = ANY(SELECT jsonb_array_elements_text(cc.related_transactions))
LEFT JOIN public.documents d ON d.organization_customer_id = oc.id
  AND d.id::text = ANY(SELECT jsonb_array_elements_text(cc.documents))
WHERE cc.customer_id = '550e8400-e29b-41d4-a716-446655440001'
GROUP BY cc.id, cc.description, cc.type, cc.status, oc.full_name, 
         ca.id, ca.action_type, ca.description, ca.action_date, ca.action_by_name, ca.details
ORDER BY cc.created_at DESC, ca.action_date ASC;

-- Query 5: Document verification status across all organization customers with related cases
SELECT 
  oc.id as customer_id,
  oc.full_name as customer_name,
  oc.kyc_status,
  d.id as document_id,
  d.type as document_type,
  d.status as document_status,
  d.upload_date,
  d.verification_date,
  d.verified_by,
  CASE 
    WHEN cc.id IS NOT NULL THEN 'Has Related Case'
    ELSE 'No Related Case'
  END as case_status,
  cc.id as case_id,
  cc.type as case_type,
  cc.priority as case_priority
FROM public.organization_customers oc
LEFT JOIN public.documents d ON d.organization_customer_id = oc.id
LEFT JOIN public.compliance_cases cc ON cc.organization_customer_id = oc.id
  AND d.id::text = ANY(SELECT jsonb_array_elements_text(cc.documents))
WHERE oc.customer_id = '550e8400-e29b-41d4-a716-446655440001'
ORDER BY oc.full_name, d.upload_date DESC;
