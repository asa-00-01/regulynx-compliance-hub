-- Fix ambiguous column reference in send_escalation_notifications function
-- The issue is with the JOIN between profiles and user_roles tables

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
  -- Fixed: Use explicit table aliases to avoid ambiguous column references
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
