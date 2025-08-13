
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { IntegrationAPIKey, IntegrationConfig } from '@/types/integration';
import { Key, Plus, Copy, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import APIKeyGenerationDialog from './APIKeyGenerationDialog';

interface APIKeyManagementProps {
  apiKeys: IntegrationAPIKey[];
  selectedClientId: string | null;
  onClientSelect: (clientId: string | null) => void;
  integrationConfigs: IntegrationConfig[];
  onCreateAPIKey: (apiKey: Omit<IntegrationAPIKey, 'id' | 'createdAt'>) => Promise<IntegrationAPIKey>;
  onRevokeAPIKey?: (keyId: string) => Promise<void>;
}

const APIKeyManagement = ({ 
  apiKeys, 
  selectedClientId, 
  onClientSelect, 
  integrationConfigs, 
  onCreateAPIKey,
  onRevokeAPIKey 
}: APIKeyManagementProps) => {
  const [isGenerationDialogOpen, setIsGenerationDialogOpen] = useState(false);
  const [revokingKeyId, setRevokingKeyId] = useState<string | null>(null);
  const { toast } = useToast();

  const selectedClient = integrationConfigs.find(config => config.clientId === selectedClientId);

  const handleCopyKey = (keyHash: string) => {
    // In a real implementation, you wouldn't expose the actual key hash
    // This is just for demonstration
    navigator.clipboard.writeText(keyHash);
    toast({
      title: 'Success',
      description: 'API key copied to clipboard',
    });
  };

  const handleRevokeKey = async (keyId: string) => {
    try {
      setRevokingKeyId(keyId);
      if (onRevokeAPIKey) {
        await onRevokeAPIKey(keyId);
      } else {
        await new Promise(resolve => setTimeout(resolve, 600));
      }
      
      toast({
        title: 'Success',
        description: 'API key has been revoked',
      });
    } catch (error) {
      console.error('Error revoking API key:', error);
      toast({
        title: 'Error',
        description: 'Failed to revoke API key',
        variant: 'destructive',
      });
    } finally {
      setRevokingKeyId(null);
    }
  };

  const getKeyStatus = (key: IntegrationAPIKey) => {
    if (!key.isActive) return 'inactive';
    if (key.expiresAt && new Date(key.expiresAt) < new Date()) return 'expired';
    return 'active';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
              <Select 
                value={selectedClientId || 'none'} 
                onValueChange={(value) => onClientSelect(value === 'none' ? null : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">All Clients</SelectItem>
                  {integrationConfigs.map((config) => (
                    <SelectItem key={config.id} value={config.clientId}>
                      {config.clientName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedClientId && (
              <Button size="sm" onClick={() => setIsGenerationDialogOpen(true)}>
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
            <Key className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">No API keys found</p>
            <p className="text-sm mb-4">Generate your first API key to get started.</p>
            <Button onClick={() => setIsGenerationDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Generate API Key
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {apiKeys.map((key) => {
              const status = getKeyStatus(key);
              return (
                <div key={key.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{key.keyName}</h4>
                      <Badge className={getStatusColor(status)}>
                        {status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Created {formatDistanceToNow(new Date(key.createdAt), { addSuffix: true })}</p>
                      {key.lastUsedAt && (
                        <p>Last used {formatDistanceToNow(new Date(key.lastUsedAt), { addSuffix: true })}</p>
                      )}
                      {key.expiresAt && (
                        <p>Expires {new Date(key.expiresAt).toLocaleDateString()}</p>
                      )}
                      {key.permissions.length > 0 && (
                        <p>Permissions: {key.permissions.join(', ')}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyKey(key.keyHash)}
                      title="Copy API key"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={revokingKeyId === key.id || !key.isActive}
                          title="Revoke API key"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Revoke API Key</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to revoke the API key "{key.keyName}"? 
                            This action cannot be undone and will immediately stop all API requests using this key.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRevokeKey(key.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            {revokingKeyId === key.id ? 'Revoking...' : 'Revoke Key'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      {selectedClientId && selectedClient && (
        <APIKeyGenerationDialog
          open={isGenerationDialogOpen}
          onOpenChange={setIsGenerationDialogOpen}
          clientId={selectedClientId}
          clientName={selectedClient.clientName}
          onCreateAPIKey={onCreateAPIKey}
        />
      )}
    </Card>
  );
};

export default APIKeyManagement;
