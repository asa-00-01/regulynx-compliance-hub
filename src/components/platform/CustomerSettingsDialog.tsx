
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Customer } from '@/types/platform-roles';
import { SupabasePlatformRoleService } from '@/services/supabasePlatformRoleService';
import { useToast } from '@/hooks/use-toast';
import { Settings, Save, AlertTriangle } from 'lucide-react';

interface CustomerSettingsDialogProps {
  customer: Customer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomerSettingsDialog({ customer, open, onOpenChange }: CustomerSettingsDialogProps) {
  const [formData, setFormData] = useState({
    name: customer.name || '',
    domain: customer.domain || '',
    subscription_tier: customer.subscription_tier || 'basic',
    settings: {
      maxUsers: customer.settings?.maxUsers || 10,
      apiRateLimit: customer.settings?.apiRateLimit || 1000,
      storageLimit: customer.settings?.storageLimit || 1000,
      enableNotifications: customer.settings?.enableNotifications ?? true,
      enableAuditLogs: customer.settings?.enableAuditLogs ?? true,
      customDomain: customer.settings?.customDomain || '',
      webhookUrl: customer.settings?.webhookUrl || '',
      notes: customer.settings?.notes || ''
    }
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      setLoading(true);
      await SupabasePlatformRoleService.updateCustomer(customer.id, formData);
      toast({
        title: "Success",
        description: "Customer settings updated successfully"
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating customer:', error);
      toast({
        title: "Error",
        description: "Failed to update customer settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSettingsChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [field]: value
      }
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Customer Settings: {customer.name}
          </DialogTitle>
          <DialogDescription>
            Configure settings and preferences for this customer
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
              <CardDescription>
                Update customer name, domain, and subscription tier
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Customer Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter customer name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="domain">Domain</Label>
                  <Input
                    id="domain"
                    value={formData.domain}
                    onChange={(e) => handleInputChange('domain', e.target.value)}
                    placeholder="customer.example.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subscription">Subscription Tier</Label>
                <Select
                  value={formData.subscription_tier}
                  onValueChange={(value) => handleInputChange('subscription_tier', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Resource Limits */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resource Limits</CardTitle>
              <CardDescription>
                Configure usage limits and quotas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxUsers">Max Users</Label>
                  <Input
                    id="maxUsers"
                    type="number"
                    value={formData.settings.maxUsers}
                    onChange={(e) => handleSettingsChange('maxUsers', parseInt(e.target.value) || 0)}
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apiRateLimit">API Rate Limit (per hour)</Label>
                  <Input
                    id="apiRateLimit"
                    type="number"
                    value={formData.settings.apiRateLimit}
                    onChange={(e) => handleSettingsChange('apiRateLimit', parseInt(e.target.value) || 0)}
                    min="100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storageLimit">Storage Limit (MB)</Label>
                  <Input
                    id="storageLimit"
                    type="number"
                    value={formData.settings.storageLimit}
                    onChange={(e) => handleSettingsChange('storageLimit', parseInt(e.target.value) || 0)}
                    min="100"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feature Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Feature Settings</CardTitle>
              <CardDescription>
                Enable or disable features for this customer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enableNotifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Send email notifications for important events
                  </p>
                </div>
                <Switch
                  id="enableNotifications"
                  checked={formData.settings.enableNotifications}
                  onCheckedChange={(checked) => handleSettingsChange('enableNotifications', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enableAuditLogs">Audit Logging</Label>
                  <p className="text-sm text-muted-foreground">
                    Track user actions and system changes
                  </p>
                </div>
                <Switch
                  id="enableAuditLogs"
                  checked={formData.settings.enableAuditLogs}
                  onCheckedChange={(checked) => handleSettingsChange('enableAuditLogs', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Integration Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Integration Settings</CardTitle>
              <CardDescription>
                Configure external integrations and webhooks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customDomain">Custom Domain</Label>
                <Input
                  id="customDomain"
                  value={formData.settings.customDomain}
                  onChange={(e) => handleSettingsChange('customDomain', e.target.value)}
                  placeholder="app.customer.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="webhookUrl">Webhook URL</Label>
                <Input
                  id="webhookUrl"
                  type="url"
                  value={formData.settings.webhookUrl}
                  onChange={(e) => handleSettingsChange('webhookUrl', e.target.value)}
                  placeholder="https://customer.com/webhook"
                />
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notes</CardTitle>
              <CardDescription>
                Internal notes and comments about this customer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.settings.notes}
                onChange={(e) => handleSettingsChange('notes', e.target.value)}
                placeholder="Add internal notes about this customer..."
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-lg text-destructive flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                Irreversible actions that affect this customer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" disabled>
                Delete Customer
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Customer deletion is not yet implemented
              </p>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
