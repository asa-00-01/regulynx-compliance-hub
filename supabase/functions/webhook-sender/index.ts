
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('[WEBHOOK-SENDER] Processing pending webhooks');

    // Get pending webhook notifications
    const { data: webhooks, error: fetchError } = await supabase
      .from('webhook_notifications')
      .select('*')
      .eq('status', 'pending')
      .lt('retry_count', 3)
      .order('created_at', { ascending: true })
      .limit(10);

    if (fetchError) {
      throw fetchError;
    }

    if (!webhooks || webhooks.length === 0) {
      console.log('[WEBHOOK-SENDER] No pending webhooks found');
      return new Response(JSON.stringify({ processed: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let processed = 0;
    let successful = 0;
    let failed = 0;

    for (const webhook of webhooks) {
      try {
        console.log(`[WEBHOOK-SENDER] Sending webhook ${webhook.id} to ${webhook.webhook_url}`);

        const response = await fetch(webhook.webhook_url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Compliance-System-Webhook/1.0'
          },
          body: JSON.stringify({
            event_type: webhook.event_type,
            client_id: webhook.client_id,
            timestamp: webhook.created_at,
            data: webhook.payload
          })
        });

        const now = new Date().toISOString();

        if (response.ok) {
          // Mark as delivered
          await supabase
            .from('webhook_notifications')
            .update({
              status: 'delivered',
              delivered_at: now,
              last_attempt_at: now
            })
            .eq('id', webhook.id);

          successful++;
          console.log(`[WEBHOOK-SENDER] Successfully sent webhook ${webhook.id}`);
        } else {
          // Mark as failed and increment retry count
          const newRetryCount = webhook.retry_count + 1;
          const newStatus = newRetryCount >= 3 ? 'failed' : 'pending';

          await supabase
            .from('webhook_notifications')
            .update({
              status: newStatus,
              retry_count: newRetryCount,
              last_attempt_at: now
            })
            .eq('id', webhook.id);

          failed++;
          console.log(`[WEBHOOK-SENDER] Failed to send webhook ${webhook.id}: ${response.status} ${response.statusText}`);
        }

        processed++;
      } catch (error) {
        console.error(`[WEBHOOK-SENDER] Error processing webhook ${webhook.id}:`, error);

        // Update retry count and status
        const newRetryCount = webhook.retry_count + 1;
        const newStatus = newRetryCount >= 3 ? 'failed' : 'pending';

        await supabase
          .from('webhook_notifications')
          .update({
            status: newStatus,
            retry_count: newRetryCount,
            last_attempt_at: new Date().toISOString()
          })
          .eq('id', webhook.id);

        failed++;
        processed++;
      }
    }

    console.log(`[WEBHOOK-SENDER] Processed ${processed} webhooks: ${successful} successful, ${failed} failed`);

    return new Response(JSON.stringify({
      processed,
      successful,
      failed
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[WEBHOOK-SENDER] Error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
