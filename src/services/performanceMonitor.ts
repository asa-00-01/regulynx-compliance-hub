
interface PerformanceMetrics {
  loadTime: number;
  domContentLoaded: number;
  firstPaint: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
}

class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {};
  private observers: PerformanceObserver[] = [];

  private collectNavigationMetrics() {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      this.metrics.loadTime = navigation.loadEventEnd - navigation.loadEventStart;
      this.metrics.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.fetchStart;
    }
  }

  private collectPaintMetrics() {
    const paintEntries = performance.getEntriesByType('paint');
    paintEntries.forEach(entry => {
      if (entry.name === 'first-paint') {
        this.metrics.firstPaint = entry.startTime;
      }
      if (entry.name === 'first-contentful-paint') {
        this.metrics.firstContentfulPaint = entry.startTime;
      }
    });
  }

  private observeLCP() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.largestContentfulPaint = lastEntry.startTime;
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(observer);
    }
  }

  private observeCLS() {
    if ('PerformanceObserver' in window) {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        this.metrics.cumulativeLayoutShift = clsValue;
      });
      observer.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(observer);
    }
  }

  private observeFID() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.metrics.firstInputDelay = (entry as any).processingStart - entry.startTime;
        }
      });
      observer.observe({ entryTypes: ['first-input'] });
      this.observers.push(observer);
    }
  }

  getMetrics(): Partial<PerformanceMetrics> {
    this.collectNavigationMetrics();
    this.collectPaintMetrics();
    return { ...this.metrics };
  }

  logMetrics() {
    const metrics = this.getMetrics();
    console.group('Performance Metrics');
    Object.entries(metrics).forEach(([key, value]) => {
      if (value !== undefined) {
        console.log(`${key}: ${typeof value === 'number' ? value.toFixed(2) : value}ms`);
      }
    });
    console.groupEnd();
  }

  startMonitoring() {
    // Wait for page load
    if (document.readyState === 'loading') {
      window.addEventListener('load', () => {
        setTimeout(() => {
          this.observeLCP();
          this.observeCLS();
          this.observeFID();
        }, 0);
      });
    } else {
      this.observeLCP();
      this.observeCLS();
      this.observeFID();
    }
  }

  stopMonitoring() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Add the missing getPerformanceScore function
export const getPerformanceScore = (): number => {
  const metrics = performanceMonitor.getMetrics();
  let score = 100;
  
  // Deduct points based on performance metrics
  if (metrics.largestContentfulPaint && metrics.largestContentfulPaint > 2500) {
    score -= 20;
  }
  if (metrics.firstInputDelay && metrics.firstInputDelay > 100) {
    score -= 15;
  }
  if (metrics.cumulativeLayoutShift && metrics.cumulativeLayoutShift > 0.1) {
    score -= 15;
  }
  if (metrics.loadTime && metrics.loadTime > 3000) {
    score -= 20;
  }
  if (metrics.domContentLoaded && metrics.domContentLoaded > 1500) {
    score -= 10;
  }
  
  // Ensure score is between 0 and 100
  return Math.max(0, Math.min(100, score));
};
