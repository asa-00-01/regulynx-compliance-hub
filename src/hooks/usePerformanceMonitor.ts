
import { useEffect, useCallback } from 'react';
import config from '@/config/environment';
import { analytics } from '@/services/analytics';

interface PerformanceMetrics {
  lcp?: number;
  fid?: number;
  cls?: number;
  fcp?: number;
  ttfb?: number;
}

export const usePerformanceMonitor = () => {
  const metrics: PerformanceMetrics = {};

  useEffect(() => {
    if (!config.features.enablePerformanceMonitoring) return;

    // Enhanced Core Web Vitals monitoring
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        switch (entry.entryType) {
          case 'largest-contentful-paint':
            metrics.lcp = entry.startTime;
            console.log('🚀 LCP:', entry.startTime);
            if (config.features.enableAnalytics) {
              analytics.trackPerformance('lcp', entry.startTime);
            }
            break;
            
          case 'first-input':
            const fidEntry = entry as PerformanceEventTiming;
            metrics.fid = fidEntry.processingStart - fidEntry.startTime;
            console.log('🚀 FID:', metrics.fid);
            if (config.features.enableAnalytics) {
              analytics.trackPerformance('fid', metrics.fid);
            }
            break;
            
          case 'layout-shift':
            const clsEntry = entry as any;
            if (!clsEntry.hadRecentInput) {
              metrics.cls = clsEntry.value;
              console.log('🚀 CLS:', clsEntry.value);
              if (config.features.enableAnalytics) {
                analytics.trackPerformance('cls', clsEntry.value);
              }
            }
            break;
            
          case 'paint':
            if (entry.name === 'first-contentful-paint') {
              metrics.fcp = entry.startTime;
              console.log('🚀 FCP:', entry.startTime);
              if (config.features.enableAnalytics) {
                analytics.trackPerformance('fcp', entry.startTime);
              }
            }
            break;
            
          case 'navigation':
            const navEntry = entry as PerformanceNavigationTiming;
            metrics.ttfb = navEntry.responseStart - navEntry.requestStart;
            console.log('🚀 TTFB:', metrics.ttfb);
            if (config.features.enableAnalytics) {
              analytics.trackPerformance('ttfb', metrics.ttfb);
            }
            break;
        }
      }
    });

    try {
      observer.observe({ 
        entryTypes: [
          'largest-contentful-paint', 
          'first-input', 
          'layout-shift',
          'paint',
          'navigation'
        ] 
      });
    } catch (e) {
      console.warn('⚠️ Performance monitoring not fully supported in this browser');
    }

    // Memory usage monitoring
    const monitorMemory = () => {
      if ('memory' in performance) {
        const memInfo = (performance as any).memory;
        console.log('🧠 Memory Usage:', {
          used: Math.round(memInfo.usedJSHeapSize / 1048576) + ' MB',
          total: Math.round(memInfo.totalJSHeapSize / 1048576) + ' MB',
          limit: Math.round(memInfo.jsHeapSizeLimit / 1048576) + ' MB',
        });
        
        if (config.features.enableAnalytics) {
          analytics.trackPerformance('memory_used', memInfo.usedJSHeapSize);
        }
      }
    };

    // Monitor memory every 30 seconds in development
    const memoryInterval = config.isDevelopment ? 
      setInterval(monitorMemory, 30000) : null;

    return () => {
      observer.disconnect();
      if (memoryInterval) clearInterval(memoryInterval);
    };
  }, []);

  const measureComponentRender = useCallback((componentName: string) => {
    if (!config.features.enablePerformanceMonitoring) {
      return { start: () => {}, end: () => {} };
    }

    return {
      start: () => {
        performance.mark(`${componentName}-start`);
      },
      end: () => {
        performance.mark(`${componentName}-end`);
        try {
          performance.measure(
            `${componentName}-render`,
            `${componentName}-start`,
            `${componentName}-end`
          );
          
          const measure = performance.getEntriesByName(`${componentName}-render`)[0];
          console.log(`⚡ ${componentName} render time:`, measure.duration + 'ms');
          
          if (config.features.enableAnalytics) {
            analytics.trackPerformance(`component_render_${componentName}`, measure.duration);
          }
        } catch (error) {
          console.warn(`Performance measurement failed for ${componentName}:`, error);
        }
      }
    };
  }, []);

  const measureApiCall = useCallback((apiName: string) => {
    if (!config.features.enablePerformanceMonitoring) {
      return { start: () => {}, end: () => {} };
    }

    const startTime = performance.now();
    
    return {
      start: () => {
        performance.mark(`${apiName}-api-start`);
      },
      end: () => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        console.log(`🌐 API ${apiName} duration:`, duration + 'ms');
        
        if (config.features.enableAnalytics) {
          analytics.trackPerformance(`api_call_${apiName}`, duration);
        }
        
        // Warn if API call is slow
        if (duration > 2000) {
          console.warn(`⚠️ Slow API call detected: ${apiName} took ${duration.toFixed(2)}ms`);
        }
      }
    };
  }, []);

  return { 
    measureComponentRender, 
    measureApiCall,
    metrics 
  };
};
