-- Fix JSONB conversion issues in automatic linking functions

-- Update the auto_link_transaction_to_customer function to handle JSONB conversion properly
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
  v_flags JSONB;
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
  
  -- Handle flags conversion properly
  IF p_transaction_data ? 'flags' THEN
    IF jsonb_typeof(p_transaction_data->'flags') = 'array' THEN
      v_flags := p_transaction_data->'flags';
    ELSE
      v_flags := '[]'::jsonb;
    END IF;
  ELSE
    v_flags := '[]'::jsonb;
  END IF;
  
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
      v_flags,
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
