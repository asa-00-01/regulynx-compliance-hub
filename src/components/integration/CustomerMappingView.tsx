
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExternalCustomerMapping, ExternalTransactionMapping, IntegrationConfig } from '@/types/integration';
import { Users, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CustomerMappingViewProps {
  customerMappings: ExternalCustomerMapping[];
  transactionMappings: ExternalTransactionMapping[];
  selectedClientId: string | null;
  onClientSelect: (clientId: string | null) => void;
  integrationConfigs: IntegrationConfig[];
}

const CustomerMappingView = ({ customerMappings, transactionMappings, selectedClientId, onClientSelect, integrationConfigs }: CustomerMappingViewProps) => {
  const getSyncStatusBadge = (status: string) => {
    const variants = {
      synced: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      error: 'bg-red-100 text-red-800 border-red-200',
    };
    return variants[status as keyof typeof variants] || variants.pending;
  };

  return (
    <div className="space-y-6">
      {/* Customer Mappings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Customer Mappings
            </CardTitle>
            <div className="w-64">
              <Select value={selectedClientId || ''} onValueChange={(value) => onClientSelect(value || null)}>
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
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <h4 className="font-medium">
                        External ID: {mapping.externalCustomerId}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Internal ID: {mapping.internalUserId}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {mapping.lastSyncedAt && `Last synced ${formatDistanceToNow(new Date(mapping.lastSyncedAt), { addSuffix: true })}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getSyncStatusBadge(mapping.syncStatus)}>
                      {mapping.syncStatus}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction Mappings */}
      {selectedClientId && transactionMappings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Transaction Mappings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactionMappings.map((mapping) => (
                <div key={mapping.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <h4 className="font-medium">
                        Transaction ID: {mapping.externalTransactionId}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Customer ID: {mapping.externalCustomerId}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(mapping.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  {mapping.complianceStatus && (
                    <Badge variant="outline">
                      {mapping.complianceStatus}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CustomerMappingView;
