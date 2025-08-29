#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.bright}${msg}${colors.reset}`)
};

class PerformanceTester {
  constructor() {
    this.metrics = {};
    this.issues = [];
    this.warnings = [];
    this.passed = 0;
    this.total = 0;
  }

  check(title, testFn) {
    this.total++;
    try {
      const result = testFn();
      if (result === true) {
        this.passed++;
        log.success(title);
        return true;
      } else {
        this.issues.push({ title, issue: result });
        log.error(`${title}: ${result}`);
        return false;
      }
    } catch (error) {
      this.issues.push({ title, issue: error.message });
      log.error(`${title}: ${error.message}`);
      return false;
    }
  }

  warn(title, message) {
    this.warnings.push({ title, message });
    log.warning(`${title}: ${message}`);
  }

  async runPerformanceTests() {
    log.header('⚡ Performance Testing');
    log.info('Starting comprehensive performance analysis...\n');

    // Bundle Analysis
    log.section('Bundle Analysis');
    await this.analyzeBundleSize();

    // Build Performance
    log.section('Build Performance');
    await this.testBuildPerformance();

    // Code Quality
    log.section('Code Quality');
    this.analyzeCodeQuality();

    // Dependencies
    log.section('Dependencies');
    this.analyzeDependencies();

    // Final Report
    this.generatePerformanceReport();
  }

  async analyzeBundleSize() {
    const distDir = join(__dirname, '..', 'dist');
    
    if (!existsSync(distDir)) {
      this.warn('No build directory found', 'Run npm run build first to analyze bundle size');
      return;
    }

    try {
      // Get total bundle size
      const size = execSync(`du -sh ${distDir}`, { encoding: 'utf8' });
      const sizeInMB = parseFloat(size.split('\t')[0].replace('M', ''));
      
      this.metrics.bundleSize = sizeInMB;
      
      if (sizeInMB < 5) {
        this.passed++;
        log.success(`Bundle size: ${size.trim()} (Excellent)`);
      } else if (sizeInMB < 10) {
        this.passed++;
        log.success(`Bundle size: ${size.trim()} (Good)`);
      } else if (sizeInMB < 20) {
        this.warn('Bundle size', `${size.trim()} (Consider optimization)`);
      } else {
        this.issues.push({ title: 'Bundle size too large', issue: `${size.trim()} (Should be under 10MB)` });
      }

      // Analyze individual files
      const files = execSync(`find ${distDir} -name "*.js" -o -name "*.css"`, { encoding: 'utf8' });
      const fileList = files.split('\n').filter(f => f.trim());
      
      let largeFiles = [];
      for (const file of fileList) {
        if (existsSync(file)) {
          const fileSize = execSync(`du -sh "${file}"`, { encoding: 'utf8' });
          const sizeInKB = parseFloat(fileSize.split('\t')[0].replace('K', ''));
          
          if (sizeInKB > 500) {
            largeFiles.push({ file: file.split('/').pop(), size: fileSize.trim() });
          }
        }
      }
      
      if (largeFiles.length > 0) {
        this.warn('Large files detected', `${largeFiles.length} files over 500KB`);
        largeFiles.forEach(({ file, size }) => {
          log.warning(`  ${file}: ${size}`);
        });
      } else {
        this.passed++;
        log.success('No excessively large files found');
      }

    } catch (error) {
      this.warn('Could not analyze bundle size', error.message);
    }
  }

  async testBuildPerformance() {
    try {
      // Test build time
      const startTime = Date.now();
      execSync('npm run build', { stdio: 'pipe' });
      const buildTime = (Date.now() - startTime) / 1000;
      
      this.metrics.buildTime = buildTime;
      
      if (buildTime < 30) {
        this.passed++;
        log.success(`Build time: ${buildTime.toFixed(1)}s (Fast)`);
      } else if (buildTime < 60) {
        this.passed++;
        log.success(`Build time: ${buildTime.toFixed(1)}s (Acceptable)`);
      } else if (buildTime < 120) {
        this.warn('Build time', `${buildTime.toFixed(1)}s (Slow - consider optimization)`);
      } else {
        this.issues.push({ title: 'Build time too slow', issue: `${buildTime.toFixed(1)}s (Should be under 60s)` });
      }

    } catch (error) {
      this.warn('Could not test build performance', error.message);
    }
  }

  analyzeCodeQuality() {
    const srcDir = join(__dirname, '..', 'src');
    
    try {
      // Count lines of code
      const loc = execSync(`find ${srcDir} -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | xargs wc -l | tail -1`, { encoding: 'utf8' });
      const totalLines = parseInt(loc.trim().split(' ')[0]);
      
      this.metrics.linesOfCode = totalLines;
      
      if (totalLines < 10000) {
        this.passed++;
        log.success(`Lines of code: ${totalLines.toLocaleString()} (Manageable)`);
      } else if (totalLines < 50000) {
        this.passed++;
        log.success(`Lines of code: ${totalLines.toLocaleString()} (Large)`);
      } else {
        this.warn('Lines of code', `${totalLines.toLocaleString()} (Very large - consider modularization)`);
      }

      // Check for code duplication
      const duplicatePatterns = [
        /function\s+\w+\s*\([^)]*\)\s*\{[^}]*\}/g,
        /const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*\{[^}]*\}/g
      ];
      
      let duplicateCount = 0;
      const files = execSync(`find ${srcDir} -name "*.ts" -o -name "*.tsx"`, { encoding: 'utf8' });
      const fileList = files.split('\n').filter(f => f.trim());
      
      for (const file of fileList) {
        if (existsSync(file)) {
          const content = readFileSync(file, 'utf8');
          for (const pattern of duplicatePatterns) {
            const matches = content.match(pattern);
            if (matches && matches.length > 1) {
              duplicateCount += matches.length - 1;
            }
          }
        }
      }
      
      if (duplicateCount < 10) {
        this.passed++;
        log.success(`Code duplication: ${duplicateCount} potential duplicates (Low)`);
      } else if (duplicateCount < 50) {
        this.warn('Code duplication', `${duplicateCount} potential duplicates (Moderate)`);
      } else {
        this.issues.push({ title: 'High code duplication', issue: `${duplicateCount} potential duplicates (Should refactor)` });
      }

    } catch (error) {
      this.warn('Could not analyze code quality', error.message);
    }
  }

  analyzeDependencies() {
    try {
      const packageJson = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf8'));
      
      const dependencies = Object.keys(packageJson.dependencies || {});
      const devDependencies = Object.keys(packageJson.devDependencies || {});
      const totalDeps = dependencies.length + devDependencies.length;
      
      this.metrics.dependencies = totalDeps;
      
      if (totalDeps < 50) {
        this.passed++;
        log.success(`Dependencies: ${totalDeps} (Lightweight)`);
      } else if (totalDeps < 100) {
        this.passed++;
        log.success(`Dependencies: ${totalDeps} (Moderate)`);
      } else if (totalDeps < 200) {
        this.warn('Dependencies', `${totalDeps} (Heavy - consider optimization)`);
      } else {
        this.issues.push({ title: 'Too many dependencies', issue: `${totalDeps} dependencies (Should reduce)` });
      }

      // Check for large dependencies
      const largeDeps = [
        'lodash', 'moment', 'date-fns', 'react', 'react-dom', '@supabase/supabase-js'
      ];
      
      let foundLargeDeps = [];
      for (const dep of largeDeps) {
        if (dependencies.includes(dep) || devDependencies.includes(dep)) {
          foundLargeDeps.push(dep);
        }
      }
      
      if (foundLargeDeps.length > 0) {
        this.warn('Large dependencies detected', `${foundLargeDeps.join(', ')}`);
      } else {
        this.passed++;
        log.success('No excessively large dependencies found');
      }

      // Check for unused dependencies
      try {
        const depcheck = execSync('npx depcheck --json', { stdio: 'pipe' });
        const depcheckResult = JSON.parse(depcheck);
        
        if (depcheckResult.dependencies.length > 0) {
          this.warn('Unused dependencies', `${depcheckResult.dependencies.join(', ')}`);
        } else {
          this.passed++;
          log.success('No unused dependencies found');
        }
      } catch (error) {
        // depcheck returns non-zero when unused deps are found
        this.warn('Could not check for unused dependencies', 'Install depcheck: npm install -g depcheck');
      }

    } catch (error) {
      this.warn('Could not analyze dependencies', error.message);
    }
  }

  generatePerformanceReport() {
    log.header('\n⚡ Performance Test Report');
    
    const score = Math.round((this.passed / this.total) * 100);
    const status = score >= 90 ? 'EXCELLENT' : score >= 70 ? 'GOOD' : 'NEEDS IMPROVEMENT';
    
    console.log(`\n${colors.bright}Performance Score: ${score}%${colors.reset}`);
    console.log(`${colors.bright}Status: ${status}${colors.reset}`);
    console.log(`\n${this.passed}/${this.total} performance checks passed`);
    
    // Display metrics
    if (Object.keys(this.metrics).length > 0) {
      log.section('\n📊 Performance Metrics:');
      if (this.metrics.bundleSize) {
        console.log(`Bundle Size: ${this.metrics.bundleSize.toFixed(1)}MB`);
      }
      if (this.metrics.buildTime) {
        console.log(`Build Time: ${this.metrics.buildTime.toFixed(1)}s`);
      }
      if (this.metrics.linesOfCode) {
        console.log(`Lines of Code: ${this.metrics.linesOfCode.toLocaleString()}`);
      }
      if (this.metrics.dependencies) {
        console.log(`Dependencies: ${this.metrics.dependencies}`);
      }
    }
    
    if (this.issues.length > 0) {
      log.section('\n❌ Performance Issues (Must Fix):');
      this.issues.forEach(({ title, issue }) => {
        log.error(`${title}: ${issue}`);
      });
    }
    
    if (this.warnings.length > 0) {
      log.section('\n⚠️  Performance Warnings (Should Address):');
      this.warnings.forEach(({ title, message }) => {
        log.warning(`${title}: ${message}`);
      });
    }
    
    if (this.issues.length === 0 && this.warnings.length === 0) {
      log.success('\n🎉 Excellent performance! Your application is optimized for production.');
    } else if (this.issues.length === 0) {
      log.success('\n✅ Good performance. Address warnings for optimal performance.');
    } else {
      log.error('\n🚨 Performance issues found. Please address critical issues before deployment.');
    }
    
    // Performance recommendations
    log.section('\n💡 Performance Recommendations:');
    console.log('• Use code splitting for large components');
    console.log('• Implement lazy loading for routes');
    console.log('• Optimize images and assets');
    console.log('• Use production builds with minification');
    console.log('• Consider using a CDN for static assets');
    console.log('• Monitor Core Web Vitals in production');
    
    console.log(`\n${colors.cyan}For detailed performance optimization, see: docs/performance-optimization.md${colors.reset}`);
  }
}

// Run the performance tests
const tester = new PerformanceTester();
tester.runPerformanceTests().catch(error => {
  log.error(`Performance test failed: ${error.message}`);
  process.exit(1);
});
