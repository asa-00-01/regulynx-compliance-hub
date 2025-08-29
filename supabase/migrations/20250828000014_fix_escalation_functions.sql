-- Fix nested aggregate function issues in escalation functions

-- Fix get_escalation_dashboard_stats function
CREATE OR REPLACE FUNCTION get_escalation_dashboard_stats(p_customer_id UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  total_escalations INTEGER;
  active_escalations INTEGER;
  sla_breaches_count INTEGER;
  escalation_levels JSONB;
  recent_escalations JSONB;
BEGIN
  -- Get total escalations
  SELECT COUNT(*) INTO total_escalations
  FROM public.escalation_history eh
  JOIN public.compliance_cases cc ON eh.case_id = cc.id
  WHERE cc.customer_id = p_customer_id;

  -- Get active escalations
  SELECT COUNT(*) INTO active_escalations
  FROM public.escalation_history eh
  JOIN public.compliance_cases cc ON eh.case_id = cc.id
  WHERE cc.customer_id = p_customer_id
  AND eh.resolved_at IS NULL;

  -- Get SLA breaches count
  SELECT COUNT(*) INTO sla_breaches_count
  FROM public.sla_tracking sla
  JOIN public.compliance_cases cc ON sla.case_id = cc.id
  WHERE cc.customer_id = p_customer_id
  AND sla.status = 'breached';

  -- Get escalation levels breakdown
  SELECT jsonb_object_agg(
    'level' || eh.escalation_level, 
    COUNT(*)
  ) INTO escalation_levels
  FROM public.escalation_history eh
  JOIN public.compliance_cases cc ON eh.case_id = cc.id
  WHERE cc.customer_id = p_customer_id
  GROUP BY eh.escalation_level;

  -- Get recent escalations
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', eh.id,
      'caseId', eh.case_id,
      'escalationLevel', eh.escalation_level,
      'reason', eh.reason,
      'escalationDate', eh.escalation_date,
      'resolvedAt', eh.resolved_at
    )
  ) INTO recent_escalations
  FROM public.escalation_history eh
  JOIN public.compliance_cases cc ON eh.case_id = cc.id
  WHERE cc.customer_id = p_customer_id
  ORDER BY eh.escalation_date DESC
  LIMIT 10;

  -- Build result
  result := jsonb_build_object(
    'totalEscalations', total_escalations,
    'activeEscalations', active_escalations,
    'slaBreaches', sla_breaches_count,
    'escalationLevels', COALESCE(escalation_levels, '{}'::jsonb),
    'recentEscalations', COALESCE(recent_escalations, '[]'::jsonb)
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix get_escalation_metrics function
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
  escalation_by_level JSONB;
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

  -- Get escalation by level
  SELECT jsonb_object_agg(
    'level' || eh.escalation_level, 
    COUNT(*)
  ) INTO escalation_by_level
  FROM public.escalation_history eh
  JOIN public.compliance_cases cc ON eh.case_id = cc.id
  WHERE cc.customer_id = p_customer_id
  GROUP BY eh.escalation_level;

  -- Get top escalated cases
  SELECT jsonb_agg(
    jsonb_build_object(
      'caseId', eh.case_id,
      'caseType', cc.type,
      'escalationLevel', eh.escalation_level,
      'escalationDate', eh.escalation_date,
      'assignedTo', eh.new_assigned_to
    )
  ) INTO top_escalated_cases
  FROM public.escalation_history eh
  JOIN public.compliance_cases cc ON eh.case_id = cc.id
  WHERE cc.customer_id = p_customer_id
  ORDER BY eh.escalation_date DESC
  LIMIT 5;

  -- Build result
  result := jsonb_build_object(
    'totalEscalations', total_escalations,
    'escalationsToday', escalations_today,
    'escalationsThisWeek', escalations_this_week,
    'escalationsThisMonth', escalations_this_month,
    'averageResolutionTime', average_resolution_time,
    'slaComplianceRate', sla_compliance_rate,
    'escalationByLevel', COALESCE(escalation_by_level, '{}'::jsonb),
    'topEscalatedCases', COALESCE(top_escalated_cases, '[]'::jsonb)
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_escalation_dashboard_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_escalation_metrics(UUID) TO authenticated;
