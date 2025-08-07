
-- Create webhook_notifications table
CREATE TABLE public.webhook_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  webhook_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'delivered', 'failed')),
  retry_count INTEGER NOT NULL DEFAULT 0,
  last_attempt_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  delivered_at TIMESTAMP WITH TIME ZONE
);

-- Add Row Level Security
ALTER TABLE public.webhook_notifications ENABLE ROW LEVEL SECURITY;

-- Create policy for authorized users (admins and compliance officers)
CREATE POLICY "Webhook notifications for authorized users" 
  ON public.webhook_notifications 
  FOR ALL 
  USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::text, 'complianceOfficer'::text]));

-- Add index for better query performance
CREATE INDEX idx_webhook_notifications_status ON public.webhook_notifications(status);
CREATE INDEX idx_webhook_notifications_created_at ON public.webhook_notifications(created_at DESC);
