
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useNotificationManager, NotificationPreferences, NotificationConfig } from '@/hooks/notifications/useNotificationManager';

const NotificationPreferencesCard = () => {
  const { preferences, loading, updatePreference, resetToDefaults } = useNotificationManager();

  const renderNotificationCategory = (
    title: string,
    category: keyof NotificationPreferences,
    config: NotificationConfig
  ) => (
    <div className="space-y-3">
      <h4 className="font-medium text-sm">{title}</h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex items-center space-x-2">
          <Switch
            id={`${category}-email`}
            checked={config.email}
            onCheckedChange={(checked) => updatePreference(category, 'email', checked)}
            disabled={loading}
          />
          <Label htmlFor={`${category}-email`} className="text-sm">Email</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id={`${category}-push`}
            checked={config.push}
            onCheckedChange={(checked) => updatePreference(category, 'push', checked)}
            disabled={loading}
          />
          <Label htmlFor={`${category}-push`} className="text-sm">Push</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id={`${category}-sms`}
            checked={config.sms}
            onCheckedChange={(checked) => updatePreference(category, 'sms', checked)}
            disabled={loading}
          />
          <Label htmlFor={`${category}-sms`} className="text-sm">SMS</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id={`${category}-inapp`}
            checked={config.inApp}
            onCheckedChange={(checked) => updatePreference(category, 'inApp', checked)}
            disabled={loading}
          />
          <Label htmlFor={`${category}-inapp`} className="text-sm">In-App</Label>
        </div>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Notification Preferences</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={resetToDefaults}
            disabled={loading}
          >
            Reset to Defaults
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {renderNotificationCategory('Document Updates', 'documentUpdates', preferences.documentUpdates)}
        {renderNotificationCategory('Case Updates', 'caseUpdates', preferences.caseUpdates)}
        {renderNotificationCategory('System Alerts', 'systemAlerts', preferences.systemAlerts)}
        {renderNotificationCategory('Billing', 'billing', preferences.billing)}
        {renderNotificationCategory('Security', 'security', preferences.security)}
      </CardContent>
    </Card>
  );
};

export default NotificationPreferencesCard;
