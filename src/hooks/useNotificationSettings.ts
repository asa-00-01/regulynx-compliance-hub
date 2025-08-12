
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export interface NotificationSettings {
  email: boolean;
  browser: boolean;
  weekly: boolean;
  newCase: boolean;
  riskAlerts: boolean;
}

export const useNotificationSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<NotificationSettings>({
    email: true,
    browser: true,
    weekly: false,
    newCase: true,
    riskAlerts: true,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Load settings from user preferences
  useEffect(() => {
    if (user?.preferences?.notifications) {
      setSettings(user.preferences.notifications);
    }
  }, [user]);

  const updateSetting = async (key: keyof NotificationSettings, value: boolean) => {
    if (!user) return;

    setIsLoading(true);
    try {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);

      // Update in Supabase
      const { error } = await supabase.auth.updateUser({
        data: {
          preferences: {
            ...user.preferences,
            notifications: newSettings
          }
        }
      });

      if (error) throw error;

      // Request browser permission for browser notifications
      if (key === 'browser' && value && 'Notification' in window) {
        if (Notification.permission === 'default') {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            toast.success('Browser notifications enabled');
          } else {
            toast.error('Browser notification permission denied');
            setSettings(prev => ({ ...prev, browser: false }));
          }
        } else if (Notification.permission === 'granted') {
          toast.success('Browser notifications enabled');
        }
      } else {
        toast.success(`${key} notifications ${value ? 'enabled' : 'disabled'}`);
      }
    } catch (error: any) {
      console.error('Failed to update notification setting:', error);
      toast.error('Failed to update notification settings');
      // Revert the change
      setSettings(prev => ({ ...prev, [key]: !value }));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    settings,
    updateSetting,
    isLoading
  };
};
