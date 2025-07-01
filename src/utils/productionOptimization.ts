
import config from '@/config/environment';

interface OptimizationReport {
  bundleSize: string;
  recommendations: string[];
  criticalIssues: string[];
  performanceScore: number;
}

class ProductionOptimizer {
  generateOptimizationReport(): OptimizationReport {
    const recommendations: string[] = [];
    const criticalIssues: string[] = [];
    let performanceScore = 100;

    // Check bundle size (rough estimation)
    const scripts = document.querySelectorAll('script[src]');
    const estimatedSize = scripts.length * 100; // Rough estimate in KB

    if (estimatedSize > 1000) {
      criticalIssues.push('Bundle size appears large (>1MB). Consider code splitting.');
      performanceScore -= 20;
    } else if (estimatedSize > 500) {
      recommendations.push('Bundle size is moderate. Consider lazy loading non-critical components.');
      performanceScore -= 10;
    }

    // Check for production optimizations
    if (config.isDevelopment) {
      recommendations.push('Switch to production build for optimal performance.');
    }

    if (!config.performance.enableServiceWorker) {
      recommendations.push('Enable service worker for better caching and offline support.');
      performanceScore -= 5;
    }

    if (!config.performance.enableCompression) {
      recommendations.push('Enable compression for better load times.');
      performanceScore -= 10;
    }

    if (config.features.enableDebugMode && config.isProduction) {
      criticalIssues.push('Debug mode is enabled in production. This should be disabled.');
      performanceScore -= 15;
    }

    if (config.features.useMockData && config.isProduction) {
      criticalIssues.push('Mock data is enabled in production. This MUST be disabled.');
      performanceScore -= 30;
    }

    // Check security optimizations
    if (!config.security.enableCSP) {
      recommendations.push('Enable Content Security Policy for better security.');
      performanceScore -= 5;
    }

    if (!config.security.enableHSTS && config.isProduction) {
      recommendations.push('Enable HSTS for production security.');
      performanceScore -= 5;
    }

    // Check analytics and monitoring
    if (!config.features.enablePerformanceMonitoring && config.isProduction) {
      recommendations.push('Enable performance monitoring for production insights.');
    }

    if (!config.features.enableErrorReporting && config.isProduction) {
      recommendations.push('Enable error reporting for production monitoring.');
    }

    return {
      bundleSize: `~${estimatedSize}KB (estimated)`,
      recommendations,
      criticalIssues,
      performanceScore: Math.max(0, performanceScore),
    };
  }

  async measureLoadTime(): Promise<number> {
    return new Promise((resolve) => {
      if ('performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          resolve(navigation.loadEventEnd - navigation.navigationStart);
        } else {
          resolve(0);
        }
      } else {
        resolve(0);
      }
    });
  }

  optimizeImages() {
    // Check for unoptimized images
    const images = document.querySelectorAll('img');
    const recommendations: string[] = [];

    images.forEach((img, index) => {
      if (!img.loading) {
        recommendations.push(`Image ${index + 1}: Consider adding loading="lazy" for better performance.`);
      }
      
      if (!img.alt) {
        recommendations.push(`Image ${index + 1}: Missing alt attribute affects accessibility.`);
      }
    });

    return recommendations;
  }

  checkCoreWebVitals(): Promise<{ lcp?: number; fid?: number; cls?: number }> {
    return new Promise((resolve) => {
      const vitals: { lcp?: number; fid?: number; cls?: number } = {};

      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          switch (entry.entryType) {
            case 'largest-contentful-paint':
              vitals.lcp = entry.startTime;
              break;
            case 'first-input':
              const fidEntry = entry as PerformanceEventTiming;
              vitals.fid = fidEntry.processingStart - fidEntry.startTime;
              break;
            case 'layout-shift':
              const clsEntry = entry as any;
              if (!clsEntry.hadRecentInput) {
                vitals.cls = (vitals.cls || 0) + clsEntry.value;
              }
              break;
          }
        }
      });

      try {
        observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
        
        // Resolve after 5 seconds to give time for metrics to be collected
        setTimeout(() => {
          observer.disconnect();
          resolve(vitals);
        }, 5000);
      } catch (error) {
        resolve(vitals);
      }
    });
  }
}

export const productionOptimizer = new ProductionOptimizer();
export default productionOptimizer;
