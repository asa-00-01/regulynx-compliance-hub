
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Activity, AlertTriangle, BarChart3, Eye, Settings } from 'lucide-react';
import config from '@/config/environment';
import { analytics, AnalyticsEvent, ErrorReport, PerformanceMetric } from '@/services/analytics';

const AnalyticsDashboard: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [analyticsEvents, setAnalyticsEvents] = useState<AnalyticsEvent[]>([]);
  const [errorReports, setErrorReports] = useState<ErrorReport[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);

  useEffect(() => {
    const handleEvent = (event: AnalyticsEvent) => {
      setAnalyticsEvents((prev) => [event, ...prev].slice(0, 100)); // Cap at 100 entries
    };
    const handleError = (report: ErrorReport) => {
      setErrorReports((prev) => [report, ...prev].slice(0, 100));
    };
    const handleMetric = (metric: PerformanceMetric) => {
      setPerformanceMetrics((prev) => [metric, ...prev].slice(0, 100));
    };

    analytics.addEventListener('event', handleEvent);
    analytics.addEventListener('error', handleError);
    analytics.addEventListener('metric', handleMetric);

    return () => {
      analytics.removeEventListener('event', handleEvent);
      analytics.removeEventListener('error', handleError);
      analytics.removeEventListener('metric', handleMetric);
    };
  }, []);

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
        className="fixed bottom-4 right-4 z-50"
        variant="outline"
        size="sm"
      >
        <BarChart3 className="h-4 w-4 mr-2" />
        Analytics
      </Button>

      {/* Dashboard Panel */}
      {isVisible && (
        <div className="fixed bottom-16 right-4 w-96 max-h-[32rem] overflow-auto bg-background border rounded-lg shadow-lg z-50 p-4 flex flex-col gap-4">
          <div className="flex justify-between items-center">
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

          {/* Event Logs */}
          <div className="flex-grow overflow-y-auto space-y-4 text-xs">
            <h4 className="font-semibold text-sm">Event Log</h4>
            
            {analyticsEvents.map((event, i) => (
              <div key={`evt-${i}`} className="p-2 border rounded bg-muted/50">
                <div className="flex items-center gap-2">
                  <Eye className="h-3 w-3 text-blue-500" />
                  <span className="font-semibold">{event.name}</span>
                  <span className="text-muted-foreground ml-auto">{new Date(event.properties?.timestamp).toLocaleTimeString()}</span>
                </div>
                <pre className="text-muted-foreground whitespace-pre-wrap break-all text-[10px] mt-1 p-1 bg-background rounded">
                  {JSON.stringify(event.properties, null, 2)}
                </pre>
              </div>
            ))}

            {errorReports.map((report, i) => (
              <div key={`err-${i}`} className="p-2 border rounded bg-red-500/10">
                 <div className="flex items-center gap-2">
                  <AlertTriangle className="h-3 w-3 text-red-500" />
                  <span className="font-semibold text-red-500">Error</span>
                  <span className="text-muted-foreground ml-auto">{new Date(report.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="mt-1">{report.error.message}</p>
                <pre className="text-muted-foreground whitespace-pre-wrap break-all text-[10px] mt-1 p-1 bg-background rounded">
                  {JSON.stringify(report.context, null, 2)}
                </pre>
              </div>
            ))}
            
            {performanceMetrics.map((metric, i) => (
              <div key={`perf-${i}`} className="p-2 border rounded bg-green-500/10">
                 <div className="flex items-center gap-2">
                  <Activity className="h-3 w-3 text-green-500" />
                  <span className="font-semibold text-green-500">{metric.name}</span>
                  <span className="text-muted-foreground ml-auto">{new Date(metric.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="mt-1">{metric.value.toFixed(2)} {metric.unit}</p>
              </div>
            ))}

            {analyticsEvents.length === 0 && errorReports.length === 0 && performanceMetrics.length === 0 && (
              <div className="text-center text-muted-foreground p-4">No events recorded yet.</div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AnalyticsDashboard;
