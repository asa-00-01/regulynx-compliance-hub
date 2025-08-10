
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { useSystemHealth } from '@/hooks/useSystemHealth';
import { Link } from 'react-router-dom';

const SystemHealthWidget: React.FC = () => {
  const { status, alerts, isLoading } = useSystemHealth(30000); // Check every 30 seconds

  const getStatusIcon = () => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="h-3 w-3 text-yellow-500" />;
      case 'down':
        return <AlertTriangle className="h-3 w-3 text-red-500" />;
      default:
        return <Activity className="h-3 w-3 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
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

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Activity className="h-3 w-3 animate-pulse" />
        Checking system health...
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Badge className={`${getStatusColor()} flex items-center gap-1 text-xs`}>
        {getStatusIcon()}
        System: {status}
      </Badge>
      
      {alerts.length > 0 && (
        <Badge variant="destructive" className="text-xs">
          {alerts.length} alert{alerts.length !== 1 ? 's' : ''}
        </Badge>
      )}
      
      <Button asChild variant="ghost" size="sm" className="h-6 px-2">
        <Link to="/admin/system-health">
          <ExternalLink className="h-3 w-3" />
        </Link>
      </Button>
    </div>
  );
};

export default SystemHealthWidget;
