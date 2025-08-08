
import { supabase } from '@/integrations/supabase/client';
import { 
  IntegrationConfig, 
  DataIngestionLog, 
  ExternalCustomerMapping, 
  ExternalTransactionMapping,
  IntegrationAPIKey,
  IntegrationStats
} from '@/types/integration';

export class IntegrationService {
  // Integration Config Management
  async getIntegrationConfigs(): Promise<IntegrationConfig[]> {
    const { data, error } = await supabase
      .from('integration_configs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(this.mapConfigFromDb);
  }

  async createIntegrationConfig(config: Omit<IntegrationConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<IntegrationConfig> {
    const { data, error } = await supabase
      .from('integration_configs')
      .insert({
        client_id: config.clientId,
        client_name: config.clientName,
        integration_type: config.integrationType,
        api_key_hash: config.apiKeyHash,
        webhook_url: config.webhookUrl,
        batch_frequency: config.batchFrequency,
        data_mapping: config.dataMapping,
        status: config.status,
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapConfigFromDb(data);
  }

  async updateIntegrationConfig(id: string, updates: Partial<IntegrationConfig>): Promise<IntegrationConfig> {
    const { data, error } = await supabase
      .from('integration_configs')
      .update({
        client_name: updates.clientName,
        integration_type: updates.integrationType,
        api_key_hash: updates.apiKeyHash,
        webhook_url: updates.webhookUrl,
        batch_frequency: updates.batchFrequency,
        data_mapping: updates.dataMapping,
        status: updates.status,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.mapConfigFromDb(data);
  }

  // Data Ingestion Logs
  async getDataIngestionLogs(clientId?: string): Promise<DataIngestionLog[]> {
    let query = supabase
      .from('data_ingestion_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (clientId) {
      query = query.eq('client_id', clientId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data?.map(this.mapLogFromDb) || [];
  }

  async createDataIngestionLog(log: Omit<DataIngestionLog, 'id' | 'createdAt'>): Promise<DataIngestionLog> {
    const { data, error } = await supabase
      .from('data_ingestion_logs')
      .insert({
        client_id: log.clientId,
        ingestion_type: log.ingestionType,
        record_count: log.recordCount,
        success_count: log.successCount,
        error_count: log.errorCount,
        status: log.status,
        error_details: log.errorDetails,
        processing_time_ms: log.processingTimeMs,
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapLogFromDb(data);
  }

  // Customer Mappings
  async getCustomerMappings(clientId: string): Promise<ExternalCustomerMapping[]> {
    const { data, error } = await supabase
      .from('external_customer_mappings')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data?.map(this.mapCustomerFromDb) || [];
  }

  // Transaction Mappings
  async getTransactionMappings(clientId: string): Promise<ExternalTransactionMapping[]> {
    const { data, error } = await supabase
      .from('external_transaction_mappings')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data?.map(this.mapTransactionFromDb) || [];
  }

  // API Key Management
  async getAPIKeys(clientId: string): Promise<IntegrationAPIKey[]> {
    const { data, error } = await supabase
      .from('integration_api_keys')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data?.map(this.mapAPIKeyFromDb) || [];
  }

  async createAPIKey(apiKey: Omit<IntegrationAPIKey, 'id' | 'createdAt'>): Promise<IntegrationAPIKey> {
    const { data, error } = await supabase
      .from('integration_api_keys')
      .insert({
        client_id: apiKey.clientId,
        key_name: apiKey.keyName,
        key_hash: apiKey.keyHash,
        permissions: apiKey.permissions,
        expires_at: apiKey.expiresAt,
        is_active: apiKey.isActive,
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapAPIKeyFromDb(data);
  }

  async revokeAPIKey(keyId: string): Promise<void> {
    const { error } = await supabase
      .from('integration_api_keys')
      .update({ is_active: false })
      .eq('id', keyId);

    if (error) throw error;
  }

  async updateAPIKeyLastUsed(keyId: string): Promise<void> {
    const { error } = await supabase
      .from('integration_api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', keyId);

    if (error) throw error;
  }

  // Statistics
  async getIntegrationStats(): Promise<IntegrationStats> {
    const [configsData, logsData] = await Promise.all([
      supabase.from('integration_configs').select('status'),
      supabase.from('data_ingestion_logs').select('record_count, error_count, processing_time_ms, created_at')
    ]);

    const configs = configsData.data || [];
    const logs = logsData.data || [];

    const totalClients = configs.length;
    const activeIntegrations = configs.filter(c => c.status === 'active').length;
    const totalDataIngested = logs.reduce((sum, log) => sum + (log.record_count || 0), 0);
    const totalErrors = logs.reduce((sum, log) => sum + (log.error_count || 0), 0);
    const errorRate = totalDataIngested > 0 ? (totalErrors / totalDataIngested) * 100 : 0;
    const avgProcessingTime = logs.length > 0 
      ? logs.reduce((sum, log) => sum + (log.processing_time_ms || 0), 0) / logs.length 
      : 0;

    return {
      totalClients,
      activeIntegrations,
      totalDataIngested,
      errorRate: parseFloat(errorRate.toFixed(2)),
      avgProcessingTime: parseFloat(avgProcessingTime.toFixed(2)),
    };
  }

  // Helper mapping functions
  private mapConfigFromDb(data: any): IntegrationConfig {
    return {
      id: data.id,
      clientId: data.client_id,
      clientName: data.client_name,
      integrationType: data.integration_type,
      apiKeyHash: data.api_key_hash,
      webhookUrl: data.webhook_url,
      batchFrequency: data.batch_frequency,
      dataMapping: data.data_mapping,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapLogFromDb(data: any): DataIngestionLog {
    return {
      id: data.id,
      clientId: data.client_id,
      ingestionType: data.ingestion_type,
      recordCount: data.record_count,
      successCount: data.success_count,
      errorCount: data.error_count,
      status: data.status,
      errorDetails: data.error_details,
      processingTimeMs: data.processing_time_ms,
      createdAt: data.created_at,
    };
  }

  private mapCustomerFromDb(data: any): ExternalCustomerMapping {
    return {
      id: data.id,
      clientId: data.client_id,
      externalCustomerId: data.external_customer_id,
      internalUserId: data.internal_user_id,
      customerData: data.customer_data,
      syncStatus: data.sync_status,
      lastSyncedAt: data.last_synced_at,
      createdAt: data.created_at,
    };
  }

  private mapTransactionFromDb(data: any): ExternalTransactionMapping {
    return {
      id: data.id,
      clientId: data.client_id,
      externalTransactionId: data.external_transaction_id,
      externalCustomerId: data.external_customer_id,
      transactionData: data.transaction_data,
      riskAssessment: data.risk_assessment,
      complianceStatus: data.compliance_status,
      createdAt: data.created_at,
    };
  }

  private mapAPIKeyFromDb(data: any): IntegrationAPIKey {
    return {
      id: data.id,
      clientId: data.client_id,
      keyName: data.key_name,
      keyHash: data.key_hash,
      permissions: data.permissions,
      expiresAt: data.expires_at,
      lastUsedAt: data.last_used_at,
      isActive: data.is_active,
      createdAt: data.created_at,
    };
  }
}

export const integrationService = new IntegrationService();
