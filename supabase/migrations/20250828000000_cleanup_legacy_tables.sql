-- Cleanup Legacy Tables Migration
-- This migration removes legacy tables that have been replaced by newer implementations

-- Drop legacy tables that are no longer used
-- These tables were replaced by organization_customers, aml_transactions, documents, compliance_cases

-- Drop legacy compliance_case table (replaced by compliance_cases)
DROP TABLE IF EXISTS public.compliance_case CASCADE;

-- Drop legacy document table (replaced by documents)
DROP TABLE IF EXISTS public.document CASCADE;

-- Drop legacy transaction table (replaced by aml_transactions)
DROP TABLE IF EXISTS public.transaction CASCADE;

-- Drop legacy kyx table (replaced by organization_customers.kyc_status)
DROP TABLE IF EXISTS public.kyx CASCADE;

-- Drop legacy organisation_customer table (replaced by organization_customers)
DROP TABLE IF EXISTS public.organisation_customer CASCADE;

-- Drop legacy case_transaction link table (no longer needed)
DROP TABLE IF EXISTS public.case_transaction CASCADE;

-- Drop legacy case_document link table (no longer needed)
DROP TABLE IF EXISTS public.case_document CASCADE;

-- Drop legacy case_event table (replaced by case_actions)
DROP TABLE IF EXISTS public.case_event CASCADE;

-- Clean up any remaining indexes that reference the dropped tables
-- (PostgreSQL will automatically drop indexes when tables are dropped)

-- Clean up any remaining triggers that reference the dropped tables
-- (PostgreSQL will automatically drop triggers when tables are dropped)

-- Note: The organization_customers, aml_transactions, documents, and compliance_cases tables
-- remain as the current implementation
