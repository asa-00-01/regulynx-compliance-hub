
export interface IntegrationConfig {
  id: string;
  clientId: string;
  clientName: string;
  integrationType: 'api_realtime' | 'batch_processing' | 'hybrid';
  apiKeyHash?: string;
  webhookUrl?: string;
  batchFrequency?: string;
  dataMapping: Record<string, any>;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export interface DataIngestionLog {
  id: string;
  clientId: string;
  ingestionType: 'customer' | 'transaction' | 'document';
  recordCount: number;
  successCount: number;
  errorCount: number;
  status: 'processing' | 'completed' | 'failed' | 'partial';
  errorDetails?: Record<string, any>;
  processingTimeMs?: number;
  createdAt: string;
}

export interface ExternalCustomerMapping {
  id: string;
  clientId: string;
  externalCustomerId: string;
  internalUserId: string;
  customerData: Record<string, any>;
  syncStatus: 'synced' | 'pending' | 'error';
  lastSyncedAt?: string;
  createdAt: string;
}

export interface ExternalTransactionMapping {
  id: string;
  clientId: string;
  externalTransactionId: string;
  externalCustomerId: string;
  transactionData: Record<string, any>;
  riskAssessment?: Record<string, any>;
  complianceStatus?: 'pending' | 'approved' | 'flagged' | 'requires_review';
  createdAt: string;
}

export interface IntegrationAPIKey {
  id: string;
  clientId: string;
  keyName: string;
  keyHash: string;
  permissions: string[];
  expiresAt?: string;
  lastUsedAt?: string;
  isActive: boolean;
  createdAt: string;
}

export interface IntegrationStats {
  totalClients: number;
  activeIntegrations: number;
  totalDataIngested: number;
  errorRate: number;
  avgProcessingTime: number;
}
