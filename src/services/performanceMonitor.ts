
import { auditLogger } from './auditLogger';
import config from '@/config/environment';

interface PerformanceEntry {
  name: string;
  startTime: number;
  duration: number;
  entryType: string;
}

interface PerformanceMetrics {
  pageLoad: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
}

class PerformanceMonitor {
  private metrics: Map<string, number> = new Map();
  private observers: PerformanceObserver[] = [];

  initialize() {
    if (!config.features.enablePerformanceMonitoring) {
      console.log('📊 Performance monitoring is disabled');
      return;
    }

    console.log('📊 Performance monitoring initialized');
    
    this.observeNavigationTiming();
    this.observePaintTiming();
    this.observeLayoutShift();
    this.observeLongTasks();
    this.observeResourceTiming();
    
    // Log page load performance after a delay
    setTimeout(() => {
      this.logPageLoadMetrics();
    }, 3000);
  }

  private observeNavigationTiming() {
    if ('navigation' in performance.getEntriesByType('navigation')[0]) {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      this.metrics.set('domContentLoaded', nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart);
      this.metrics.set('loadComplete', nav.loadEventEnd - nav.loadEventStart);
      this.metrics.set('ttfb', nav.responseStart - nav.fetchStart);
    }
  }

  private observePaintTiming() {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.metrics.set(entry.name, entry.startTime);
          
          auditLogger.logSystemEvent('performance_metric', {
            metric_name: entry.name,
            value: entry.startTime,
            unit: 'ms'
          });
        }
      });
      
      observer.observe({ entryTypes: ['paint'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('Paint timing not supported');
    }
  }

  private observeLayoutShift() {
    try {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        
        this.metrics.set('cumulativeLayoutShift', clsValue);
        
        if (clsValue > 0.1) {
          auditLogger.logSystemEvent('high_layout_shift', {
            cls_value: clsValue,
            threshold_exceeded: true
          }, 'medium');
        }
      });
      
      observer.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('Layout shift monitoring not supported');
    }
  }

  private observeLongTasks() {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          auditLogger.logSystemEvent('long_task_detected', {
            duration: entry.duration,
            start_time: entry.startTime
          }, entry.duration > 100 ? 'medium' : 'low');
        }
      });
      
      observer.observe({ entryTypes: ['longtask'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('Long task monitoring not supported');
    }
  }

  private observeResourceTiming() {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const resource = entry as PerformanceResourceTiming;
          
          if (resource.duration > 1000) {
            auditLogger.logSystemEvent('slow_resource_load', {
              resource_name: resource.name,
              duration: resource.duration,
              size: resource.transferSize,
              type: resource.initiatorType
            }, 'low');
          }
        }
      });
      
      observer.observe({ entryTypes: ['resource'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('Resource timing monitoring not supported');
    }
  }

  private async logPageLoadMetrics() {
    const metrics = this.getMetrics();
    
    await auditLogger.logSystemEvent('page_load_metrics', {
      url: window.location.href,
      metrics,
      user_agent: navigator.userAgent,
      connection: (navigator as any).connection?.effectiveType || 'unknown',
      memory: (performance as any).memory ? {
        used: (performance as any).memory.usedJSHeapSize,
        total: (performance as any).memory.totalJSHeapSize,
        limit: (performance as any).memory.jsHeapSizeLimit
      } : null
    });

    console.log('📊 Page load metrics:', metrics);
  }

  measureUserTiming(name: string, startMark?: string, endMark?: string) {
    try {
      if (startMark && endMark) {
        performance.measure(name, startMark, endMark);
      } else {
        performance.measure(name);
      }
      
      const measurement = performance.getEntriesByName(name, 'measure')[0];
      if (measurement) {
        auditLogger.logSystemEvent('user_timing_measure', {
          measure_name: name,
          duration: measurement.duration,
          start_mark: startMark,
          end_mark: endMark
        });
      }
    } catch (error) {
      console.warn('User timing measurement failed:', error);
    }
  }

  getMetrics(): PerformanceMetrics | Record<string, number> {
    const metricsObj: Record<string, number> = {};
    this.metrics.forEach((value, key) => {
      metricsObj[key] = value;
    });
    return metricsObj;
  }

  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics.clear();
    console.log('📊 Performance monitoring destroyed');
  }
}

export const performanceMonitor = new PerformanceMonitor();
export default performanceMonitor;
