-- Fix pattern detection recursion issue by modifying the trigger

-- Drop the existing trigger
DROP TRIGGER IF EXISTS real_time_pattern_detection_trigger ON aml_transactions;

-- Create a new trigger function that avoids recursion
CREATE OR REPLACE FUNCTION trigger_real_time_pattern_detection()
RETURNS TRIGGER AS $$
BEGIN
  -- Only run pattern detection for INSERT operations to avoid recursion
  IF TG_OP = 'INSERT' THEN
    -- Use a separate function call to avoid stack depth issues
    PERFORM detect_transaction_patterns_safe(NEW.id, NEW.customer_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a safe version of the pattern detection function
CREATE OR REPLACE FUNCTION detect_transaction_patterns_safe(
  p_transaction_id UUID,
  p_customer_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_transaction RECORD;
  v_pattern RECORD;
  v_detection_result JSONB := '[]'::jsonb;
  v_matched_patterns INTEGER := 0;
  v_total_risk_score INTEGER := 0;
  v_detection_record JSONB;
BEGIN
  -- Get transaction details
  SELECT * INTO v_transaction
  FROM aml_transactions
  WHERE id = p_transaction_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'transaction_id', p_transaction_id,
      'patterns_detected', 0,
      'total_risk_score', 0,
      'detections', '[]'::jsonb
    );
  END IF;

  -- Loop through active patterns
  FOR v_pattern IN 
    SELECT * FROM patterns 
    WHERE status = 'active' 
    AND customer_id IS NULL OR customer_id = p_customer_id
  LOOP
    -- Check pattern type and run detection
    IF v_pattern.category = 'structuring' THEN
      -- Structuring pattern detection
      IF detect_structuring_pattern_safe(v_transaction, v_pattern, p_customer_id) THEN
        v_detection_record := create_detection_record_safe(
          v_pattern, v_transaction, 'structuring', p_customer_id
        );
        v_detection_result := v_detection_result || v_detection_record;
        v_matched_patterns := v_matched_patterns + 1;
        v_total_risk_score := v_total_risk_score + v_pattern.risk_score;
      END IF;
      
    ELSIF v_pattern.category = 'high_risk_corridor' THEN
      -- High-risk corridor pattern detection
      IF detect_high_risk_corridor_pattern_safe(v_transaction, v_pattern) THEN
        v_detection_record := create_detection_record_safe(
          v_pattern, v_transaction, 'high_risk_corridor', p_customer_id
        );
        v_detection_result := v_detection_result || v_detection_record;
        v_matched_patterns := v_matched_patterns + 1;
        v_total_risk_score := v_total_risk_score + v_pattern.risk_score;
      END IF;
      
    ELSIF v_pattern.category = 'time_pattern' THEN
      -- Time-based pattern detection
      IF detect_time_pattern_safe(v_transaction, v_pattern, p_customer_id) THEN
        v_detection_record := create_detection_record_safe(
          v_pattern, v_transaction, 'time_pattern', p_customer_id
        );
        v_detection_result := v_detection_result || v_detection_record;
        v_matched_patterns := v_matched_patterns + 1;
        v_total_risk_score := v_total_risk_score + v_pattern.risk_score;
      END IF;
      
    ELSIF v_pattern.category = 'velocity' THEN
      -- Velocity pattern detection
      IF detect_velocity_pattern_safe(v_transaction, v_pattern, p_customer_id) THEN
        v_detection_record := create_detection_record_safe(
          v_pattern, v_transaction, 'velocity', p_customer_id
        );
        v_detection_result := v_detection_result || v_detection_record;
        v_matched_patterns := v_matched_patterns + 1;
        v_total_risk_score := v_total_risk_score + v_pattern.risk_score;
      END IF;
    END IF;
  END LOOP;

  -- Update transaction risk score if patterns detected (without triggering recursion)
  IF v_matched_patterns > 0 THEN
    UPDATE aml_transactions 
    SET risk_score = GREATEST(risk_score, v_total_risk_score),
        flags = CASE 
          WHEN flags IS NULL THEN jsonb_build_array('pattern_detected')
          ELSE flags || jsonb_build_array('pattern_detected')
        END
    WHERE id = p_transaction_id;
  END IF;

  RETURN jsonb_build_object(
    'transaction_id', p_transaction_id,
    'patterns_detected', v_matched_patterns,
    'total_risk_score', v_total_risk_score,
    'detections', v_detection_result
  );
END;
$$ LANGUAGE plpgsql;

-- Create safe versions of detection functions
CREATE OR REPLACE FUNCTION detect_structuring_pattern_safe(
  p_transaction RECORD,
  p_pattern RECORD,
  p_customer_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_threshold NUMERIC := 10000;
  v_time_window INTERVAL := INTERVAL '24 hours';
  v_similar_transactions INTEGER := 0;
  v_total_amount NUMERIC := 0;
BEGIN
  -- Get threshold from pattern configuration
  IF p_pattern.threshold_config ? 'amount_threshold' THEN
    v_threshold := (p_pattern.threshold_config->>'amount_threshold')::NUMERIC;
  END IF;
  
  IF p_pattern.threshold_config ? 'time_window' THEN
    v_time_window := (p_pattern.threshold_config->>'time_window')::INTERVAL;
  END IF;

  -- Count similar transactions within time window
  SELECT COUNT(*), COALESCE(SUM(amount), 0)
  INTO v_similar_transactions, v_total_amount
  FROM aml_transactions
  WHERE organization_customer_id = p_transaction.organization_customer_id
    AND customer_id = p_customer_id
    AND transaction_date >= p_transaction.transaction_date - v_time_window
    AND transaction_date <= p_transaction.transaction_date
    AND amount >= v_threshold * 0.8
    AND amount < v_threshold;

  RETURN v_similar_transactions >= 3 AND v_total_amount >= v_threshold * 2;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION detect_high_risk_corridor_pattern_safe(
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

CREATE OR REPLACE FUNCTION detect_velocity_pattern_safe(
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

  RETURN v_transaction_count > v_max_transactions;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION detect_time_pattern_safe(
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
    RETURN v_transaction_hour >= v_off_hours_start OR v_transaction_hour <= v_off_hours_end;
  ELSE
    RETURN v_transaction_hour >= v_off_hours_start AND v_transaction_hour <= v_off_hours_end;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_detection_record_safe(
  p_pattern RECORD,
  p_transaction RECORD,
  p_detection_type TEXT,
  p_customer_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_detection_id UUID;
  v_alert_id UUID;
  v_confidence_score DECIMAL(5,2) := 85.0;
BEGIN
  -- Create detection record
  INSERT INTO pattern_detections (
    pattern_id,
    organization_customer_id,
    customer_id,
    detection_type,
    severity,
    confidence_score,
    risk_score,
    detection_data,
    matched_transactions,
    detection_summary
  ) VALUES (
    p_pattern.id,
    p_transaction.organization_customer_id,
    p_customer_id,
    p_detection_type,
    p_pattern.severity,
    v_confidence_score,
    p_pattern.risk_score,
    jsonb_build_object(
      'transaction_id', p_transaction.id,
      'amount', p_transaction.amount,
      'currency', p_transaction.currency,
      'transaction_type', p_transaction.transaction_type,
      'transaction_date', p_transaction.transaction_date
    ),
    jsonb_build_array(jsonb_build_object(
      'id', p_transaction.id,
      'amount', p_transaction.amount,
      'currency', p_transaction.currency,
      'transaction_date', p_transaction.transaction_date
    )),
    p_pattern.description || ' detected for transaction ' || p_transaction.external_transaction_id
  ) RETURNING id INTO v_detection_id;

  -- Create alert if severity is medium or higher
  IF p_pattern.severity IN ('medium', 'high', 'critical') THEN
    INSERT INTO pattern_alerts (
      detection_id,
      customer_id,
      alert_type,
      severity,
      title,
      description,
      alert_data
    ) VALUES (
      v_detection_id,
      p_customer_id,
      p_detection_type,
      p_pattern.severity,
      p_pattern.name || ' Alert',
      p_pattern.description || ' detected for customer transaction.',
      jsonb_build_object(
        'pattern_id', p_pattern.id,
        'transaction_id', p_transaction.id,
        'confidence_score', v_confidence_score
      )
    ) RETURNING id INTO v_alert_id;

    -- Update detection with alert ID
    UPDATE pattern_detections 
    SET alert_id = v_alert_id, is_alert_generated = true
    WHERE id = v_detection_id;
  END IF;

  RETURN jsonb_build_object(
    'detection_id', v_detection_id,
    'alert_id', v_alert_id,
    'pattern_name', p_pattern.name,
    'severity', p_pattern.severity,
    'confidence', v_confidence_score
  );
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER real_time_pattern_detection_trigger
  AFTER INSERT ON aml_transactions
  FOR EACH ROW
  EXECUTE FUNCTION trigger_real_time_pattern_detection();
