
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { IntegrationConfig } from '@/types/integration';

interface IntegrationConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingConfig?: IntegrationConfig | null;
  onSave: (config: Omit<IntegrationConfig, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
}

const IntegrationConfigDialog = ({
  open,
  onOpenChange,
  editingConfig,
  onSave,
  onCancel,
}: IntegrationConfigDialogProps) => {
  const [formData, setFormData] = useState({
    clientId: '',
    clientName: '',
    integrationType: 'api_realtime' as const,
    webhookUrl: '',
    batchFrequency: '',
    dataMapping: '{}',
    status: 'active' as const,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingConfig) {
      setFormData({
        clientId: editingConfig.clientId,
        clientName: editingConfig.clientName,
        integrationType: editingConfig.integrationType,
        webhookUrl: editingConfig.webhookUrl || '',
        batchFrequency: editingConfig.batchFrequency || '',
        dataMapping: JSON.stringify(editingConfig.dataMapping, null, 2),
        status: editingConfig.status,
      });
    } else {
      setFormData({
        clientId: '',
        clientName: '',
        integrationType: 'api_realtime',
        webhookUrl: '',
        batchFrequency: '',
        dataMapping: '{}',
        status: 'active',
      });
    }
  }, [editingConfig, open]);

  const handleSave = async () => {
    setSaving(true);
    try {
      let dataMapping = {};
      try {
        dataMapping = JSON.parse(formData.dataMapping);
      } catch (error) {
        throw new Error('Invalid JSON in data mapping');
      }

      await onSave({
        clientId: formData.clientId,
        clientName: formData.clientName,
        integrationType: formData.integrationType,
        webhookUrl: formData.webhookUrl || undefined,
        batchFrequency: formData.batchFrequency || undefined,
        dataMapping,
        status: formData.status,
      });
    } catch (error) {
      console.error('Error saving integration config:', error);
    } finally {
      setSaving(false);
    }
  };

  const isFormValid = () => {
    return formData.clientId && formData.clientName && formData.integrationType;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editingConfig ? 'Edit Integration' : 'Add New Integration'}
          </DialogTitle>
          <DialogDescription>
            Configure external system integration settings.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="clientId">Client ID</Label>
            <Input
              id="clientId"
              value={formData.clientId}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              placeholder="unique-client-identifier"
              disabled={!!editingConfig}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="clientName">Client Name</Label>
            <Input
              id="clientName"
              value={formData.clientName}
              onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
              placeholder="External System Name"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="integrationType">Integration Type</Label>
            <Select
              value={formData.integrationType}
              onValueChange={(value: any) => setFormData({ ...formData, integrationType: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="api_realtime">Real-time API</SelectItem>
                <SelectItem value="batch_processing">Batch Processing</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="webhookUrl">Webhook URL (Optional)</Label>
            <Input
              id="webhookUrl"
              value={formData.webhookUrl}
              onChange={(e) => setFormData({ ...formData, webhookUrl: e.target.value })}
              placeholder="https://client-system.com/webhook"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="batchFrequency">Batch Frequency (Optional)</Label>
            <Input
              id="batchFrequency"
              value={formData.batchFrequency}
              onChange={(e) => setFormData({ ...formData, batchFrequency: e.target.value })}
              placeholder="daily, hourly, etc."
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: any) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="dataMapping">Data Mapping (JSON)</Label>
            <Textarea
              id="dataMapping"
              value={formData.dataMapping}
              onChange={(e) => setFormData({ ...formData, dataMapping: e.target.value })}
              placeholder='{"customer_id": "external_customer_id", "amount": "transaction_amount"}'
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!isFormValid() || saving}>
            {saving ? 'Saving...' : editingConfig ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default IntegrationConfigDialog;
