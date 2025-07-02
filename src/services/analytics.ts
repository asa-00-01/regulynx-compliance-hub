import config from '@/config/environment';

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp: number;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
}

export interface ErrorReport {
  error: Error;
  context?: Record<string, any>;
  timestamp: number;
}

type EventListener<T> = (data: T) => void;

class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private metrics: PerformanceMetric[] = [];
  private errors: ErrorReport[] = [];
  private isInitialized = false;
  private eventListeners: Map<string, EventListener<any>[]> = new Map();

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

    // Store event and emit to listeners
    this.storeEvent(event);
    this.emit('event', event);
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
    this.emit('metric', metric);
  }

  reportError(error: Error, context?: Record<string, any>) {
    if (!config.features.enableErrorReporting) return;

    const errorReport: ErrorReport = {
      error,
      context,
      timestamp: Date.now(),
    };

    this.errors.push(errorReport);

    // Log in development
    if (config.isDevelopment) {
      console.error('🚨 Error Report:', errorReport);
    }

    this.storeError(errorReport);
    this.emit('error', errorReport);
  }

  addEventListener<T>(event: string, listener: EventListener<T>) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }

  removeEventListener<T>(event: string, listener: EventListener<T>) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit<T>(event: string, data: T) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => listener(data));
    }
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

  private storeError(errorReport: ErrorReport) {
    try {
      const stored = localStorage.getItem('error_reports');
      const errors = stored ? JSON.parse(stored) : [];
      errors.push(errorReport);
      
      // Keep only last 50 errors
      if (errors.length > 50) {
        errors.splice(0, errors.length - 50);
      }
      
      localStorage.setItem('error_reports', JSON.stringify(errors));
    } catch (error) {
      console.warn('Failed to store error report:', error);
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

  getErrors(): ErrorReport[] {
    try {
      const stored = localStorage.getItem('error_reports');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  clearData() {
    localStorage.removeItem('analytics_events');
    localStorage.removeItem('performance_metrics');
    localStorage.removeItem('error_reports');
    this.events = [];
    this.metrics = [];
    this.errors = [];
  }
}

// Export singleton instance
export const analytics = new AnalyticsService();

// Helper functions for easier usage
export const trackPageView = (pageName: string, properties?: Record<string, any>) => {
  analytics.track('page_view', { page: pageName, ...properties });
};

export const trackUserAction = (action: string, properties?: Record<string, any>) => {
  analytics.track('user_action', { action, ...properties });
};

export const trackComplianceEvent = (eventType: string, properties?: Record<string, any>) => {
  analytics.track('compliance_event', { event_type: eventType, ...properties });
};

export default analytics;
