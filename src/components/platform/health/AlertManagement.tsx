
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  Bell, 
  Clock,
  CheckCircle,
  X,
  User
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface SystemAlert {
  id: string;
  rule: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  resolved: boolean;
  acknowledgedBy?: string;
}

interface AlertManagementProps {
  alerts: SystemAlert[];
  onAcknowledgeAlert: (alertId: string) => void;
  onResolveAlert: (alertId: string) => void;
}

const AlertManagement: React.FC<AlertManagementProps> = ({
  alerts,
  onAcknowledgeAlert,
  onResolveAlert
}) => {
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

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Bell className="h-4 w-4 text-blue-500" />;
    }
  };

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Alert Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No active alerts</p>
            <p className="text-sm">Your system is running smoothly.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Alert Management ({alerts.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.map((alert) => (
          <Alert key={alert.id} className="border-l-4 border-l-red-500">
            <div className="flex items-start gap-3">
              {getSeverityIcon(alert.severity)}
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <Badge className={getSeverityColor(alert.severity)}>
                    {alert.severity.toUpperCase()}
                  </Badge>
                  <div className="flex gap-2">
                    {!alert.acknowledgedBy && (
                      <Button
                        onClick={() => onAcknowledgeAlert(alert.id)}
                        size="sm"
                        variant="outline"
                      >
                        <User className="h-3 w-3 mr-1" />
                        Acknowledge
                      </Button>
                    )}
                    <Button
                      onClick={() => onResolveAlert(alert.id)}
                      size="sm"
                      variant="outline"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Resolve
                    </Button>
                  </div>
                </div>
                
                <AlertDescription className="text-sm">
                  {alert.message}
                </AlertDescription>
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(alert.timestamp)} ago
                  </div>
                  {alert.acknowledgedBy && (
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      Acknowledged
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Alert>
        ))}
      </CardContent>
    </Card>
  );
};

export default AlertManagement;
