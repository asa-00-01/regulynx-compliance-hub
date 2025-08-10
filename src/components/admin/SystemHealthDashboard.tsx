
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  RefreshCw,
  Bell,
  X
} from 'lucide-react';
import { systemMonitor } from '@/services/systemMonitor';
import { useAuth } from '@/context/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface SystemHealthCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'down';
  responseTime: number;
  lastCheck: Date;
  error?: string;
}

interface SystemAlert {
  id: string;
  rule: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  resolved: boolean;
  acknowledgedBy?: string;
}

const SystemHealthDashboard: React.FC = () => {
  const { user } = useAuth();
  const [healthChecks, setHealthChecks] = useState<SystemHealthCheck[]>([]);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [systemStatus, setSystemStatus] = useState<'healthy' | 'degraded' | 'down'>('healthy');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    refreshData();
    
    // Set up periodic refresh
    const interval = setInterval(refreshData, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      const checks = await systemMonitor.runAllHealthChecks();
      const status = systemMonitor.getSystemStatus();
      const activeAlerts = systemMonitor.getActiveAlerts();
      
      setHealthChecks(Array.from(checks.values()));
      setSystemStatus(status.status);
      setAlerts(activeAlerts);
    } catch (error) {
      console.error('Failed to refresh system data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    if (user?.id) {
      const success = systemMonitor.acknowledgeAlert(alertId, user.id);
      if (success) {
        setAlerts(prev => prev.map(alert => 
          alert.id === alertId 
            ? { ...alert, acknowledgedBy: user.id }
            : alert
        ));
      }
    }
  };

  const handleResolveAlert = (alertId: string) => {
    const success = systemMonitor.resolveAlert(alertId);
    if (success) {
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'down':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800';
      case 'down':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'bg-blue-100 text-blue-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* System Overview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(systemStatus)}
              System Health Dashboard
            </CardTitle>
            <CardDescription>
              Monitor system health and manage alerts
            </CardDescription>
          </div>
          <Button
            onClick={refreshData}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Badge className={`${getStatusColor(systemStatus)} flex items-center gap-1`}>
              {getStatusIcon(systemStatus)}
              {systemStatus.toUpperCase()}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Last updated: {formatDistanceToNow(new Date())} ago
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Active Alerts ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {alerts.map((alert) => (
              <Alert key={alert.id} className="border-l-4 border-l-red-500">
                <AlertTriangle className="h-4 w-4" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={getSeverityColor(alert.severity)}>
                      {alert.severity.toUpperCase()}
                    </Badge>
                    <div className="flex gap-2">
                      {!alert.acknowledgedBy && (
                        <Button
                          onClick={() => handleAcknowledgeAlert(alert.id)}
                          size="sm"
                          variant="outline"
                        >
                          Acknowledge
                        </Button>
                      )}
                      <Button
                        onClick={() => handleResolveAlert(alert.id)}
                        size="sm"
                        variant="outline"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Resolve
                      </Button>
                    </div>
                  </div>
                  <AlertDescription className="mb-2">
                    {alert.message}
                  </AlertDescription>
                  <div className="text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 inline mr-1" />
                    {formatDistanceToNow(alert.timestamp)} ago
                    {alert.acknowledgedBy && (
                      <span className="ml-2">• Acknowledged</span>
                    )}
                  </div>
                </div>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Service Health */}
      <Card>
        <CardHeader>
          <CardTitle>Service Health</CardTitle>
          <CardDescription>
            Current status of all system services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {healthChecks.map((check) => (
              <Card key={check.service} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium capitalize">
                    {check.service.replace('_', ' ')}
                  </h4>
                  <Badge className={`${getStatusColor(check.status)} flex items-center gap-1`}>
                    {getStatusIcon(check.status)}
                    {check.status}
                  </Badge>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div>Response: {check.responseTime.toFixed(2)}ms</div>
                  <div>
                    Last check: {formatDistanceToNow(check.lastCheck)} ago
                  </div>
                  {check.error && (
                    <div className="text-red-600 text-xs mt-2">
                      Error: {check.error}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemHealthDashboard;
