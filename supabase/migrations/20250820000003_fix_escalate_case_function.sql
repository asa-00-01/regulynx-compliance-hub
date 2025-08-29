-- Fix the escalate_case function to handle manual escalations properly
-- The function needs to handle cases where escalation_rule_id is NULL (manual escalation)

CREATE OR REPLACE FUNCTION escalate_case(
  case_id UUID,
  escalation_rule_id UUID DEFAULT NULL,
  escalated_from_user_id UUID DEFAULT NULL,
  escalation_level INTEGER DEFAULT 2,
  target_role public.customer_role DEFAULT 'customer_admin',
  target_user_id UUID DEFAULT NULL,
  reason TEXT DEFAULT 'Manual escalation'
)
RETURNS UUID AS $$
DECLARE
  escalation_history_id UUID;
  case_record RECORD;
  previous_priority TEXT;
  new_priority TEXT;
  previous_assigned_to UUID;
  new_assigned_to UUID;
  rule_record RECORD;
BEGIN
  -- Get case details
  SELECT * INTO case_record 
  FROM public.compliance_cases 
  WHERE id = case_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Case not found';
  END IF;
  
  -- Store current values
  previous_priority := case_record.priority;
  previous_assigned_to := case_record.assigned_to;
  
  -- For manual escalation, boost priority by one level
  CASE case_record.priority
    WHEN 'low' THEN new_priority := 'medium';
    WHEN 'medium' THEN new_priority := 'high';
    WHEN 'high' THEN new_priority := 'critical';
    WHEN 'critical' THEN new_priority := 'critical';
  END CASE;
  
  -- Determine new assignee
  IF target_user_id IS NOT NULL THEN
    new_assigned_to := target_user_id;
  ELSIF target_role IS NOT NULL THEN
    -- Find a user with the target role
    SELECT id INTO new_assigned_to
    FROM public.profiles
    WHERE customer_id = case_record.customer_id
    AND id IN (
      SELECT user_id FROM public.user_roles 
      WHERE role = target_role
    )
    LIMIT 1;
  ELSE
    new_assigned_to := case_record.assigned_to;
  END IF;
  
  -- Create escalation history record
  INSERT INTO public.escalation_history (
    case_id, escalation_rule_id, escalated_from_user_id, escalated_to_user_id,
    escalated_to_role, escalation_level, reason, previous_priority, new_priority,
    previous_assigned_to, new_assigned_to
  ) VALUES (
    case_id, escalation_rule_id, escalated_from_user_id, target_user_id,
    target_role, escalation_level, reason, previous_priority, new_priority,
    previous_assigned_to, new_assigned_to
  ) RETURNING id INTO escalation_history_id;
  
  -- Update case with new priority and assignee
  UPDATE public.compliance_cases 
  SET 
    priority = new_priority,
    assigned_to = new_assigned_to,
    status = 'in_progress',
    updated_at = now()
  WHERE id = case_id;
  
  -- Create SLA tracking record
  INSERT INTO public.sla_tracking (
    case_id, escalation_level, sla_type, target_hours, start_time
  ) VALUES (
    case_id, escalation_level, 'response_time', 
    CASE escalation_level
      WHEN 1 THEN 4   -- 4 hours for level 1
      WHEN 2 THEN 2   -- 2 hours for level 2
      WHEN 3 THEN 1   -- 1 hour for level 3
      WHEN 4 THEN 30  -- 30 minutes for level 4
      WHEN 5 THEN 15  -- 15 minutes for level 5
    END,
    now()
  );
  
  -- Send notifications
  PERFORM send_escalation_notifications(escalation_history_id);
  
  RETURN escalation_history_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
