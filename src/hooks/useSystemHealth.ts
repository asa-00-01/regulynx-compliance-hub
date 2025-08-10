
import { useState, useEffect } from 'react';
import { systemMonitor } from '@/services/systemMonitor';

interface SystemHealthData {
  status: 'healthy' | 'degraded' | 'down';
  healthChecks: any[];
  alerts: any[];
  lastUpdate: Date;
}

export const useSystemHealth = (refreshInterval: number = 60000) => {
  const [healthData, setHealthData] = useState<SystemHealthData>({
    status: 'healthy',
    healthChecks: [],
    alerts: [],
    lastUpdate: new Date()
  });
  const [isLoading, setIsLoading] = useState(true);

  const refreshHealthData = async () => {
    try {
      const checks = await systemMonitor.runAllHealthChecks();
      const status = systemMonitor.getSystemStatus();
      const alerts = systemMonitor.getActiveAlerts();

      setHealthData({
        status: status.status,
        healthChecks: Array.from(checks.values()),
        alerts,
        lastUpdate: new Date()
      });
    } catch (error) {
      console.error('Failed to refresh health data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial load
    refreshHealthData();

    // Set up interval
    const interval = setInterval(refreshHealthData, refreshInterval);
    
    return () => clearInterval(interval);
  }, [refreshInterval]);

  return {
    ...healthData,
    isLoading,
    refresh: refreshHealthData
  };
};
