-- Fix pattern detection statistics function
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
