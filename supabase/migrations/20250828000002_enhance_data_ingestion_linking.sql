-- Enhance data ingestion system with automatic linking capabilities
-- This migration adds functions and triggers to automatically link transactions with customers

-- Create a function to automatically link transactions to existing customers
CREATE OR REPLACE FUNCTION auto_link_transaction_to_customer(
  p_external_transaction_id TEXT,
  p_external_customer_id TEXT,
  p_client_id TEXT,
  p_transaction_data JSONB
) RETURNS UUID AS $$
DECLARE
  v_organization_customer_id UUID;
  v_customer_id UUID;
  v_transaction_id UUID;
  v_existing_transaction_id UUID;
BEGIN
  -- First, find the customer organization for this client
  SELECT id INTO v_customer_id
  FROM customers
  WHERE name = 'Test Organization' OR domain = p_client_id || '.com'
  LIMIT 1;
  
  IF v_customer_id IS NULL THEN
    RAISE EXCEPTION 'Customer organization not found for client_id: %', p_client_id;
  END IF;

  -- Check if the organization customer already exists
  SELECT id INTO v_organization_customer_id
  FROM organization_customers
  WHERE customer_id = v_customer_id 
    AND external_customer_id = p_external_customer_id;
  
  -- If organization customer doesn't exist, create it from transaction data
  IF v_organization_customer_id IS NULL THEN
    INSERT INTO organization_customers (
      customer_id,
      external_customer_id,
      full_name,
      email,
      phone_number,
      date_of_birth,
      nationality,
      identity_number,
      address,
      country_of_residence,
      kyc_status,
      risk_score,
      is_pep,
      is_sanctioned,
      created_at,
      updated_at
    ) VALUES (
      v_customer_id,
      p_external_customer_id,
      COALESCE(p_transaction_data->>'customer_name', 'Unknown Customer'),
      p_transaction_data->>'customer_email',
      p_transaction_data->>'customer_phone',
      (p_transaction_data->>'customer_dob')::DATE,
      p_transaction_data->>'customer_nationality',
      p_transaction_data->>'customer_id_number',
      p_transaction_data->>'customer_address',
      p_transaction_data->>'customer_country',
      'pending',
      COALESCE((p_transaction_data->>'customer_risk_score')::INTEGER, 50),
      COALESCE((p_transaction_data->>'customer_is_pep')::BOOLEAN, false),
      COALESCE((p_transaction_data->>'customer_is_sanctioned')::BOOLEAN, false),
      NOW(),
      NOW()
    )
    RETURNING id INTO v_organization_customer_id;
    
    -- Create external customer mapping
    INSERT INTO external_customer_mappings (
      client_id,
      external_customer_id,
      internal_user_id,
      customer_data,
      sync_status,
      last_synced_at
    ) VALUES (
      p_client_id,
      p_external_customer_id,
      v_organization_customer_id,
      p_transaction_data,
      'synced',
      NOW()
    );
  END IF;

  -- Check if transaction already exists
  SELECT id INTO v_existing_transaction_id
  FROM aml_transactions
  WHERE customer_id = v_customer_id 
    AND external_transaction_id = p_external_transaction_id;
  
  -- If transaction doesn't exist, create it
  IF v_existing_transaction_id IS NULL THEN
    INSERT INTO aml_transactions (
      organization_customer_id,
      customer_id,
      external_transaction_id,
      from_account,
      to_account,
      amount,
      currency,
      transaction_type,
      transaction_date,
      description,
      risk_score,
      flags,
      status
    ) VALUES (
      v_organization_customer_id,
      v_customer_id,
      p_external_transaction_id,
      COALESCE(p_transaction_data->>'from_account', 'UNKNOWN'),
      COALESCE(p_transaction_data->>'to_account', 'UNKNOWN'),
      COALESCE((p_transaction_data->>'amount')::NUMERIC, 0),
      COALESCE(p_transaction_data->>'currency', 'USD'),
      COALESCE(p_transaction_data->>'transaction_type', 'transfer'),
      COALESCE((p_transaction_data->>'transaction_date')::TIMESTAMPTZ, NOW()),
      COALESCE(p_transaction_data->>'description', 'Transaction from data ingestion'),
      COALESCE((p_transaction_data->>'risk_score')::INTEGER, 50),
      COALESCE(p_transaction_data->>'flags', '[]'::JSONB),
      COALESCE(p_transaction_data->>'status', 'pending')
    )
    RETURNING id INTO v_transaction_id;
  ELSE
    v_transaction_id := v_existing_transaction_id;
  END IF;

  -- Update external transaction mapping
  INSERT INTO external_transaction_mappings (
    client_id,
    external_transaction_id,
    external_customer_id,
    transaction_data,
    compliance_status
  ) VALUES (
    p_client_id,
    p_external_transaction_id,
    p_external_customer_id,
    p_transaction_data,
    'pending'
  )
  ON CONFLICT (client_id, external_transaction_id) 
  DO UPDATE SET
    external_customer_id = EXCLUDED.external_customer_id,
    transaction_data = EXCLUDED.transaction_data,
    compliance_status = EXCLUDED.compliance_status;

  RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql;

-- Create a function to process customer data and link to existing transactions
CREATE OR REPLACE FUNCTION auto_link_customer_to_transactions(
  p_external_customer_id TEXT,
  p_client_id TEXT,
  p_customer_data JSONB
) RETURNS UUID AS $$
DECLARE
  v_organization_customer_id UUID;
  v_customer_id UUID;
  v_transaction_count INTEGER;
BEGIN
  -- Find the customer organization for this client
  SELECT id INTO v_customer_id
  FROM customers
  WHERE name = 'Test Organization' OR domain = p_client_id || '.com'
  LIMIT 1;
  
  IF v_customer_id IS NULL THEN
    RAISE EXCEPTION 'Customer organization not found for client_id: %', p_client_id;
  END IF;

  -- Check if the organization customer already exists
  SELECT id INTO v_organization_customer_id
  FROM organization_customers
  WHERE customer_id = v_customer_id 
    AND external_customer_id = p_external_customer_id;
  
  -- If organization customer doesn't exist, create it
  IF v_organization_customer_id IS NULL THEN
    INSERT INTO organization_customers (
      customer_id,
      external_customer_id,
      full_name,
      email,
      phone_number,
      date_of_birth,
      nationality,
      identity_number,
      address,
      country_of_residence,
      kyc_status,
      risk_score,
      is_pep,
      is_sanctioned,
      created_at,
      updated_at
    ) VALUES (
      v_customer_id,
      p_external_customer_id,
      COALESCE(p_customer_data->>'full_name', 'Unknown Customer'),
      p_customer_data->>'email',
      p_customer_data->>'phone_number',
      (p_customer_data->>'date_of_birth')::DATE,
      p_customer_data->>'nationality',
      p_customer_data->>'identity_number',
      p_customer_data->>'address',
      p_customer_data->>'country_of_residence',
      COALESCE(p_customer_data->>'kyc_status', 'pending'),
      COALESCE((p_customer_data->>'risk_score')::INTEGER, 50),
      COALESCE((p_customer_data->>'is_pep')::BOOLEAN, false),
      COALESCE((p_customer_data->>'is_sanctioned')::BOOLEAN, false),
      NOW(),
      NOW()
    )
    RETURNING id INTO v_organization_customer_id;
  END IF;

  -- Create external customer mapping
  INSERT INTO external_customer_mappings (
    client_id,
    external_customer_id,
    internal_user_id,
    customer_data,
    sync_status,
    last_synced_at
  ) VALUES (
    p_client_id,
    p_external_customer_id,
    v_organization_customer_id,
    p_customer_data,
    'synced',
    NOW()
  )
  ON CONFLICT (client_id, external_customer_id) 
  DO UPDATE SET
    internal_user_id = EXCLUDED.internal_user_id,
    customer_data = EXCLUDED.customer_data,
    sync_status = EXCLUDED.sync_status,
    last_synced_at = EXCLUDED.last_synced_at;

  -- Link any existing transactions for this customer
  UPDATE aml_transactions
  SET organization_customer_id = v_organization_customer_id
  WHERE customer_id = v_customer_id 
    AND external_transaction_id IN (
      SELECT external_transaction_id 
      FROM external_transaction_mappings 
      WHERE client_id = p_client_id 
        AND external_customer_id = p_external_customer_id
    );

  -- Get count of linked transactions
  SELECT COUNT(*) INTO v_transaction_count
  FROM aml_transactions
  WHERE organization_customer_id = v_organization_customer_id;

  RAISE NOTICE 'Customer % linked to % existing transactions', p_external_customer_id, v_transaction_count;

  RETURN v_organization_customer_id;
END;
$$ LANGUAGE plpgsql;

-- Create a function to process batch data ingestion with automatic linking
CREATE OR REPLACE FUNCTION process_batch_data_ingestion(
  p_client_id TEXT,
  p_data_type TEXT,
  p_records JSONB
) RETURNS JSONB AS $$
DECLARE
  v_record JSONB;
  v_result JSONB := '{"success_count": 0, "error_count": 0, "errors": []}'::JSONB;
  v_success_count INTEGER := 0;
  v_error_count INTEGER := 0;
  v_errors JSONB := '[]'::JSONB;
  v_transaction_id UUID;
  v_customer_id UUID;
BEGIN
  -- Process each record based on data type
  FOR v_record IN SELECT * FROM jsonb_array_elements(p_records)
  LOOP
    BEGIN
      IF p_data_type = 'transaction' THEN
        -- Process transaction and auto-link to customer
        SELECT auto_link_transaction_to_customer(
          v_record->>'external_id',
          v_record->>'customer_id',
          p_client_id,
          v_record
        ) INTO v_transaction_id;
        v_success_count := v_success_count + 1;
        
      ELSIF p_data_type = 'customer' THEN
        -- Process customer and auto-link to existing transactions
        SELECT auto_link_customer_to_transactions(
          v_record->>'external_id',
          p_client_id,
          v_record
        ) INTO v_customer_id;
        v_success_count := v_success_count + 1;
        
      ELSE
        RAISE EXCEPTION 'Unsupported data type: %', p_data_type;
      END IF;
      
    EXCEPTION WHEN OTHERS THEN
      v_error_count := v_error_count + 1;
      v_errors := v_errors || jsonb_build_object(
        'record_id', COALESCE(v_record->>'external_id', 'unknown'),
        'error', SQLERRM
      );
    END;
  END LOOP;

  -- Return results
  RETURN jsonb_build_object(
    'success_count', v_success_count,
    'error_count', v_error_count,
    'errors', v_errors,
    'total_processed', jsonb_array_length(p_records)
  );
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically link transactions when external mappings are created
CREATE OR REPLACE FUNCTION trigger_auto_link_transaction()
RETURNS TRIGGER AS $$
BEGIN
  -- If this is a new transaction mapping, try to link it to an existing customer
  IF TG_OP = 'INSERT' THEN
    PERFORM auto_link_transaction_to_customer(
      NEW.external_transaction_id,
      NEW.external_customer_id,
      NEW.client_id,
      NEW.transaction_data
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on external_transaction_mappings
CREATE TRIGGER auto_link_transaction_trigger
  AFTER INSERT ON external_transaction_mappings
  FOR EACH ROW
  EXECUTE FUNCTION trigger_auto_link_transaction();

-- Create a trigger to automatically link customers when external mappings are created
CREATE OR REPLACE FUNCTION trigger_auto_link_customer()
RETURNS TRIGGER AS $$
BEGIN
  -- If this is a new customer mapping, try to link it to existing transactions
  IF TG_OP = 'INSERT' THEN
    PERFORM auto_link_customer_to_transactions(
      NEW.external_customer_id,
      NEW.client_id,
      NEW.customer_data
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on external_customer_mappings
CREATE TRIGGER auto_link_customer_trigger
  AFTER INSERT ON external_customer_mappings
  FOR EACH ROW
  EXECUTE FUNCTION trigger_auto_link_customer();

-- Add indexes for better performance on linking operations
CREATE INDEX IF NOT EXISTS idx_organization_customers_external_customer_id 
ON organization_customers(external_customer_id);

CREATE INDEX IF NOT EXISTS idx_aml_transactions_external_transaction_id 
ON aml_transactions(external_transaction_id);

CREATE INDEX IF NOT EXISTS idx_external_transaction_mappings_customer_id 
ON external_transaction_mappings(external_customer_id);

-- Create a view to show linked data relationships
CREATE OR REPLACE VIEW linked_data_relationships AS
SELECT 
  c.client_id,
  c.external_customer_id,
  c.internal_user_id as customer_uuid,
  oc.full_name as customer_name,
  oc.email as customer_email,
  COUNT(t.id) as transaction_count,
  SUM(t.amount) as total_transaction_amount,
  MAX(t.transaction_date) as latest_transaction_date
FROM external_customer_mappings c
LEFT JOIN organization_customers oc ON c.internal_user_id = oc.id
LEFT JOIN aml_transactions t ON oc.id = t.organization_customer_id
GROUP BY c.client_id, c.external_customer_id, c.internal_user_id, oc.full_name, oc.email;

-- Grant permissions for the functions
GRANT EXECUTE ON FUNCTION auto_link_transaction_to_customer(TEXT, TEXT, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION auto_link_customer_to_transactions(TEXT, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION process_batch_data_ingestion(TEXT, TEXT, JSONB) TO authenticated;
GRANT SELECT ON linked_data_relationships TO authenticated;
