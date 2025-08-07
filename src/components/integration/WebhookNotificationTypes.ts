
export interface WebhookNotification {
  id: string;
  client_id: string;
  event_type: string;
  payload: any;
  webhook_url: string;
  status: 'pending' | 'delivered' | 'failed';
  retry_count: number;
  last_attempt_at?: string;
  created_at: string;
  delivered_at?: string;
}
