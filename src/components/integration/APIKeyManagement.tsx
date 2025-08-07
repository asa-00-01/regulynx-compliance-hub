
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { IntegrationAPIKey, IntegrationConfig } from '@/types/integration';
import { Key, Plus, Copy } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface APIKeyManagementProps {
  apiKeys: IntegrationAPIKey[];
  selectedClientId: string | null;
  onClientSelect: (clientId: string | null) => void;
  integrationConfigs: IntegrationConfig[];
  onCreateAPIKey: (apiKey: Omit<IntegrationAPIKey, 'id' | 'createdAt'>) => Promise<IntegrationAPIKey>;
}

const APIKeyManagement = ({ apiKeys, selectedClientId, onClientSelect, integrationConfigs, onCreateAPIKey }: APIKeyManagementProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Key Management
          </CardTitle>
          <div className="flex items-center gap-2">
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
            {selectedClientId && (
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Generate Key
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!selectedClientId ? (
          <div className="text-center py-8 text-muted-foreground">
            Select a client to manage API keys.
          </div>
        ) : apiKeys.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No API keys found for this client.
          </div>
        ) : (
          <div className="space-y-4">
            {apiKeys.map((key) => (
              <div key={key.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{key.keyName}</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge className={key.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {key.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Created {formatDistanceToNow(new Date(key.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  {key.lastUsedAt && (
                    <span className="text-xs text-muted-foreground">
                      Last used {formatDistanceToNow(new Date(key.lastUsedAt), { addSuffix: true })}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    Revoke
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default APIKeyManagement;
