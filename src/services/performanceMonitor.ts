interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  bundleSize: number;
  score: number;
}

interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

declare global {
  interface Performance {
    memory?: MemoryInfo;
  }
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private observers: PerformanceObserver[] = [];
  private isMonitoring = false;

  constructor() {
    this.initializeObservers();
  }

  private initializeObservers() {
    if (typeof window === 'undefined') return;

    try {
      // Navigation timing observer
      const navObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'navigation') {
            this.recordMetric({
              loadTime: entry.loadEventEnd - entry.loadEventStart,
              renderTime: entry.loadEventEnd - entry.fetchStart,
              memoryUsage: this.getMemoryUsage(),
              bundleSize: this.estimateBundleSize(),
              score: 0
            });
          }
        });
      });
      
      navObserver.observe({ entryTypes: ['navigation'] });
      this.observers.push(navObserver);
    } catch (error) {
      console.warn('Performance monitoring not supported:', error);
    }
  }

  private recordMetric(metric: Omit<PerformanceMetrics, 'score'>) {
    const score = this.calculateScore(metric);
    const fullMetric = { ...metric, score };
    
    this.metrics.push(fullMetric);
    
    // Keep only last 50 metrics
    if (this.metrics.length > 50) {
      this.metrics = this.metrics.slice(-50);
    }
  }

  private calculateScore(metric: Omit<PerformanceMetrics, 'score'>): number {
    let score = 100;
    
    // Penalize slow load times
    if (metric.loadTime > 3000) score -= 30;
    else if (metric.loadTime > 1000) score -= 15;
    
    // Penalize high memory usage
    if (metric.memoryUsage > 80) score -= 20;
    else if (metric.memoryUsage > 50) score -= 10;
    
    // Penalize large bundle size
    if (metric.bundleSize > 1000) score -= 20;
    else if (metric.bundleSize > 500) score -= 10;
    
    return Math.max(0, score);
  }

  private getMemoryUsage(): number {
    if (typeof window === 'undefined') return 0;
    
    try {
      if (performance.memory) {
        return (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100;
      }
    } catch (error) {
      console.warn('Memory usage monitoring not available:', error);
    }
    
    return 0;
  }

  private estimateBundleSize(): number {
    if (typeof window === 'undefined') return 0;
    
    try {
      const resources = performance.getEntriesByType('resource');
      const jsResources = resources.filter(r => r.name.includes('.js'));
      return jsResources.reduce((total, resource) => {
        return total + (resource.transferSize || 0);
      }, 0) / 1024; // Convert to KB
    } catch (error) {
      console.warn('Bundle size estimation failed:', error);
      return 0;
    }
  }

  public getPerformanceScore(): number {
    if (this.metrics.length === 0) return 85; // Default score
    
    const recentMetrics = this.metrics.slice(-10);
    const avgScore = recentMetrics.reduce((sum, metric) => sum + metric.score, 0) / recentMetrics.length;
    
    return Math.round(avgScore);
  }

  public getLatestMetrics(): PerformanceMetrics | null {
    return this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] : null;
  }

  public getAllMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  public startMonitoring() {
    this.isMonitoring = true;
  }

  public stopMonitoring() {
    this.isMonitoring = false;
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }

  public clearMetrics() {
    this.metrics = [];
  }
}

export const performanceMonitor = new PerformanceMonitor();
export const getPerformanceScore = () => performanceMonitor.getPerformanceScore();

export default performanceMonitor;
