
-- Create webhook_notifications table
CREATE TABLE IF NOT EXISTS public.webhook_notifications (
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

-- Note: RLS policy will be added in a later migration after get_user_role function is defined

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_webhook_notifications_status ON public.webhook_notifications(status);
CREATE INDEX IF NOT EXISTS idx_webhook_notifications_created_at ON public.webhook_notifications(created_at DESC);
