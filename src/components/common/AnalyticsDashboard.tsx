
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Activity, AlertTriangle, BarChart3, Eye, Settings } from 'lucide-react';
import config from '@/config/environment';

const AnalyticsDashboard: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [analyticsEvents, setAnalyticsEvents] = useState<any[]>([]);
  const [errorReports, setErrorReports] = useState<any[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<any[]>([]);

  // Only show in development mode
  if (!config.isDevelopment) {
    return null;
  }

  const getStatusColor = (enabled: boolean) => enabled ? 'bg-green-500' : 'bg-gray-400';

  return (
    <>
      {/* Toggle Button */}
      <Button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 left-4 z-50"
        variant="outline"
        size="sm"
      >
        <BarChart3 className="h-4 w-4 mr-2" />
        Analytics
      </Button>

      {/* Dashboard Panel */}
      {isVisible && (
        <div className="fixed bottom-16 left-4 w-96 max-h-96 overflow-auto bg-background border rounded-lg shadow-lg z-50 p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Analytics Dashboard</h3>
            <Button
              onClick={() => setIsVisible(false)}
              variant="ghost"
              size="sm"
            >
              ×
            </Button>
          </div>

          {/* Configuration Status */}
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center">
                <Settings className="h-4 w-4 mr-2" />
                Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Analytics</span>
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(config.features.enableAnalytics)}`} />
                  <Badge variant={config.features.enableAnalytics ? "default" : "secondary"}>
                    {config.features.enableAnalytics ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Error Reporting</span>
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(config.features.enableErrorReporting)}`} />
                  <Badge variant={config.features.enableErrorReporting ? "default" : "secondary"}>
                    {config.features.enableErrorReporting ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Performance Monitoring</span>
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(config.features.enablePerformanceMonitoring)}`} />
                  <Badge variant={config.features.enablePerformanceMonitoring ? "default" : "secondary"}>
                    {config.features.enablePerformanceMonitoring ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <Card className="p-2">
              <div className="text-center">
                <Eye className="h-4 w-4 mx-auto mb-1 text-blue-500" />
                <div className="text-xs text-muted-foreground">Events</div>
                <div className="text-lg font-semibold">{analyticsEvents.length}</div>
              </div>
            </Card>
            <Card className="p-2">
              <div className="text-center">
                <AlertTriangle className="h-4 w-4 mx-auto mb-1 text-red-500" />
                <div className="text-xs text-muted-foreground">Errors</div>
                <div className="text-lg font-semibold">{errorReports.length}</div>
              </div>
            </Card>
            <Card className="p-2">
              <div className="text-center">
                <Activity className="h-4 w-4 mx-auto mb-1 text-green-500" />
                <div className="text-xs text-muted-foreground">Metrics</div>
                <div className="text-lg font-semibold">{performanceMetrics.length}</div>
              </div>
            </Card>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Development mode - Analytics data is logged to console. 
              In production, data will be sent to configured services.
            </AlertDescription>
          </Alert>
        </div>
      )}
    </>
  );
};

export default AnalyticsDashboard;
