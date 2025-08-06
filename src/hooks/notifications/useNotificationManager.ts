
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export interface NotificationConfig {
  email: boolean;
  push: boolean;
  sms: boolean;
  inApp: boolean;
}

export interface NotificationPreferences {
  documentUpdates: NotificationConfig;
  caseUpdates: NotificationConfig;
  systemAlerts: NotificationConfig;
  billing: NotificationConfig;
  security: NotificationConfig;
}

const defaultPreferences: NotificationPreferences = {
  documentUpdates: { email: true, push: true, sms: false, inApp: true },
  caseUpdates: { email: true, push: true, sms: false, inApp: true },
  systemAlerts: { email: true, push: true, sms: true, inApp: true },
  billing: { email: true, push: false, sms: false, inApp: true },
  security: { email: true, push: true, sms: true, inApp: true },
};

export const useNotificationManager = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(false);

  const updatePreference = useCallback(async (
    category: keyof NotificationPreferences,
    channel: keyof NotificationConfig,
    enabled: boolean
  ) => {
    setLoading(true);
    try {
      setPreferences(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          [channel]: enabled
        }
      }));
      
      // In a real app, this would save to backend
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast.success(`${category} ${channel} notifications ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      toast.error('Failed to update notification preferences');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCategoryPreferences = useCallback(async (
    category: keyof NotificationPreferences,
    config: NotificationConfig
  ) => {
    setLoading(true);
    try {
      setPreferences(prev => ({
        ...prev,
        [category]: config
      }));
      
      // In a real app, this would save to backend
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast.success(`${category} notification preferences updated`);
    } catch (error) {
      toast.error('Failed to update notification preferences');
    } finally {
      setLoading(false);
    }
  }, []);

  const resetToDefaults = useCallback(async () => {
    setLoading(true);
    try {
      setPreferences(defaultPreferences);
      
      // In a real app, this would save to backend
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast.success('Notification preferences reset to defaults');
    } catch (error) {
      toast.error('Failed to reset notification preferences');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    preferences,
    loading,
    updatePreference,
    updateCategoryPreferences,
    resetToDefaults
  };
};
