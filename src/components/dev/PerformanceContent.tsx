
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Activity, Zap, Clock, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import config from '@/config/environment';

interface PerformanceMetric {
  name: string;
  value: number;
  threshold: number;
  unit: string;
  status: 'good' | 'needs-improvement' | 'poor';
}

const PerformanceContent: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [isCollecting, setIsCollecting] = useState(false);

  const collectMetrics = async () => {
    setIsCollecting(true);
    const performanceMetrics: PerformanceMetric[] = [];

    try {
      // Collect Core Web Vitals
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          switch (entry.entryType) {
            case 'largest-contentful-paint':
              performanceMetrics.push({
                name: 'Largest Contentful Paint',
                value: entry.startTime,
                threshold: 2500,
                unit: 'ms',
                status: entry.startTime <= 2500 ? 'good' : entry.startTime <= 4000 ? 'needs-improvement' : 'poor'
              });
              break;
              
            case 'first-input':
              const fidEntry = entry as PerformanceEventTiming;
              const fid = fidEntry.processingStart - fidEntry.startTime;
              performanceMetrics.push({
                name: 'First Input Delay',
                value: fid,
                threshold: 100,
                unit: 'ms',
                status: fid <= 100 ? 'good' : fid <= 300 ? 'needs-improvement' : 'poor'
              });
              break;
          }
        }
      });

      try {
        observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input'] });
      } catch (error) {
        console.warn('Some performance metrics not supported');
      }

      // Add navigation timing metrics
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.fetchStart;
        performanceMetrics.push({
          name: 'DOM Content Loaded',
          value: domContentLoaded,
          threshold: 1500,
          unit: 'ms',
          status: domContentLoaded <= 1000 ? 'good' : domContentLoaded <= 1500 ? 'needs-improvement' : 'poor'
        });

        const pageLoad = navigation.loadEventEnd - navigation.fetchStart;
        performanceMetrics.push({
          name: 'Page Load Time',
          value: pageLoad,
          threshold: 3000,
          unit: 'ms',
          status: pageLoad <= 2000 ? 'good' : pageLoad <= 3000 ? 'needs-improvement' : 'poor'
        });
      }

      // Add memory metrics if available
      if ('memory' in performance) {
        const memInfo = (performance as any).memory;
        const memoryUsage = (memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit) * 100;
        
        performanceMetrics.push({
          name: 'Memory Usage',
          value: memoryUsage,
          threshold: 80,
          unit: '%',
          status: memoryUsage <= 60 ? 'good' : memoryUsage <= 80 ? 'needs-improvement' : 'poor'
        });
      }

      // Add resource metrics
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      const totalSize = resources.reduce((sum, resource) => sum + (resource.transferSize || 0), 0) / 1024; // KB
      
      performanceMetrics.push({
        name: 'Total Resource Size',
        value: totalSize,
        threshold: 1000,
        unit: 'KB',
        status: totalSize <= 500 ? 'good' : totalSize <= 1000 ? 'needs-improvement' : 'poor'
      });

      performanceMetrics.push({
        name: 'Resource Count',
        value: resources.length,
        threshold: 50,
        unit: 'resources',
        status: resources.length <= 30 ? 'good' : resources.length <= 50 ? 'needs-improvement' : 'poor'
      });

      // Wait a bit for metrics to collect
      setTimeout(() => {
        setMetrics(performanceMetrics);
        observer.disconnect();
        setIsCollecting(false);
      }, 2000);

    } catch (error) {
      console.error('Performance collection failed:', error);
      setIsCollecting(false);
    }
  };

  useEffect(() => {
    collectMetrics();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'needs-improvement':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'poor':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'needs-improvement':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'poor':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getProgressValue = (metric: PerformanceMetric) => {
    const percentage = (metric.value / metric.threshold) * 100;
    return Math.min(percentage, 100);
  };

  const overallScore = metrics.length > 0 
    ? Math.round(metrics.reduce((sum, metric) => {
        const score = metric.status === 'good' ? 100 : metric.status === 'needs-improvement' ? 70 : 30;
        return sum + score;
      }, 0) / metrics.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold">Performance Score</h4>
          <div className="flex items-center gap-4 mt-2">
            <div className={`text-3xl font-bold ${overallScore >= 80 ? 'text-green-600' : overallScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
              {overallScore}
            </div>
            <div className="flex-1">
              <Progress value={overallScore} className="h-2" />
              <p className="text-sm text-muted-foreground mt-1">
                {overallScore >= 80 ? 'Excellent' : overallScore >= 60 ? 'Good' : 'Needs Improvement'}
              </p>
            </div>
          </div>
        </div>
        <Button onClick={collectMetrics} disabled={isCollecting} size="sm">
          <RefreshCw className={`h-4 w-4 mr-2 ${isCollecting ? 'animate-spin' : ''}`} />
          {isCollecting ? 'Collecting...' : 'Refresh'}
        </Button>
      </div>

      <Alert>
        <Zap className="h-4 w-4" />
        <AlertDescription>
          Performance metrics are collected from the browser's Performance API. 
          Results may vary based on device capabilities and network conditions.
        </AlertDescription>
      </Alert>

      {/* Metrics Grid */}
      <div className="space-y-4">
        {metrics.length === 0 && !isCollecting ? (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No performance metrics available yet.</p>
            <p className="text-sm">Click refresh to collect metrics.</p>
          </div>
        ) : isCollecting ? (
          <div className="text-center py-8 text-muted-foreground">
            <RefreshCw className="h-12 w-12 mx-auto mb-4 animate-spin" />
            <p>Collecting performance metrics...</p>
          </div>
        ) : (
          metrics.map((metric, index) => (
            <div key={index} className="p-4 border rounded space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(metric.status)}
                  <div>
                    <h5 className="font-medium">{metric.name}</h5>
                    <p className="text-sm text-muted-foreground">
                      Target: ≤ {metric.threshold}{metric.unit}
                    </p>
                  </div>
                </div>
                <Badge className={getStatusColor(metric.status)}>
                  {metric.value.toFixed(1)}{metric.unit}
                </Badge>
              </div>
              <div>
                <Progress 
                  value={getProgressValue(metric)} 
                  className="h-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{metric.status.replace('-', ' ')}</span>
                  <span>{((metric.value / metric.threshold) * 100).toFixed(0)}% of threshold</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {config.isDevelopment && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            Development mode detected. Performance metrics may not reflect production performance.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default PerformanceContent;
