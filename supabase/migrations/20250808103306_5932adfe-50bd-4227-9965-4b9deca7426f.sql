
-- First, let's see what the current enum values are for case_source
SELECT unnest(enum_range(NULL::case_source)) AS valid_values;

-- If we need to add the missing enum values, we can do:
ALTER TYPE case_source ADD VALUE 'transaction_alert';
ALTER TYPE case_source ADD VALUE 'kyc_flag'; 
ALTER TYPE case_source ADD VALUE 'sanctions_hit';
ALTER TYPE case_source ADD VALUE 'risk_assessment';
