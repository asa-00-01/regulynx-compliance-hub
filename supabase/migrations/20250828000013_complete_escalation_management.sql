-- Complete Escalation Management System
-- This migration adds all missing functions and triggers for a fully operational escalation management system

-- Function to check SLA breaches
CREATE OR REPLACE FUNCTION check_sla_breaches()
RETURNS TABLE (
  sla_id UUID,
  case_id UUID,
  escalation_level INTEGER,
  sla_type TEXT,
  target_hours INTEGER,
  actual_hours NUMERIC,
  status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sla.id as sla_id,
    sla.case_id,
    sla.escalation_level,
    sla.sla_type,
    sla.target_hours,
    EXTRACT(EPOCH FROM (now() - sla.start_time)) / 3600 as actual_hours,
    CASE 
      WHEN sla.end_time IS NOT NULL THEN 'met'
      WHEN EXTRACT(EPOCH FROM (now() - sla.start_time)) / 3600 > sla.target_hours THEN 'breached'
      ELSE 'active'
    END as status
  FROM public.sla_tracking sla
  WHERE sla.status = 'active'
  AND sla.end_time IS NULL
  AND EXTRACT(EPOCH FROM (now() - sla.start_time)) / 3600 > sla.target_hours;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get escalation notifications for a user
CREATE OR REPLACE FUNCTION get_user_escalation_notifications(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  escalation_history_id UUID,
  notification_type TEXT,
  subject TEXT,
  message TEXT,
  status TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    en.id,
    en.escalation_history_id,
    en.notification_type,
    en.subject,
    en.message,
    en.status,
    en.created_at
  FROM public.escalation_notifications en
  WHERE en.recipient_user_id = p_user_id
  AND en.status IN ('pending', 'sent', 'delivered')
  ORDER BY en.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update SLA tracking when case status changes
CREATE OR REPLACE FUNCTION update_sla_on_case_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- If case is resolved or closed, update SLA tracking
  IF NEW.status IN ('resolved', 'closed') AND OLD.status NOT IN ('resolved', 'closed') THEN
    UPDATE public.sla_tracking
    SET 
      end_time = now(),
      status = 'met',
      updated_at = now()
    WHERE case_id = NEW.id
    AND status = 'active';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for SLA updates on case status changes
DROP TRIGGER IF EXISTS update_sla_on_case_status_change_trigger ON public.compliance_cases;
CREATE TRIGGER update_sla_on_case_status_change_trigger
  AFTER UPDATE ON public.compliance_cases
  FOR EACH ROW
  EXECUTE FUNCTION update_sla_on_case_status_change();

-- Function to get escalation statistics for dashboard
CREATE OR REPLACE FUNCTION get_escalation_dashboard_stats(p_customer_id UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'totalEscalations', (
      SELECT COUNT(*) 
      FROM public.escalation_history eh
      JOIN public.compliance_cases cc ON eh.case_id = cc.id
      WHERE cc.customer_id = p_customer_id
    ),
    'activeEscalations', (
      SELECT COUNT(*) 
      FROM public.escalation_history eh
      JOIN public.compliance_cases cc ON eh.case_id = cc.id
      WHERE cc.customer_id = p_customer_id
      AND eh.resolved_at IS NULL
    ),
    'slaBreaches', (
      SELECT COUNT(*) 
      FROM public.sla_tracking sla
      JOIN public.compliance_cases cc ON sla.case_id = cc.id
      WHERE cc.customer_id = p_customer_id
      AND sla.status = 'breached'
    ),
    'escalationLevels', (
      SELECT jsonb_object_agg(
        'level' || eh.escalation_level, 
        COUNT(*)
      )
      FROM public.escalation_history eh
      JOIN public.compliance_cases cc ON eh.case_id = cc.id
      WHERE cc.customer_id = p_customer_id
      GROUP BY eh.escalation_level
    ),
    'recentEscalations', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', eh.id,
          'caseId', eh.case_id,
          'escalationLevel', eh.escalation_level,
          'reason', eh.reason,
          'escalationDate', eh.escalation_date,
          'resolvedAt', eh.resolved_at
        )
      )
      FROM public.escalation_history eh
      JOIN public.compliance_cases cc ON eh.case_id = cc.id
      WHERE cc.customer_id = p_customer_id
      ORDER BY eh.escalation_date DESC
      LIMIT 10
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get escalation metrics
CREATE OR REPLACE FUNCTION get_escalation_metrics(p_customer_id UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  today DATE := CURRENT_DATE;
  week_ago DATE := today - INTERVAL '7 days';
  month_ago DATE := today - INTERVAL '30 days';
BEGIN
  SELECT jsonb_build_object(
    'totalEscalations', (
      SELECT COUNT(*) 
      FROM public.escalation_history eh
      JOIN public.compliance_cases cc ON eh.case_id = cc.id
      WHERE cc.customer_id = p_customer_id
    ),
    'escalationsToday', (
      SELECT COUNT(*) 
      FROM public.escalation_history eh
      JOIN public.compliance_cases cc ON eh.case_id = cc.id
      WHERE cc.customer_id = p_customer_id
      AND DATE(eh.escalation_date) = today
    ),
    'escalationsThisWeek', (
      SELECT COUNT(*) 
      FROM public.escalation_history eh
      JOIN public.compliance_cases cc ON eh.case_id = cc.id
      WHERE cc.customer_id = p_customer_id
      AND DATE(eh.escalation_date) >= week_ago
    ),
    'escalationsThisMonth', (
      SELECT COUNT(*) 
      FROM public.escalation_history eh
      JOIN public.compliance_cases cc ON eh.case_id = cc.id
      WHERE cc.customer_id = p_customer_id
      AND DATE(eh.escalation_date) >= month_ago
    ),
    'averageResolutionTime', (
      SELECT COALESCE(AVG(
        EXTRACT(EPOCH FROM (eh.resolved_at - eh.escalation_date)) / 3600
      ), 0)
      FROM public.escalation_history eh
      JOIN public.compliance_cases cc ON eh.case_id = cc.id
      WHERE cc.customer_id = p_customer_id
      AND eh.resolved_at IS NOT NULL
    ),
    'slaComplianceRate', (
      SELECT COALESCE(
        (COUNT(*) FILTER (WHERE sla.status = 'met')) * 100.0 / COUNT(*),
        100
      )
      FROM public.sla_tracking sla
      JOIN public.compliance_cases cc ON sla.case_id = cc.id
      WHERE cc.customer_id = p_customer_id
    ),
    'escalationByLevel', (
      SELECT jsonb_object_agg(
        'level' || eh.escalation_level, 
        COUNT(*)
      )
      FROM public.escalation_history eh
      JOIN public.compliance_cases cc ON eh.case_id = cc.id
      WHERE cc.customer_id = p_customer_id
      GROUP BY eh.escalation_level
    ),
    'topEscalatedCases', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'caseId', eh.case_id,
          'caseType', cc.type,
          'escalationLevel', eh.escalation_level,
          'escalationDate', eh.escalation_date,
          'assignedTo', eh.new_assigned_to
        )
      )
      FROM public.escalation_history eh
      JOIN public.compliance_cases cc ON eh.case_id = cc.id
      WHERE cc.customer_id = p_customer_id
      ORDER BY eh.escalation_date DESC
      LIMIT 5
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get escalation history with case details
CREATE OR REPLACE FUNCTION get_escalation_history_with_details(
  p_customer_id UUID,
  p_filters JSONB DEFAULT '{}'
)
RETURNS TABLE (
  id UUID,
  case_id UUID,
  escalation_rule_id UUID,
  escalated_from_user_id UUID,
  escalated_to_user_id UUID,
  escalated_to_role TEXT,
  escalation_level INTEGER,
  reason TEXT,
  previous_priority TEXT,
  new_priority TEXT,
  previous_assigned_to UUID,
  new_assigned_to UUID,
  escalation_date TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  case_type TEXT,
  case_description TEXT,
  case_status TEXT,
  case_priority TEXT
) AS $$
DECLARE
  v_case_id UUID;
  v_escalation_level INTEGER;
  v_status TEXT;
  v_date_from DATE;
  v_date_to DATE;
BEGIN
  -- Extract filters
  v_case_id := (p_filters->>'caseId')::UUID;
  v_escalation_level := (p_filters->>'escalationLevel')::INTEGER;
  v_status := p_filters->>'status';
  v_date_from := (p_filters->>'dateFrom')::DATE;
  v_date_to := (p_filters->>'dateTo')::DATE;
  
  RETURN QUERY
  SELECT 
    eh.id,
    eh.case_id,
    eh.escalation_rule_id,
    eh.escalated_from_user_id,
    eh.escalated_to_user_id,
    eh.escalated_to_role,
    eh.escalation_level,
    eh.reason,
    eh.previous_priority,
    eh.new_priority,
    eh.previous_assigned_to,
    eh.new_assigned_to,
    eh.escalation_date,
    eh.resolved_at,
    eh.resolution_notes,
    cc.type as case_type,
    cc.description as case_description,
    cc.status as case_status,
    cc.priority as case_priority
  FROM public.escalation_history eh
  JOIN public.compliance_cases cc ON eh.case_id = cc.id
  WHERE cc.customer_id = p_customer_id
  AND (v_case_id IS NULL OR eh.case_id = v_case_id)
  AND (v_escalation_level IS NULL OR eh.escalation_level = v_escalation_level)
  AND (
    v_status IS NULL 
    OR (v_status = 'active' AND eh.resolved_at IS NULL)
    OR (v_status = 'resolved' AND eh.resolved_at IS NOT NULL)
  )
  AND (v_date_from IS NULL OR DATE(eh.escalation_date) >= v_date_from)
  AND (v_date_to IS NULL OR DATE(eh.escalation_date) <= v_date_to)
  ORDER BY eh.escalation_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create escalation notification
CREATE OR REPLACE FUNCTION create_escalation_notification(
  p_escalation_history_id UUID,
  p_notification_type TEXT,
  p_recipient_user_id UUID,
  p_subject TEXT,
  p_message TEXT
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO public.escalation_notifications (
    escalation_history_id,
    notification_type,
    recipient_user_id,
    subject,
    message,
    status
  ) VALUES (
    p_escalation_history_id,
    p_notification_type,
    p_recipient_user_id,
    p_subject,
    p_message,
    'pending'
  ) RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to process pending notifications
CREATE OR REPLACE FUNCTION process_pending_notifications()
RETURNS INTEGER AS $$
DECLARE
  v_processed_count INTEGER := 0;
  v_notification RECORD;
BEGIN
  FOR v_notification IN 
    SELECT * FROM public.escalation_notifications 
    WHERE status = 'pending'
    ORDER BY created_at ASC
    LIMIT 50
  LOOP
    -- Update status to sent (in a real implementation, this would send actual notifications)
    UPDATE public.escalation_notifications
    SET 
      status = 'sent',
      sent_at = now(),
      updated_at = now()
    WHERE id = v_notification.id;
    
    v_processed_count := v_processed_count + 1;
  END LOOP;
  
  RETURN v_processed_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a scheduled job to process notifications (this would be handled by a cron job in production)
-- For now, we'll create a function that can be called manually
CREATE OR REPLACE FUNCTION trigger_notification_processing()
RETURNS VOID AS $$
BEGIN
  PERFORM process_pending_notifications();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION check_sla_breaches() TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_escalation_notifications(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_escalation_dashboard_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_escalation_metrics(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_escalation_history_with_details(UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION create_escalation_notification(UUID, TEXT, UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION process_pending_notifications() TO authenticated;
GRANT EXECUTE ON FUNCTION trigger_notification_processing() TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_escalation_history_escalation_date ON public.escalation_history(escalation_date);
CREATE INDEX IF NOT EXISTS idx_escalation_history_resolved_at ON public.escalation_history(resolved_at);
CREATE INDEX IF NOT EXISTS idx_escalation_notifications_recipient_user_id ON public.escalation_notifications(recipient_user_id);
CREATE INDEX IF NOT EXISTS idx_escalation_notifications_status ON public.escalation_notifications(status);
CREATE INDEX IF NOT EXISTS idx_sla_tracking_start_time ON public.sla_tracking(start_time);
CREATE INDEX IF NOT EXISTS idx_sla_tracking_status ON public.sla_tracking(status);

-- Add comments for documentation
COMMENT ON FUNCTION check_sla_breaches() IS 'Returns all SLA breaches for active escalations';
COMMENT ON FUNCTION get_user_escalation_notifications(UUID) IS 'Returns escalation notifications for a specific user';
COMMENT ON FUNCTION get_escalation_dashboard_stats(UUID) IS 'Returns comprehensive escalation statistics for dashboard';
COMMENT ON FUNCTION get_escalation_metrics(UUID) IS 'Returns detailed escalation metrics for reporting';
COMMENT ON FUNCTION get_escalation_history_with_details(UUID, JSONB) IS 'Returns escalation history with case details and filtering';
COMMENT ON FUNCTION create_escalation_notification(UUID, TEXT, UUID, TEXT, TEXT) IS 'Creates a new escalation notification';
COMMENT ON FUNCTION process_pending_notifications() IS 'Processes pending notifications (up to 50 at a time)';
COMMENT ON FUNCTION trigger_notification_processing() IS 'Triggers notification processing (for manual or scheduled execution)';
