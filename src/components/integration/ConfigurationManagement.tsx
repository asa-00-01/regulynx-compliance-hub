
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Settings, 
  Database, 
  Shield, 
  Bell, 
  Code,
  Save,
  RotateCcw,
  History,
  Eye,
  EyeOff,
  Copy,
  Download,
  Upload
} from 'lucide-react';

const ConfigurationManagement = () => {
  const [showSecrets, setShowSecrets] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const configSections = {
    database: {
      host: process.env.VITE_DB_HOST || 'localhost',
      port: process.env.VITE_DB_PORT || '5432',
      database: process.env.VITE_DB_NAME || 'compliance_db',
      ssl_mode: process.env.VITE_DB_SSL_MODE || 'require',
      connection_pool_size: process.env.VITE_DB_POOL_SIZE || '20',
      query_timeout: process.env.VITE_DB_TIMEOUT || '30000'
    },
    security: {
      jwt_secret: process.env.VITE_JWT_SECRET ? '***************' : 'Not configured',
      encryption_key: process.env.VITE_ENCRYPTION_KEY ? '***************' : 'Not configured',
      api_rate_limit: process.env.VITE_API_RATE_LIMIT || '1000',
      session_timeout: process.env.VITE_SESSION_TIMEOUT || '3600',
      password_policy: process.env.VITE_PASSWORD_POLICY || 'strong',
      two_factor_enabled: process.env.VITE_2FA_ENABLED === 'true'
    },
    notifications: {
      email_enabled: process.env.VITE_EMAIL_ENABLED === 'true',
      slack_webhook: process.env.VITE_SLACK_WEBHOOK ? '***************' : 'Not configured',
      sms_enabled: process.env.VITE_SMS_ENABLED === 'true',
      alert_threshold: process.env.VITE_ALERT_THRESHOLD || '5',
      notification_frequency: process.env.VITE_NOTIFICATION_FREQUENCY || 'immediate'
    },
    api: {
      base_url: process.env.VITE_API_BASE_URL || 'https://api.compliance.com',
      version: process.env.VITE_API_VERSION || 'v2',
      timeout: process.env.VITE_API_TIMEOUT || '30000',
      retry_attempts: process.env.VITE_API_RETRY_ATTEMPTS || '3',
      cache_enabled: process.env.VITE_API_CACHE_ENABLED === 'true',
      debug_mode: process.env.VITE_DEBUG_MODE === 'true'
    }
  };

  const configHistory = [
    {
      id: '1',
      timestamp: '2024-01-20T10:30:00Z',
      user: 'John Doe',
      section: 'Security',
      changes: ['Updated JWT secret', 'Enabled 2FA'],
      version: 'v1.2.3'
    },
    {
      id: '2',
      timestamp: '2024-01-19T15:45:00Z',
      user: 'Jane Smith',
      changes: ['Increased rate limit', 'Updated database timeout'],
      section: 'API',
      version: 'v1.2.2'
    },
    {
      id: '3',
      timestamp: '2024-01-18T09:15:00Z',
      user: 'Mike Johnson',
      section: 'Notifications',
      changes: ['Added Slack integration', 'Updated alert thresholds'],
      version: 'v1.2.1'
    }
  ];

  const handleSave = () => {
    console.log('Saving configuration...');
    setHasUnsavedChanges(false);
  };

  const handleReset = () => {
    console.log('Resetting configuration...');
    setHasUnsavedChanges(false);
  };

  const handleExport = () => {
    console.log('Exporting configuration...');
  };

  const handleImport = () => {
    console.log('Importing configuration...');
  };

  const maskValue = (value: string) => {
    if (typeof value !== 'string') return value;
    return showSecrets ? value : '*'.repeat(Math.min(value.length, 15));
  };

  const copyToClipboard = (value: string) => {
    navigator.clipboard.writeText(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Configuration Management</h2>
          <p className="text-muted-foreground">
            Manage system configuration and environment variables
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleImport}>
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          {hasUnsavedChanges && (
            <>
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </>
          )}
        </div>
      </div>

      <Tabs defaultValue="database" className="space-y-4">
        <TabsList>
          <TabsTrigger value="database">
            <Database className="mr-2 h-4 w-4" />
            Database
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="mr-2 h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="api">
            <Code className="mr-2 h-4 w-4" />
            API
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="mr-2 h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Database Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="db-host">Host</Label>
                  <Input id="db-host" value={configSections.database.host} />
                </div>
                <div>
                  <Label htmlFor="db-port">Port</Label>
                  <Input id="db-port" value={configSections.database.port} />
                </div>
                <div>
                  <Label htmlFor="db-name">Database Name</Label>
                  <Input id="db-name" value={configSections.database.database} />
                </div>
                <div>
                  <Label htmlFor="ssl-mode">SSL Mode</Label>
                  <Input id="ssl-mode" value={configSections.database.ssl_mode} />
                </div>
                <div>
                  <Label htmlFor="pool-size">Connection Pool Size</Label>
                  <Input id="pool-size" value={configSections.database.connection_pool_size} />
                </div>
                <div>
                  <Label htmlFor="query-timeout">Query Timeout (ms)</Label>
                  <Input id="query-timeout" value={configSections.database.query_timeout} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Security Configuration</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSecrets(!showSecrets)}
                >
                  {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showSecrets ? 'Hide' : 'Show'} Secrets
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="jwt-secret">JWT Secret</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="jwt-secret" 
                      type={showSecrets ? 'text' : 'password'}
                      value={maskValue(configSections.security.jwt_secret)} 
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(configSections.security.jwt_secret)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="encryption-key">Encryption Key</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="encryption-key" 
                      type={showSecrets ? 'text' : 'password'}
                      value={maskValue(configSections.security.encryption_key)} 
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(configSections.security.encryption_key)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rate-limit">API Rate Limit</Label>
                    <Input id="rate-limit" value={configSections.security.api_rate_limit} />
                  </div>
                  <div>
                    <Label htmlFor="session-timeout">Session Timeout (s)</Label>
                    <Input id="session-timeout" value={configSections.security.session_timeout} />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="two-factor"
                    checked={configSections.security.two_factor_enabled}
                  />
                  <Label htmlFor="two-factor">Enable Two-Factor Authentication</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="email-enabled"
                    checked={configSections.notifications.email_enabled}
                  />
                  <Label htmlFor="email-enabled">Enable Email Notifications</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="sms-enabled"
                    checked={configSections.notifications.sms_enabled}
                  />
                  <Label htmlFor="sms-enabled">Enable SMS Notifications</Label>
                </div>
                <div>
                  <Label htmlFor="slack-webhook">Slack Webhook URL</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="slack-webhook" 
                      type={showSecrets ? 'text' : 'password'}
                      value={maskValue(configSections.notifications.slack_webhook)} 
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(configSections.notifications.slack_webhook)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="alert-threshold">Alert Threshold</Label>
                    <Input id="alert-threshold" value={configSections.notifications.alert_threshold} />
                  </div>
                  <div>
                    <Label htmlFor="notification-frequency">Notification Frequency</Label>
                    <Input id="notification-frequency" value={configSections.notifications.notification_frequency} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="base-url">Base URL</Label>
                  <Input id="base-url" value={configSections.api.base_url} />
                </div>
                <div>
                  <Label htmlFor="api-version">API Version</Label>
                  <Input id="api-version" value={configSections.api.version} />
                </div>
                <div>
                  <Label htmlFor="api-timeout">Timeout (ms)</Label>
                  <Input id="api-timeout" value={configSections.api.timeout} />
                </div>
                <div>
                  <Label htmlFor="retry-attempts">Retry Attempts</Label>
                  <Input id="retry-attempts" value={configSections.api.retry_attempts} />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="cache-enabled"
                    checked={configSections.api.cache_enabled}
                  />
                  <Label htmlFor="cache-enabled">Enable Caching</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="debug-mode"
                    checked={configSections.api.debug_mode}
                  />
                  <Label htmlFor="debug-mode">Debug Mode</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuration History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {configHistory.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{entry.version}</Badge>
                        <span className="font-medium">{entry.section}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {entry.changes.join(', ')}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{entry.user}</span>
                        <span>•</span>
                        <span>{new Date(entry.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <RotateCcw className="mr-1 h-3 w-3" />
                      Restore
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConfigurationManagement;
