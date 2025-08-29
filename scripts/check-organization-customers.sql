-- Check if organization_customers table has data
SELECT 
  COUNT(*) as total_customers,
  COUNT(CASE WHEN full_name IS NOT NULL THEN 1 END) as with_names,
  COUNT(CASE WHEN email IS NOT NULL THEN 1 END) as with_emails
FROM organization_customers;

-- Show sample data
SELECT 
  id,
  full_name,
  email,
  kyc_status,
  risk_score,
  created_at
FROM organization_customers 
LIMIT 5;

-- Check if there are any customers at all
SELECT 'customers' as table_name, COUNT(*) as count FROM customers
UNION ALL
SELECT 'organization_customers' as table_name, COUNT(*) as count FROM organization_customers;
