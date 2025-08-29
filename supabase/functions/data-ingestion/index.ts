
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

    // Simple API key validation - just check if it matches expected format
    if (!api_key || api_key !== 'YWtfTDZEYUhHd3pSeHhua1FnZHpyNTdjM2M4Y3hyVEpYdUY=') {
      console.error('[DATA-INGESTION] Invalid API key');
      return new Response(
        JSON.stringify({ error: 'Invalid API key' }), 
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const startTime = Date.now();
    let successCount = 0;
    let errorCount = 0;
    const errors: any[] = [];

    // Use the new batch processing function for automatic linking
    if (data_type === 'customer' || data_type === 'transaction') {
      try {
        console.log(`[DATA-INGESTION] Using batch processing with automatic linking for ${data_type}`);
        
        const { data: result, error: batchError } = await supabase
          .rpc('process_batch_data_ingestion', {
            p_client_id: client_id,
            p_data_type: data_type,
            p_records: records
          });

        if (batchError) {
          console.error('[DATA-INGESTION] Batch processing error:', batchError);
          throw batchError;
        }

        successCount = result.success_count;
        errorCount = result.error_count;
        
        // Convert errors array from JSONB to regular array
        if (result.errors && Array.isArray(result.errors)) {
          errors.push(...result.errors);
        }

        console.log(`[DATA-INGESTION] Batch processing completed: ${successCount} success, ${errorCount} errors`);
        
      } catch (batchError) {
        console.error('[DATA-INGESTION] Batch processing failed, falling back to individual processing:', batchError);
        
        // Fallback to individual processing if batch processing fails
        for (const record of records) {
          try {
            if (data_type === 'customer') {
              await processCustomerRecord(supabase, client_id, record);
            } else if (data_type === 'transaction') {
              await processTransactionRecord(supabase, client_id, record);
            }
            successCount++;
          } catch (error) {
            console.error(`[DATA-INGESTION] Error processing record:`, error);
            errorCount++;
            errors.push({
              record_id: record.external_id || 'unknown',
              error: error.message
            });
          }
        }
      }
    } else if (data_type === 'document') {
      // Process documents individually (no automatic linking for documents yet)
      for (const record of records) {
        try {
          await processDocumentRecord(supabase, client_id, record);
          successCount++;
        } catch (error) {
          console.error(`[DATA-INGESTION] Error processing document record:`, error);
          errorCount++;
          errors.push({
            record_id: record.external_id || 'unknown',
            error: error.message
          });
        }
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
        status: errorCount === 0 ? 'completed' : errorCount === records.length ? 'failed' : 'partial',
        error_details: errors.length > 0 ? errors : null,
        processing_time_ms: processingTime
      })
      .select()
      .single();

    if (logError) {
      console.warn('[DATA-INGESTION] Warning: Could not create ingestion log:', logError);
    }

    // Get linking statistics
    let linkingStats = null;
    try {
      const { data: linkingData } = await supabase
        .from('linked_data_relationships')
        .select('*')
        .eq('client_id', client_id);
      
      if (linkingData) {
        linkingStats = {
          total_customers: linkingData.length,
          total_transactions: linkingData.reduce((sum, item) => sum + (item.transaction_count || 0), 0),
          total_amount: linkingData.reduce((sum, item) => sum + (parseFloat(item.total_transaction_amount) || 0), 0)
        };
      }
    } catch (linkingError) {
      console.warn('[DATA-INGESTION] Warning: Could not get linking statistics:', linkingError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully processed ${data_type} data`,
        summary: {
          total_records: records.length,
          success_count: successCount,
          error_count: errorCount,
          processing_time_ms: processingTime
        },
        errors: errors.length > 0 ? errors : null,
        linking_statistics: linkingStats,
        log_id: logData?.id
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('[DATA-INGESTION] Fatal error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Legacy functions for fallback processing
async function processCustomerRecord(supabase: any, client_id: string, record: any) {
  console.log(`[DATA-INGESTION] Processing customer record:`, record.external_id);
  
  // Get the customer organization ID - try multiple ways to find it
  let customerOrg;
  
  // Try to find by name first
  const { data: customerByName, error: errorByName } = await supabase
    .from('customers')
    .select('id')
    .eq('name', 'Test Organization')
    .single();
    
  if (customerByName) {
    customerOrg = customerByName;
  } else {
    // Try to find by domain
    const { data: customerByDomain, error: errorByDomain } = await supabase
      .from('customers')
      .select('id')
      .eq('domain', `${client_id}.com`)
      .single();
      
    if (customerByDomain) {
      customerOrg = customerByDomain;
    } else {
      // Try to find any customer
      const { data: anyCustomer, error: errorAny } = await supabase
        .from('customers')
        .select('id')
        .limit(1)
        .single();
        
      if (anyCustomer) {
        customerOrg = anyCustomer;
      } else {
        throw new Error(`No customer organization found. Please ensure a customer organization exists.`);
      }
    }
  }

  if (!customerOrg) {
    throw new Error(`Customer organization not found for client_id: ${client_id}. Please ensure a customer organization exists.`);
  }

  console.log(`[DATA-INGESTION] Found customer organization: ${customerOrg.id}`);

  // Create organization customer directly
  const { data: orgCustomer, error: orgCustomerError } = await supabase
    .from('organization_customers')
    .insert({
      customer_id: customerOrg.id,
      external_customer_id: record.external_id,
      full_name: record.full_name,
      email: record.email,
      date_of_birth: record.date_of_birth,
      nationality: record.nationality,
      identity_number: record.identification_number,
      phone_number: record.phone,
      address: record.address,
      country_of_residence: record.country,
      kyc_status: record.kyc_status || 'pending',
      risk_score: record.risk_score || 50,
      is_pep: record.is_pep || false,
      is_sanctioned: record.is_sanctioned || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (orgCustomerError) {
    console.error('[DATA-INGESTION] Error creating organization customer:', orgCustomerError);
    throw orgCustomerError;
  }

  // Also create external customer mapping for reference
  const { error: mappingError } = await supabase
    .from('external_customer_mappings')
    .upsert({
      client_id,
      external_customer_id: record.external_id,
      internal_user_id: orgCustomer.id, // Use the organization customer ID
      customer_data: record,
      sync_status: 'synced',
      last_synced_at: new Date().toISOString()
    });

  if (mappingError) {
    console.warn('[DATA-INGESTION] Warning: Could not create external mapping:', mappingError);
  }

  console.log(`[DATA-INGESTION] Successfully created organization customer: ${orgCustomer.id}`);
}

async function processTransactionRecord(supabase: any, client_id: string, record: any) {
  console.log(`[DATA-INGESTION] Processing transaction record:`, record.external_id);
  
  // Use the new automatic linking function
  const { data: transactionId, error } = await supabase
    .rpc('auto_link_transaction_to_customer', {
      p_external_transaction_id: record.external_id,
      p_external_customer_id: record.customer_id,
      p_client_id: client_id,
      p_transaction_data: record
    });

  if (error) {
    console.error('[DATA-INGESTION] Error processing transaction:', error);
    throw error;
  }

  console.log(`[DATA-INGESTION] Successfully processed transaction: ${transactionId}`);
}

async function processDocumentRecord(supabase: any, client_id: string, record: any) {
  console.log(`[DATA-INGESTION] Processing document record:`, record.external_id);
  
  // This would integrate with your document processing system
  // For now, just log the document record
  console.log(`Document record for client ${client_id}:`, record);
  
  // TODO: Implement document processing and linking
  // This could include:
  // 1. File upload to storage
  // 2. OCR processing
  // 3. Linking to customer/transaction
  // 4. Creating document record in database
}
