import config from '@/config/environment';

interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp?: number;
}

interface PerformanceMetric {
  metric: string;
  value: number;
  timestamp?: number;
}

class AnalyticsService {
  private initialized = false;
  private queue: AnalyticsEvent[] = [];
  private performanceQueue: PerformanceMetric[] = [];

  initialize() {
    if (this.initialized) return;

    this.initialized = true;
    
    if (config.features.enableAnalytics) {
      console.log('📊 Analytics service initialized');
      this.flushQueue();
    }

    if (config.features.enablePerformanceMonitoring) {
      console.log('⚡ Performance monitoring enabled');
      this.initializePerformanceTracking();
    }
  }

  private initializePerformanceTracking() {
    // Track page load performance
    if (typeof window !== 'undefined') {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          
          if (navigation) {
            this.trackPerformance('page_load_time', navigation.loadEventEnd - navigation.navigationStart);
            this.trackPerformance('dom_content_loaded', navigation.domContentLoadedEventEnd - navigation.navigationStart);
            this.trackPerformance('time_to_first_byte', navigation.responseStart - navigation.requestStart);
          }
        }, 0);
      });
    }
  }

  track(event: string, properties?: Record<string, any>) {
    const analyticsEvent: AnalyticsEvent = {
      event,
      properties: {
        ...properties,
        timestamp: Date.now(),
        environment: config.app.environment,
        version: config.app.version,
      },
      timestamp: Date.now(),
    };

    if (config.features.enableAnalytics) {
      if (this.initialized) {
        this.processEvent(analyticsEvent);
      } else {
        this.queue.push(analyticsEvent);
      }
    }

    // Log in development
    if (config.isDevelopment) {
      console.log('📊 Analytics Event:', analyticsEvent);
    }
  }

  trackPerformance(metric: string, value: number) {
    const performanceMetric: PerformanceMetric = {
      metric,
      value,
      timestamp: Date.now(),
    };

    if (config.features.enablePerformanceMonitoring) {
      if (this.initialized) {
        this.processPerformanceMetric(performanceMetric);
      } else {
        this.performanceQueue.push(performanceMetric);
      }
    }

    // Log in development
    if (config.isDevelopment) {
      console.log('⚡ Performance Metric:', performanceMetric);
    }
  }

  private processEvent(event: AnalyticsEvent) {
    // In a real implementation, this would send to your analytics service
    // For now, we'll log and potentially send to a local endpoint
    
    if (config.isDevelopment) {
      console.log('Processing analytics event:', event);
    }

    // Store in localStorage for development debugging
    if (config.isDevelopment) {
      const stored = localStorage.getItem('analytics_events') || '[]';
      const events = JSON.parse(stored);
      events.push(event);
      
      // Keep only last 100 events
      if (events.length > 100) {
        events.splice(0, events.length - 100);
      }
      
      localStorage.setItem('analytics_events', JSON.stringify(events));
    }
  }

  private processPerformanceMetric(metric: PerformanceMetric) {
    // In a real implementation, this would send to your performance monitoring service
    
    if (config.isDevelopment) {
      console.log('Processing performance metric:', metric);
    }

    // Store in localStorage for development debugging
    if (config.isDevelopment) {
      const stored = localStorage.getItem('performance_metrics') || '[]';
      const metrics = JSON.parse(stored);
      metrics.push(metric);
      
      // Keep only last 50 metrics
      if (metrics.length > 50) {
        metrics.splice(0, metrics.length - 50);
      }
      
      localStorage.setItem('performance_metrics', JSON.stringify(metrics));
    }
  }

  private flushQueue() {
    // Process queued events
    this.queue.forEach(event => this.processEvent(event));
    this.queue = [];

    // Process queued performance metrics
    this.performanceQueue.forEach(metric => this.processPerformanceMetric(metric));
    this.performanceQueue = [];
  }

  reportError(error: Error, context?: Record<string, any>) {
    if (config.features.enableErrorReporting) {
      this.track('error', {
        message: error.message,
        stack: error.stack,
        context,
      });
    }

    if (config.isDevelopment) {
      console.error('📊 Error reported to analytics:', error, context);
    }
  }

  // Utility methods for common tracking scenarios
  trackPageView(page: string, properties?: Record<string, any>) {
    this.track('page_view', {
      page,
      url: window.location.href,
      referrer: document.referrer,
      ...properties,
    });
  }

  trackUserAction(action: string, properties?: Record<string, any>) {
    this.track('user_action', {
      action,
      ...properties,
    });
  }

  trackComplianceEvent(eventType: string, properties?: Record<string, any>) {
    this.track('compliance_event', {
      event_type: eventType,
      ...properties,
    });
  }

  // Development helper to view stored analytics data
  getStoredEvents(): AnalyticsEvent[] {
    if (!config.isDevelopment) return [];
    
    const stored = localStorage.getItem('analytics_events') || '[]';
    return JSON.parse(stored);
  }

  getStoredMetrics(): PerformanceMetric[] {
    if (!config.isDevelopment) return [];
    
    const stored = localStorage.getItem('performance_metrics') || '[]';
    return JSON.parse(stored);
  }
}

// Export singleton instance
export const analytics = new AnalyticsService();

// Export individual functions for convenience
export const trackPageView = (page: string, properties?: Record<string, any>) => 
  analytics.trackPageView(page, properties);

export const trackUserAction = (action: string, properties?: Record<string, any>) => 
  analytics.trackUserAction(action, properties);

export const trackComplianceEvent = (eventType: string, properties?: Record<string, any>) => 
  analytics.trackComplianceEvent(eventType, properties);

export default analytics;
