
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';
import { 
  Settings as SettingsIcon, 
  Shield, 
  Bell, 
  Database, 
  User, 
  Globe, 
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface SystemSettings {
  // General Settings
  companyName: string;
  timezone: string;
  dateFormat: string;
  language: string;
  
  // Compliance Settings
  autoEscalationEnabled: boolean;
  escalationThreshold: number;
  riskScoreThreshold: number;
  sarAutoGeneration: boolean;
  
  // Notification Settings
  emailNotifications: boolean;
  smsNotifications: boolean;
  notificationFrequency: 'immediate' | 'hourly' | 'daily';
  
  // Security Settings
  sessionTimeout: number;
  mfaRequired: boolean;
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
  };
  
  // Data Retention
  dataRetentionDays: number;
  auditLogRetention: number;
  autoArchiveEnabled: boolean;
}

const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SystemSettings>({
    companyName: 'Regulynx Compliance Hub',
    timezone: 'UTC',
    dateFormat: 'YYYY-MM-DD',
    language: 'en',
    autoEscalationEnabled: true,
    escalationThreshold: 75,
    riskScoreThreshold: 70,
    sarAutoGeneration: false,
    emailNotifications: true,
    smsNotifications: false,
    notificationFrequency: 'immediate',
    sessionTimeout: 30,
    mfaRequired: true,
    passwordPolicy: {
      minLength: 12,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
    },
    dataRetentionDays: 2555, // 7 years
    auditLogRetention: 3650, // 10 years
    autoArchiveEnabled: true,
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      // TODO: Load settings from API/database
      // For now, using default settings
      console.log('Loading system settings...');
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // TODO: Save settings to API/database
      console.log('Saving settings:', settings);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Success',
        description: 'Settings saved successfully',
      });
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSettingChange = (key: keyof SystemSettings, value: string | number | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handlePasswordPolicyChange = (key: keyof SystemSettings['passwordPolicy'], value: boolean | number) => {
    setSettings(prev => ({
      ...prev,
      passwordPolicy: { ...prev.passwordPolicy, [key]: value }
    }));
    setHasChanges(true);
  };

  const resetToDefaults = () => {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      loadSettings();
      setHasChanges(false);
      toast({
        title: 'Reset Complete',
        description: 'Settings have been reset to defaults',
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
          <p className="text-muted-foreground">
            Configure system-wide settings and preferences
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetToDefaults}>
            Reset to Defaults
          </Button>
          <Button 
            onClick={saveSettings} 
            disabled={!hasChanges || saving}
            className="min-w-[100px]"
          >
            {saving ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {hasChanges && (
        <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <span className="text-sm text-yellow-800">
            You have unsaved changes. Click "Save Changes" to apply them.
          </span>
        </div>
      )}

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="data">Data & Retention</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                General Settings
              </CardTitle>
              <CardDescription>
                Configure basic system settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={settings.companyName}
                    onChange={(e) => handleSettingChange('companyName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={settings.timezone} onValueChange={(value) => handleSettingChange('timezone', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="Europe/London">London</SelectItem>
                      <SelectItem value="Europe/Paris">Paris</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Select value={settings.dateFormat} onValueChange={(value) => handleSettingChange('dateFormat', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM-DD-YYYY">MM-DD-YYYY</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select value={settings.language} onValueChange={(value) => handleSettingChange('language', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="sv">Svenska</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Compliance Settings
              </CardTitle>
              <CardDescription>
                Configure compliance rules and automation settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto Escalation</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically escalate cases when risk threshold is exceeded
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoEscalationEnabled}
                    onCheckedChange={(checked) => handleSettingChange('autoEscalationEnabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SAR Auto Generation</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically generate SARs for high-risk activities
                    </p>
                  </div>
                  <Switch
                    checked={settings.sarAutoGeneration}
                    onCheckedChange={(checked) => handleSettingChange('sarAutoGeneration', checked)}
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="escalationThreshold">Escalation Threshold (%)</Label>
                  <Input
                    id="escalationThreshold"
                    type="number"
                    min="0"
                    max="100"
                    value={settings.escalationThreshold}
                    onChange={(e) => handleSettingChange('escalationThreshold', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="riskScoreThreshold">Risk Score Threshold</Label>
                  <Input
                    id="riskScoreThreshold"
                    type="number"
                    min="0"
                    max="100"
                    value={settings.riskScoreThreshold}
                    onChange={(e) => handleSettingChange('riskScoreThreshold', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Configure how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive urgent notifications via SMS
                    </p>
                  </div>
                  <Switch
                    checked={settings.smsNotifications}
                    onCheckedChange={(checked) => handleSettingChange('smsNotifications', checked)}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="notificationFrequency">Notification Frequency</Label>
                <Select 
                  value={settings.notificationFrequency} 
                  onValueChange={(value) => handleSettingChange('notificationFrequency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="hourly">Hourly Digest</SelectItem>
                    <SelectItem value="daily">Daily Digest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Configure security policies and authentication settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Multi-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Require MFA for all users
                    </p>
                  </div>
                  <Switch
                    checked={settings.mfaRequired}
                    onCheckedChange={(checked) => handleSettingChange('mfaRequired', checked)}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  min="5"
                  max="480"
                  value={settings.sessionTimeout}
                  onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <Label>Password Policy</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minLength">Minimum Length</Label>
                    <Input
                      id="minLength"
                      type="number"
                      min="8"
                      max="32"
                      value={settings.passwordPolicy.minLength}
                      onChange={(e) => handlePasswordPolicyChange('minLength', parseInt(e.target.value))}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={settings.passwordPolicy.requireUppercase}
                      onCheckedChange={(checked) => handlePasswordPolicyChange('requireUppercase', checked)}
                    />
                    <Label>Require Uppercase Letters</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={settings.passwordPolicy.requireLowercase}
                      onCheckedChange={(checked) => handlePasswordPolicyChange('requireLowercase', checked)}
                    />
                    <Label>Require Lowercase Letters</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={settings.passwordPolicy.requireNumbers}
                      onCheckedChange={(checked) => handlePasswordPolicyChange('requireNumbers', checked)}
                    />
                    <Label>Require Numbers</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={settings.passwordPolicy.requireSpecialChars}
                      onCheckedChange={(checked) => handlePasswordPolicyChange('requireSpecialChars', checked)}
                    />
                    <Label>Require Special Characters</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Data & Retention Settings
              </CardTitle>
              <CardDescription>
                Configure data retention policies and archival settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto Archive</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically archive old data
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoArchiveEnabled}
                    onCheckedChange={(checked) => handleSettingChange('autoArchiveEnabled', checked)}
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dataRetentionDays">Data Retention (days)</Label>
                  <Input
                    id="dataRetentionDays"
                    type="number"
                    min="365"
                    max="3650"
                    value={settings.dataRetentionDays}
                    onChange={(e) => handleSettingChange('dataRetentionDays', parseInt(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum 1 year, maximum 10 years
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="auditLogRetention">Audit Log Retention (days)</Label>
                  <Input
                    id="auditLogRetention"
                    type="number"
                    min="365"
                    max="3650"
                    value={settings.auditLogRetention}
                    onChange={(e) => handleSettingChange('auditLogRetention', parseInt(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum 1 year, maximum 10 years
                  </p>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-blue-900">Compliance Notice</p>
                    <p className="text-sm text-blue-800">
                      Data retention settings are configured to meet regulatory requirements. 
                      Changes may affect compliance status.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
