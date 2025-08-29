-- Fix pattern detection functions with correct syntax

-- Fix the high-risk corridor pattern detection function
CREATE OR REPLACE FUNCTION detect_high_risk_corridor_pattern(
  p_transaction RECORD,
  p_pattern RECORD
) RETURNS BOOLEAN AS $$
DECLARE
  v_high_risk_countries TEXT[] := ARRAY['AF', 'IR', 'KP', 'CU', 'VE', 'RU'];
  v_amount_threshold NUMERIC := 5000;
  v_country TEXT;
BEGIN
  -- Get high-risk countries from pattern configuration
  IF p_pattern.pattern_rules ? 'high_risk_countries' THEN
    v_high_risk_countries := ARRAY(SELECT jsonb_array_elements_text(p_pattern.pattern_rules->'high_risk_countries'));
  END IF;
  
  IF p_pattern.threshold_config ? 'amount_threshold' THEN
    v_amount_threshold := (p_pattern.threshold_config->>'amount_threshold')::NUMERIC;
  END IF;

  -- Check if transaction involves high-risk country and exceeds threshold
  IF p_transaction.amount >= v_amount_threshold THEN
    -- Check if from_account or to_account contains any high-risk country
    FOREACH v_country IN ARRAY v_high_risk_countries
    LOOP
      IF p_transaction.from_account LIKE '%' || v_country || '%'
         OR p_transaction.to_account LIKE '%' || v_country || '%' THEN
        RETURN true;
      END IF;
    END LOOP;
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql;

-- Fix the velocity pattern detection function
CREATE OR REPLACE FUNCTION detect_velocity_pattern(
  p_transaction RECORD,
  p_pattern RECORD,
  p_customer_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_max_transactions INTEGER := 10;
  v_time_window INTERVAL := INTERVAL '1 hour';
  v_transaction_count INTEGER := 0;
BEGIN
  -- Get configuration from pattern
  IF p_pattern.pattern_rules ? 'max_transactions_per_hour' THEN
    v_max_transactions := (p_pattern.pattern_rules->>'max_transactions_per_hour')::INTEGER;
  END IF;
  
  IF p_pattern.threshold_config ? 'time_window' THEN
    v_time_window := (p_pattern.threshold_config->>'time_window')::INTERVAL;
  END IF;

  -- Count transactions within time window
  SELECT COUNT(*)
  INTO v_transaction_count
  FROM aml_transactions
  WHERE organization_customer_id = p_transaction.organization_customer_id
    AND customer_id = p_customer_id
    AND transaction_date >= p_transaction.transaction_date - v_time_window
    AND transaction_date <= p_transaction.transaction_date;

  -- Return true if velocity threshold exceeded
  RETURN v_transaction_count > v_max_transactions;
END;
$$ LANGUAGE plpgsql;

-- Fix the time pattern detection function
CREATE OR REPLACE FUNCTION detect_time_pattern(
  p_transaction RECORD,
  p_pattern RECORD,
  p_customer_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_off_hours_start INTEGER := 22;
  v_off_hours_end INTEGER := 6;
  v_transaction_hour INTEGER;
BEGIN
  -- Get configuration from pattern
  IF p_pattern.pattern_rules ? 'off_hours_start' THEN
    v_off_hours_start := (p_pattern.pattern_rules->>'off_hours_start')::INTEGER;
  END IF;
  
  IF p_pattern.pattern_rules ? 'off_hours_end' THEN
    v_off_hours_end := (p_pattern.pattern_rules->>'off_hours_end')::INTEGER;
  END IF;

  -- Get transaction hour
  v_transaction_hour := EXTRACT(HOUR FROM p_transaction.transaction_date);

  -- Check if transaction is during off-hours
  IF v_off_hours_start > v_off_hours_end THEN
    -- Off-hours span midnight (e.g., 22:00 to 06:00)
    RETURN v_transaction_hour >= v_off_hours_start OR v_transaction_hour <= v_off_hours_end;
  ELSE
    -- Off-hours within same day
    RETURN v_transaction_hour >= v_off_hours_start AND v_transaction_hour <= v_off_hours_end;
  END IF;
END;
$$ LANGUAGE plpgsql;
