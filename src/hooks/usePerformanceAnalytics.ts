
import { useState, useEffect, useCallback } from 'react';
import config from '@/config/environment';
import { analytics } from '@/services/analytics';

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

interface CoreWebVitals {
  lcp: PerformanceMetric | null; // Largest Contentful Paint
  fid: PerformanceMetric | null; // First Input Delay
  cls: PerformanceMetric | null; // Cumulative Layout Shift
  fcp: PerformanceMetric | null; // First Contentful Paint
  ttfb: PerformanceMetric | null; // Time to First Byte
}

interface PerformanceAnalytics {
  coreWebVitals: CoreWebVitals;
  loadTimes: {
    domContentLoaded: number;
    windowLoad: number;
    navigationStart: number;
  };
  resourceTiming: {
    totalResources: number;
    totalSize: number;
    slowestResource: string;
    cacheHitRatio: number;
  };
  userTiming: {
    marks: PerformanceMark[];
    measures: PerformanceMeasure[];
  };
}

export const usePerformanceAnalytics = () => {
  const [analytics, setAnalytics] = useState<PerformanceAnalytics | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const getRating = (metricName: string, value: number): 'good' | 'needs-improvement' | 'poor' => {
    const thresholds = {
      lcp: { good: 2500, poor: 4000 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 },
      fcp: { good: 1800, poor: 3000 },
      ttfb: { good: 800, poor: 1800 },
    };

    const threshold = thresholds[metricName as keyof typeof thresholds];
    if (!threshold) return 'good';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  };

  const measureCoreWebVitals = useCallback((): Promise<CoreWebVitals> => {
    return new Promise((resolve) => {
      const vitals: CoreWebVitals = {
        lcp: null,
        fid: null,
        cls: null,
        fcp: null,
        ttfb: null,
      };

      // Measure TTFB from Navigation Timing
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        const ttfb = navigation.responseStart - navigation.requestStart;
        vitals.ttfb = {
          name: 'TTFB',
          value: ttfb,
          rating: getRating('ttfb', ttfb),
          timestamp: Date.now(),
        };
      }

      // Use Performance Observer for other metrics
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            switch (entry.entryType) {
              case 'largest-contentful-paint':
                vitals.lcp = {
                  name: 'LCP',
                  value: entry.startTime,
                  rating: getRating('lcp', entry.startTime),
                  timestamp: Date.now(),
                };
                break;
              case 'first-input':
                const fidEntry = entry as PerformanceEventTiming;
                vitals.fid = {
                  name: 'FID',
                  value: fidEntry.processingStart - fidEntry.startTime,
                  rating: getRating('fid', fidEntry.processingStart - fidEntry.startTime),
                  timestamp: Date.now(),
                };
                break;
              case 'layout-shift':
                if (!(entry as any).hadRecentInput) {
                  const currentCLS = vitals.cls?.value || 0;
                  const newValue = currentCLS + (entry as any).value;
                  vitals.cls = {
                    name: 'CLS',
                    value: newValue,
                    rating: getRating('cls', newValue),
                    timestamp: Date.now(),
                  };
                }
                break;
              case 'paint':
                if (entry.name === 'first-contentful-paint') {
                  vitals.fcp = {
                    name: 'FCP',
                    value: entry.startTime,
                    rating: getRating('fcp', entry.startTime),
                    timestamp: Date.now(),
                  };
                }
                break;
            }
          }
        });

        try {
          observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift', 'paint'] });
        } catch (error) {
          console.warn('Some performance metrics not supported in this browser');
        }

        // Disconnect observer after 10 seconds
        setTimeout(() => {
          observer.disconnect();
          resolve(vitals);
        }, 10000);
      } else {
        resolve(vitals);
      }
    });
  }, []);

  const analyzeResourceTiming = useCallback(() => {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    let totalSize = 0;
    let slowestResource = '';
    let slowestTime = 0;
    let cacheHits = 0;

    resources.forEach((resource) => {
      const size = resource.transferSize || 0;
      totalSize += size;

      const loadTime = resource.responseEnd - resource.startTime;
      if (loadTime > slowestTime) {
        slowestTime = loadTime;
        slowestResource = resource.name;
      }

      // Cache hit if transfer size is 0 but encoded body size > 0
      if (resource.transferSize === 0 && resource.encodedBodySize > 0) {
        cacheHits++;
      }
    });

    return {
      totalResources: resources.length,
      totalSize: Math.round(totalSize / 1024), // KB
      slowestResource,
      cacheHitRatio: resources.length > 0 ? (cacheHits / resources.length) * 100 : 0,
    };
  }, []);

  const analyzePerformance = useCallback(async () => {
    setIsAnalyzing(true);

    try {
      // Wait for page to be fully loaded
      if (document.readyState !== 'complete') {
        await new Promise((resolve) => {
          window.addEventListener('load', resolve, { once: true });
        });
      }

      const coreWebVitals = await measureCoreWebVitals();
      const resourceTiming = analyzeResourceTiming();

      // Get load times from Navigation Timing
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const loadTimes = {
        domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.navigationStart : 0,
        windowLoad: navigation ? navigation.loadEventEnd - navigation.navigationStart : 0,
        navigationStart: navigation ? navigation.navigationStart : 0,
      };

      // Get user timing data
      const marks = performance.getEntriesByType('mark') as PerformanceMark[];
      const measures = performance.getEntriesByType('measure') as PerformanceMeasure[];

      const performanceData: PerformanceAnalytics = {
        coreWebVitals,
        loadTimes,
        resourceTiming,
        userTiming: { marks, measures },
      };

      setAnalytics(performanceData);

      // Report to analytics service
      if (config.features.enableAnalytics) {
        analytics.track('performance_analysis', {
          lcp: coreWebVitals.lcp?.value,
          fid: coreWebVitals.fid?.value,
          cls: coreWebVitals.cls?.value,
          fcp: coreWebVitals.fcp?.value,
          ttfb: coreWebVitals.ttfb?.value,
          dom_content_loaded: loadTimes.domContentLoaded,
          window_load: loadTimes.windowLoad,
          total_resources: resourceTiming.totalResources,
          total_size_kb: resourceTiming.totalSize,
          cache_hit_ratio: resourceTiming.cacheHitRatio,
        });
      }
    } catch (error) {
      console.error('Performance analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [measureCoreWebVitals, analyzeResourceTiming]);

  // Auto-analyze on mount
  useEffect(() => {
    if (config.features.enablePerformanceMonitoring) {
      // Delay to ensure page is loaded
      const timer = setTimeout(analyzePerformance, 2000);
      return () => clearTimeout(timer);
    }
  }, [analyzePerformance]);

  const markUserTiming = useCallback((name: string) => {
    if ('performance' in window && 'mark' in performance) {
      performance.mark(name);
    }
  }, []);

  const measureUserTiming = useCallback((name: string, startMark: string, endMark: string) => {
    if ('performance' in window && 'measure' in performance) {
      try {
        performance.measure(name, startMark, endMark);
      } catch (error) {
        console.warn(`Failed to measure ${name}:`, error);
      }
    }
  }, []);

  return {
    analytics,
    isAnalyzing,
    analyzePerformance,
    markUserTiming,
    measureUserTiming,
  };
};
