
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface HealthOverviewProps {
  systemStatus: 'healthy' | 'degraded' | 'down';
  activeAlerts: number;
  avgResponseTime: number;
  uptime: number;
  lastUpdate: Date;
}

const HealthOverview: React.FC<HealthOverviewProps> = ({
  systemStatus,
  activeAlerts,
  avgResponseTime,
  uptime,
  lastUpdate
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'down':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600';
      case 'degraded':
        return 'text-yellow-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getResponseTimeStatus = (responseTime: number) => {
    if (responseTime < 200) return { status: 'excellent', color: 'text-green-600' };
    if (responseTime < 500) return { status: 'good', color: 'text-blue-600' };
    if (responseTime < 1000) return { status: 'fair', color: 'text-yellow-600' };
    return { status: 'poor', color: 'text-red-600' };
  };

  const responseTimeStatus = getResponseTimeStatus(avgResponseTime);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* System Status */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">System Status</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-2">
            {getStatusIcon(systemStatus)}
            <div className={`text-2xl font-bold ${getStatusColor(systemStatus)}`}>
              {systemStatus.charAt(0).toUpperCase() + systemStatus.slice(1)}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        </CardContent>
      </Card>

      {/* Active Alerts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold mb-2">
            {activeAlerts}
          </div>
          <p className="text-xs text-muted-foreground">
            {activeAlerts === 0 ? 'No active alerts' : `${activeAlerts} alert${activeAlerts > 1 ? 's' : ''} requiring attention`}
          </p>
        </CardContent>
      </Card>

      {/* Average Response Time */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-2">
            <div className={`text-2xl font-bold ${responseTimeStatus.color}`}>
              {avgResponseTime.toFixed(0)}ms
            </div>
            {avgResponseTime < 300 ? (
              <TrendingDown className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingUp className="h-4 w-4 text-red-500" />
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {responseTimeStatus.status} performance
          </p>
        </CardContent>
      </Card>

      {/* System Uptime */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600 mb-2">
            {uptime.toFixed(1)}%
          </div>
          <div className="space-y-1">
            <Progress value={uptime} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthOverview;
