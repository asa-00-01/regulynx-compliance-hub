import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Cpu, 
  Activity, 
  Wifi, 
  AlertTriangle, 
  CheckCircle,
  RefreshCw,
  Zap
} from 'lucide-react';
import config from '@/config/environment';
import { analytics } from '@/services/analytics';

interface SystemHealth {
  performance: {
    score: number;
    status: 'good' | 'warning' | 'critical';
  };
  network: {
    status: 'online' | 'offline';
    connection: string;
    effectiveType?: string;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
    status: 'good' | 'warning' | 'critical';
  } | null;
  storage: {
    used: number;
    available: number;
    percentage: number;
    status: 'good' | 'warning' | 'critical';
  } | null;
}

interface SystemHealthMonitorProps {
  embedded?: boolean;
}

const SystemHealthMonitor: React.FC<SystemHealthMonitorProps> = ({ embedded = false }) => {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const checkSystemHealth = async () => {
    setIsRefreshing(true);
    
    try {
      const healthData: SystemHealth = {
        performance: await checkPerformance(),
        network: checkNetwork(),
        memory: checkMemory(),
        storage: await checkStorage(),
      };

      setHealth(healthData);
      
      // Log critical issues
      const issues = [];
      if (healthData.performance.status === 'critical') issues.push('Performance');
      if (healthData.network.status === 'offline') issues.push('Network');
      if (healthData.memory?.status === 'critical') issues.push('Memory');
      if (healthData.storage?.status === 'critical') issues.push('Storage');

      if (issues.length > 0 && config.features.enableAnalytics) {
        analytics.track('system_health_issues', {
          issues,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('System health check failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const checkPerformance = async (): Promise<SystemHealth['performance']> => {
    // Simple performance check based on timing
    const start = performance.now();
    await new Promise(resolve => setTimeout(resolve, 1));
    const duration = performance.now() - start;
    
    const score = Math.max(0, 100 - duration);
    return {
      score: Math.round(score),
      status: score > 80 ? 'good' : score > 50 ? 'warning' : 'critical'
    };
  };

  const checkNetwork = (): SystemHealth['network'] => {
    const connection = (navigator as any).connection;
    return {
      status: navigator.onLine ? 'online' : 'offline',
      connection: connection?.type || 'unknown',
      effectiveType: connection?.effectiveType,
    };
  };

  const checkMemory = (): SystemHealth['memory'] | null => {
    if (!('memory' in performance)) return null;
    
    const memInfo = (performance as any).memory;
    const used = memInfo.usedJSHeapSize;
    const total = memInfo.jsHeapSizeLimit;
    const percentage = (used / total) * 100;
    
    return {
      used: Math.round(used / 1024 / 1024), // MB
      total: Math.round(total / 1024 / 1024), // MB
      percentage: Math.round(percentage),
      status: percentage < 70 ? 'good' : percentage < 85 ? 'warning' : 'critical'
    };
  };

  const checkStorage = async (): Promise<SystemHealth['storage'] | null> => {
    if (!('storage' in navigator) || !('estimate' in (navigator as any).storage)) {
      return null;
    }
    
    try {
      const estimate = await (navigator as any).storage.estimate();
      const used = estimate.usage || 0;
      const quota = estimate.quota || 0;
      const percentage = quota > 0 ? (used / quota) * 100 : 0;
      
      return {
        used: Math.round(used / 1024 / 1024), // MB
        available: Math.round((quota - used) / 1024 / 1024), // MB
        percentage: Math.round(percentage),
        status: percentage < 70 ? 'good' : percentage < 85 ? 'warning' : 'critical'
      };
    } catch (error) {
      console.warn('Storage estimate not available:', error);
      return null;
    }
  };

  useEffect(() => {
    checkSystemHealth();
  }, []);

  const getStatusIcon = (status: 'good' | 'warning' | 'critical' | 'online' | 'offline') => {
    switch (status) {
      case 'good':
      case 'online':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical':
      case 'offline':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: 'good' | 'warning' | 'critical' | 'online' | 'offline') => {
    switch (status) {
      case 'good':
      case 'online':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
      case 'offline':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // If embedded, show the content directly
  if (embedded) {
    return (
      <Card className="w-full shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4" />
              System Health Monitor
            </CardTitle>
            <Button
              onClick={checkSystemHealth}
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {!health ? (
            <div className="text-center py-4 text-sm text-muted-foreground">
              Checking system health...
            </div>
          ) : (
            <>
              {/* Performance */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  <span className="text-sm">Performance</span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(health.performance.status)}
                  <Badge className={`text-xs ${getStatusColor(health.performance.status)}`}>
                    {health.performance.score}
                  </Badge>
                </div>
              </div>

              {/* Network */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wifi className="h-4 w-4" />
                  <span className="text-sm">Network</span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(health.network.status)}
                  <Badge className={`text-xs ${getStatusColor(health.network.status)}`}>
                    {health.network.status}
                  </Badge>
                </div>
              </div>

              {/* Memory */}
              {health.memory && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="h-4 w-4" />
                    <span className="text-sm">Memory</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(health.memory.status)}
                    <Badge className={`text-xs ${getStatusColor(health.memory.status)}`}>
                      {health.memory.percentage}%
                    </Badge>
                  </div>
                </div>
              )}

              {/* Storage */}
              {health.storage && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    <span className="text-sm">Storage</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(health.storage.status)}
                    <Badge className={`text-xs ${getStatusColor(health.storage.status)}`}>
                      {health.storage.percentage}%
                    </Badge>
                  </div>
                </div>
              )}

              {/* Warnings */}
              {health && (
                (health.performance.status === 'critical' || 
                 health.network.status === 'offline' ||
                 health.memory?.status === 'critical' ||
                 health.storage?.status === 'critical') && (
                  <Alert className="mt-3">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      Critical issues detected. Check browser console for details.
                    </AlertDescription>
                  </Alert>
                )
              )}
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  // Don't show floating version anymore
  return null;
};

export default SystemHealthMonitor;
