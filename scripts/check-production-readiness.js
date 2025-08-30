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

class ProductionReadinessChecker {
  constructor() {
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

  async runAllChecks() {
    log.header('🚀 Production Readiness Check');
    log.info('Starting comprehensive production readiness validation...\n');

    // Environment Configuration
    log.section('Environment Configuration');
    this.checkEnvironmentVariables();
    this.checkBuildConfiguration();

    // Security Checks
    log.section('Security Configuration');
    this.checkSecuritySettings();
    this.checkDependencies();

    // Performance Checks
    log.section('Performance & Optimization');
    await this.checkPerformanceOptimizations();

    // Database Checks
    log.section('Database & Backend');
    await this.checkDatabaseConfiguration();

    // Testing & Quality
    log.section('Testing & Quality Assurance');
    this.checkTestCoverage();
    this.checkCodeQuality();

    // Documentation
    log.section('Documentation');
    this.checkDocumentation();

    // Final Report
    this.generateReport();
  }

  checkEnvironmentVariables() {
    const envFile = join(__dirname, '..', '.env.local');
    const envExample = join(__dirname, '..', '.env.example');

    this.check(
      'Environment file exists',
      () => existsSync(envFile) || existsSync('.env') || 'No .env file found'
    );

    if (existsSync(envFile)) {
      const envContent = readFileSync(envFile, 'utf8');
      
      this.check(
        'Production environment set',
        () => envContent.includes('VITE_ENVIRONMENT=production') || 'VITE_ENVIRONMENT not set to production'
      );

      this.check(
        'Debug mode disabled',
        () => !envContent.includes('VITE_DEBUG_MODE=true') || 'Debug mode should be disabled in production'
      );

      this.check(
        'Mock data disabled',
        () => !envContent.includes('VITE_USE_MOCK_DATA=true') || 'Mock data should be disabled in production'
      );

      this.check(
        'Log level set to error',
        () => envContent.includes('VITE_LOG_LEVEL=error') || 'Log level should be set to error for production'
      );

      this.check(
        'App domain configured',
        () => envContent.includes('VITE_APP_DOMAIN=') && !envContent.includes('VITE_APP_DOMAIN=localhost') || 'Production domain not configured'
      );

      this.check(
        'Support email configured',
        () => envContent.includes('VITE_SUPPORT_EMAIL=') || 'Support email not configured'
      );
    }
  }

  checkBuildConfiguration() {
    const packageJson = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf8'));
    const viteConfig = join(__dirname, '..', 'vite.config.ts');

    this.check(
      'Build script exists',
      () => packageJson.scripts.build && packageJson.scripts.build.includes('vite build') || 'Build script not found in package.json'
    );

    this.check(
      'Vite config exists',
      () => existsSync(viteConfig) || 'vite.config.ts not found'
    );

    if (existsSync(viteConfig)) {
      const viteContent = readFileSync(viteConfig, 'utf8');
      
      this.check(
        'Source maps configured for production',
        () => viteContent.includes('sourcemap') || 'Source maps not configured for error tracking'
      );

      this.check(
        'Build optimization enabled',
        () => viteContent.includes('minify') || 'Build minification not configured'
      );
    }
  }

  checkSecuritySettings() {
    const envFile = existsSync(join(__dirname, '..', '.env.local')) ? 
      readFileSync(join(__dirname, '..', '.env.local'), 'utf8') : '';
    const htmlFile = join(__dirname, '..', 'index.html');
    const htmlContent = existsSync(htmlFile) ? readFileSync(htmlFile, 'utf8') : '';

    this.check(
      'CSP enabled',
      () => envFile.includes('VITE_ENABLE_CSP=true') || htmlContent.includes('Content-Security-Policy') || 'Content Security Policy not enabled'
    );

    this.check(
      'HSTS enabled',
      () => envFile.includes('VITE_ENABLE_HSTS=true') || htmlContent.includes('Strict-Transport-Security') || 'HTTP Strict Transport Security not enabled'
    );

    this.check(
      'XSS protection enabled',
      () => envFile.includes('VITE_ENABLE_XSS_PROTECTION=true') || htmlContent.includes('X-XSS-Protection') || 'XSS protection not enabled'
    );

    this.check(
      'Error reporting enabled',
      () => envFile.includes('VITE_ENABLE_ERROR_REPORTING=true') || htmlContent.includes('error') && htmlContent.includes('gtag') || 'Error reporting not enabled for monitoring'
    );

    // Check for hardcoded secrets
    const srcDir = join(__dirname, '..', 'src');
    this.checkForHardcodedSecrets(srcDir);
  }

  checkForHardcodedSecrets(dir) {
    try {
      const files = execSync(`find ${dir} -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx"`, { encoding: 'utf8' });
      const fileList = files.split('\n').filter(f => f.trim());
      
      let hasSecrets = false;
      for (const file of fileList) {
        if (existsSync(file)) {
          const content = readFileSync(file, 'utf8');
          const secretPatterns = [
            /api[_-]?key\s*[:=]\s*['"][^'"]{20,}['"]/i,
            /secret\s*[:=]\s*['"][^'"]{10,}['"]/i,
            /password\s*[:=]\s*['"][^'"]{8,}['"]/i,
            /token\s*[:=]\s*['"][^'"]{20,}['"]/i
          ];
          
          for (const pattern of secretPatterns) {
            if (pattern.test(content)) {
              hasSecrets = true;
              this.warn('Potential hardcoded secret found', `Check file: ${file}`);
            }
          }
        }
      }
      
      if (!hasSecrets) {
        this.passed++;
        log.success('No hardcoded secrets found');
      }
    } catch (error) {
      this.warn('Could not check for hardcoded secrets', error.message);
    }
  }

  checkDependencies() {
    try {
      const packageJson = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf8'));
      
      this.check(
        'Dependencies have no critical vulnerabilities',
        () => {
          try {
            execSync('npm audit --audit-level=high', { stdio: 'pipe' });
            return true;
          } catch (error) {
            return 'Critical vulnerabilities found in dependencies';
          }
        }
      );

      // Check for outdated dependencies
      try {
        const outdated = execSync('npm outdated --json', { stdio: 'pipe' });
        const outdatedDeps = JSON.parse(outdated);
        if (Object.keys(outdatedDeps).length > 0) {
          this.warn('Outdated dependencies found', `${Object.keys(outdatedDeps).length} packages have updates available`);
        } else {
          this.passed++;
          log.success('All dependencies are up to date');
        }
      } catch (error) {
        // npm outdated returns non-zero when there are outdated packages
        this.warn('Could not check for outdated dependencies', error.message);
      }
    } catch (error) {
      this.issues.push({ title: 'Dependency check failed', issue: error.message });
    }
  }

  async checkPerformanceOptimizations() {
    const packageJson = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf8'));
    const viteConfig = join(__dirname, '..', 'vite.config.ts');

    this.check(
      'Code splitting configured',
      () => {
        if (existsSync(viteConfig)) {
          const content = readFileSync(viteConfig, 'utf8');
          return content.includes('rollupOptions') || 'Code splitting not configured';
        }
        return 'Vite config not found';
      }
    );

    this.check(
      'Bundle analyzer available',
      () => packageJson.scripts['build:analyze'] && packageJson.scripts['build:analyze'].includes('vite-bundle-analyzer') || 'Bundle analyzer script not available'
    );

    // Check if build directory exists and analyze size
    const distDir = join(__dirname, '..', 'dist');
    if (existsSync(distDir)) {
      try {
        const size = execSync(`du -sh ${distDir}`, { encoding: 'utf8' });
        const sizeInMB = parseInt(size.split('\t')[0].replace('M', ''));
        
        if (sizeInMB < 10) {
          this.passed++;
          log.success(`Bundle size: ${size.trim()} (Good)`);
        } else if (sizeInMB < 20) {
          this.warn('Bundle size', `${size.trim()} (Consider optimization)`);
        } else {
          this.issues.push({ title: 'Bundle size too large', issue: `${size.trim()} (Should be under 10MB)` });
        }
      } catch (error) {
        this.warn('Could not check bundle size', error.message);
      }
    }
  }

  async checkDatabaseConfiguration() {
    const supabaseConfig = join(__dirname, '..', 'supabase', 'config.toml');
    
    this.check(
      'Supabase config exists',
      () => existsSync(supabaseConfig) || 'Supabase configuration not found'
    );

    if (existsSync(supabaseConfig)) {
      const config = readFileSync(supabaseConfig, 'utf8');
      
      this.check(
        'Database port configured',
        () => config.includes('port = 54322') || 'Database port not configured'
      );

      this.check(
        'API enabled',
        () => config.includes('enabled = true') || 'API not enabled in Supabase config'
      );
    }

    // Check for migrations
    const migrationsDir = join(__dirname, '..', 'supabase', 'migrations');
    this.check(
      'Migrations directory exists',
      () => existsSync(migrationsDir) || 'Migrations directory not found'
    );

    if (existsSync(migrationsDir)) {
      try {
        const migrations = execSync(`ls ${migrationsDir}/*.sql`, { encoding: 'utf8' });
        const migrationCount = migrations.split('\n').filter(f => f.trim()).length;
        
        if (migrationCount > 0) {
          this.passed++;
          log.success(`${migrationCount} database migrations found`);
        } else {
          this.warn('No database migrations found', 'Consider creating initial migration');
        }
      } catch (error) {
        this.warn('Could not check migrations', error.message);
      }
    }
  }

  checkTestCoverage() {
    const packageJson = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf8'));
    
    this.check(
      'Test scripts configured',
      () => packageJson.scripts.test && packageJson.scripts.test.includes('vitest') || 'Test script not found'
    );

    this.check(
      'Test coverage script available',
      () => packageJson.scripts['test:coverage'] && packageJson.scripts['test:coverage'].includes('--coverage') || 'Test coverage script not available'
    );

    // Check if tests exist
    const testDir = join(__dirname, '..', 'src');
    try {
      const testFiles = execSync(`find ${testDir} -name "*.test.*" -o -name "*.spec.*"`, { encoding: 'utf8' });
      const testCount = testFiles.split('\n').filter(f => f.trim()).length;
      
      if (testCount > 0) {
        this.passed++;
        log.success(`${testCount} test files found`);
      } else {
        this.warn('No test files found', 'Consider adding unit tests');
      }
    } catch (error) {
      this.warn('Could not check test files', error.message);
    }
  }

  checkCodeQuality() {
    const packageJson = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf8'));
    
    this.check(
      'ESLint configured',
      () => packageJson.scripts.lint && packageJson.scripts.lint.includes('eslint') || 'ESLint script not found'
    );

    // Check for TypeScript configuration
    const tsConfig = join(__dirname, '..', 'tsconfig.json');
    const tsConfigApp = join(__dirname, '..', 'tsconfig.app.json');
    this.check(
      'TypeScript config exists',
      () => existsSync(tsConfig) || 'TypeScript configuration not found'
    );

    if (existsSync(tsConfigApp)) {
      try {
        const tsConfigAppContent = JSON.parse(readFileSync(tsConfigApp, 'utf8'));
        
        this.check(
          'Strict mode enabled',
          () => tsConfigAppContent.compilerOptions?.strict === true || 'TypeScript strict mode not enabled'
        );

        this.check(
          'No implicit any',
          () => tsConfigAppContent.compilerOptions?.noImplicitAny === true || 'noImplicitAny not enabled'
        );
      } catch (error) {
        this.warn('Could not parse tsconfig.app.json', error.message);
      }
    } else if (existsSync(tsConfig)) {
      try {
        const tsConfigContent = JSON.parse(readFileSync(tsConfig, 'utf8'));
        
        this.check(
          'Strict mode enabled',
          () => tsConfigContent.compilerOptions?.strict === true || 'TypeScript strict mode not enabled'
        );

        this.check(
          'No implicit any',
          () => tsConfigContent.compilerOptions?.noImplicitAny === true || 'noImplicitAny not enabled'
        );
      } catch (error) {
        this.warn('Could not parse tsconfig.json', error.message);
      }
    }
  }

  checkDocumentation() {
    const docsDir = join(__dirname, '..', 'docs');
    const readme = join(__dirname, '..', 'README.md');
    
    this.check(
      'README exists',
      () => existsSync(readme) || 'README.md not found'
    );

    this.check(
      'Documentation directory exists',
      () => existsSync(docsDir) || 'Documentation directory not found'
    );

    if (existsSync(docsDir)) {
      try {
        const docFiles = execSync(`find ${docsDir} -name "*.md"`, { encoding: 'utf8' });
        const docCount = docFiles.split('\n').filter(f => f.trim()).length;
        
        if (docCount >= 5) {
          this.passed++;
          log.success(`${docCount} documentation files found`);
        } else {
          this.warn('Limited documentation', `Only ${docCount} documentation files found`);
        }
      } catch (error) {
        this.warn('Could not check documentation files', error.message);
      }
    }
  }

  generateReport() {
    log.header('\n📊 Production Readiness Report');
    
    const score = Math.round((this.passed / this.total) * 100);
    const status = score >= 90 ? 'READY' : score >= 70 ? 'NEARLY READY' : 'NOT READY';
    
    console.log(`\n${colors.bright}Overall Score: ${score}%${colors.reset}`);
    console.log(`${colors.bright}Status: ${status}${colors.reset}`);
    console.log(`\n${this.passed}/${this.total} checks passed`);
    
    if (this.issues.length > 0) {
      log.section('\n❌ Critical Issues (Must Fix):');
      this.issues.forEach(({ title, issue }) => {
        log.error(`${title}: ${issue}`);
      });
    }
    
    if (this.warnings.length > 0) {
      log.section('\n⚠️  Warnings (Should Address):');
      this.warnings.forEach(({ title, message }) => {
        log.warning(`${title}: ${message}`);
      });
    }
    
    if (this.issues.length === 0 && this.warnings.length === 0) {
      log.success('\n🎉 All checks passed! Your application is ready for production deployment.');
    } else if (this.issues.length === 0) {
      log.success('\n✅ No critical issues found. Address warnings for optimal production deployment.');
    } else {
      log.error('\n🚨 Critical issues found. Please fix all issues before deploying to production.');
      process.exit(1);
    }
    
    console.log(`\n${colors.cyan}For detailed deployment instructions, see: docs/production-readiness-checklist.md${colors.reset}`);
  }
}

// Run the checker
const checker = new ProductionReadinessChecker();
checker.runAllChecks().catch(error => {
  log.error(`Production readiness check failed: ${error.message}`);
  process.exit(1);
});
