
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useSystemHealth } from '@/hooks/useSystemHealth';
import { useAuth } from '@/context/AuthContext';
import HealthOverview from './health/HealthOverview';
import SystemMetricsCard from './health/SystemMetricsCard';
import AlertManagement from './health/AlertManagement';
import PerformanceMetrics from './health/PerformanceMetrics';
import { systemMonitor } from '@/services/systemMonitor';

const PlatformSystemHealth: React.FC = () => {
  const { user } = useAuth();
  const { status, healthChecks, alerts, isLoading, refresh } = useSystemHealth(30000);
  const [selectedMetric, setSelectedMetric] = useState('response_time');
  const [timeRange, setTimeRange] = useState('1h');

  // Mock performance data - in real implementation, this would come from your monitoring system
  const [performanceData] = useState([
    { time: '00:00', response_time: 120, throughput: 450, error_rate: 0.5, cpu_usage: 45, memory_usage: 60 },
    { time: '00:15', response_time: 115, throughput: 480, error_rate: 0.3, cpu_usage: 42, memory_usage: 58 },
    { time: '00:30', response_time: 140, throughput: 420, error_rate: 0.8, cpu_usage: 48, memory_usage: 62 },
    { time: '00:45', response_time: 110, throughput: 520, error_rate: 0.2, cpu_usage: 40, memory_usage: 55 },
    { time: '01:00', response_time: 125, throughput: 490, error_rate: 0.4, cpu_usage: 44, memory_usage: 59 },
  ]);

  const handleAcknowledgeAlert = (alertId: string) => {
    if (user?.id) {
      systemMonitor.acknowledgeAlert(alertId, user.id);
      refresh();
    }
  };

  const handleResolveAlert = (alertId: string) => {
    systemMonitor.resolveAlert(alertId);
    refresh();
  };

  const avgResponseTime = healthChecks.length > 0 
    ? healthChecks.reduce((sum, check) => sum + check.responseTime, 0) / healthChecks.length
    : 0;

  const uptime = 99.9; // This would be calculated from actual uptime data

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Health Monitor</h1>
          <p className="text-muted-foreground">
            Monitor platform infrastructure and service health in real-time
          </p>
        </div>
        <Button
          onClick={refresh}
          disabled={isLoading}
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* System Overview */}
      <HealthOverview
        systemStatus={status}
        activeAlerts={alerts.length}
        avgResponseTime={avgResponseTime}
        uptime={uptime}
        lastUpdate={new Date()}
      />

      {/* Performance Metrics Chart */}
      <PerformanceMetrics
        data={performanceData}
        selectedMetric={selectedMetric}
        onMetricChange={setSelectedMetric}
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
      />

      {/* Service Health Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Service Health Details</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {healthChecks.map((check) => (
            <SystemMetricsCard key={check.service} healthCheck={check} />
          ))}
        </div>
      </div>

      {/* Alert Management */}
      <AlertManagement
        alerts={alerts}
        onAcknowledgeAlert={handleAcknowledgeAlert}
        onResolveAlert={handleResolveAlert}
      />
    </div>
  );
};

export default PlatformSystemHealth;
