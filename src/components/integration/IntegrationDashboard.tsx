
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useIntegrationManagement } from '@/hooks/useIntegrationManagement';
import { Plus, Activity, Users, Database, Key, AlertTriangle } from 'lucide-react';
import IntegrationConfigDialog from './IntegrationConfigDialog';
import APIKeyManagement from './APIKeyManagement';
import DataIngestionMonitor from './DataIngestionMonitor';
import CustomerMappingView from './CustomerMappingView';
import IntegrationStats from './IntegrationStats';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

const IntegrationDashboard = () => {
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
  } = useIntegrationManagement();

  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner />
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'bg-green-100 text-green-800 border-green-200',
      inactive: 'bg-gray-100 text-gray-800 border-gray-200',
      suspended: 'bg-red-100 text-red-800 border-red-200',
    };
    return variants[status as keyof typeof variants] || variants.inactive;
  };

  const getIntegrationTypeLabel = (type: string) => {
    const labels = {
      api_realtime: 'Real-time API',
      batch_processing: 'Batch Processing',
      hybrid: 'Hybrid',
    };
    return labels[type as keyof typeof labels] || type;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Integration Management</h1>
          <p className="text-muted-foreground">
            Manage external integrations and monitor data flows
          </p>
        </div>
        <Button onClick={() => setShowConfigDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Integration
        </Button>
      </div>

      {/* Stats Overview */}
      <IntegrationStats stats={stats} />

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="data-monitor" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Data Monitor
          </TabsTrigger>
          <TabsTrigger value="customers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Customer Mappings
          </TabsTrigger>
          <TabsTrigger value="api-keys" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            API Keys
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Integration Configurations */}
          <Card>
            <CardHeader>
              <CardTitle>Integration Configurations</CardTitle>
              <CardDescription>
                Manage your external system integrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {integrationConfigs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No integrations configured yet. Create your first integration to get started.
                </div>
              ) : (
                <div className="space-y-4">
                  {integrationConfigs.map((config) => (
                    <div
                      key={config.id}
                      className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-accent/5"
                      onClick={() => setSelectedClientId(config.clientId)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        <div>
                          <h3 className="font-medium">{config.clientName}</h3>
                          <p className="text-sm text-muted-foreground">
                            Client ID: {config.clientId}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusBadge(config.status)}>
                          {config.status}
                        </Badge>
                        <Badge variant="outline">
                          {getIntegrationTypeLabel(config.integrationType)}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingConfig(config);
                            setShowConfigDialog(true);
                          }}
                        >
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          {selectedClientId && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest data ingestion activities for selected client
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataIngestionMonitor logs={dataIngestionLogs.slice(0, 5)} />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="data-monitor">
          <DataIngestionMonitor logs={dataIngestionLogs} />
        </TabsContent>

        <TabsContent value="customers">
          <CustomerMappingView 
            mappings={customerMappings}
            selectedClientId={selectedClientId}
          />
        </TabsContent>

        <TabsContent value="api-keys">
          <APIKeyManagement 
            apiKeys={apiKeys}
            selectedClientId={selectedClientId}
            onCreateAPIKey={createAPIKey}
          />
        </TabsContent>
      </Tabs>

      {/* Integration Config Dialog */}
      <IntegrationConfigDialog
        open={showConfigDialog}
        onOpenChange={setShowConfigDialog}
        editingConfig={editingConfig}
        onSave={async (config) => {
          try {
            if (editingConfig) {
              await updateIntegrationConfig(editingConfig.id, config);
            } else {
              await createIntegrationConfig(config);
            }
            setShowConfigDialog(false);
            setEditingConfig(null);
          } catch (error) {
            // Error handling is done in the hook
          }
        }}
        onCancel={() => {
          setShowConfigDialog(false);
          setEditingConfig(null);
        }}
      />
    </div>
  );
};

export default IntegrationDashboard;
