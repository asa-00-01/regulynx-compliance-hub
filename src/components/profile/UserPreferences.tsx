
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const UserPreferences = () => {
  const [notifications, setNotifications] = useState({
    email: true,
    browser: true,
    weekly: false,
    newCase: true,
    riskAlerts: true,
  });
  const [theme, setTheme] = useState('system');
  const [language, setLanguage] = useState('en');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const savePreferences = () => {
    setIsSubmitting(true);
    
    // Mock API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success('Preferences saved successfully');
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Configure how you want to receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-notifications" className="font-medium">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive notifications via email</p>
              </div>
              <Switch 
                id="email-notifications" 
                checked={notifications.email}
                onCheckedChange={() => handleNotificationChange('email')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="browser-notifications" className="font-medium">Browser Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive push notifications in your browser</p>
              </div>
              <Switch 
                id="browser-notifications" 
                checked={notifications.browser}
                onCheckedChange={() => handleNotificationChange('browser')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="weekly-notifications" className="font-medium">Weekly Summary</Label>
                <p className="text-sm text-muted-foreground">Receive a weekly summary of compliance activities</p>
              </div>
              <Switch 
                id="weekly-notifications" 
                checked={notifications.weekly}
                onCheckedChange={() => handleNotificationChange('weekly')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="new-case" className="font-medium">New Case Alerts</Label>
                <p className="text-sm text-muted-foreground">Be notified when a new compliance case is created</p>
              </div>
              <Switch 
                id="new-case" 
                checked={notifications.newCase}
                onCheckedChange={() => handleNotificationChange('newCase')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="risk-alerts" className="font-medium">High Risk Alerts</Label>
                <p className="text-sm text-muted-foreground">Be notified of high-risk score changes</p>
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
          <CardTitle>Display Settings</CardTitle>
          <CardDescription>Customize how Regulynx appears to you</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger id="theme">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger id="language">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="sv">Swedish</SelectItem>
                  <SelectItem value="fi">Finnish</SelectItem>
                  <SelectItem value="no">Norwegian</SelectItem>
                  <SelectItem value="da">Danish</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={savePreferences} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Preferences'}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Export Data</CardTitle>
          <CardDescription>Download your personal data from the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            You can export all your personal data and activity history from the platform in various formats.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline">Export as CSV</Button>
            <Button variant="outline">Export as JSON</Button>
            <Button variant="outline">Export as PDF</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserPreferences;
