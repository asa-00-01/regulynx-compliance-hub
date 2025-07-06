
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Activity, AlertTriangle, Eye, Settings } from 'lucide-react';
import config from '@/config/environment';
import { analytics, AnalyticsEvent, ErrorReport, PerformanceMetric } from '@/services/analytics';

const AnalyticsContent: React.FC = () => {
  const [analyticsEvents, setAnalyticsEvents] = useState<AnalyticsEvent[]>([]);
  const [errorReports, setErrorReports] = useState<ErrorReport[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);

  useEffect(() => {
    const handleEvent = (event: AnalyticsEvent) => {
      setAnalyticsEvents((prev) => [event, ...prev].slice(0, 50));
    };
    const handleError = (report: ErrorReport) => {
      setErrorReports((prev) => [report, ...prev].slice(0, 50));
    };
    const handleMetric = (metric: PerformanceMetric) => {
      setPerformanceMetrics((prev) => [metric, ...prev].slice(0, 50));
    };

    analytics.addEventListener('event', handleEvent);
    analytics.addEventListener('error', handleError);
    analytics.addEventListener('metric', handleMetric);

    // Load existing data
    setAnalyticsEvents(analytics.getEvents().slice(0, 50));
    setErrorReports(analytics.getErrors().slice(0, 50));
    setPerformanceMetrics(analytics.getMetrics().slice(0, 50));

    return () => {
      analytics.removeEventListener('event', handleEvent);
      analytics.removeEventListener('error', handleError);
      analytics.removeEventListener('metric', handleMetric);
    };
  }, []);

  const getStatusColor = (enabled: boolean) => enabled ? 'bg-green-500' : 'bg-gray-400';

  return (
    <div className="space-y-6">
      {/* Configuration Status */}
      <div className="space-y-4">
        <h4 className="font-semibold">Configuration Status</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-3 border rounded">
            <span className="text-sm">Analytics</span>
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(config.features.enableAnalytics)}`} />
              <Badge variant={config.features.enableAnalytics ? "default" : "secondary"}>
                {config.features.enableAnalytics ? "Enabled" : "Disabled"}
              </Badge>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 border rounded">
            <span className="text-sm">Error Reporting</span>
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(config.features.enableErrorReporting)}`} />
              <Badge variant={config.features.enableErrorReporting ? "default" : "secondary"}>
                {config.features.enableErrorReporting ? "Enabled" : "Disabled"}
              </Badge>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 border rounded">
            <span className="text-sm">Performance Monitoring</span>
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(config.features.enablePerformanceMonitoring)}`} />
              <Badge variant={config.features.enablePerformanceMonitoring ? "default" : "secondary"}>
                {config.features.enablePerformanceMonitoring ? "Enabled" : "Disabled"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 border rounded text-center">
          <Eye className="h-8 w-8 mx-auto mb-2 text-blue-500" />
          <div className="text-xs text-muted-foreground">Events</div>
          <div className="text-2xl font-semibold">{analyticsEvents.length}</div>
        </div>
        <div className="p-4 border rounded text-center">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-500" />
          <div className="text-xs text-muted-foreground">Errors</div>
          <div className="text-2xl font-semibold">{errorReports.length}</div>
        </div>
        <div className="p-4 border rounded text-center">
          <Activity className="h-8 w-8 mx-auto mb-2 text-green-500" />
          <div className="text-xs text-muted-foreground">Metrics</div>
          <div className="text-2xl font-semibold">{performanceMetrics.length}</div>
        </div>
      </div>

      <Alert>
        <Settings className="h-4 w-4" />
        <AlertDescription className="text-sm">
          {config.isDevelopment 
            ? "Development mode - Analytics data is logged to console and stored locally." 
            : "Production mode - Analytics data is sent to configured services."
          }
        </AlertDescription>
      </Alert>

      {/* Recent Events */}
      <div className="space-y-4">
        <h4 className="font-semibold">Recent Activity</h4>
        <div className="max-h-96 overflow-y-auto space-y-2">
          {analyticsEvents.slice(0, 10).map((event, i) => (
            <div key={`evt-${i}`} className="p-3 border rounded bg-muted/30">
              <div className="flex items-center gap-2 mb-1">
                <Eye className="h-3 w-3 text-blue-500" />
                <span className="font-medium text-sm">{event.name}</span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </span>
              </div>
              {event.properties && (
                <pre className="text-xs text-muted-foreground bg-background p-2 rounded overflow-x-auto">
                  {JSON.stringify(event.properties, null, 2)}
                </pre>
              )}
            </div>
          ))}

          {errorReports.slice(0, 5).map((report, i) => (
            <div key={`err-${i}`} className="p-3 border rounded bg-red-50 dark:bg-red-950/20">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-3 w-3 text-red-500" />
                <span className="font-medium text-sm text-red-600 dark:text-red-400">Error</span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {new Date(report.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-sm mb-1">{report.error.message}</p>
              {report.context && (
                <pre className="text-xs text-muted-foreground bg-background p-2 rounded overflow-x-auto">
                  {JSON.stringify(report.context, null, 2)}
                </pre>
              )}
            </div>
          ))}

          {performanceMetrics.slice(0, 5).map((metric, i) => (
            <div key={`perf-${i}`} className="p-3 border rounded bg-green-50 dark:bg-green-950/20">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="h-3 w-3 text-green-500" />
                <span className="font-medium text-sm text-green-600 dark:text-green-400">{metric.name}</span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {new Date(metric.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-sm">{metric.value.toFixed(2)} {metric.unit}</p>
            </div>
          ))}

          {analyticsEvents.length === 0 && errorReports.length === 0 && performanceMetrics.length === 0 && (
            <div className="text-center text-muted-foreground p-8">
              No analytics data available yet. Start using the application to see events and metrics.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsContent;
