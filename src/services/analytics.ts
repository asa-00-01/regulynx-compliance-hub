import config from '@/config/environment';

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  userId?: string;
}

export interface ErrorReport {
  error: Error;
  context?: Record<string, any>;
  userId?: string;
  timestamp: string;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: string;
}

type Listener<T> = (data: T) => void;

class AnalyticsService {
  private isInitialized = false;
  private eventListeners: Listener<AnalyticsEvent>[] = [];
  private errorListeners: Listener<ErrorReport>[] = [];
  private metricListeners: Listener<PerformanceMetric>[] = [];

  public addEventListener(type: 'event', listener: Listener<AnalyticsEvent>): void;
  public addEventListener(type: 'error', listener: Listener<ErrorReport>): void;
  public addEventListener(type: 'metric', listener: Listener<PerformanceMetric>): void;
  public addEventListener(type: 'event' | 'error' | 'metric', listener: Listener<any>): void {
    switch (type) {
      case 'event': this.eventListeners.push(listener); break;
      case 'error': this.errorListeners.push(listener); break;
      case 'metric': this.metricListeners.push(listener); break;
    }
  }

  public removeEventListener(type: 'event', listener: Listener<AnalyticsEvent>): void;
  public removeEventListener(type: 'error', listener: Listener<ErrorReport>): void;
  public removeEventListener(type: 'metric', listener: Listener<PerformanceMetric>): void;
  public removeEventListener(type: 'event' | 'error' | 'metric', listener: Listener<any>): void {
    switch (type) {
      case 'event': this.eventListeners = this.eventListeners.filter(l => l !== listener); break;
      case 'error': this.errorListeners = this.errorListeners.filter(l => l !== listener); break;
      case 'metric': this.metricListeners = this.metricListeners.filter(l => l !== listener); break;
    }
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      if (config.features.enableAnalytics) {
        await this.initializeAnalytics();
      }

      if (config.features.enableErrorReporting) {
        await this.initializeErrorReporting();
      }

      if (config.features.enablePerformanceMonitoring) {
        await this.initializePerformanceMonitoring();
      }

      this.isInitialized = true;
      console.log('Analytics service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize analytics service:', error);
    }
  }

  private async initializeAnalytics() {
    // In production, this would integrate with services like Google Analytics, Mixpanel, etc.
    if (config.isDevelopment) {
      console.log('Analytics initialized (development mode)');
    }
  }

  private async initializeErrorReporting() {
    // In production, this would integrate with services like Sentry, Bugsnag, etc.
    if (config.isDevelopment) {
      console.log('Error reporting initialized (development mode)');
    }

    // Set up global error handlers
    window.addEventListener('error', this.handleGlobalError.bind(this));
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this));
  }

  private async initializePerformanceMonitoring() {
    // Monitor Core Web Vitals and custom metrics
    if ('PerformanceObserver' in window) {
      this.observeWebVitals();
    }
  }

  private handleGlobalError(event: ErrorEvent) {
    this.reportError(new Error(event.message), {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack,
    });
  }

  private handleUnhandledRejection(event: PromiseRejectionEvent) {
    this.reportError(new Error(`Unhandled Promise Rejection: ${event.reason}`), {
      reason: event.reason,
    });
  }

  private observeWebVitals() {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          this.reportPerformanceMetric({
            name: 'LCP',
            value: entry.startTime,
            unit: 'ms',
            timestamp: new Date().toISOString(),
          });
        }

        if (entry.entryType === 'first-input') {
          const fidEntry = entry as PerformanceEventTiming;
          this.reportPerformanceMetric({
            name: 'FID',
            value: fidEntry.processingStart - fidEntry.startTime,
            unit: 'ms',
            timestamp: new Date().toISOString(),
          });
        }

        if (entry.entryType === 'layout-shift') {
          const clsEntry = entry as any;
          if (!clsEntry.hadRecentInput) {
            this.reportPerformanceMetric({
              name: 'CLS',
              value: clsEntry.value,
              unit: 'score',
              timestamp: new Date().toISOString(),
            });
          }
        }
      }
    });

    try {
      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
    } catch (e) {
      console.warn('Some performance metrics not supported');
    }
  }

  track(event: AnalyticsEvent) {
    if (!config.features.enableAnalytics) return;

    try {
      const payload = {
        ...event,
        timestamp: new Date().toISOString(),
        sessionId: this.getSessionId(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      };

      if (config.isDevelopment) {
        console.log('Analytics Event:', payload);
        this.eventListeners.forEach((listener) => listener(payload as AnalyticsEvent));
      } else {
        // In production, send to analytics service
        this.sendToAnalyticsService(payload);
      }
    } catch (error) {
      console.error('Failed to track analytics event:', error);
    }
  }

  reportError(error: Error, context?: Record<string, any>) {
    if (!config.features.enableErrorReporting) return;

    try {
      const errorReport: ErrorReport = {
        error,
        context: {
          ...context,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      };

      if (config.isDevelopment) {
        console.error('Error Report:', errorReport);
        this.errorListeners.forEach((listener) => listener(errorReport));
      } else {
        // In production, send to error reporting service
        this.sendToErrorReportingService(errorReport);
      }
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  }

  reportPerformanceMetric(metric: PerformanceMetric) {
    if (!config.features.enablePerformanceMonitoring) return;

    try {
      if (config.isDevelopment) {
        console.log('Performance Metric:', metric);
        this.metricListeners.forEach((listener) => listener(metric));
      } else {
        // In production, send to performance monitoring service
        this.sendToPerformanceService(metric);
      }
    } catch (error) {
      console.error('Failed to report performance metric:', error);
    }
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  private async sendToAnalyticsService(payload: any) {
    // Implement actual analytics service integration here
    // Example: Google Analytics, Mixpanel, Amplitude, etc.
    console.log('Sending to analytics service:', payload);
  }

  private async sendToErrorReportingService(errorReport: ErrorReport) {
    // Implement actual error reporting service integration here
    // Example: Sentry, Bugsnag, LogRocket, etc.
    console.log('Sending to error reporting service:', errorReport);
  }

  private async sendToPerformanceService(metric: PerformanceMetric) {
    // Implement actual performance monitoring service integration here
    // Example: New Relic, DataDog, Pingdom, etc.
    console.log('Sending to performance service:', metric);
  }
}

export const analytics = new AnalyticsService();

// Helper functions for common tracking scenarios
export const trackPageView = (pageName: string, properties?: Record<string, any>) => {
  analytics.track({
    name: 'page_view',
    properties: {
      page: pageName,
      ...properties,
    },
  });
};

export const trackUserAction = (action: string, properties?: Record<string, any>) => {
  analytics.track({
    name: 'user_action',
    properties: {
      action,
      ...properties,
    },
  });
};

export const trackComplianceEvent = (eventType: string, properties?: Record<string, any>) => {
  analytics.track({
    name: 'compliance_event',
    properties: {
      event_type: eventType,
      ...properties,
    },
  });
};

export default analytics;
