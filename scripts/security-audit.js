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

class SecurityAuditor {
  constructor() {
    this.vulnerabilities = [];
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
        this.vulnerabilities.push({ title, issue: result, severity: 'high' });
        log.error(`${title}: ${result}`);
        return false;
      }
    } catch (error) {
      this.vulnerabilities.push({ title, issue: error.message, severity: 'high' });
      log.error(`${title}: ${error.message}`);
      return false;
    }
  }

  warn(title, message) {
    this.warnings.push({ title, message });
    log.warning(`${title}: ${message}`);
  }

  async runSecurityAudit() {
    log.header('🔒 Security Audit');
    log.info('Starting comprehensive security vulnerability assessment...\n');

    // Dependency Security
    log.section('Dependency Security');
    this.checkDependencyVulnerabilities();

    // Code Security
    log.section('Code Security');
    this.checkCodeVulnerabilities();

    // Configuration Security
    log.section('Configuration Security');
    this.checkConfigurationSecurity();

    // Authentication Security
    log.section('Authentication Security');
    this.checkAuthenticationSecurity();

    // Data Security
    log.section('Data Security');
    this.checkDataSecurity();

    // Network Security
    log.section('Network Security');
    this.checkNetworkSecurity();

    // Final Report
    this.generateSecurityReport();
  }

  checkDependencyVulnerabilities() {
    try {
      // Check for known vulnerabilities
      const auditResult = execSync('npm audit --json', { encoding: 'utf8' });
      const audit = JSON.parse(auditResult);
      
      if (audit.metadata.vulnerabilities.critical > 0) {
        this.vulnerabilities.push({
          title: 'Critical dependency vulnerabilities',
          issue: `${audit.metadata.vulnerabilities.critical} critical vulnerabilities found`,
          severity: 'critical'
        });
        log.error(`Critical vulnerabilities: ${audit.metadata.vulnerabilities.critical}`);
      } else {
        this.passed++;
        log.success('No critical dependency vulnerabilities found');
      }

      if (audit.metadata.vulnerabilities.high > 0) {
        this.warn('High dependency vulnerabilities', `${audit.metadata.vulnerabilities.high} high vulnerabilities found`);
      }

      if (audit.metadata.vulnerabilities.moderate > 0) {
        this.warn('Moderate dependency vulnerabilities', `${audit.metadata.vulnerabilities.moderate} moderate vulnerabilities found`);
      }

      // Check for outdated packages with known vulnerabilities
      try {
        const outdated = execSync('npm outdated --json', { stdio: 'pipe' });
        const outdatedDeps = JSON.parse(outdated);
        const outdatedCount = Object.keys(outdatedDeps).length;
        
        if (outdatedCount > 10) {
          this.warn('Many outdated dependencies', `${outdatedCount} packages are outdated`);
        } else if (outdatedCount > 0) {
          this.warn('Some outdated dependencies', `${outdatedCount} packages are outdated`);
        } else {
          this.passed++;
          log.success('All dependencies are up to date');
        }
      } catch (error) {
        // npm outdated returns non-zero when there are outdated packages
        this.warn('Could not check for outdated dependencies', error.message);
      }

    } catch (error) {
      this.vulnerabilities.push({
        title: 'Dependency audit failed',
        issue: error.message,
        severity: 'high'
      });
    }
  }

  checkCodeVulnerabilities() {
    const srcDir = join(__dirname, '..', 'src');
    
    // Check for hardcoded secrets
    this.checkForHardcodedSecrets(srcDir);
    
    // Check for XSS vulnerabilities
    this.checkForXSSVulnerabilities(srcDir);
    
    // Check for SQL injection patterns
    this.checkForSQLInjectionPatterns(srcDir);
    
    // Check for unsafe eval usage
    this.checkForUnsafeEval(srcDir);
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
            /token\s*[:=]\s*['"][^'"]{20,}['"]/i,
            /private[_-]?key\s*[:=]\s*['"][^'"]{20,}['"]/i
          ];
          
          for (const pattern of secretPatterns) {
            if (pattern.test(content)) {
              hasSecrets = true;
              this.vulnerabilities.push({
                title: 'Hardcoded secret found',
                issue: `Potential secret in file: ${file}`,
                severity: 'critical'
              });
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

  checkForXSSVulnerabilities(dir) {
    try {
      const files = execSync(`find ${dir} -name "*.tsx" -o -name "*.jsx"`, { encoding: 'utf8' });
      const fileList = files.split('\n').filter(f => f.trim());
      
      let hasXSS = false;
      for (const file of fileList) {
        if (existsSync(file)) {
          const content = readFileSync(file, 'utf8');
          const xssPatterns = [
            /dangerouslySetInnerHTML\s*[:=]\s*\{[^}]*\}/g,
            /innerHTML\s*[:=]\s*[^;]+/g,
            /document\.write\s*\(/g,
            /eval\s*\(/g
          ];
          
          for (const pattern of xssPatterns) {
            if (pattern.test(content)) {
              hasXSS = true;
              this.warn('Potential XSS vulnerability', `Check file: ${file}`);
            }
          }
        }
      }
      
      if (!hasXSS) {
        this.passed++;
        log.success('No obvious XSS vulnerabilities found');
      }
    } catch (error) {
      this.warn('Could not check for XSS vulnerabilities', error.message);
    }
  }

  checkForSQLInjectionPatterns(dir) {
    try {
      const files = execSync(`find ${dir} -name "*.ts" -o -name "*.js"`, { encoding: 'utf8' });
      const fileList = files.split('\n').filter(f => f.trim());
      
      let hasSQLInjection = false;
      for (const file of fileList) {
        if (existsSync(file)) {
          const content = readFileSync(file, 'utf8');
          const sqlPatterns = [
            /SELECT.*\+.*\$/g,
            /INSERT.*\+.*\$/g,
            /UPDATE.*\+.*\$/g,
            /DELETE.*\+.*\$/g
          ];
          
          for (const pattern of sqlPatterns) {
            if (pattern.test(content)) {
              hasSQLInjection = true;
              this.warn('Potential SQL injection pattern', `Check file: ${file}`);
            }
          }
        }
      }
      
      if (!hasSQLInjection) {
        this.passed++;
        log.success('No obvious SQL injection patterns found');
      }
    } catch (error) {
      this.warn('Could not check for SQL injection patterns', error.message);
    }
  }

  checkForUnsafeEval(dir) {
    try {
      const files = execSync(`find ${dir} -name "*.ts" -o -name "*.js"`, { encoding: 'utf8' });
      const fileList = files.split('\n').filter(f => f.trim());
      
      let hasUnsafeEval = false;
      for (const file of fileList) {
        if (existsSync(file)) {
          const content = readFileSync(file, 'utf8');
          if (content.includes('eval(') || content.includes('Function(')) {
            hasUnsafeEval = true;
            this.vulnerabilities.push({
              title: 'Unsafe eval usage',
              issue: `eval() or Function() found in file: ${file}`,
              severity: 'high'
            });
          }
        }
      }
      
      if (!hasUnsafeEval) {
        this.passed++;
        log.success('No unsafe eval usage found');
      }
    } catch (error) {
      this.warn('Could not check for unsafe eval usage', error.message);
    }
  }

  checkConfigurationSecurity() {
    const envFile = join(__dirname, '..', '.env.local');
    
    if (existsSync(envFile)) {
      const envContent = readFileSync(envFile, 'utf8');
      
      this.check(
        'Debug mode disabled in production',
        () => !envContent.includes('VITE_DEBUG_MODE=true') || 'Debug mode should be disabled in production'
      );

      this.check(
        'Mock data disabled in production',
        () => !envContent.includes('VITE_USE_MOCK_DATA=true') || 'Mock data should be disabled in production'
      );

      this.check(
        'CSP enabled',
        () => envContent.includes('VITE_ENABLE_CSP=true') || 'Content Security Policy not enabled'
      );

      this.check(
        'HSTS enabled',
        () => envContent.includes('VITE_ENABLE_HSTS=true') || 'HTTP Strict Transport Security not enabled'
      );

      this.check(
        'XSS protection enabled',
        () => envContent.includes('VITE_ENABLE_XSS_PROTECTION=true') || 'XSS protection not enabled'
      );

      // Check for weak passwords in config
      if (envContent.includes('password') && envContent.includes('123')) {
        this.vulnerabilities.push({
          title: 'Weak password in configuration',
          issue: 'Weak password pattern detected in environment file',
          severity: 'high'
        });
      }
    } else {
      this.warn('No environment file found', 'Consider creating .env.local for configuration');
    }
  }

  checkAuthenticationSecurity() {
    const srcDir = join(__dirname, '..', 'src');
    
    try {
      const authFiles = execSync(`find ${srcDir} -name "*auth*" -o -name "*login*"`, { encoding: 'utf8' });
      const authFileList = authFiles.split('\n').filter(f => f.trim());
      
      if (authFileList.length > 0) {
        this.passed++;
        log.success('Authentication files found');
        
        // Check for rate limiting in auth
        let hasRateLimiting = false;
        for (const file of authFileList) {
          if (existsSync(file)) {
            const content = readFileSync(file, 'utf8');
            if (content.includes('rate') && content.includes('limit')) {
              hasRateLimiting = true;
              break;
            }
          }
        }
        
        if (hasRateLimiting) {
          this.passed++;
          log.success('Rate limiting found in authentication');
        } else {
          this.warn('No rate limiting found', 'Consider implementing rate limiting for authentication');
        }
      } else {
        this.warn('No authentication files found', 'Check if authentication is properly implemented');
      }
    } catch (error) {
      this.warn('Could not check authentication security', error.message);
    }
  }

  checkDataSecurity() {
    const srcDir = join(__dirname, '..', 'src');
    
    try {
      const files = execSync(`find ${srcDir} -name "*.ts" -o -name "*.tsx"`, { encoding: 'utf8' });
      const fileList = files.split('\n').filter(f => f.trim());
      
      let hasInputValidation = false;
      let hasDataSanitization = false;
      
      for (const file of fileList) {
        if (existsSync(file)) {
          const content = readFileSync(file, 'utf8');
          
          if (content.includes('validate') || content.includes('validation')) {
            hasInputValidation = true;
          }
          
          if (content.includes('sanitize') || content.includes('DOMPurify')) {
            hasDataSanitization = true;
          }
        }
      }
      
      if (hasInputValidation) {
        this.passed++;
        log.success('Input validation found');
      } else {
        this.warn('No input validation found', 'Consider implementing input validation');
      }
      
      if (hasDataSanitization) {
        this.passed++;
        log.success('Data sanitization found');
      } else {
        this.warn('No data sanitization found', 'Consider implementing data sanitization');
      }
    } catch (error) {
      this.warn('Could not check data security', error.message);
    }
  }

  checkNetworkSecurity() {
    const envFile = join(__dirname, '..', '.env.local');
    
    if (existsSync(envFile)) {
      const envContent = readFileSync(envFile, 'utf8');
      
      this.check(
        'HTTPS enforced',
        () => envContent.includes('https://') || 'HTTPS should be enforced in production'
      );

      this.check(
        'Secure headers enabled',
        () => envContent.includes('VITE_ENABLE_CSP=true') && envContent.includes('VITE_ENABLE_HSTS=true') || 'Secure headers not fully enabled'
      );
    }
    
    // Check for CORS configuration
    const viteConfig = join(__dirname, '..', 'vite.config.ts');
    if (existsSync(viteConfig)) {
      const viteContent = readFileSync(viteConfig, 'utf8');
      
      if (viteContent.includes('cors')) {
        this.passed++;
        log.success('CORS configuration found');
      } else {
        this.warn('No CORS configuration found', 'Consider configuring CORS for security');
      }
    }
  }

  generateSecurityReport() {
    log.header('\n🔒 Security Audit Report');
    
    const score = Math.round((this.passed / this.total) * 100);
    const status = score >= 90 ? 'SECURE' : score >= 70 ? 'MODERATE' : 'VULNERABLE';
    
    console.log(`\n${colors.bright}Security Score: ${score}%${colors.reset}`);
    console.log(`${colors.bright}Status: ${status}${colors.reset}`);
    console.log(`\n${this.passed}/${this.total} security checks passed`);
    
    if (this.vulnerabilities.length > 0) {
      log.section('\n🚨 Critical Vulnerabilities (Must Fix):');
      this.vulnerabilities.forEach(({ title, issue, severity }) => {
        const severityColor = severity === 'critical' ? colors.red : colors.yellow;
        console.log(`${severityColor}${severity.toUpperCase()}${colors.reset}: ${title}: ${issue}`);
      });
    }
    
    if (this.warnings.length > 0) {
      log.section('\n⚠️  Security Warnings (Should Address):');
      this.warnings.forEach(({ title, message }) => {
        log.warning(`${title}: ${message}`);
      });
    }
    
    if (this.vulnerabilities.length === 0 && this.warnings.length === 0) {
      log.success('\n🎉 No security vulnerabilities found! Your application is secure.');
    } else if (this.vulnerabilities.length === 0) {
      log.success('\n✅ No critical vulnerabilities found. Address warnings for better security.');
    } else {
      log.error('\n🚨 Critical vulnerabilities found. Please fix all vulnerabilities before deployment.');
      process.exit(1);
    }
    
    console.log(`\n${colors.cyan}For security best practices, see: docs/security-monitoring.md${colors.reset}`);
  }
}

// Run the security audit
const auditor = new SecurityAuditor();
auditor.runSecurityAudit().catch(error => {
  log.error(`Security audit failed: ${error.message}`);
  process.exit(1);
});
