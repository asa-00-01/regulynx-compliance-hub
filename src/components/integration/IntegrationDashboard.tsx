
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Settings, Database, Key, Send, FileText, Rocket, Activity, Cog } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { useIntegrationManagement } from '@/hooks/useIntegrationManagement';
import IntegrationStats from './IntegrationStats';
import IntegrationConfigDialog from './IntegrationConfigDialog';
import DataIngestionMonitor from './DataIngestionMonitor';
import APIKeyManagement from './APIKeyManagement';
import CustomerMappingView from './CustomerMappingView';
import WebhookMonitor from './WebhookMonitor';
import APIDocumentation from './APIDocumentation';
import ReleaseManagement from './ReleaseManagement';
import EnhancedMonitoring from './EnhancedMonitoring';
import ConfigurationManagement from './ConfigurationManagement';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const IntegrationDashboard = () => {
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  
  const {
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
    refreshData,
  } = useIntegrationManagement();

  const handleCreateConfig = () => {
    setEditingConfig(null);
    setConfigDialogOpen(true);
  };

  const handleEditConfig = (config: any) => {
    setEditingConfig(config);
    setConfigDialogOpen(true);
  };

  const handleSaveConfig = async (configData: any) => {
    if (editingConfig) {
      await updateIntegrationConfig(editingConfig.id, configData);
    } else {
      await createIntegrationConfig(configData);
    }
    setConfigDialogOpen(false);
    setEditingConfig(null);
  };

  const handleCancelConfig = () => {
    setConfigDialogOpen(false);
    setEditingConfig(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading integration dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Integration Management</h1>
          <p className="text-muted-foreground">
            Manage external system integrations and data flows
          </p>
        </div>
        <Button onClick={handleCreateConfig}>
          <Plus className="mr-2 h-4 w-4" />
          Add Integration
        </Button>
      </div>

      <IntegrationStats stats={stats} />

      <Tabs defaultValue="configs" className="space-y-4">
        <TabsList className="grid w-full grid-cols-9">
          <TabsTrigger value="configs">
            <Settings className="mr-2 h-4 w-4" />
            Configurations
          </TabsTrigger>
          <TabsTrigger value="monitoring">
            <Database className="mr-2 h-4 w-4" />
            Data Monitoring
          </TabsTrigger>
          <TabsTrigger value="enhanced-monitoring">
            <Activity className="mr-2 h-4 w-4" />
            Enhanced Monitoring
          </TabsTrigger>
          <TabsTrigger value="keys">
            <Key className="mr-2 h-4 w-4" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="webhooks">
            <Send className="mr-2 h-4 w-4" />
            Webhooks
          </TabsTrigger>
          <TabsTrigger value="mappings">
            Customer Mappings
          </TabsTrigger>
          <TabsTrigger value="releases">
            <Rocket className="mr-2 h-4 w-4" />
            Releases
          </TabsTrigger>
          <TabsTrigger value="config-management">
            <Cog className="mr-2 h-4 w-4" />
            Configuration
          </TabsTrigger>
          <TabsTrigger value="docs">
            <FileText className="mr-2 h-4 w-4" />
            API Docs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="configs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integration Configurations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {integrationConfigs.map((config) => (
                  <div
                    key={config.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h3 className="font-semibold">{config.clientName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {config.clientId} • {config.integrationType} • {config.status}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditConfig(config)}
                    >
                      Edit
                    </Button>
                  </div>
                ))}
                {integrationConfigs.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No integration configurations found. Create your first integration.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <DataIngestionMonitor
            logs={dataIngestionLogs}
            selectedClientId={selectedClientId}
            onClientSelect={setSelectedClientId}
            integrationConfigs={integrationConfigs}
          />
        </TabsContent>

        <TabsContent value="enhanced-monitoring" className="space-y-4">
          <EnhancedMonitoring />
        </TabsContent>

        <TabsContent value="keys" className="space-y-4">
          <APIKeyManagement
            apiKeys={apiKeys}
            selectedClientId={selectedClientId}
            onClientSelect={setSelectedClientId}
            integrationConfigs={integrationConfigs}
            onCreateAPIKey={createAPIKey}
          />
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <WebhookMonitor />
        </TabsContent>

        <TabsContent value="mappings" className="space-y-4">
          <CustomerMappingView
            customerMappings={customerMappings}
            transactionMappings={transactionMappings}
            selectedClientId={selectedClientId}
            onClientSelect={setSelectedClientId}
            integrationConfigs={integrationConfigs}
          />
        </TabsContent>

        <TabsContent value="releases" className="space-y-4">
          <ReleaseManagement />
        </TabsContent>

        <TabsContent value="config-management" className="space-y-4">
          <ConfigurationManagement />
        </TabsContent>

        <TabsContent value="docs" className="space-y-4">
          <APIDocumentation />
        </TabsContent>
      </Tabs>

      <IntegrationConfigDialog
        open={configDialogOpen}
        onOpenChange={setConfigDialogOpen}
        editingConfig={editingConfig}
        onSave={handleSaveConfig}
        onCancel={handleCancelConfig}
      />
    </div>
  );
};

export default IntegrationDashboard;
