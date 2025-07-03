
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

  // Analyze environment configuration
  const envAnalysis = analyzeEnvironmentConfiguration();
  opportunities.push(...envAnalysis.issues);

  // Analyze bundle size
  const bundleAnalysis = await analyzeBundleSize();
  opportunities.push(...bundleAnalysis.issues);

  // Analyze performance metrics
  const performanceAnalysis = analyzePerformanceMetrics();
  opportunities.push(...performanceAnalysis.issues);

  // Analyze security
  const securityAnalysis = analyzeSecurityConfiguration();
  opportunities.push(...securityAnalysis.issues);

  // Analyze SEO and accessibility
  const seoAnalysis = analyzeSEOAndAccessibility();
  opportunities.push(...seoAnalysis.issues);

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

const analyzeEnvironmentConfiguration = () => {
  const issues: OptimizationOpportunity[] = [];

  // Check if debug mode is enabled in production
  if (config.features.enableDebugMode && config.app.environment === 'production') {
    issues.push({
      id: 'debug-mode-production',
      category: 'security',
      severity: 'critical',
      title: 'Debug Mode Enabled in Production',
      description: 'Debug mode is currently enabled in production environment.',
      impact: 'Exposes sensitive information and performance overhead',
      recommendation: 'Set VITE_DEBUG_MODE="false" for production deployment',
      implementation: 'easy',
    });
  }

  // Check if mock data is being used in production
  if (config.features.useMockData && config.app.environment === 'production') {
    issues.push({
      id: 'mock-data-production',
      category: 'security',
      severity: 'critical',
      title: 'Mock Data Enabled in Production',
      description: 'Application is using mock data in production environment.',
      impact: 'Users will see fake data instead of real application data',
      recommendation: 'Set VITE_USE_MOCK_DATA="false" for production deployment',
      implementation: 'easy',
    });
  }

  // Check console logging in production
  if (config.logging.enableConsoleLogging && config.app.environment === 'production') {
    issues.push({
      id: 'console-logging-production',
      category: 'performance',
      severity: 'medium',
      title: 'Console Logging Enabled in Production',
      description: 'Console logging is enabled which can impact performance.',
      impact: 'Slower performance and potential memory leaks',
      recommendation: 'Set VITE_ENABLE_CONSOLE_LOGGING="false" for production',
      implementation: 'easy',
    });
  }

  // Check if domain is properly configured
  if (config.app.domain === 'localhost' && config.app.environment === 'production') {
    issues.push({
      id: 'localhost-domain-production',
      category: 'security',
      severity: 'high',
      title: 'Domain Set to Localhost in Production',
      description: 'Application domain is configured as localhost in production.',
      impact: 'Application may not work correctly in production environment',
      recommendation: 'Set VITE_APP_DOMAIN to your actual production domain',
      implementation: 'easy',
    });
  }

  return { issues };
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
        // Estimate size for development (more accurate estimation)
        const estimatedSize = src.includes('vendor') ? 800 : 
                            src.includes('node_modules') ? 400 :
                            src.includes('chunk') ? 200 : 100; // KB
        totalSize += estimatedSize;
      }
    }

    // Check for large bundle
    if (totalSize > 2000) { // > 2MB
      issues.push({
        id: 'large-bundle',
        category: 'performance',
        severity: 'critical',
        title: 'Large Bundle Size',
        description: `Total bundle size is approximately ${totalSize}KB, which significantly impacts loading performance.`,
        impact: 'Very slow initial page load, poor user experience on slow connections',
        recommendation: 'Implement code splitting, lazy loading, and tree shaking. Remove unused dependencies.',
        implementation: 'medium',
        estimatedSavings: `${Math.round(totalSize * 0.4)}KB reduction possible`,
      });
    } else if (totalSize > 1000) { // > 1MB
      issues.push({
        id: 'medium-bundle',
        category: 'performance',
        severity: 'high',
        title: 'Bundle Size Could Be Optimized',
        description: `Total bundle size is approximately ${totalSize}KB.`,
        impact: 'Slower initial page load on slower connections',
        recommendation: 'Consider code splitting for non-critical features and optimize imports',
        implementation: 'medium',
        estimatedSavings: `${Math.round(totalSize * 0.3)}KB reduction possible`,
      });
    }

    // Check for too many script files
    if (scripts.length > 15) {
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

    // Check for unoptimized images
    const images = document.querySelectorAll('img');
    const largeImages = Array.from(images).filter(img => {
      const width = img.naturalWidth || img.width;
      const height = img.naturalHeight || img.height;
      return width > 1920 || height > 1080;
    });

    if (largeImages.length > 0) {
      issues.push({
        id: 'unoptimized-images',
        category: 'performance',
        severity: 'medium',
        title: 'Unoptimized Images Detected',
        description: `Found ${largeImages.length} images that may be larger than necessary.`,
        impact: 'Slower page loading and increased bandwidth usage',
        recommendation: 'Optimize image sizes and consider using modern formats like WebP',
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
      
      if (loadTime > 5000) { // > 5 seconds
        issues.push({
          id: 'very-slow-load-time',
          category: 'performance',
          severity: 'critical',
          title: 'Very Slow Page Load Time',
          description: `Page takes ${Math.round(loadTime)}ms to load completely.`,
          impact: 'Very poor user experience, high bounce rate, SEO penalties',
          recommendation: 'Optimize critical rendering path, implement caching, compress assets, use CDN',
          implementation: 'hard',
          estimatedSavings: '3-4 seconds faster load time',
        });
      } else if (loadTime > 3000) { // > 3 seconds
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
      
      if (memoryUsage > 80) {
        issues.push({
          id: 'critical-memory-usage',
          category: 'performance',
          severity: 'critical',
          title: 'Critical Memory Usage',
          description: `JavaScript heap is using ${memoryUsage.toFixed(1)}% of available memory.`,
          impact: 'Application crashes, poor performance on low-memory devices',
          recommendation: 'Implement memory cleanup, fix memory leaks, optimize data structures',
          implementation: 'hard',
        });
      } else if (memoryUsage > 70) {
        issues.push({
          id: 'high-memory-usage',
          category: 'performance',
          severity: 'high',
          title: 'High Memory Usage',
          description: `JavaScript heap is using ${memoryUsage.toFixed(1)}% of available memory.`,
          impact: 'Potential performance issues and crashes on low-memory devices',
          recommendation: 'Review and optimize memory-intensive operations, implement proper cleanup',
          implementation: 'medium',
        });
      }
    }

    // Check for render-blocking resources
    const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');
    if (cssLinks.length > 5) {
      issues.push({
        id: 'render-blocking-css',
        category: 'performance',
        severity: 'medium',
        title: 'Multiple Render-Blocking CSS Files',
        description: `Found ${cssLinks.length} CSS files that may block rendering.`,
        impact: 'Delayed first paint and slower perceived loading',
        recommendation: 'Combine CSS files, inline critical CSS, and defer non-critical styles',
        implementation: 'medium',
      });
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
  if (location.protocol !== 'https:' && config.app.environment === 'production') {
    issues.push({
      id: 'no-https',
      category: 'security',
      severity: 'critical',
      title: 'No HTTPS in Production',
      description: 'Site is not served over HTTPS in production environment.',
      impact: 'Data transmission is not encrypted, vulnerable to man-in-the-middle attacks',
      recommendation: 'Enable HTTPS for all production environments',
      implementation: 'easy',
    });
    score -= 30;
  }

  // Check for Content Security Policy
  const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  const cspHeader = document.querySelector('meta[name="csp-nonce"]'); // Check if CSP is configured
  
  if (!cspMeta && !config.security.enableCSP) {
    issues.push({
      id: 'no-csp',
      category: 'security',
      severity: 'high',
      title: 'No Content Security Policy',
      description: 'No Content Security Policy is configured.',
      impact: 'Vulnerable to XSS attacks and code injection',
      recommendation: 'Enable CSP by setting VITE_ENABLE_CSP="true"',
      implementation: 'easy',
    });
    score -= 20;
  }

  // Check HSTS configuration
  if (!config.security.enableHSTS && config.app.environment === 'production') {
    issues.push({
      id: 'no-hsts',
      category: 'security',
      severity: 'medium',
      title: 'HSTS Not Configured',
      description: 'HTTP Strict Transport Security is not enabled.',
      impact: 'Vulnerable to protocol downgrade attacks',
      recommendation: 'Enable HSTS by setting VITE_ENABLE_HSTS="true"',
      implementation: 'easy',
    });
    score -= 10;
  }

  // Check for mixed content
  const httpImages = document.querySelectorAll('img[src^="http:"]');
  const httpScripts = document.querySelectorAll('script[src^="http:"]');
  const mixedContentCount = httpImages.length + httpScripts.length;
  
  if (mixedContentCount > 0 && location.protocol === 'https:') {
    issues.push({
      id: 'mixed-content',
      category: 'security',
      severity: 'medium',
      title: 'Mixed Content Issues',
      description: `Found ${mixedContentCount} resources loaded over HTTP on HTTPS page.`,
      impact: 'Browser warnings and potential security vulnerabilities',
      recommendation: 'Update all resource URLs to use HTTPS',
      implementation: 'easy',
    });
    score -= 10;
  }

  // Check for error reporting configuration
  if (!config.features.enableErrorReporting && config.app.environment === 'production') {
    issues.push({
      id: 'no-error-reporting',
      category: 'security',
      severity: 'low',
      title: 'Error Reporting Not Configured',
      description: 'Error reporting is disabled in production.',
      impact: 'Unable to monitor and respond to production errors',
      recommendation: 'Enable error reporting by setting VITE_ENABLE_ERROR_REPORTING="true"',
      implementation: 'easy',
    });
    score -= 5;
  }

  return { issues, score };
};

const analyzeSEOAndAccessibility = () => {
  const issues: OptimizationOpportunity[] = [];

  // Check for meta description
  const metaDescription = document.querySelector('meta[name="description"]');
  if (!metaDescription || !metaDescription.getAttribute('content')?.trim()) {
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

  // Check for title tag
  const title = document.querySelector('title');
  if (!title || !title.textContent?.trim()) {
    issues.push({
      id: 'no-title',
      category: 'seo',
      severity: 'high',
      title: 'Missing Page Title',
      description: 'Page is missing a title tag.',
      impact: 'Very poor SEO and user experience',
      recommendation: 'Add descriptive title tags to all pages',
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

  // Check for form labels
  const inputsWithoutLabels = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
  const inputsWithoutAssociatedLabels = Array.from(inputsWithoutLabels).filter(input => {
    const id = input.getAttribute('id');
    return !id || !document.querySelector(`label[for="${id}"]`);
  });

  if (inputsWithoutAssociatedLabels.length > 0) {
    issues.push({
      id: 'missing-form-labels',
      category: 'accessibility',
      severity: 'medium',
      title: 'Missing Form Labels',
      description: `Found ${inputsWithoutAssociatedLabels.length} form inputs without proper labels.`,
      impact: 'Poor accessibility for screen readers and form usability',
      recommendation: 'Add proper labels or aria-label attributes to all form inputs',
      implementation: 'easy',
    });
  }

  // Check viewport meta tag
  const viewportMeta = document.querySelector('meta[name="viewport"]');
  if (!viewportMeta) {
    issues.push({
      id: 'no-viewport-meta',
      category: 'seo',
      severity: 'medium',
      title: 'Missing Viewport Meta Tag',
      description: 'Page is missing a viewport meta tag.',
      impact: 'Poor mobile experience and mobile SEO',
      recommendation: 'Add viewport meta tag for responsive design',
      implementation: 'easy',
    });
  }

  return { issues };
};
