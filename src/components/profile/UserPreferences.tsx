
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useAuth } from '@/context/auth/AuthContext';
import { useTheme } from 'next-themes';
import { StandardUser } from '@/types/user';

interface UserPreferencesProps {
  user: StandardUser | null;
}

const UserPreferences = ({ user }: UserPreferencesProps) => {
  const { t, i18n } = useTranslation();
  const { updateUserProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  
  const [notifications, setNotifications] = useState({
    email: true,
    browser: true,
    weekly: false,
    newCase: true,
    riskAlerts: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.user_metadata) {
      if (user.user_metadata.preferences?.notifications) {
        setNotifications(user.user_metadata.preferences.notifications);
      }
      if (user.user_metadata.preferences?.theme) {
        setTheme(user.user_metadata.preferences.theme);
      }
      if (user.user_metadata.preferences?.language) {
        i18n.changeLanguage(user.user_metadata.preferences.language);
      }
    }
  }, [user, setTheme, i18n]);

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLanguageChange = (value: string) => {
    i18n.changeLanguage(value);
  };

  const savePreferences = async () => {
    setIsSubmitting(true);
    try {
      await updateUserProfile({
        preferences: {
          notifications,
          theme: theme || 'system',
          language: i18n.language,
        },
      });
    } catch (error) {
      // toast is handled in context/update function
    } finally {
      setIsSubmitting(false);
    }
  };

  const exportDataAsJson = () => {
    if (!user) return;
    const dataStr = JSON.stringify(user, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'user_profile_data.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    toast.success('User data exported as JSON.');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('profile.notifications')}</CardTitle>
          <CardDescription>{t('profile.notificationsDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-notifications" className="font-medium">{t('profile.emailNotifications')}</Label>
                <p className="text-sm text-muted-foreground">{t('profile.emailNotificationsDesc')}</p>
              </div>
              <Switch 
                id="email-notifications" 
                checked={notifications.email}
                onCheckedChange={() => handleNotificationChange('email')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="browser-notifications" className="font-medium">{t('profile.browserNotifications')}</Label>
                <p className="text-sm text-muted-foreground">{t('profile.browserNotificationsDesc')}</p>
              </div>
              <Switch 
                id="browser-notifications" 
                checked={notifications.browser}
                onCheckedChange={() => handleNotificationChange('browser')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="weekly-notifications" className="font-medium">{t('profile.weeklySummary')}</Label>
                <p className="text-sm text-muted-foreground">{t('profile.weeklySummaryDesc')}</p>
              </div>
              <Switch 
                id="weekly-notifications" 
                checked={notifications.weekly}
                onCheckedChange={() => handleNotificationChange('weekly')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="new-case" className="font-medium">{t('profile.newCaseAlerts')}</Label>
                <p className="text-sm text-muted-foreground">{t('profile.newCaseAlertsDesc')}</p>
              </div>
              <Switch 
                id="new-case" 
                checked={notifications.newCase}
                onCheckedChange={() => handleNotificationChange('newCase')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="risk-alerts" className="font-medium">{t('profile.highRiskAlerts')}</Label>
                <p className="text-sm text-muted-foreground">{t('profile.highRiskAlertsDesc')}</p>
              </div>
              <Switch 
                id="risk-alerts" 
                checked={notifications.riskAlerts}
                onCheckedChange={() => handleNotificationChange('riskAlerts')}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('profile.displaySettings')}</CardTitle>
          <CardDescription>{t('profile.displaySettingsDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="theme">{t('profile.theme')}</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger id="theme">
                  <SelectValue placeholder={t('common.selectTheme')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">{t('profile.light')}</SelectItem>
                  <SelectItem value="dark">{t('profile.dark')}</SelectItem>
                  <SelectItem value="system">{t('profile.system')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="language">{t('profile.language')}</Label>
              <Select value={i18n.language} onValueChange={handleLanguageChange}>
                <SelectTrigger id="language">
                  <SelectValue placeholder={t('common.selectLanguage')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="sv">Svenska</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={savePreferences} disabled={isSubmitting}>
            {isSubmitting ? t('profile.saving') : t('profile.savePreferences')}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('profile.exportData')}</CardTitle>
          <CardDescription>{t('profile.exportDataDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            {t('profile.exportDesc')}
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={exportDataAsJson}>{t('profile.exportJson')}</Button>
            <Button variant="outline" disabled>{t('profile.exportCsv')}</Button>
            <Button variant="outline" disabled>{t('profile.exportPdf')}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserPreferences;
