
import config from '@/config/environment';

export interface OptimizationOpportunity {
  id: string;
  category: 'performance' | 'security' | 'bundle' | 'seo' | 'accessibility';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  recommendation: string;
  implementation: 'easy' | 'medium' | 'hard';
  estimatedSavings?: string;
}

export interface OptimizationReport {
  score: number;
  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  opportunities: OptimizationOpportunity[];
  metrics?: {
    bundleSize?: number;
    loadTime?: number;
    memoryCoverage?: number;
    securityScore?: number;
  };
}

export const analyzeProductionReadiness = async (): Promise<OptimizationReport> => {
  const opportunities: OptimizationOpportunity[] = [];

  // Analyze bundle size
  const bundleAnalysis = await analyzeBundleSize();
  if (bundleAnalysis.issues.length > 0) {
    opportunities.push(...bundleAnalysis.issues);
  }

  // Analyze performance metrics
  const performanceAnalysis = analyzePerformanceMetrics();
  if (performanceAnalysis.issues.length > 0) {
    opportunities.push(...performanceAnalysis.issues);
  }

  // Analyze security
  const securityAnalysis = analyzeSecurityConfiguration();
  if (securityAnalysis.issues.length > 0) {
    opportunities.push(...securityAnalysis.issues);
  }

  // Analyze SEO and accessibility
  const seoAnalysis = analyzeSEOAndAccessibility();
  if (seoAnalysis.issues.length > 0) {
    opportunities.push(...seoAnalysis.issues);
  }

  // Calculate summary
  const summary = {
    total: opportunities.length,
    critical: opportunities.filter(o => o.severity === 'critical').length,
    high: opportunities.filter(o => o.severity === 'high').length,
    medium: opportunities.filter(o => o.severity === 'medium').length,
    low: opportunities.filter(o => o.severity === 'low').length,
  };

  // Calculate overall score (100 - deductions for issues)
  let score = 100;
  opportunities.forEach(opportunity => {
    switch (opportunity.severity) {
      case 'critical':
        score -= 25;
        break;
      case 'high':
        score -= 15;
        break;
      case 'medium':
        score -= 8;
        break;
      case 'low':
        score -= 3;
        break;
    }
  });

  score = Math.max(0, score);

  // Collect metrics
  const metrics = {
    bundleSize: bundleAnalysis.totalSize,
    loadTime: performanceAnalysis.loadTime,
    memoryCoverage: performanceAnalysis.memoryUsage,
    securityScore: securityAnalysis.score,
  };

  return {
    score,
    summary,
    opportunities,
    metrics,
  };
};

const analyzeBundleSize = async () => {
  const issues: OptimizationOpportunity[] = [];
  let totalSize = 0;

  try {
    // Analyze JavaScript files
    const scripts = document.querySelectorAll('script[src]');
    for (const script of scripts) {
      const src = script.getAttribute('src');
      if (src && !src.startsWith('http')) {
        // Estimate size for development
        const estimatedSize = src.includes('vendor') ? 500 : 100; // KB
        totalSize += estimatedSize;
      }
    }

    // Check for large bundle
    if (totalSize > 1000) { // > 1MB
      issues.push({
        id: 'large-bundle',
        category: 'bundle',
        severity: 'high',
        title: 'Large Bundle Size',
        description: `Total bundle size is approximately ${totalSize}KB, which may impact loading performance.`,
        impact: 'Slower initial page load and poor user experience on slower connections',
        recommendation: 'Implement code splitting, lazy loading, and tree shaking to reduce bundle size',
        implementation: 'medium',
        estimatedSavings: `${Math.round(totalSize * 0.3)}KB reduction possible`,
      });
    }

    // Check for too many script files
    if (scripts.length > 10) {
      issues.push({
        id: 'too-many-scripts',
        category: 'performance',
        severity: 'medium',
        title: 'Too Many Script Files',
        description: `Found ${scripts.length} script files, which increases HTTP requests.`,
        impact: 'Increased network overhead and slower page load times',
        recommendation: 'Bundle scripts together to reduce the number of HTTP requests',
        implementation: 'easy',
      });
    }
  } catch (error) {
    console.warn('Bundle analysis failed:', error);
  }

  return { issues, totalSize };
};

const analyzePerformanceMetrics = () => {
  const issues: OptimizationOpportunity[] = [];
  let loadTime = 0;
  let memoryUsage = 0;

  try {
    // Check navigation timing
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      loadTime = navigation.loadEventEnd - navigation.fetchStart;
      
      if (loadTime > 3000) { // > 3 seconds
        issues.push({
          id: 'slow-load-time',
          category: 'performance',
          severity: 'high',
          title: 'Slow Page Load Time',
          description: `Page takes ${Math.round(loadTime)}ms to load completely.`,
          impact: 'Poor user experience and potential SEO penalties',
          recommendation: 'Optimize critical rendering path, compress assets, and implement caching',
          implementation: 'medium',
          estimatedSavings: '1-2 seconds faster load time',
        });
      }
    }

    // Check memory usage
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      memoryUsage = (memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit) * 100;
      
      if (memoryUsage > 70) {
        issues.push({
          id: 'high-memory-usage',
          category: 'performance',
          severity: 'medium',
          title: 'High Memory Usage',
          description: `JavaScript heap is using ${memoryUsage.toFixed(1)}% of available memory.`,
          impact: 'Potential performance issues and crashes on low-memory devices',
          recommendation: 'Review and optimize memory-intensive operations, implement proper cleanup',
          implementation: 'hard',
        });
      }
    }
  } catch (error) {
    console.warn('Performance analysis failed:', error);
  }

  return { issues, loadTime, memoryUsage };
};

const analyzeSecurityConfiguration = () => {
  const issues: OptimizationOpportunity[] = [];
  let score = 100;

  // Check for HTTPS
  if (location.protocol !== 'https:' && !config.isDevelopment) {
    issues.push({
      id: 'no-https',
      category: 'security',
      severity: 'critical',
      title: 'No HTTPS',
      description: 'Site is not served over HTTPS in production.',
      impact: 'Data transmission is not encrypted, vulnerable to man-in-the-middle attacks',
      recommendation: 'Enable HTTPS for all production environments',
      implementation: 'easy',
    });
    score -= 30;
  }

  // Check for Content Security Policy
  const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  if (!cspMeta) {
    issues.push({
      id: 'no-csp',
      category: 'security',
      severity: 'high',
      title: 'No Content Security Policy',
      description: 'No Content Security Policy header or meta tag found.',
      impact: 'Vulnerable to XSS attacks and code injection',
      recommendation: 'Implement a strict Content Security Policy',
      implementation: 'medium',
    });
    score -= 20;
  }

  // Check for mixed content
  const images = document.querySelectorAll('img[src^="http:"]');
  if (images.length > 0 && location.protocol === 'https:') {
    issues.push({
      id: 'mixed-content',
      category: 'security',
      severity: 'medium',
      title: 'Mixed Content Issues',
      description: `Found ${images.length} resources loaded over HTTP on HTTPS page.`,
      impact: 'Browser warnings and potential security vulnerabilities',
      recommendation: 'Update all resource URLs to use HTTPS',
      implementation: 'easy',
    });
    score -= 10;
  }

  return { issues, score };
};

const analyzeSEOAndAccessibility = () => {
  const issues: OptimizationOpportunity[] = [];

  // Check for meta description
  const metaDescription = document.querySelector('meta[name="description"]');
  if (!metaDescription || !metaDescription.getAttribute('content')) {
    issues.push({
      id: 'no-meta-description',
      category: 'seo',
      severity: 'medium',
      title: 'Missing Meta Description',
      description: 'Page is missing a meta description tag.',
      impact: 'Poor search engine optimization and click-through rates',
      recommendation: 'Add descriptive meta description tags to all pages',
      implementation: 'easy',
    });
  }

  // Check for alt attributes on images
  const imagesWithoutAlt = document.querySelectorAll('img:not([alt])');
  if (imagesWithoutAlt.length > 0) {
    issues.push({
      id: 'missing-alt-text',
      category: 'accessibility',
      severity: 'medium',
      title: 'Missing Alt Text',
      description: `Found ${imagesWithoutAlt.length} images without alt attributes.`,
      impact: 'Poor accessibility for screen readers and SEO',
      recommendation: 'Add descriptive alt text to all images',
      implementation: 'easy',
    });
  }

  // Check for proper heading hierarchy
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const h1Count = document.querySelectorAll('h1').length;
  
  if (h1Count === 0) {
    issues.push({
      id: 'no-h1',
      category: 'seo',
      severity: 'high',
      title: 'Missing H1 Tag',
      description: 'Page is missing an H1 heading tag.',
      impact: 'Poor SEO structure and accessibility',
      recommendation: 'Add a descriptive H1 tag to each page',
      implementation: 'easy',
    });
  } else if (h1Count > 1) {
    issues.push({
      id: 'multiple-h1',
      category: 'seo',
      severity: 'medium',
      title: 'Multiple H1 Tags',
      description: `Found ${h1Count} H1 tags on the page.`,
      impact: 'Confusing heading hierarchy for SEO and accessibility',
      recommendation: 'Use only one H1 tag per page',
      implementation: 'easy',
    });
  }

  return { issues };
};
