-- Fix ambiguous column reference in check_case_escalation function
-- The issue is with the parameter name 'case_id' conflicting with the column name 'case_id'

-- Drop the existing function first
DROP FUNCTION IF EXISTS check_case_escalation(UUID);

-- Recreate the function with a different parameter name
CREATE OR REPLACE FUNCTION check_case_escalation(p_case_id UUID)
RETURNS TABLE (
  should_escalate BOOLEAN,
  rule_id UUID,
  escalation_level INTEGER,
  target_role public.customer_role,
  target_user_id UUID,
  reason TEXT
) AS $$
DECLARE
  case_record RECORD;
  rule_record RECORD;
  time_threshold_exceeded BOOLEAN;
BEGIN
  -- Get case details
  SELECT * INTO case_record 
  FROM public.compliance_cases 
  WHERE id = p_case_id;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Check if case has been open longer than time threshold
  FOR rule_record IN 
    SELECT * FROM public.escalation_rules 
    WHERE (customer_id IS NULL OR customer_id = case_record.customer_id)
    AND is_active = true
    AND (case_type IS NULL OR case_type = case_record.type)
    AND (priority_threshold IS NULL OR 
         CASE 
           WHEN priority_threshold = 'low' THEN case_record.priority = 'low'
           WHEN priority_threshold = 'medium' THEN case_record.priority IN ('low', 'medium')
           WHEN priority_threshold = 'high' THEN case_record.priority IN ('low', 'medium', 'high')
           WHEN priority_threshold = 'critical' THEN case_record.priority IN ('low', 'medium', 'high', 'critical')
         END)
    AND (risk_score_threshold IS NULL OR case_record.risk_score >= risk_score_threshold)
    AND (time_threshold_hours IS NULL OR 
         EXTRACT(EPOCH FROM (now() - case_record.created_at)) / 3600 >= time_threshold_hours)
    ORDER BY escalation_level ASC
  LOOP
    -- Check if this escalation level has already been triggered
    -- Fixed: Use explicit table alias to avoid ambiguous column reference
    IF NOT EXISTS (
      SELECT 1 FROM public.escalation_history eh
      WHERE eh.case_id = p_case_id 
      AND eh.escalation_level = rule_record.escalation_level
    ) THEN
      should_escalate := true;
      rule_id := rule_record.id;
      escalation_level := rule_record.escalation_level;
      target_role := rule_record.target_role;
      target_user_id := rule_record.target_user_id;
      reason := format('Case escalated to level %s based on rule: %s', 
                      rule_record.escalation_level, rule_record.name);
      RETURN NEXT;
      EXIT;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the trigger function to use the new parameter name
CREATE OR REPLACE FUNCTION trigger_case_escalation_check()
RETURNS TRIGGER AS $$
DECLARE
  escalation_result RECORD;
BEGIN
  -- Only check for escalation if case is still open/in progress
  IF NEW.status IN ('open', 'in_progress') THEN
    FOR escalation_result IN 
      SELECT * FROM check_case_escalation(NEW.id)
    LOOP
      IF escalation_result.should_escalate THEN
        PERFORM escalate_case(
          NEW.id,
          escalation_result.rule_id,
          NEW.assigned_to,
          escalation_result.escalation_level,
          escalation_result.target_role,
          escalation_result.target_user_id,
          escalation_result.reason
        );
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
