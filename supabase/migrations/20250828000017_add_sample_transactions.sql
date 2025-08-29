-- Add sample transactions for each customer user in the Test Organization
-- This migration adds 5 transactions per customer user with different statuses and risk levels

-- Get the customer users for the Test Organization
DO $$
DECLARE
    test_customer_id UUID := '550e8400-e29b-41d4-a716-446655440100';
    customer_user_1 UUID;
    customer_user_2 UUID;
    customer_user_3 UUID;
    transaction_counter INTEGER := 1;
BEGIN
    -- Get the customer user IDs
    SELECT id INTO customer_user_1 FROM organization_customers WHERE customer_id = test_customer_id AND full_name = 'Bob Wilson' LIMIT 1;
    SELECT id INTO customer_user_2 FROM organization_customers WHERE customer_id = test_customer_id AND full_name = 'Alice Johnson' LIMIT 1;
    SELECT id INTO customer_user_3 FROM organization_customers WHERE customer_id = test_customer_id AND full_name = 'Carol Davis' LIMIT 1;

    -- Bob Wilson's transactions (5 transactions)
    INSERT INTO aml_transactions (id, organization_customer_id, customer_id, external_transaction_id, from_account, to_account, amount, currency, transaction_type, transaction_date, description, risk_score, status, flags, created_at, updated_at) VALUES
    (gen_random_uuid(), customer_user_1, test_customer_id, 'TXN-BOB-001', 'BOB-CHECKING-001', 'EXTERNAL-ACC-001', 2500.00, 'USD', 'transfer', NOW() - INTERVAL '2 days', 'Salary deposit from employer', 15, 'approved', '[]', NOW(), NOW()),
    (gen_random_uuid(), customer_user_1, test_customer_id, 'TXN-BOB-002', 'BOB-CHECKING-001', 'UTILITY-COMPANY', 150.00, 'USD', 'payment', NOW() - INTERVAL '5 days', 'Electricity bill payment', 10, 'approved', '[]', NOW(), NOW()),
    (gen_random_uuid(), customer_user_1, test_customer_id, 'TXN-BOB-003', 'BOB-CHECKING-001', 'INTERNATIONAL-ACC', 5000.00, 'USD', 'international_transfer', NOW() - INTERVAL '1 day', 'International wire transfer', 75, 'flagged', '["high_amount", "international"]', NOW(), NOW()),
    (gen_random_uuid(), customer_user_1, test_customer_id, 'TXN-BOB-004', 'BOB-SAVINGS-001', 'BOB-CHECKING-001', 1000.00, 'USD', 'internal_transfer', NOW() - INTERVAL '3 days', 'Internal account transfer', 5, 'approved', '[]', NOW(), NOW()),
    (gen_random_uuid(), customer_user_1, test_customer_id, 'TXN-BOB-005', 'BOB-CHECKING-001', 'ONLINE-MERCHANT', 250.00, 'USD', 'online_payment', NOW() - INTERVAL '6 hours', 'Online purchase', 20, 'pending', '[]', NOW(), NOW());

    -- Alice Johnson's transactions (5 transactions)
    INSERT INTO aml_transactions (id, organization_customer_id, customer_id, external_transaction_id, from_account, to_account, amount, currency, transaction_type, transaction_date, description, risk_score, status, flags, created_at, updated_at) VALUES
    (gen_random_uuid(), customer_user_2, test_customer_id, 'TXN-ALICE-001', 'ALICE-CHECKING-001', 'FREELANCE-CLIENT', 3500.00, 'USD', 'transfer', NOW() - INTERVAL '1 day', 'Freelance payment received', 25, 'approved', '[]', NOW(), NOW()),
    (gen_random_uuid(), customer_user_2, test_customer_id, 'TXN-ALICE-002', 'ALICE-CHECKING-001', 'CRYPTO-EXCHANGE', 15000.00, 'USD', 'crypto_purchase', NOW() - INTERVAL '12 hours', 'Cryptocurrency purchase', 85, 'flagged', '["high_amount", "crypto", "unusual_pattern"]', NOW(), NOW()),
    (gen_random_uuid(), customer_user_2, test_customer_id, 'TXN-ALICE-003', 'ALICE-CHECKING-001', 'RENTAL-AGENCY', 1200.00, 'USD', 'payment', NOW() - INTERVAL '4 days', 'Rent payment', 15, 'approved', '[]', NOW(), NOW()),
    (gen_random_uuid(), customer_user_2, test_customer_id, 'TXN-ALICE-004', 'ALICE-CHECKING-001', 'INTERNATIONAL-FAMILY', 8000.00, 'USD', 'international_transfer', NOW() - INTERVAL '2 days', 'Family support transfer', 70, 'flagged', '["high_amount", "international", "family_transfer"]', NOW(), NOW()),
    (gen_random_uuid(), customer_user_2, test_customer_id, 'TXN-ALICE-005', 'ALICE-CHECKING-001', 'GROCERY-STORE', 85.50, 'USD', 'payment', NOW() - INTERVAL '1 hour', 'Grocery shopping', 5, 'approved', '[]', NOW(), NOW());

    -- Carol Davis's transactions (5 transactions)
    INSERT INTO aml_transactions (id, organization_customer_id, customer_id, external_transaction_id, from_account, to_account, amount, currency, transaction_type, transaction_date, description, risk_score, status, flags, created_at, updated_at) VALUES
    (gen_random_uuid(), customer_user_3, test_customer_id, 'TXN-CAROL-001', 'CAROL-CHECKING-001', 'EMPLOYER-COMPANY', 4200.00, 'USD', 'transfer', NOW() - INTERVAL '3 days', 'Monthly salary deposit', 10, 'approved', '[]', NOW(), NOW()),
    (gen_random_uuid(), customer_user_3, test_customer_id, 'TXN-CAROL-002', 'CAROL-CHECKING-001', 'CASINO-ONLINE', 500.00, 'USD', 'gambling', NOW() - INTERVAL '1 day', 'Online gambling transaction', 60, 'flagged', '["gambling", "suspicious_activity"]', NOW(), NOW()),
    (gen_random_uuid(), customer_user_3, test_customer_id, 'TXN-CAROL-003', 'CAROL-CHECKING-001', 'INSURANCE-COMPANY', 300.00, 'USD', 'payment', NOW() - INTERVAL '5 days', 'Insurance premium payment', 15, 'approved', '[]', NOW(), NOW()),
    (gen_random_uuid(), customer_user_3, test_customer_id, 'TXN-CAROL-004', 'CAROL-CHECKING-001', 'HIGH-RISK-COUNTRY', 12000.00, 'USD', 'international_transfer', NOW() - INTERVAL '6 hours', 'Transfer to high-risk jurisdiction', 90, 'flagged', '["high_amount", "high_risk_country", "sanctions_risk"]', NOW(), NOW()),
    (gen_random_uuid(), customer_user_3, test_customer_id, 'TXN-CAROL-005', 'CAROL-CHECKING-001', 'RESTAURANT', 45.75, 'USD', 'payment', NOW() - INTERVAL '2 hours', 'Restaurant payment', 5, 'approved', '[]', NOW(), NOW());

    RAISE NOTICE 'Added 15 sample transactions (5 per customer user) for Test Organization';
END $$;
