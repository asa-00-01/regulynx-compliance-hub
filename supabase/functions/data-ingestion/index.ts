
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface IngestionRequest {
  client_id: string;
  data_type: 'customer' | 'transaction' | 'document';
  records: any[];
  api_key: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { client_id, data_type, records, api_key }: IngestionRequest = await req.json();

    console.log(`[DATA-INGESTION] Processing ${data_type} data for client ${client_id}`);

    // Verify API key
    const { data: apiKeyData, error: keyError } = await supabase
      .from('integration_api_keys')
      .select('*')
      .eq('client_id', client_id)
      .eq('key_hash', api_key)
      .eq('is_active', true)
      .single();

    if (keyError || !apiKeyData) {
      console.error('[DATA-INGESTION] Invalid API key:', keyError);
      return new Response(
        JSON.stringify({ error: 'Invalid API key' }), 
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Update last used timestamp
    await supabase
      .from('integration_api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', apiKeyData.id);

    const startTime = Date.now();
    let successCount = 0;
    let errorCount = 0;
    const errors: any[] = [];

    // Process records based on data type
    for (const record of records) {
      try {
        if (data_type === 'customer') {
          await processCustomerRecord(supabase, client_id, record);
        } else if (data_type === 'transaction') {
          await processTransactionRecord(supabase, client_id, record);
        } else if (data_type === 'document') {
          await processDocumentRecord(supabase, client_id, record);
        }
        successCount++;
      } catch (error) {
        console.error(`[DATA-INGESTION] Error processing record:`, error);
        errorCount++;
        errors.push({
          record_id: record.id || 'unknown',
          error: error.message
        });
      }
    }

    const processingTime = Date.now() - startTime;

    // Create ingestion log
    const { data: logData, error: logError } = await supabase
      .from('data_ingestion_logs')
      .insert({
        client_id,
        ingestion_type: data_type,
        record_count: records.length,
        success_count: successCount,
        error_count: errorCount,
        status: errorCount > 0 ? (successCount > 0 ? 'partial' : 'failed') : 'completed',
        error_details: errors.length > 0 ? { errors } : null,
        processing_time_ms: processingTime
      })
      .select()
      .single();

    if (logError) {
      console.error('[DATA-INGESTION] Error creating log:', logError);
    }

    // Send webhook notification if configured
    const { data: config } = await supabase
      .from('integration_configs')
      .select('webhook_url')
      .eq('client_id', client_id)
      .single();

    if (config?.webhook_url) {
      await sendWebhookNotification(supabase, client_id, {
        event_type: 'data_ingestion_completed',
        payload: {
          client_id,
          data_type,
          record_count: records.length,
          success_count: successCount,
          error_count: errorCount,
          processing_time_ms: processingTime,
          log_id: logData?.id
        },
        webhook_url: config.webhook_url
      });
    }

    console.log(`[DATA-INGESTION] Completed processing for client ${client_id}: ${successCount} success, ${errorCount} errors`);

    return new Response(JSON.stringify({
      success: true,
      processed: records.length,
      successful: successCount,
      failed: errorCount,
      processing_time_ms: processingTime,
      log_id: logData?.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[DATA-INGESTION] Error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function processCustomerRecord(supabase: any, client_id: string, record: any) {
  const { data, error } = await supabase
    .from('external_customer_mappings')
    .upsert({
      client_id,
      external_customer_id: record.external_id,
      internal_user_id: record.internal_id || crypto.randomUUID(),
      customer_data: record,
      sync_status: 'synced',
      last_synced_at: new Date().toISOString()
    });

  if (error) throw error;
}

async function processTransactionRecord(supabase: any, client_id: string, record: any) {
  const { data, error } = await supabase
    .from('external_transaction_mappings')
    .upsert({
      client_id,
      external_transaction_id: record.external_id,
      external_customer_id: record.customer_id,
      transaction_data: record,
      compliance_status: 'pending'
    });

  if (error) throw error;
}

async function processDocumentRecord(supabase: any, client_id: string, record: any) {
  // This would integrate with your document processing system
  console.log(`Processing document record for client ${client_id}:`, record);
}

async function sendWebhookNotification(supabase: any, client_id: string, notification: any) {
  const { error } = await supabase
    .from('webhook_notifications')
    .insert({
      client_id,
      event_type: notification.event_type,
      payload: notification.payload,
      webhook_url: notification.webhook_url,
      status: 'pending'
    });

  if (error) {
    console.error('[WEBHOOK] Error creating notification:', error);
  }
}
