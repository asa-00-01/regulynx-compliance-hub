
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { integrationService } from '@/services/integration/IntegrationService';
import { 
  IntegrationConfig, 
  DataIngestionLog, 
  ExternalCustomerMapping,
  ExternalTransactionMapping,
  IntegrationAPIKey,
  IntegrationStats 
} from '@/types/integration';

export function useIntegrationManagement() {
  const [integrationConfigs, setIntegrationConfigs] = useState<IntegrationConfig[]>([]);
  const [dataIngestionLogs, setDataIngestionLogs] = useState<DataIngestionLog[]>([]);
  const [customerMappings, setCustomerMappings] = useState<ExternalCustomerMapping[]>([]);
  const [transactionMappings, setTransactionMappings] = useState<ExternalTransactionMapping[]>([]);
  const [apiKeys, setAPIKeys] = useState<IntegrationAPIKey[]>([]);
  const [stats, setStats] = useState<IntegrationStats>({
    totalClients: 0,
    activeIntegrations: 0,
    totalDataIngested: 0,
    errorRate: 0,
    avgProcessingTime: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const { toast } = useToast();

  // Load integration configs
  const loadIntegrationConfigs = useCallback(async () => {
    try {
      const configs = await integrationService.getIntegrationConfigs();
      setIntegrationConfigs(configs);
    } catch (error) {
      console.error('Error loading integration configs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load integration configurations.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  // Load data ingestion logs
  const loadDataIngestionLogs = useCallback(async (clientId?: string) => {
    try {
      const logs = await integrationService.getDataIngestionLogs(clientId);
      setDataIngestionLogs(logs);
    } catch (error) {
      console.error('Error loading data ingestion logs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load data ingestion logs.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  // Load customer mappings
  const loadCustomerMappings = useCallback(async (clientId: string) => {
    try {
      const mappings = await integrationService.getCustomerMappings(clientId);
      setCustomerMappings(mappings);
    } catch (error) {
      console.error('Error loading customer mappings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load customer mappings.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  // Load transaction mappings
  const loadTransactionMappings = useCallback(async (clientId: string) => {
    try {
      const mappings = await integrationService.getTransactionMappings(clientId);
      setTransactionMappings(mappings);
    } catch (error) {
      console.error('Error loading transaction mappings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load transaction mappings.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  // Load API keys
  const loadAPIKeys = useCallback(async (clientId: string) => {
    try {
      const keys = await integrationService.getAPIKeys(clientId);
      setAPIKeys(keys);
    } catch (error) {
      console.error('Error loading API keys:', error);
      toast({
        title: 'Error',
        description: 'Failed to load API keys.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  // Load stats
  const loadStats = useCallback(async () => {
    try {
      const statsData = await integrationService.getIntegrationStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading integration stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load integration statistics.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  // Create integration config
  const createIntegrationConfig = useCallback(async (config: Omit<IntegrationConfig, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newConfig = await integrationService.createIntegrationConfig(config);
      setIntegrationConfigs(prev => [newConfig, ...prev]);
      toast({
        title: 'Success',
        description: 'Integration configuration created successfully.',
      });
      return newConfig;
    } catch (error) {
      console.error('Error creating integration config:', error);
      toast({
        title: 'Error',
        description: 'Failed to create integration configuration.',
        variant: 'destructive',
      });
      throw error;
    }
  }, [toast]);

  // Update integration config
  const updateIntegrationConfig = useCallback(async (id: string, updates: Partial<IntegrationConfig>) => {
    try {
      const updatedConfig = await integrationService.updateIntegrationConfig(id, updates);
      setIntegrationConfigs(prev => 
        prev.map(config => config.id === id ? updatedConfig : config)
      );
      toast({
        title: 'Success',
        description: 'Integration configuration updated successfully.',
      });
      return updatedConfig;
    } catch (error) {
      console.error('Error updating integration config:', error);
      toast({
        title: 'Error',
        description: 'Failed to update integration configuration.',
        variant: 'destructive',
      });
      throw error;
    }
  }, [toast]);

  // Create API key
  const createAPIKey = useCallback(async (apiKey: Omit<IntegrationAPIKey, 'id' | 'createdAt'>) => {
    try {
      const newAPIKey = await integrationService.createAPIKey(apiKey);
      setAPIKeys(prev => [newAPIKey, ...prev]);
      toast({
        title: 'Success',
        description: 'API key created successfully.',
      });
      return newAPIKey;
    } catch (error) {
      console.error('Error creating API key:', error);
      toast({
        title: 'Error',
        description: 'Failed to create API key.',
        variant: 'destructive',
      });
      throw error;
    }
  }, [toast]);

  // Revoke API key
  const revokeAPIKey = useCallback(async (keyId: string) => {
    try {
      await integrationService.revokeAPIKey(keyId);
      setAPIKeys(prev => 
        prev.map(key => key.id === keyId ? { ...key, isActive: false } : key)
      );
      toast({
        title: 'Success',
        description: 'API key has been revoked.',
      });
    } catch (error) {
      console.error('Error revoking API key:', error);
      toast({
        title: 'Error',
        description: 'Failed to revoke API key.',
        variant: 'destructive',
      });
      throw error;
    }
  }, [toast]);

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await Promise.all([
        loadIntegrationConfigs(),
        loadDataIngestionLogs(),
        loadStats(),
      ]);
      setLoading(false);
    };

    initializeData();
  }, [loadIntegrationConfigs, loadDataIngestionLogs, loadStats]);

  // Load client-specific data when client is selected
  useEffect(() => {
    if (selectedClientId) {
      loadCustomerMappings(selectedClientId);
      loadTransactionMappings(selectedClientId);
      loadAPIKeys(selectedClientId);
      loadDataIngestionLogs(selectedClientId);
    }
  }, [selectedClientId, loadCustomerMappings, loadTransactionMappings, loadAPIKeys, loadDataIngestionLogs]);

  return {
    integrationConfigs,
    dataIngestionLogs,
    customerMappings,
    transactionMappings,
    apiKeys,
    stats,
    loading,
    selectedClientId,
    setSelectedClientId,
    createIntegrationConfig,
    updateIntegrationConfig,
    createAPIKey,
    revokeAPIKey,
    refreshData: () => {
      loadIntegrationConfigs();
      loadDataIngestionLogs();
      loadStats();
      if (selectedClientId) {
        loadAPIKeys(selectedClientId);
      }
    },
  };
}
