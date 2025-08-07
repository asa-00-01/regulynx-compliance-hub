
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExternalCustomerMapping, ExternalTransactionMapping, IntegrationConfig } from '@/types/integration';
import { Users, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CustomerMappingViewProps {
  customerMappings: ExternalCustomerMapping[];
  transactionMappings: ExternalTransactionMapping[];
  selectedClientId: string | null;
  onClientSelect: (clientId: string | null) => void;
  integrationConfigs: IntegrationConfig[];
}

const CustomerMappingView = ({ 
  customerMappings, 
  transactionMappings, 
  selectedClientId, 
  onClientSelect, 
  integrationConfigs 
}: CustomerMappingViewProps) => {
  const getSyncStatusColor = (status: string) => {
    switch (status) {
      case 'synced':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Customer Mappings
            </CardTitle>
            <div className="w-64">
              <Select 
                value={selectedClientId || 'none'} 
                onValueChange={(value) => onClientSelect(value === 'none' ? null : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {integrationConfigs.map((config) => (
                    <SelectItem key={config.id} value={config.clientId}>
                      {config.clientName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!selectedClientId ? (
            <div className="text-center py-8 text-muted-foreground">
              Select a client to view customer mappings.
            </div>
          ) : customerMappings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No customer mappings found for this client.
            </div>
          ) : (
            <div className="space-y-4">
              {customerMappings.map((mapping) => (
                <div key={mapping.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                      {mapping.externalCustomerId}
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <div className="text-sm font-mono bg-blue-100 px-2 py-1 rounded">
                      {mapping.internalUserId}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getSyncStatusColor(mapping.syncStatus)}>
                      {mapping.syncStatus}
                    </Badge>
                    <div className="text-xs text-muted-foreground mt-1">
                      Created {formatDistanceToNow(new Date(mapping.createdAt), { addSuffix: true })}
                    </div>
                    {mapping.lastSyncedAt && (
                      <div className="text-xs text-muted-foreground">
                        Last synced {formatDistanceToNow(new Date(mapping.lastSyncedAt), { addSuffix: true })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transaction Mappings</CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedClientId ? (
            <div className="text-center py-8 text-muted-foreground">
              Select a client to view transaction mappings.
            </div>
          ) : transactionMappings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No transaction mappings found for this client.
            </div>
          ) : (
            <div className="space-y-4">
              {transactionMappings.map((mapping) => (
                <div key={mapping.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">Transaction ID:</span>
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {mapping.externalTransactionId}
                      </code>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-sm text-muted-foreground">Customer:</span>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {mapping.externalCustomerId}
                      </code>
                    </div>
                  </div>
                  <div className="text-right">
                    {mapping.complianceStatus && (
                      <Badge className={
                        mapping.complianceStatus === 'approved' ? 'bg-green-100 text-green-800' :
                        mapping.complianceStatus === 'flagged' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }>
                        {mapping.complianceStatus}
                      </Badge>
                    )}
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(mapping.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerMappingView;
