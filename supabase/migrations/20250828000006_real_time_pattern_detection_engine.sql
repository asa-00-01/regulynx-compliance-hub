-- Real-Time Pattern Detection Engine for AML Transaction Monitoring
-- This migration creates a comprehensive system for detecting suspicious transaction patterns in real-time

-- Create enhanced pattern detection enums
CREATE TYPE public.pattern_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE public.pattern_status AS ENUM ('active', 'inactive', 'draft', 'archived');
CREATE TYPE public.detection_method AS ENUM ('rule_based', 'ml_model', 'statistical', 'behavioral');

-- Enhanced patterns table with more sophisticated pattern definitions
ALTER TABLE public.patterns ADD COLUMN IF NOT EXISTS severity public.pattern_severity DEFAULT 'medium';
ALTER TABLE public.patterns ADD COLUMN IF NOT EXISTS status public.pattern_status DEFAULT 'active';
ALTER TABLE public.patterns ADD COLUMN IF NOT EXISTS detection_method public.detection_method DEFAULT 'rule_based';
ALTER TABLE public.patterns ADD COLUMN IF NOT EXISTS pattern_rules JSONB DEFAULT '{}';
ALTER TABLE public.patterns ADD COLUMN IF NOT EXISTS threshold_config JSONB DEFAULT '{}';
ALTER TABLE public.patterns ADD COLUMN IF NOT EXISTS risk_score INTEGER DEFAULT 50;
ALTER TABLE public.patterns ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES public.customers(id);
ALTER TABLE public.patterns ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id);
ALTER TABLE public.patterns ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Create real-time pattern detection results table
CREATE TABLE public.pattern_detections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_id UUID NOT NULL REFERENCES public.patterns(id) ON DELETE CASCADE,
  organization_customer_id UUID NOT NULL REFERENCES public.organization_customers(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  detection_type TEXT NOT NULL,
  severity public.pattern_severity NOT NULL,
  confidence_score DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  risk_score INTEGER NOT NULL DEFAULT 0,
  detection_data JSONB NOT NULL DEFAULT '{}',
  matched_transactions JSONB NOT NULL DEFAULT '[]',
  detection_summary TEXT,
  is_alert_generated BOOLEAN DEFAULT false,
  alert_id UUID,
  case_id UUID,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewing', 'resolved', 'false_positive', 'escalated')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create pattern detection alerts table
CREATE TABLE public.pattern_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  detection_id UUID NOT NULL REFERENCES public.pattern_detections(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL,
  severity public.pattern_severity NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  alert_data JSONB NOT NULL DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  is_acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID REFERENCES public.profiles(id),
  acknowledged_at TIMESTAMPTZ,
  escalation_level INTEGER DEFAULT 0,
  auto_escalate_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create real-time monitoring configuration table
CREATE TABLE public.monitoring_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  config_name TEXT NOT NULL,
  config_type TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  config_data JSONB NOT NULL DEFAULT '{}',
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(customer_id, config_name)
);

-- Create pattern detection statistics table
CREATE TABLE public.pattern_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  pattern_id UUID REFERENCES public.patterns(id) ON DELETE SET NULL,
  detection_date DATE NOT NULL,
  total_detections INTEGER DEFAULT 0,
  true_positives INTEGER DEFAULT 0,
  false_positives INTEGER DEFAULT 0,
  average_confidence DECIMAL(5,2) DEFAULT 0.00,
  average_risk_score INTEGER DEFAULT 0,
  total_transaction_volume NUMERIC(15,2) DEFAULT 0,
  total_transaction_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(customer_id, pattern_id, detection_date)
);

-- Create indexes for performance
CREATE INDEX idx_pattern_detections_customer_id ON public.pattern_detections(customer_id);
CREATE INDEX idx_pattern_detections_organization_customer_id ON public.pattern_detections(organization_customer_id);
CREATE INDEX idx_pattern_detections_pattern_id ON public.pattern_detections(pattern_id);
CREATE INDEX idx_pattern_detections_status ON public.pattern_detections(status);
CREATE INDEX idx_pattern_detections_created_at ON public.pattern_detections(created_at);
CREATE INDEX idx_pattern_detections_severity ON public.pattern_detections(severity);

CREATE INDEX idx_pattern_alerts_customer_id ON public.pattern_alerts(customer_id);
CREATE INDEX idx_pattern_alerts_detection_id ON public.pattern_alerts(detection_id);
CREATE INDEX idx_pattern_alerts_severity ON public.pattern_alerts(severity);
CREATE INDEX idx_pattern_alerts_is_read ON public.pattern_alerts(is_read);
CREATE INDEX idx_pattern_alerts_created_at ON public.pattern_alerts(created_at);

CREATE INDEX idx_monitoring_configs_customer_id ON public.monitoring_configs(customer_id);
CREATE INDEX idx_monitoring_configs_is_active ON public.monitoring_configs(is_active);

CREATE INDEX idx_pattern_statistics_customer_date ON public.pattern_statistics(customer_id, detection_date);
CREATE INDEX idx_pattern_statistics_pattern_date ON public.pattern_statistics(pattern_id, detection_date);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_pattern_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for timestamp updates
CREATE TRIGGER update_pattern_detections_timestamp
  BEFORE UPDATE ON public.pattern_detections
  FOR EACH ROW
  EXECUTE FUNCTION update_pattern_timestamps();

CREATE TRIGGER update_pattern_alerts_timestamp
  BEFORE UPDATE ON public.pattern_alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_pattern_timestamps();

CREATE TRIGGER update_monitoring_configs_timestamp
  BEFORE UPDATE ON public.monitoring_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_pattern_timestamps();

CREATE TRIGGER update_pattern_statistics_timestamp
  BEFORE UPDATE ON public.pattern_statistics
  FOR EACH ROW
  EXECUTE FUNCTION update_pattern_timestamps();

-- Create function for real-time pattern detection
CREATE OR REPLACE FUNCTION detect_transaction_patterns(
  p_transaction_id UUID,
  p_customer_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_transaction RECORD;
  v_pattern RECORD;
  v_detection_result JSONB := '[]'::JSONB;
  v_detection_id UUID;
  v_alert_id UUID;
  v_matched_patterns INTEGER := 0;
  v_total_risk_score INTEGER := 0;
BEGIN
  -- Get transaction details
  SELECT * INTO v_transaction
  FROM aml_transactions
  WHERE id = p_transaction_id AND customer_id = p_customer_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Transaction not found');
  END IF;

  -- Check each active pattern for this customer
  FOR v_pattern IN 
    SELECT p.*, oc.id as organization_customer_id
    FROM patterns p
    CROSS JOIN organization_customers oc
    WHERE p.status = 'active' 
      AND (p.customer_id = p_customer_id OR p.customer_id IS NULL)
      AND oc.customer_id = p_customer_id
      AND oc.id = v_transaction.organization_customer_id
  LOOP
    -- Apply pattern detection logic based on pattern type
    IF v_pattern.category = 'structuring' THEN
      -- Structuring detection: multiple transactions just below reporting threshold
      IF detect_structuring_pattern(v_transaction, v_pattern, p_customer_id) THEN
        v_detection_result := v_detection_result || create_detection_record(
          v_pattern, v_transaction, 'structuring', p_customer_id
        );
        v_matched_patterns := v_matched_patterns + 1;
        v_total_risk_score := v_total_risk_score + v_pattern.risk_score;
      END IF;
      
    ELSIF v_pattern.category = 'high_risk_corridor' THEN
      -- High-risk corridor detection: transactions to sanctioned countries
      IF detect_high_risk_corridor_pattern(v_transaction, v_pattern) THEN
        v_detection_result := v_detection_result || create_detection_record(
          v_pattern, v_transaction, 'high_risk_corridor', p_customer_id
        );
        v_matched_patterns := v_matched_patterns + 1;
        v_total_risk_score := v_total_risk_score + v_pattern.risk_score;
      END IF;
      
    ELSIF v_pattern.category = 'time_pattern' THEN
      -- Time-based pattern detection: off-hours, rapid succession
      IF detect_time_pattern(v_transaction, v_pattern, p_customer_id) THEN
        v_detection_result := v_detection_result || create_detection_record(
          v_pattern, v_transaction, 'time_pattern', p_customer_id
        );
        v_matched_patterns := v_matched_patterns + 1;
        v_total_risk_score := v_total_risk_score + v_pattern.risk_score;
      END IF;
      
    ELSIF v_pattern.category = 'velocity' THEN
      -- Velocity pattern detection: high transaction frequency
      IF detect_velocity_pattern(v_transaction, v_pattern, p_customer_id) THEN
        v_detection_result := v_detection_result || create_detection_record(
          v_pattern, v_transaction, 'velocity', p_customer_id
        );
        v_matched_patterns := v_matched_patterns + 1;
        v_total_risk_score := v_total_risk_score + v_pattern.risk_score;
      END IF;
    END IF;
  END LOOP;

  -- Update transaction risk score if patterns detected
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

-- Helper function to detect structuring patterns
CREATE OR REPLACE FUNCTION detect_structuring_pattern(
  p_transaction RECORD,
  p_pattern RECORD,
  p_customer_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_threshold NUMERIC := 10000; -- Default $10,000 threshold
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
    AND amount >= v_threshold * 0.8  -- 80% of threshold
    AND amount < v_threshold;         -- Below threshold

  -- Return true if structuring pattern detected
  RETURN v_similar_transactions >= 3 AND v_total_amount >= v_threshold * 2;
END;
$$ LANGUAGE plpgsql;

-- Helper function to detect high-risk corridor patterns
CREATE OR REPLACE FUNCTION detect_high_risk_corridor_pattern(
  p_transaction RECORD,
  p_pattern RECORD
) RETURNS BOOLEAN AS $$
DECLARE
  v_high_risk_countries TEXT[] := ARRAY['AF', 'IR', 'KP', 'CU', 'VE', 'RU'];
  v_amount_threshold NUMERIC := 5000;
BEGIN
  -- Get high-risk countries from pattern configuration
  IF p_pattern.pattern_rules ? 'high_risk_countries' THEN
    v_high_risk_countries := ARRAY(SELECT jsonb_array_elements_text(p_pattern.pattern_rules->'high_risk_countries'));
  END IF;
  
  IF p_pattern.threshold_config ? 'amount_threshold' THEN
    v_amount_threshold := (p_pattern.threshold_config->>'amount_threshold')::NUMERIC;
  END IF;

  -- Check if transaction involves high-risk country and exceeds threshold
  RETURN p_transaction.amount >= v_amount_threshold 
    AND (p_transaction.from_account LIKE '%' || ANY(v_high_risk_countries) || '%'
         OR p_transaction.to_account LIKE '%' || ANY(v_high_risk_countries) || '%');
END;
$$ LANGUAGE plpgsql;

-- Helper function to detect time-based patterns
CREATE OR REPLACE FUNCTION detect_time_pattern(
  p_transaction RECORD,
  p_pattern RECORD,
  p_customer_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_time_window INTERVAL := INTERVAL '1 hour';
  v_transaction_count INTEGER := 0;
  v_hour INTEGER;
BEGIN
  -- Get time window from pattern configuration
  IF p_pattern.threshold_config ? 'time_window' THEN
    v_time_window := (p_pattern.threshold_config->>'time_window')::INTERVAL;
  END IF;

  -- Get hour of transaction
  v_hour := EXTRACT(HOUR FROM p_transaction.transaction_date);

  -- Check for off-hours transactions (between 10 PM and 6 AM)
  IF v_hour >= 22 OR v_hour <= 6 THEN
    -- Count transactions in recent time window
    SELECT COUNT(*)
    INTO v_transaction_count
    FROM aml_transactions
    WHERE organization_customer_id = p_transaction.organization_customer_id
      AND customer_id = p_customer_id
      AND transaction_date >= p_transaction.transaction_date - v_time_window
      AND transaction_date <= p_transaction.transaction_date;

    RETURN v_transaction_count >= 3; -- Multiple transactions in off-hours
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql;

-- Helper function to detect velocity patterns
CREATE OR REPLACE FUNCTION detect_velocity_pattern(
  p_transaction RECORD,
  p_pattern RECORD,
  p_customer_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_time_window INTERVAL := INTERVAL '1 hour';
  v_transaction_limit INTEGER := 10;
  v_transaction_count INTEGER := 0;
BEGIN
  -- Get configuration from pattern
  IF p_pattern.threshold_config ? 'time_window' THEN
    v_time_window := (p_pattern.threshold_config->>'time_window')::INTERVAL;
  END IF;
  
  IF p_pattern.threshold_config ? 'transaction_limit' THEN
    v_transaction_limit := (p_pattern.threshold_config->>'transaction_limit')::INTEGER;
  END IF;

  -- Count transactions in time window
  SELECT COUNT(*)
  INTO v_transaction_count
  FROM aml_transactions
  WHERE organization_customer_id = p_transaction.organization_customer_id
    AND customer_id = p_customer_id
    AND transaction_date >= p_transaction.transaction_date - v_time_window
    AND transaction_date <= p_transaction.transaction_date;

  RETURN v_transaction_count > v_transaction_limit;
END;
$$ LANGUAGE plpgsql;

-- Helper function to create detection record
CREATE OR REPLACE FUNCTION create_detection_record(
  p_pattern RECORD,
  p_transaction RECORD,
  p_detection_type TEXT,
  p_customer_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_detection_id UUID;
  v_alert_id UUID;
  v_confidence_score DECIMAL(5,2) := 85.0; -- Default confidence
BEGIN
  -- Insert detection record
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

-- Create trigger for real-time pattern detection on transaction insert/update
CREATE OR REPLACE FUNCTION trigger_real_time_pattern_detection()
RETURNS TRIGGER AS $$
BEGIN
  -- Run pattern detection for new or updated transactions
  PERFORM detect_transaction_patterns(NEW.id, NEW.customer_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on aml_transactions
CREATE TRIGGER real_time_pattern_detection_trigger
  AFTER INSERT OR UPDATE ON aml_transactions
  FOR EACH ROW
  EXECUTE FUNCTION trigger_real_time_pattern_detection();

-- Create function to get pattern detection statistics
CREATE OR REPLACE FUNCTION get_pattern_detection_stats(
  p_customer_id UUID,
  p_date_from DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  p_date_to DATE DEFAULT CURRENT_DATE
) RETURNS JSONB AS $$
DECLARE
  v_stats JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_detections', COUNT(*),
    'by_severity', (
      SELECT jsonb_object_agg(severity, count)
      FROM (
        SELECT severity, COUNT(*) as count
        FROM pattern_detections
        WHERE customer_id = p_customer_id
          AND DATE(created_at) BETWEEN p_date_from AND p_date_to
        GROUP BY severity
      ) severity_counts
    ),
    'by_pattern_type', (
      SELECT jsonb_object_agg(detection_type, count)
      FROM (
        SELECT detection_type, COUNT(*) as count
        FROM pattern_detections
        WHERE customer_id = p_customer_id
          AND DATE(created_at) BETWEEN p_date_from AND p_date_to
        GROUP BY detection_type
      ) type_counts
    ),
    'average_confidence', AVG(confidence_score),
    'average_risk_score', AVG(risk_score),
    'alerts_generated', COUNT(*) FILTER (WHERE is_alert_generated = true),
    'resolved_detections', COUNT(*) FILTER (WHERE status = 'resolved'),
    'pending_review', COUNT(*) FILTER (WHERE status = 'new')
  ) INTO v_stats
  FROM pattern_detections
  WHERE customer_id = p_customer_id
    AND DATE(created_at) BETWEEN p_date_from AND p_date_to;

  RETURN v_stats;
END;
$$ LANGUAGE plpgsql;

-- Insert default patterns for testing
INSERT INTO patterns (
  name, 
  description, 
  category, 
  severity, 
  status, 
  detection_method,
  pattern_rules,
  threshold_config,
  risk_score
) VALUES 
(
  'Structuring Detection',
  'Detects multiple transactions just below reporting thresholds',
  'structuring',
  'high',
  'active',
  'rule_based',
  '{"threshold_amount": 10000, "time_window": "24 hours", "min_transactions": 3}',
  '{"amount_threshold": 10000, "time_window": "24 hours"}',
  85
),
(
  'High-Risk Corridor Monitoring',
  'Detects transactions to sanctioned or high-risk countries',
  'high_risk_corridor',
  'critical',
  'active',
  'rule_based',
  '{"high_risk_countries": ["AF", "IR", "KP", "CU", "VE", "RU"]}',
  '{"amount_threshold": 5000}',
  95
),
(
  'Off-Hours Trading Pattern',
  'Detects unusual transaction activity during off-hours',
  'time_pattern',
  'medium',
  'active',
  'rule_based',
  '{"off_hours_start": 22, "off_hours_end": 6}',
  '{"time_window": "1 hour"}',
  70
),
(
  'High Transaction Velocity',
  'Detects unusually high frequency of transactions',
  'velocity',
  'medium',
  'active',
  'rule_based',
  '{"max_transactions_per_hour": 10}',
  '{"time_window": "1 hour", "transaction_limit": 10}',
  75
)
ON CONFLICT DO NOTHING;

-- Enable RLS on new tables
ALTER TABLE public.pattern_detections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pattern_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monitoring_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pattern_statistics ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT EXECUTE ON FUNCTION detect_transaction_patterns(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_pattern_detection_stats(UUID, DATE, DATE) TO authenticated;
GRANT SELECT, INSERT, UPDATE ON pattern_detections TO authenticated;
GRANT SELECT, INSERT, UPDATE ON pattern_alerts TO authenticated;
GRANT SELECT, INSERT, UPDATE ON monitoring_configs TO authenticated;
GRANT SELECT, INSERT, UPDATE ON pattern_statistics TO authenticated;
