
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { IntegrationAPIKey } from '@/types/integration';
import { generateRandomKey } from '@/lib/utils';

interface APIKeyGenerationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  clientName: string;
  onCreateAPIKey: (apiKey: Omit<IntegrationAPIKey, 'id' | 'createdAt'>) => Promise<IntegrationAPIKey>;
}

const permissions = [
  { id: 'read:customers', label: 'Read Customers' },
  { id: 'write:customers', label: 'Write Customers' },
  { id: 'read:transactions', label: 'Read Transactions' },
  { id: 'write:transactions', label: 'Write Transactions' },
  { id: 'read:documents', label: 'Read Documents' },
  { id: 'write:documents', label: 'Write Documents' },
];

const APIKeyGenerationDialog = ({ 
  open, 
  onOpenChange, 
  clientId, 
  clientName, 
  onCreateAPIKey 
}: APIKeyGenerationDialogProps) => {
  const [keyName, setKeyName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [expiresAt, setExpiresAt] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string>('');

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    if (checked) {
      setSelectedPermissions(prev => [...prev, permissionId]);
    } else {
      setSelectedPermissions(prev => prev.filter(id => id !== permissionId));
    }
  };

  const handleGenerateKey = async () => {
    if (!keyName.trim()) return;
    
    setIsCreating(true);
    try {
      const actualKey = generateRandomKey();
      const keyHash = btoa(actualKey); // In production, use proper hashing
      
      const newAPIKey = await onCreateAPIKey({
        clientId,
        keyName: keyName.trim(),
        keyHash,
        permissions: selectedPermissions,
        expiresAt: expiresAt || undefined,
        isActive: true,
      });

      setGeneratedKey(actualKey);
    } catch (error) {
      console.error('Error generating API key:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setKeyName('');
    setSelectedPermissions([]);
    setExpiresAt('');
    setGeneratedKey('');
    onOpenChange(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedKey);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Generate API Key</DialogTitle>
        </DialogHeader>
        
        {!generatedKey ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="client">Client</Label>
              <Input id="client" value={clientName} disabled />
            </div>
            
            <div>
              <Label htmlFor="keyName">Key Name</Label>
              <Input
                id="keyName"
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                placeholder="Enter key name"
              />
            </div>

            <div>
              <Label htmlFor="expires">Expires At (Optional)</Label>
              <Input
                id="expires"
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </div>

            <div>
              <Label>Permissions</Label>
              <div className="space-y-2 mt-2">
                {permissions.map((permission) => (
                  <div key={permission.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={permission.id}
                      checked={selectedPermissions.includes(permission.id)}
                      onCheckedChange={(checked) => 
                        handlePermissionChange(permission.id, checked as boolean)
                      }
                    />
                    <Label htmlFor={permission.id} className="text-sm">
                      {permission.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleGenerateKey}
                disabled={!keyName.trim() || isCreating}
              >
                {isCreating ? 'Generating...' : 'Generate Key'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label>Generated API Key</Label>
              <div className="flex items-center space-x-2 mt-2">
                <Input value={generatedKey} readOnly />
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  Copy
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Make sure to copy your API key now. You won't be able to see it again!
              </p>
            </div>
            <Button onClick={handleClose} className="w-full">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default APIKeyGenerationDialog;
