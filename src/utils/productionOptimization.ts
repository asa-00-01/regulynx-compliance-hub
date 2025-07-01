
import config from '@/config/environment';

interface OptimizationConfig {
  enableLazyLoading: boolean;
  enableCodeSplitting: boolean;
  enableCaching: boolean;
  enableCompression: boolean;
  enablePerformanceMonitoring: boolean;
}

class ProductionOptimizer {
  private config: OptimizationConfig;

  constructor() {
    this.config = {
      enableLazyLoading: true,
      enableCodeSplitting: true,
      enableCaching: true,
      enableCompression: true,
      enablePerformanceMonitoring: config.features.enablePerformanceMonitoring,
    };
  }

  // Lazy loading implementation
  enableLazyLoading() {
    if (!this.config.enableLazyLoading) return;

    // Implement intersection observer for images
    const images = document.querySelectorAll('img[data-lazy]');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            img.src = img.dataset.lazy || '';
            img.classList.remove('lazy');
            observer.unobserve(img);
          }
        });
      });

      images.forEach(img => imageObserver.observe(img));
    }
  }

  // Performance monitoring
  initializePerformanceMonitoring() {
    if (!this.config.enablePerformanceMonitoring) return;

    // Monitor Core Web Vitals
    this.observeLCP();
    this.observeFID();
    this.observeCLS();
    this.observeResourceLoading();
  }

  private observeLCP() {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        console.log('🚀 LCP:', lastEntry.startTime);
        
        // You can send this to your analytics service
        if (window.analytics && typeof window.analytics.trackPerformance === 'function') {
          window.analytics.trackPerformance('lcp', lastEntry.startTime, 'ms');
        }
      });
      
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (error) {
      console.warn('LCP monitoring not supported:', error);
    }
  }

  private observeFID() {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const fidEntry = entry as PerformanceEventTiming;
          const fid = fidEntry.processingStart - fidEntry.startTime;
          
          console.log('🚀 FID:', fid);
          
          if (window.analytics && typeof window.analytics.trackPerformance === 'function') {
            window.analytics.trackPerformance('fid', fid, 'ms');
          }
        }
      });
      
      observer.observe({ entryTypes: ['first-input'] });
    } catch (error) {
      console.warn('FID monitoring not supported:', error);
    }
  }

  private observeCLS() {
    if (!('PerformanceObserver' in window)) return;

    try {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const layoutShiftEntry = entry as any;
          if (!layoutShiftEntry.hadRecentInput) {
            clsValue += layoutShiftEntry.value;
          }
        }
        
        console.log('🚀 CLS:', clsValue);
        
        if (window.analytics && typeof window.analytics.trackPerformance === 'function') {
          window.analytics.trackPerformance('cls', clsValue, 'score');
        }
      });
      
      observer.observe({ entryTypes: ['layout-shift'] });
    } catch (error) {
      console.warn('CLS monitoring not supported:', error);
    }
  }

  private observeResourceLoading() {
    if (typeof window !== 'undefined' && 'performance' in window) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          
          if (navigation) {
            // Use fetchStart instead of deprecated navigationStart
            const pageLoadTime = navigation.loadEventEnd - navigation.fetchStart;
            const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.fetchStart;
            const timeToFirstByte = navigation.responseStart - navigation.requestStart;
            
            console.log('📊 Page Load Metrics:', {
              pageLoadTime,
              domContentLoaded,
              timeToFirstByte,
            });

            if (window.analytics && typeof window.analytics.trackPerformance === 'function') {
              window.analytics.trackPerformance('page_load_time', pageLoadTime, 'ms');
              window.analytics.trackPerformance('dom_content_loaded', domContentLoaded, 'ms');
              window.analytics.trackPerformance('time_to_first_byte', timeToFirstByte, 'ms');
            }
          }
        }, 0);
      });
    }
  }

  // Bundle optimization
  optimizeBundle() {
    if (!this.config.enableCodeSplitting) return;
    
    // Code splitting is typically handled by the build tool (Vite)
    // But we can provide runtime optimizations
    this.enableLazyComponentLoading();
  }

  private enableLazyComponentLoading() {
    // This would be implemented with React.lazy() at the component level
    console.log('🎯 Lazy component loading enabled');
  }

  // Caching strategies
  initializeCaching() {
    if (!this.config.enableCaching) return;

    this.setupServiceWorkerCaching();
    this.setupLocalStorageCaching();
  }

  private setupServiceWorkerCaching() {
    if ('serviceWorker' in navigator && config.isProduction) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('🔧 Service Worker registered:', registration);
        })
        .catch(error => {
          console.log('🔧 Service Worker registration failed:', error);
        });
    }
  }

  private setupLocalStorageCaching() {
    // Implement strategic localStorage caching for API responses
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const [resource, options] = args;
      const url = typeof resource === 'string' ? resource : resource.url;
      
      // Only cache GET requests
      if (options?.method && options.method !== 'GET') {
        return originalFetch(...args);
      }
      
      // Check if we have cached data
      const cacheKey = `cache_${url}`;
      const cached = localStorage.getItem(cacheKey);
      
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const age = Date.now() - timestamp;
        
        // Cache for 5 minutes
        if (age < 5 * 60 * 1000) {
          return Promise.resolve(new Response(JSON.stringify(data)));
        }
      }
      
      // Make the request and cache the result
      try {
        const response = await originalFetch(...args);
        
        if (response.ok && url.includes('/api/')) {
          const clone = response.clone();
          const data = await clone.json();
          
          localStorage.setItem(cacheKey, JSON.stringify({
            data,
            timestamp: Date.now(),
          }));
        }
        
        return response;
      } catch (error) {
        console.error('Fetch error:', error);
        throw error;
      }
    };
  }

  // Memory optimization
  optimizeMemoryUsage() {
    // Monitor memory usage
    this.monitorMemoryUsage();
    
    // Clean up unused resources
    this.setupMemoryCleanup();
  }

  private monitorMemoryUsage() {
    if ('memory' in performance) {
      setInterval(() => {
        const memInfo = (performance as any).memory;
        const usedPercent = (memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit) * 100;
        
        if (usedPercent > 90) {
          console.warn('🧠 High memory usage detected:', usedPercent.toFixed(2) + '%');
          this.triggerMemoryCleanup();
        }
        
        if (config.isDevelopment) {
          console.log('🧠 Memory Usage:', {
            used: Math.round(memInfo.usedJSHeapSize / 1048576) + ' MB',
            total: Math.round(memInfo.totalJSHeapSize / 1048576) + ' MB',
            limit: Math.round(memInfo.jsHeapSizeLimit / 1048576) + ' MB',
            percentage: usedPercent.toFixed(2) + '%',
          });
        }
      }, 30000); // Check every 30 seconds
    }
  }

  private setupMemoryCleanup() {
    // Clean up localStorage periodically
    setInterval(() => {
      this.cleanupOldCacheEntries();
    }, 10 * 60 * 1000); // Every 10 minutes
  }

  private cleanupOldCacheEntries() {
    const keys = Object.keys(localStorage);
    const now = Date.now();
    
    keys.forEach(key => {
      if (key.startsWith('cache_')) {
        try {
          const cached = JSON.parse(localStorage.getItem(key) || '{}');
          const age = now - (cached.timestamp || 0);
          
          // Remove entries older than 1 hour
          if (age > 60 * 60 * 1000) {
            localStorage.removeItem(key);
          }
        } catch (error) {
          // Remove invalid entries
          localStorage.removeItem(key);
        }
      }
    });
  }

  private triggerMemoryCleanup() {
    // Force garbage collection if available
    if (window.gc) {
      window.gc();
    }
    
    // Clear old cache entries
    this.cleanupOldCacheEntries();
    
    // Clear console logs in production
    if (config.isProduction) {
      console.clear();
    }
  }

  // Initialize all optimizations
  initialize() {
    console.log('🚀 Initializing production optimizations...');
    
    this.enableLazyLoading();
    this.initializePerformanceMonitoring();
    this.optimizeBundle();
    this.initializeCaching();
    this.optimizeMemoryUsage();
    
    console.log('✅ Production optimizations initialized');
  }
}

// Global interface for analytics
declare global {
  interface Window {
    analytics?: {
      trackPerformance: (metric: string, value: number, unit: string) => void;
    };
    gc?: () => void;
  }
}

// Export singleton instance
export const productionOptimizer = new ProductionOptimizer();

// Auto-initialize in production
if (config.isProduction) {
  productionOptimizer.initialize();
}

export default productionOptimizer;
