
import config from '@/config/environment';
import { analytics } from '@/services/analytics';

export interface OptimizationOpportunity {
  category: 'performance' | 'security' | 'seo' | 'accessibility' | 'bundle';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: string;
  recommendation: string;
  estimatedSavings?: string;
  implementation: 'easy' | 'medium' | 'hard';
}

export interface OptimizationReport {
  score: number;
  opportunities: OptimizationOpportunity[];
  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  metrics: {
    bundleSize?: number;
    loadTime?: number;
    memoryCoverage?: number;
    securityScore?: number;
  };
}

class ProductionOptimizationAnalyzer {
  private opportunities: OptimizationOpportunity[] = [];

  async analyze(): Promise<OptimizationReport> {
    this.opportunities = [];
    
    // Analyze performance
    await this.analyzePerformance();
    
    // Analyze bundle
    this.analyzeBundle();
    
    // Analyze security
    this.analyzeSecurity();
    
    // Analyze configuration
    this.analyzeConfiguration();
    
    // Analyze SEO
    this.analyzeSEO();
    
    // Calculate score
    const score = this.calculateScore();
    
    const summary = this.getSummary();
    
    const metrics = await this.getMetrics();
    
    return {
      score,
      opportunities: this.opportunities,
      summary,
      metrics
    };
  }

  private async analyzePerformance() {
    // Core Web Vitals analysis
    if (typeof window !== 'undefined') {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'largest-contentful-paint' && entry.startTime > 2500) {
              this.addOpportunity({
                category: 'performance',
                severity: 'high',
                title: 'Large Contentful Paint (LCP) is slow',
                description: `LCP is ${(entry.startTime / 1000).toFixed(2)}s, which exceeds the recommended 2.5s`,
                impact: 'Poor user experience and SEO ranking',
                recommendation: 'Optimize images, preload critical resources, and improve server response times',
                estimatedSavings: '1-3s load time improvement',
                implementation: 'medium'
              });
            }
          }
        });

        observer.observe({ entryTypes: ['largest-contentful-paint'] });
        
        // Disconnect after a short time to avoid memory leaks
        setTimeout(() => observer.disconnect(), 5000);
      } catch (error) {
        console.warn('Performance analysis not supported in this browser');
      }
    }

    // Memory usage analysis
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memInfo = (performance as any).memory;
      const memoryUsage = (memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit) * 100;
      
      if (memoryUsage > 80) {
        this.addOpportunity({
          category: 'performance',
          severity: 'high',
          title: 'High memory usage detected',
          description: `Memory usage is at ${memoryUsage.toFixed(1)}% of the available heap`,
          impact: 'Potential app crashes and poor performance',
          recommendation: 'Implement memory optimization, check for memory leaks, and optimize large objects',
          estimatedSavings: `${(memoryUsage - 60).toFixed(1)}% memory reduction`,
          implementation: 'medium'
        });
      }
    }

    // Network performance
    if (typeof window !== 'undefined' && 'connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection && connection.effectiveType === '2g') {
        this.addOpportunity({
          category: 'performance',
          severity: 'medium',
          title: 'Slow network connection detected',
          description: 'User has a slow network connection',
          impact: 'Poor loading experience for users on slow networks',
          recommendation: 'Implement progressive loading, optimize images, and reduce bundle size',
          implementation: 'medium'
        });
      }
    }
  }

  private analyzeBundle() {
    // Estimate bundle size based on loaded scripts
    if (typeof document !== 'undefined') {
      const scripts = document.querySelectorAll('script[src]');
      let estimatedSize = scripts.length * 100; // Rough estimate

      if (estimatedSize > 1000) {
        this.addOpportunity({
          category: 'bundle',
          severity: 'high',
          title: 'Large bundle size detected',
          description: `Estimated bundle size is ${estimatedSize}KB`,
          impact: 'Slower initial load times and poor performance on slow networks',
          recommendation: 'Implement code splitting, tree shaking, and lazy loading',
          estimatedSavings: `${Math.round(estimatedSize * 0.3)}KB reduction possible`,
          implementation: 'medium'
        });
      }

      // Check for unused CSS
      const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
      if (stylesheets.length > 5) {
        this.addOpportunity({
          category: 'bundle',
          severity: 'medium',
          title: 'Multiple CSS files detected',
          description: `${stylesheets.length} CSS files are being loaded`,
          impact: 'Additional network requests and potential render blocking',
          recommendation: 'Combine and minify CSS files, remove unused CSS',
          implementation: 'easy'
        });
      }
    }
  }

  private analyzeSecurity() {
    // Check for HTTPS
    if (typeof window !== 'undefined' && window.location.protocol !== 'https:' && config.isProduction) {
      this.addOpportunity({
        category: 'security',
        severity: 'critical',
        title: 'Site not served over HTTPS',
        description: 'The site is not using HTTPS in production',
        impact: 'Security vulnerabilities and SEO penalties',
        recommendation: 'Enable HTTPS/SSL certificate',
        implementation: 'easy'
      });
    }

    // Check security headers
    if (!config.security.enableCSP) {
      this.addOpportunity({
        category: 'security',
        severity: 'high',
        title: 'Content Security Policy not enabled',
        description: 'CSP headers are not configured',
        impact: 'Vulnerability to XSS attacks',
        recommendation: 'Enable and configure Content Security Policy',
        implementation: 'medium'
      });
    }

    if (!config.security.enableHSTS) {
      this.addOpportunity({
        category: 'security',
        severity: 'medium',
        title: 'HSTS not enabled',
        description: 'HTTP Strict Transport Security is not configured',
        impact: 'Potential man-in-the-middle attacks',
        recommendation: 'Enable HSTS headers',
        implementation: 'easy'
      });
    }
  }

  private analyzeConfiguration() {
    // Development mode in production
    if (config.isProduction && config.features.enableDebugMode) {
      this.addOpportunity({
        category: 'security',
        severity: 'critical',
        title: 'Debug mode enabled in production',
        description: 'Debug mode is active in production environment',
        impact: 'Security vulnerabilities and performance degradation',
        recommendation: 'Disable debug mode for production',
        implementation: 'easy'
      });
    }

    // Mock data in production
    if (config.isProduction && config.features.useMockData) {
      this.addOpportunity({
        category: 'security',
        severity: 'critical',
        title: 'Mock data enabled in production',
        description: 'Mock data mode is active in production',
        impact: 'Data integrity issues and potential security risks',
        recommendation: 'Disable mock data mode for production',
        implementation: 'easy'
      });
    }

    // Console logging in production
    if (config.isProduction && config.logging.enableConsoleLogging) {
      this.addOpportunity({
        category: 'performance',
        severity: 'medium',
        title: 'Console logging enabled in production',
        description: 'Console logging is active in production',
        impact: 'Performance overhead and potential information disclosure',
        recommendation: 'Disable console logging for production',
        implementation: 'easy'
      });
    }

    // Service Worker not enabled
    if (!config.performance.enableServiceWorker) {
      this.addOpportunity({
        category: 'performance',
        severity: 'medium',
        title: 'Service Worker not enabled',
        description: 'Service Worker is disabled',
        impact: 'Missed caching opportunities and offline functionality',
        recommendation: 'Enable Service Worker for better performance',
        implementation: 'medium'
      });
    }
  }

  private analyzeSEO() {
    if (typeof document !== 'undefined') {
      // Check for meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription || !metaDescription.getAttribute('content')) {
        this.addOpportunity({
          category: 'seo',
          severity: 'medium',
          title: 'Missing meta description',
          description: 'Page is missing meta description',
          impact: 'Poor search engine visibility',
          recommendation: 'Add descriptive meta description tags',
          implementation: 'easy'
        });
      }

      // Check for title tag
      if (!document.title || document.title.length < 10) {
        this.addOpportunity({
          category: 'seo',
          severity: 'medium',
          title: 'Poor page title',
          description: 'Page title is missing or too short',
          impact: 'Poor search engine ranking',
          recommendation: 'Add descriptive page titles',
          implementation: 'easy'
        });
      }

      // Check for alt attributes on images
      const images = document.querySelectorAll('img');
      const imagesWithoutAlt = Array.from(images).filter(img => !img.alt);
      if (imagesWithoutAlt.length > 0) {
        this.addOpportunity({
          category: 'accessibility',
          severity: 'medium',
          title: 'Images missing alt attributes',
          description: `${imagesWithoutAlt.length} images are missing alt attributes`,
          impact: 'Poor accessibility and SEO',
          recommendation: 'Add descriptive alt attributes to all images',
          implementation: 'easy'
        });
      }
    }
  }

  private addOpportunity(opportunity: OptimizationOpportunity) {
    this.opportunities.push(opportunity);
  }

  private calculateScore(): number {
    const severityWeights = {
      critical: 25,
      high: 15,
      medium: 10,
      low: 5
    };

    const totalPenalty = this.opportunities.reduce((sum, opp) => {
      return sum + severityWeights[opp.severity];
    }, 0);

    return Math.max(0, 100 - totalPenalty);
  }

  private getSummary() {
    const summary = {
      total: this.opportunities.length,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    };

    this.opportunities.forEach(opp => {
      summary[opp.severity]++;
    });

    return summary;
  }

  private async getMetrics() {
    const metrics: OptimizationReport['metrics'] = {};

    // Bundle size estimation
    if (typeof document !== 'undefined') {
      const scripts = document.querySelectorAll('script[src]');
      metrics.bundleSize = scripts.length * 100; // Rough estimate
    }

    // Load time from performance API
    if (typeof window !== 'undefined' && window.performance) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        metrics.loadTime = navigation.loadEventEnd - navigation.fetchStart;
      }
    }

    // Memory usage
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memInfo = (performance as any).memory;
      metrics.memoryCoverage = (memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit) * 100;
    }

    // Security score based on configuration
    let securityScore = 100;
    if (!config.security.enableCSP) securityScore -= 20;
    if (!config.security.enableHSTS) securityScore -= 10;
    if (config.isProduction && config.features.enableDebugMode) securityScore -= 30;
    if (typeof window !== 'undefined' && window.location.protocol !== 'https:' && config.isProduction) securityScore -= 40;
    
    metrics.securityScore = Math.max(0, securityScore);

    return metrics;
  }
}

// Export singleton instance
export const productionOptimizer = new ProductionOptimizationAnalyzer();

// Helper function to run optimization analysis
export const analyzeProductionReadiness = async (): Promise<OptimizationReport> => {
  const report = await productionOptimizer.analyze();
  
  // Track optimization analysis
  if (config.features.enableAnalytics) {
    analytics.track('production_optimization_analysis', {
      score: report.score,
      total_opportunities: report.summary.total,
      critical_issues: report.summary.critical,
      high_issues: report.summary.high,
    });
  }
  
  return report;
};

// Helper function to get quick optimization tips
export const getQuickOptimizationTips = (): OptimizationOpportunity[] => {
  const tips: OptimizationOpportunity[] = [];

  // Basic performance tips
  tips.push({
    category: 'performance',
    severity: 'medium',
    title: 'Enable compression',
    description: 'Enable gzip/brotli compression for better performance',
    impact: 'Up to 70% reduction in file sizes',
    recommendation: 'Configure server-side compression',
    estimatedSavings: '30-70% bandwidth savings',
    implementation: 'easy'
  });

  tips.push({
    category: 'performance',
    severity: 'medium',
    title: 'Implement lazy loading',
    description: 'Load images and components only when needed',
    impact: 'Faster initial page load',
    recommendation: 'Add lazy loading to images and non-critical components',
    estimatedSavings: '1-3s faster load time',
    implementation: 'medium'
  });

  // Security tips
  tips.push({
    category: 'security',
    severity: 'high',
    title: 'Set up security headers',
    description: 'Configure proper security headers',
    impact: 'Protection against common security vulnerabilities',
    recommendation: 'Set up CSP, HSTS, and other security headers',
    implementation: 'medium'
  });

  return tips;
};
