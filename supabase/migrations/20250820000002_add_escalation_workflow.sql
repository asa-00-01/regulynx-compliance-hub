-- Add comprehensive escalation workflow for compliance cases
-- This implements proper escalation management with automatic assignments, notifications, and priority management

-- 1. Escalation Rules Table - Defines when and how cases should be escalated
CREATE TABLE public.escalation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE, -- Allow NULL for default rules
  name TEXT NOT NULL,
  description TEXT,
  case_type public.case_type,
  priority_threshold TEXT CHECK (priority_threshold IN ('low', 'medium', 'high', 'critical')),
  risk_score_threshold INTEGER CHECK (risk_score_threshold >= 0 AND risk_score_threshold <= 100),
  time_threshold_hours INTEGER CHECK (time_threshold_hours >= 0),
  escalation_level INTEGER NOT NULL CHECK (escalation_level >= 1 AND escalation_level <= 5),
  target_role public.customer_role,
  target_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  auto_assign BOOLEAN DEFAULT true,
  send_notifications BOOLEAN DEFAULT true,
  priority_boost BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Allow NULL for system rules
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Escalation History Table - Tracks all escalations for audit trail
CREATE TABLE public.escalation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.compliance_cases(id) ON DELETE CASCADE,
  escalation_rule_id UUID REFERENCES public.escalation_rules(id) ON DELETE SET NULL,
  escalated_from_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  escalated_to_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  escalated_to_role public.customer_role,
  escalation_level INTEGER NOT NULL,
  reason TEXT NOT NULL,
  previous_priority TEXT,
  new_priority TEXT,
  previous_assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  new_assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  escalation_date TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT
);

-- 3. Escalation Notifications Table - Manages notifications for escalated cases
CREATE TABLE public.escalation_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escalation_history_id UUID NOT NULL REFERENCES public.escalation_history(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('email', 'sms', 'in_app', 'slack')),
  recipient_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_email TEXT,
  recipient_phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
  retry_count INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. SLA Tracking Table - Tracks service level agreements for escalated cases
CREATE TABLE public.sla_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.compliance_cases(id) ON DELETE CASCADE,
  escalation_level INTEGER NOT NULL,
  sla_type TEXT NOT NULL CHECK (sla_type IN ('response_time', 'resolution_time', 'escalation_time')),
  target_hours INTEGER NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'met', 'breached', 'paused')),
  breach_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_escalation_rules_customer_id ON public.escalation_rules(customer_id);
CREATE INDEX idx_escalation_rules_is_active ON public.escalation_rules(is_active);
CREATE INDEX idx_escalation_history_case_id ON public.escalation_history(case_id);
CREATE INDEX idx_escalation_history_escalated_to_user_id ON public.escalation_history(escalated_to_user_id);
CREATE INDEX idx_escalation_notifications_escalation_history_id ON public.escalation_notifications(escalation_history_id);
CREATE INDEX idx_escalation_notifications_status ON public.escalation_notifications(status);
CREATE INDEX idx_sla_tracking_case_id ON public.sla_tracking(case_id);
CREATE INDEX idx_sla_tracking_status ON public.sla_tracking(status);

-- Enable Row Level Security
ALTER TABLE public.escalation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escalation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escalation_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sla_tracking ENABLE ROW LEVEL SECURITY;

-- RLS policies for escalation_rules
CREATE POLICY "Users can view escalation rules for their organization" ON public.escalation_rules
  FOR SELECT USING (
    customer_id IS NULL OR customer_id IN (
      SELECT customer_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage escalation rules for their organization" ON public.escalation_rules
  FOR ALL USING (
    customer_id IS NULL OR customer_id IN (
      SELECT customer_id FROM public.profiles WHERE id = auth.uid()
    ) AND (
      has_customer_role(auth.uid(), 'customer_admin'::customer_role) OR
      has_platform_role(auth.uid(), 'platform_admin'::platform_role)
    )
  );

-- RLS policies for escalation_history
CREATE POLICY "Users can view escalation history for cases in their organization" ON public.escalation_history
  FOR SELECT USING (
    case_id IN (
      SELECT id FROM public.compliance_cases 
      WHERE customer_id IN (
        SELECT customer_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Compliance officers can create escalation history" ON public.escalation_history
  FOR INSERT WITH CHECK (
    case_id IN (
      SELECT id FROM public.compliance_cases 
      WHERE customer_id IN (
        SELECT customer_id FROM public.profiles WHERE id = auth.uid()
      )
    ) AND (
      has_customer_role(auth.uid(), 'customer_compliance'::customer_role) OR
      has_customer_role(auth.uid(), 'customer_admin'::customer_role) OR
      has_platform_role(auth.uid(), 'platform_admin'::platform_role)
    )
  );

-- RLS policies for escalation_notifications
CREATE POLICY "Users can view notifications for escalations in their organization" ON public.escalation_notifications
  FOR SELECT USING (
    escalation_history_id IN (
      SELECT eh.id FROM public.escalation_history eh
      JOIN public.compliance_cases cc ON eh.case_id = cc.id
      WHERE cc.customer_id IN (
        SELECT customer_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

-- RLS policies for sla_tracking
CREATE POLICY "Users can view SLA tracking for cases in their organization" ON public.sla_tracking
  FOR SELECT USING (
    case_id IN (
      SELECT id FROM public.compliance_cases 
      WHERE customer_id IN (
        SELECT customer_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

-- Functions for escalation workflow

-- Function to check if a case should be escalated
CREATE OR REPLACE FUNCTION check_case_escalation(case_id UUID)
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
  WHERE id = case_id;
  
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
    IF NOT EXISTS (
      SELECT 1 FROM public.escalation_history 
      WHERE case_id = case_id 
      AND escalation_level = rule_record.escalation_level
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

-- Function to escalate a case
CREATE OR REPLACE FUNCTION escalate_case(
  case_id UUID,
  escalation_rule_id UUID,
  escalated_from_user_id UUID,
  escalation_level INTEGER,
  target_role public.customer_role,
  target_user_id UUID,
  reason TEXT
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
  
  -- Get escalation rule details
  SELECT * INTO rule_record 
  FROM public.escalation_rules 
  WHERE id = escalation_rule_id;
  
  -- Store current values
  previous_priority := case_record.priority;
  previous_assigned_to := case_record.assigned_to;
  
  -- Determine new priority if priority boost is enabled
  IF rule_record.priority_boost THEN
    CASE case_record.priority
      WHEN 'low' THEN new_priority := 'medium';
      WHEN 'medium' THEN new_priority := 'high';
      WHEN 'high' THEN new_priority := 'critical';
      WHEN 'critical' THEN new_priority := 'critical';
    END CASE;
  ELSE
    new_priority := case_record.priority;
  END IF;
  
  -- Determine new assignee
  IF rule_record.auto_assign THEN
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
    END IF;
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
  
  -- Send notifications if enabled
  IF rule_record.send_notifications THEN
    PERFORM send_escalation_notifications(escalation_history_id);
  END IF;
  
  RETURN escalation_history_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to send escalation notifications
CREATE OR REPLACE FUNCTION send_escalation_notifications(escalation_history_id UUID)
RETURNS VOID AS $$
DECLARE
  escalation_record RECORD;
  case_record RECORD;
  notification_record RECORD;
BEGIN
  -- Get escalation details
  SELECT * INTO escalation_record 
  FROM public.escalation_history 
  WHERE id = escalation_history_id;
  
  -- Get case details
  SELECT * INTO case_record 
  FROM public.compliance_cases 
  WHERE id = escalation_record.case_id;
  
  -- Create in-app notification for assigned user
  IF escalation_record.escalated_to_user_id IS NOT NULL THEN
    INSERT INTO public.escalation_notifications (
      escalation_history_id, notification_type, recipient_user_id,
      subject, message, status
    ) VALUES (
      escalation_history_id, 'in_app', escalation_record.escalated_to_user_id,
      'Case Escalated - Immediate Action Required',
      format('Case %s has been escalated to level %s and assigned to you. Priority: %s. Risk Score: %s', 
             case_record.id, escalation_record.escalation_level, 
             case_record.priority, case_record.risk_score),
      'pending'
    );
  END IF;
  
  -- Create email notification for assigned user
  IF escalation_record.escalated_to_user_id IS NOT NULL THEN
    INSERT INTO public.escalation_notifications (
      escalation_history_id, notification_type, recipient_user_id,
      recipient_email, subject, message, status
    ) VALUES (
      escalation_history_id, 'email', escalation_record.escalated_to_user_id,
      (SELECT email FROM public.profiles WHERE id = escalation_record.escalated_to_user_id),
      'URGENT: Compliance Case Escalated',
      format('Case %s has been escalated to level %s and requires your immediate attention. 
              Priority: %s, Risk Score: %s, Reason: %s', 
             case_record.id, escalation_record.escalation_level, 
             case_record.priority, case_record.risk_score, escalation_record.reason),
      'pending'
    );
  END IF;
  
  -- Create notification for customer admin
  INSERT INTO public.escalation_notifications (
    escalation_history_id, notification_type, recipient_user_id,
    subject, message, status
  ) 
  SELECT 
    escalation_history_id, 'in_app', p.id,
    'Case Escalated - Admin Notification',
    format('Case %s has been escalated to level %s. Please review and ensure proper handling.', 
           case_record.id, escalation_record.escalation_level),
    'pending'
  FROM public.profiles p
  JOIN public.user_roles ur ON p.id = ur.user_id
  WHERE p.customer_id = case_record.customer_id
  AND ur.role = 'customer_admin'::customer_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
    st.id,
    st.case_id,
    st.escalation_level,
    st.sla_type,
    st.target_hours,
    EXTRACT(EPOCH FROM (now() - st.start_time)) / 3600 as actual_hours,
    CASE 
      WHEN EXTRACT(EPOCH FROM (now() - st.start_time)) / 3600 > st.target_hours 
      THEN 'breached'::TEXT
      ELSE 'active'::TEXT
    END as status
  FROM public.sla_tracking st
  WHERE st.status = 'active'
  AND st.end_time IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default escalation rules
INSERT INTO public.escalation_rules (
  customer_id, name, description, case_type, priority_threshold, 
  risk_score_threshold, time_threshold_hours, escalation_level, 
  target_role, auto_assign, send_notifications, priority_boost
) VALUES
  -- Level 1 escalation: High priority cases after 24 hours
  (NULL, 'Level 1 - High Priority Timeout', 'Escalate high priority cases after 24 hours', 
   NULL, 'high', NULL, 24, 1, 'customer_compliance', true, true, false),
  
  -- Level 2 escalation: Critical cases after 4 hours
  (NULL, 'Level 2 - Critical Priority Timeout', 'Escalate critical priority cases after 4 hours', 
   NULL, 'critical', NULL, 4, 2, 'customer_admin', true, true, true),
  
  -- Level 3 escalation: High risk score cases after 2 hours
  (NULL, 'Level 3 - High Risk Score', 'Escalate cases with risk score >= 80 after 2 hours', 
   NULL, NULL, 80, 2, 3, 'customer_admin', true, true, true),
  
  -- Level 4 escalation: AML cases after 1 hour
  (NULL, 'Level 4 - AML Cases Timeout', 'Escalate AML cases after 1 hour', 
   'aml_alert', NULL, NULL, 1, 4, 'customer_admin', true, true, true),
  
  -- Level 5 escalation: Sanctions cases immediately
  (NULL, 'Level 5 - Sanctions Immediate', 'Immediate escalation for sanctions cases', 
   'sanctions_hit', NULL, NULL, 0, 5, 'customer_admin', true, true, true);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_escalation_rules_updated_at BEFORE UPDATE ON public.escalation_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sla_tracking_updated_at BEFORE UPDATE ON public.sla_tracking
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to automatically check for escalations when cases are updated
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

-- Create trigger to check for escalations
CREATE TRIGGER check_case_escalation_trigger
  AFTER UPDATE ON public.compliance_cases
  FOR EACH ROW
  EXECUTE FUNCTION trigger_case_escalation_check();

-- Create trigger to check for escalations on case creation
CREATE TRIGGER check_case_escalation_trigger_insert
  AFTER INSERT ON public.compliance_cases
  FOR EACH ROW
  EXECUTE FUNCTION trigger_case_escalation_check();
