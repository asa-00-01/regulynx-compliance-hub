
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Activity, Zap, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import config from '@/config/environment';

interface PerformanceMetric {
  name: string;
  value: number;
  threshold: number;
  unit: string;
  status: 'good' | 'needs-improvement' | 'poor';
}

const PerformanceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development or when debug mode is enabled
    if (config.isDevelopment || config.features.enableDebugMode) {
      collectMetrics();
    }
  }, []);

  const collectMetrics = () => {
    const performanceMetrics: PerformanceMetric[] = [];

    // Collect Core Web Vitals
    try {
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
        setMetrics([...performanceMetrics]);
      });

      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input'] });
    } catch (error) {
      console.warn('Performance metrics collection not supported');
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

    // Add bundle size estimation
    const scripts = document.querySelectorAll('script[src]');
    let totalSize = 0;
    scripts.forEach(script => {
      // Estimate based on script count (rough approximation)
      totalSize += 100; // KB per script estimate
    });

    performanceMetrics.push({
      name: 'Estimated Bundle Size',
      value: totalSize,
      threshold: 1000,
      unit: 'KB',
      status: totalSize <= 500 ? 'good' : totalSize <= 1000 ? 'needs-improvement' : 'poor'
    });

    setMetrics(performanceMetrics);
  };

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
        return 'bg-green-100 text-green-800';
      case 'needs-improvement':
        return 'bg-yellow-100 text-yellow-800';
      case 'poor':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressValue = (metric: PerformanceMetric) => {
    const percentage = (metric.value / metric.threshold) * 100;
    return Math.min(percentage, 100);
  };

  // Only render in development or debug mode
  if (!config.isDevelopment && !config.features.enableDebugMode) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isVisible ? (
        <Button
          onClick={() => setIsVisible(true)}
          size="sm"
          variant="outline"
          className="shadow-lg"
        >
          <Zap className="h-4 w-4 mr-2" />
          Performance
        </Button>
      ) : (
        <Card className="w-80 shadow-lg">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Performance Metrics
              </CardTitle>
              <Button
                onClick={() => setIsVisible(false)}
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
              >
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {metrics.length === 0 ? (
              <div className="text-center py-4 text-sm text-muted-foreground">
                Collecting performance metrics...
              </div>
            ) : (
              metrics.map((metric, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(metric.status)}
                      <span className="text-xs font-medium">{metric.name}</span>
                    </div>
                    <Badge className={`text-xs ${getStatusColor(metric.status)}`}>
                      {metric.value.toFixed(1)}{metric.unit}
                    </Badge>
                  </div>
                  <Progress 
                    value={getProgressValue(metric)} 
                    className="h-1"
                  />
                </div>
              ))
            )}
            
            <div className="pt-2 border-t">
              <Button
                onClick={collectMetrics}
                size="sm"
                variant="outline"
                className="w-full text-xs"
              >
                Refresh Metrics
              </Button>
            </div>
            
            <div className="text-xs text-muted-foreground">
              {config.isDevelopment ? 'Development Mode' : 'Debug Mode Active'}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PerformanceDashboard;
