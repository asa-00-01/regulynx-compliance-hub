
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  Clock 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface SystemHealthCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'down';
  responseTime: number;
  lastCheck: Date;
  error?: string;
}

interface SystemMetricsCardProps {
  healthCheck: SystemHealthCheck;
}

const SystemMetricsCard: React.FC<SystemMetricsCardProps> = ({ healthCheck }) => {
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

  const getResponseTimeStatus = (responseTime: number) => {
    if (responseTime < 200) return 'excellent';
    if (responseTime < 500) return 'good';
    if (responseTime < 1000) return 'fair';
    return 'poor';
  };

  const responseTimeStatus = getResponseTimeStatus(healthCheck.responseTime);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium capitalize">
            {healthCheck.service.replace('_', ' ')}
          </CardTitle>
          <Badge className={`${getStatusColor(healthCheck.status)} flex items-center gap-1`}>
            {getStatusIcon(healthCheck.status)}
            {healthCheck.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Response Time */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Response Time</span>
            <span className={`font-medium ${
              responseTimeStatus === 'excellent' ? 'text-green-600' :
              responseTimeStatus === 'good' ? 'text-blue-600' :
              responseTimeStatus === 'fair' ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {healthCheck.responseTime.toFixed(2)}ms
            </span>
          </div>
          <Progress 
            value={Math.min((healthCheck.responseTime / 1000) * 100, 100)} 
            className="h-2"
          />
        </div>

        {/* Last Check */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Last check: {formatDistanceToNow(healthCheck.lastCheck)} ago</span>
        </div>

        {/* Error Message */}
        {healthCheck.error && (
          <div className="text-xs text-red-600 bg-red-50 p-2 rounded border">
            Error: {healthCheck.error}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SystemMetricsCard;
