-- Fix missing FROM-clause issue in get_escalation_metrics function

CREATE OR REPLACE FUNCTION get_escalation_metrics(p_customer_id UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  total_escalations INTEGER;
  escalations_today INTEGER;
  escalations_this_week INTEGER;
  escalations_this_month INTEGER;
  average_resolution_time NUMERIC;
  sla_compliance_rate NUMERIC;
  top_escalated_cases JSONB;
  today DATE := CURRENT_DATE;
  week_ago DATE := today - INTERVAL '7 days';
  month_ago DATE := today - INTERVAL '30 days';
BEGIN
  -- Get total escalations
  SELECT COUNT(*) INTO total_escalations
  FROM public.escalation_history eh
  JOIN public.compliance_cases cc ON eh.case_id = cc.id
  WHERE cc.customer_id = p_customer_id;

  -- Get escalations today
  SELECT COUNT(*) INTO escalations_today
  FROM public.escalation_history eh
  JOIN public.compliance_cases cc ON eh.case_id = cc.id
  WHERE cc.customer_id = p_customer_id
  AND DATE(eh.escalation_date) = today;

  -- Get escalations this week
  SELECT COUNT(*) INTO escalations_this_week
  FROM public.escalation_history eh
  JOIN public.compliance_cases cc ON eh.case_id = cc.id
  WHERE cc.customer_id = p_customer_id
  AND DATE(eh.escalation_date) >= week_ago;

  -- Get escalations this month
  SELECT COUNT(*) INTO escalations_this_month
  FROM public.escalation_history eh
  JOIN public.compliance_cases cc ON eh.case_id = cc.id
  WHERE cc.customer_id = p_customer_id
  AND DATE(eh.escalation_date) >= month_ago;

  -- Get average resolution time
  SELECT COALESCE(AVG(
    EXTRACT(EPOCH FROM (eh.resolved_at - eh.escalation_date)) / 3600
  ), 0) INTO average_resolution_time
  FROM public.escalation_history eh
  JOIN public.compliance_cases cc ON eh.case_id = cc.id
  WHERE cc.customer_id = p_customer_id
  AND eh.resolved_at IS NOT NULL;

  -- Get SLA compliance rate
  SELECT COALESCE(
    (COUNT(*) FILTER (WHERE sla.status = 'met')) * 100.0 / NULLIF(COUNT(*), 0),
    100
  ) INTO sla_compliance_rate
  FROM public.sla_tracking sla
  JOIN public.compliance_cases cc ON sla.case_id = cc.id
  WHERE cc.customer_id = p_customer_id;

  -- Get top escalated cases (simplified)
  SELECT jsonb_agg(
    jsonb_build_object(
      'caseId', eh.case_id,
      'caseType', cc.type,
      'escalationLevel', eh.escalation_level,
      'escalationDate', eh.escalation_date,
      'assignedTo', eh.new_assigned_to
    )
  ) INTO top_escalated_cases
  FROM (
    SELECT eh.case_id, cc.type, eh.escalation_level, eh.escalation_date, eh.new_assigned_to
    FROM public.escalation_history eh
    JOIN public.compliance_cases cc ON eh.case_id = cc.id
    WHERE cc.customer_id = p_customer_id
    ORDER BY eh.escalation_date DESC
    LIMIT 5
  ) eh;

  -- Build result
  result := jsonb_build_object(
    'totalEscalations', total_escalations,
    'escalationsToday', escalations_today,
    'escalationsThisWeek', escalations_this_week,
    'escalationsThisMonth', escalations_this_month,
    'averageResolutionTime', average_resolution_time,
    'slaComplianceRate', sla_compliance_rate,
    'escalationByLevel', '{}'::jsonb, -- Simplified for now
    'topEscalatedCases', COALESCE(top_escalated_cases, '[]'::jsonb)
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_escalation_metrics(UUID) TO authenticated;
