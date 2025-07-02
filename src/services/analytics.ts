import config from '@/config/environment';

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp: number;
}

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
}

class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private metrics: PerformanceMetric[] = [];
  private isInitialized = false;

  initialize() {
    if (this.isInitialized) return;
    
    this.isInitialized = true;
    
    if (!config.features.enableAnalytics) {
      console.log('📊 Analytics is disabled');
      return;
    }

    console.log('📊 Analytics service initialized');
    
    // Track page view
    this.track('page_view', {
      url: window.location.href,
      title: document.title,
      referrer: document.referrer,
    });

    // Track user agent
    this.track('user_agent', {
      user_agent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
    });
  }

  track(eventName: string, properties?: Record<string, any>) {
    if (!config.features.enableAnalytics) return;

    const event: AnalyticsEvent = {
      name: eventName,
      properties,
      timestamp: Date.now(),
    };

    this.events.push(event);
    
    // Log in development
    if (config.isDevelopment) {
      console.log('📊 Analytics Event:', event);
    }

    // In a real implementation, you would send this to your analytics service
    // For now, we'll just store it locally
    this.storeEvent(event);
  }

  trackPerformance(metricName: string, value: number, unit: string) {
    if (!config.features.enablePerformanceMonitoring) return;

    const metric: PerformanceMetric = {
      name: metricName,
      value,
      unit,
      timestamp: Date.now(),
    };

    this.metrics.push(metric);
    
    // Log in development
    if (config.isDevelopment) {
      console.log('⚡ Performance Metric:', metric);
    }

    this.storeMetric(metric);
  }

  private storeEvent(event: AnalyticsEvent) {
    try {
      const stored = localStorage.getItem('analytics_events');
      const events = stored ? JSON.parse(stored) : [];
      events.push(event);
      
      // Keep only last 100 events
      if (events.length > 100) {
        events.splice(0, events.length - 100);
      }
      
      localStorage.setItem('analytics_events', JSON.stringify(events));
    } catch (error) {
      console.warn('Failed to store analytics event:', error);
    }
  }

  private storeMetric(metric: PerformanceMetric) {
    try {
      const stored = localStorage.getItem('performance_metrics');
      const metrics = stored ? JSON.parse(stored) : [];
      metrics.push(metric);
      
      // Keep only last 50 metrics
      if (metrics.length > 50) {
        metrics.splice(0, metrics.length - 50);
      }
      
      localStorage.setItem('performance_metrics', JSON.stringify(metrics));
      
      // Also log to console for debugging
      console.log(`Processing performance metric:`, metric);
    } catch (error) {
      console.warn('Failed to store performance metric:', error);
    }
  }

  getEvents(): AnalyticsEvent[] {
    try {
      const stored = localStorage.getItem('analytics_events');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  getMetrics(): PerformanceMetric[] {
    try {
      const stored = localStorage.getItem('performance_metrics');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  clearData() {
    localStorage.removeItem('analytics_events');
    localStorage.removeItem('performance_metrics');
    this.events = [];
    this.metrics = [];
  }
}

// Export singleton instance
export const analytics = new AnalyticsService();
export default analytics;
