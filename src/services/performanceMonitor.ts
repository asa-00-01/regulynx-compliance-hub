
import config from '@/config/environment';
import { analytics } from '@/services/analytics';

export interface WebVital {
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  threshold: { good: number; poor: number };
}

export interface PerformanceData {
  vitals: WebVital[];
  timing: {
    domContentLoaded: number;
    loadComplete: number;
    firstPaint: number;
    firstContentfulPaint: number;
  };
  resources: {
    totalSize: number;
    imageSize: number;
    scriptSize: number;
    stylesheetSize: number;
    resourceCount: number;
  };
  memory?: {
    used: number;
    total: number;
    limit: number;
    percentage: number;
  };
}

class PerformanceMonitorService {
  private vitals: Map<string, WebVital> = new Map();
  private observers: PerformanceObserver[] = [];
  private isInitialized = false;

  initialize() {
    if (this.isInitialized || typeof window === 'undefined') return;
    
    this.isInitialized = true;
    
    if (!config.features.enablePerformanceMonitoring) {
      console.log('📊 Performance monitoring is disabled');
      return;
    }

    console.log('📊 Initializing performance monitoring');
    
    this.setupWebVitalsTracking();
    this.setupResourceTracking();
    this.setupMemoryTracking();
    
    // Report initial metrics after page load
    if (document.readyState === 'complete') {
      this.reportInitialMetrics();
    } else {
      window.addEventListener('load', () => this.reportInitialMetrics());
    }
  }

  private setupWebVitalsTracking() {
    // Largest Contentful Paint (LCP)
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        this.recordVital('LCP', lastEntry.startTime, {
          good: 2500,
          poor: 4000
        });
      });
      
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      this.observers.push(lcpObserver);
    } catch (e) {
      console.warn('LCP tracking not supported');
    }

    // First Input Delay (FID)
    try {
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const fidEntry = entry as PerformanceEventTiming;
          const fid = fidEntry.processingStart - fidEntry.startTime;
          
          this.recordVital('FID', fid, {
            good: 100,
            poor: 300
          });
        }
      });
      
      fidObserver.observe({ type: 'first-input', buffered: true });
      this.observers.push(fidObserver);
    } catch (e) {
      console.warn('FID tracking not supported');
    }

    // Cumulative Layout Shift (CLS)
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const clsEntry = entry as any;
          if (!clsEntry.hadRecentInput) {
            clsValue += clsEntry.value;
            this.recordVital('CLS', clsValue, {
              good: 0.1,
              poor: 0.25
            });
          }
        }
      });
      
      clsObserver.observe({ type: 'layout-shift', buffered: true });
      this.observers.push(clsObserver);
    } catch (e) {
      console.warn('CLS tracking not supported');
    }

    // First Contentful Paint (FCP)
    try {
      const fcpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.recordVital('FCP', entry.startTime, {
              good: 1800,
              poor: 3000
            });
          }
        }
      });
      
      fcpObserver.observe({ type: 'paint', buffered: true });
      this.observers.push(fcpObserver);
    } catch (e) {
      console.warn('FCP tracking not supported');
    }
  }

  private setupResourceTracking() {
    if (typeof window === 'undefined') return;

    // Track resource loading
    const resourceObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const resource = entry as PerformanceResourceTiming;
        
        // Track slow resources
        if (resource.duration > 1000) {
          if (config.features.enableAnalytics) {
            analytics.trackPerformance('slow_resource', resource.duration, 'ms');
          }
        }
      }
    });

    try {
      resourceObserver.observe({ type: 'resource', buffered: true });
      this.observers.push(resourceObserver);
    } catch (e) {
      console.warn('Resource tracking not supported');
    }
  }

  private setupMemoryTracking() {
    if (typeof window === 'undefined' || !('memory' in performance)) return;

    // Track memory usage periodically
    const trackMemory = () => {
      const memInfo = (performance as any).memory;
      const percentage = (memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit) * 100;
      
      if (config.features.enableAnalytics) {
        analytics.trackPerformance('memory_usage', percentage, '%');
      }

      // Warn about high memory usage
      if (percentage > 80) {
        console.warn(`⚠️ High memory usage: ${percentage.toFixed(2)}%`);
        
        if (config.features.enableAnalytics) {
          analytics.track('high_memory_warning', {
            usage_percentage: percentage,
            used_mb: Math.round(memInfo.usedJSHeapSize / 1048576),
            limit_mb: Math.round(memInfo.jsHeapSizeLimit / 1048576)
          });
        }
      }
    };

    // Track memory every 30 seconds
    setInterval(trackMemory, 30000);
    
    // Initial memory check
    trackMemory();
  }

  private recordVital(name: WebVital['name'], value: number, threshold: WebVital['threshold']) {
    const rating: WebVital['rating'] = 
      value <= threshold.good ? 'good' : 
      value <= threshold.poor ? 'needs-improvement' : 'poor';

    const vital: WebVital = { name, value, rating, threshold };
    this.vitals.set(name, vital);

    // Log the vital
    const color = rating === 'good' ? '🟢' : rating === 'needs-improvement' ? '🟡' : '🔴';
    console.log(`${color} ${name}: ${value.toFixed(2)} (${rating})`);

    // Track with analytics
    if (config.features.enableAnalytics) {
      analytics.trackPerformance(`web_vital_${name.toLowerCase()}`, value, name === 'CLS' ? 'score' : 'ms');
      
      analytics.track('web_vital_recorded', {
        vital_name: name,
        value,
        rating,
        is_good: rating === 'good'
      });
    }
  }

  private reportInitialMetrics() {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (navigation) {
      // Time to First Byte
      const ttfb = navigation.responseStart - navigation.requestStart;
      this.recordVital('TTFB', ttfb, {
        good: 800,
        poor: 1800
      });

      // Track page load metrics
      if (config.features.enableAnalytics) {
        analytics.trackPerformance('dom_content_loaded', navigation.domContentLoadedEventEnd - navigation.fetchStart, 'ms');
        analytics.trackPerformance('page_load_complete', navigation.loadEventEnd - navigation.fetchStart, 'ms');
      }
    }
  }

  getPerformanceData(): PerformanceData {
    const vitals = Array.from(this.vitals.values());
    
    // Get timing data
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const timing = {
      domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.fetchStart : 0,
      loadComplete: navigation ? navigation.loadEventEnd - navigation.fetchStart : 0,
      firstPaint: 0,
      firstContentfulPaint: 0
    };

    // Get paint timings
    const paintEntries = performance.getEntriesByType('paint');
    paintEntries.forEach(entry => {
      if (entry.name === 'first-paint') {
        timing.firstPaint = entry.startTime;
      } else if (entry.name === 'first-contentful-paint') {
        timing.firstContentfulPaint = entry.startTime;
      }
    });

    // Calculate resource sizes
    const resources = this.calculateResourceSizes();
    
    // Get memory data
    let memory: PerformanceData['memory'];
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      memory = {
        used: memInfo.usedJSHeapSize,
        total: memInfo.totalJSHeapSize,
        limit: memInfo.jsHeapSizeLimit,
        percentage: (memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit) * 100
      };
    }

    return {
      vitals,
      timing,
      resources,
      memory
    };
  }

  private calculateResourceSizes() {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    const sizes = {
      totalSize: 0,
      imageSize: 0,
      scriptSize: 0,
      stylesheetSize: 0,
      resourceCount: resources.length
    };

    resources.forEach(resource => {
      const size = resource.transferSize || 0;
      sizes.totalSize += size;

      if (resource.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
        sizes.imageSize += size;
      } else if (resource.name.match(/\.js$/i)) {
        sizes.scriptSize += size;
      } else if (resource.name.match(/\.css$/i)) {
        sizes.stylesheetSize += size;
      }
    });

    return sizes;
  }

  getVitalsScore(): number {
    const vitals = Array.from(this.vitals.values());
    if (vitals.length === 0) return 0;

    const scores = vitals.map(vital => {
      switch (vital.rating) {
        case 'good': return 100;
        case 'needs-improvement': return 60;
        case 'poor': return 20;
        default: return 0;
      }
    });

    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  measureFunction<T>(name: string, fn: () => T | Promise<T>): T | Promise<T> {
    if (!config.features.enablePerformanceMonitoring) {
      return fn();
    }

    const startTime = performance.now();
    const result = fn();

    const measure = () => {
      const duration = performance.now() - startTime;
      console.log(`⚡ ${name}: ${duration.toFixed(2)}ms`);
      
      if (config.features.enableAnalytics) {
        analytics.trackPerformance(`function_${name}`, duration, 'ms');
      }
    };

    if (result instanceof Promise) {
      return result.finally(measure) as T;
    } else {
      measure();
      return result;
    }
  }

  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.vitals.clear();
    this.isInitialized = false;
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitorService();

// Helper functions
export const measurePerformance = <T>(name: string, fn: () => T | Promise<T>): T | Promise<T> => {
  return performanceMonitor.measureFunction(name, fn);
};

export const getPerformanceScore = (): number => {
  return performanceMonitor.getVitalsScore();
};

export default performanceMonitor;
