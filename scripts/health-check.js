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

class HealthChecker {
  constructor() {
    this.checks = [];
    this.passed = 0;
    this.total = 0;
    this.startTime = Date.now();
  }

  async check(title, testFn) {
    this.total++;
    const checkStart = Date.now();
    
    try {
      const result = await testFn();
      const duration = Date.now() - checkStart;
      
      if (result === true) {
        this.passed++;
        log.success(`${title} (${duration}ms)`);
        this.checks.push({ title, status: 'passed', duration });
        return true;
      } else {
        log.error(`${title}: ${result}`);
        this.checks.push({ title, status: 'failed', error: result, duration });
        return false;
      }
    } catch (error) {
      const duration = Date.now() - checkStart;
      log.error(`${title}: ${error.message}`);
      this.checks.push({ title, status: 'failed', error: error.message, duration });
      return false;
    }
  }

  async runHealthChecks() {
    log.header('🏥 Application Health Check');
    log.info('Starting comprehensive health check...\n');

    // System Health
    log.section('System Health');
    await this.checkSystemHealth();

    // Database Health
    log.section('Database Health');
    await this.checkDatabaseHealth();

    // Application Health
    log.section('Application Health');
    await this.checkApplicationHealth();

    // Network Health
    log.section('Network Health');
    await this.checkNetworkHealth();

    // Final Report
    this.generateHealthReport();
  }

  async checkSystemHealth() {
    // Check Node.js version
    await this.check(
      'Node.js version',
      () => {
        const version = process.version;
        const major = parseInt(version.slice(1).split('.')[0]);
        if (major >= 18) {
          return true;
        }
        return `Node.js ${version} is outdated. Requires Node.js 18+`;
      }
    );

    // Check npm version
    await this.check(
      'npm version',
      () => {
        try {
          const version = execSync('npm --version', { encoding: 'utf8' }).trim();
          const major = parseInt(version.split('.')[0]);
          if (major >= 8) {
            return true;
          }
          return `npm ${version} is outdated. Requires npm 8+`;
        } catch (error) {
          return 'npm not found';
        }
      }
    );

    // Check available memory
    await this.check(
      'Available memory',
      () => {
        const memUsage = process.memoryUsage();
        const availableMB = Math.round(memUsage.heapUsed / 1024 / 1024);
        if (availableMB < 1000) {
          return true;
        }
        return `High memory usage: ${availableMB}MB`;
      }
    );

    // Check disk space
    await this.check(
      'Disk space',
      () => {
        try {
          const df = execSync('df -h .', { encoding: 'utf8' });
          const lines = df.split('\n');
          const usageLine = lines[1];
          const usage = parseInt(usageLine.split(/\s+/)[4].replace('%', ''));
          if (usage < 90) {
            return true;
          }
          return `Disk usage high: ${usage}%`;
        } catch (error) {
          return 'Could not check disk space';
        }
      }
    );
  }

  async checkDatabaseHealth() {
    const supabaseConfig = join(__dirname, '..', 'supabase', 'config.toml');
    
    // Check Supabase configuration
    await this.check(
      'Supabase config exists',
      () => {
        if (existsSync(supabaseConfig)) {
          return true;
        }
        return 'Supabase configuration not found';
      }
    );

    // Check if Supabase is running
    await this.check(
      'Supabase local instance',
      () => {
        try {
          const status = execSync('supabase status', { encoding: 'utf8' });
          if (status.includes('API URL: http://127.0.0.1:54321')) {
            return true;
          }
          return 'Supabase local instance not running';
        } catch (error) {
          return 'Supabase CLI not available or instance not running';
        }
      }
    );

    // Check database connection
    await this.check(
      'Database connection',
      () => {
        try {
          const ping = execSync('supabase db ping', { encoding: 'utf8' });
          if (ping.includes('Connected')) {
            return true;
          }
          return 'Database connection failed';
        } catch (error) {
          return 'Could not connect to database';
        }
      }
    );

    // Check migrations status
    await this.check(
      'Database migrations',
      () => {
        try {
          const migrations = execSync('supabase migration list', { encoding: 'utf8' });
          const migrationCount = migrations.split('\n').filter(line => line.includes('.sql')).length;
          if (migrationCount > 0) {
            return true;
          }
          return 'No migrations found';
        } catch (error) {
          return 'Could not check migrations';
        }
      }
    );
  }

  async checkApplicationHealth() {
    const packageJson = join(__dirname, '..', 'package.json');
    
    // Check package.json
    await this.check(
      'Package.json exists',
      () => {
        if (existsSync(packageJson)) {
          return true;
        }
        return 'package.json not found';
      }
    );

    // Check dependencies
    await this.check(
      'Dependencies installed',
      () => {
        const nodeModules = join(__dirname, '..', 'node_modules');
        if (existsSync(nodeModules)) {
          return true;
        }
        return 'node_modules not found. Run npm install';
      }
    );

    // Check build capability
    await this.check(
      'Build capability',
      () => {
        try {
          const pkg = JSON.parse(readFileSync(packageJson, 'utf8'));
          if (pkg.scripts && pkg.scripts.build) {
            return true;
          }
          return 'Build script not found in package.json';
        } catch (error) {
          return 'Could not read package.json';
        }
      }
    );

    // Check TypeScript configuration
    await this.check(
      'TypeScript config',
      () => {
        const tsConfig = join(__dirname, '..', 'tsconfig.json');
        if (existsSync(tsConfig)) {
          return true;
        }
        return 'tsconfig.json not found';
      }
    );

    // Check Vite configuration
    await this.check(
      'Vite config',
      () => {
        const viteConfig = join(__dirname, '..', 'vite.config.ts');
        if (existsSync(viteConfig)) {
          return true;
        }
        return 'vite.config.ts not found';
      }
    );
  }

  async checkNetworkHealth() {
    // Check internet connectivity
    await this.check(
      'Internet connectivity',
      () => {
        try {
          execSync('ping -c 1 8.8.8.8', { stdio: 'pipe' });
          return true;
        } catch (error) {
          return 'No internet connectivity';
        }
      }
    );

    // Check npm registry
    await this.check(
      'npm registry',
      () => {
        try {
          execSync('npm ping', { stdio: 'pipe' });
          return true;
        } catch (error) {
          return 'npm registry not accessible';
        }
      }
    );

    // Check if ports are available
    await this.check(
      'Port availability (3000)',
      () => {
        try {
          execSync('netstat -an | grep :3000', { stdio: 'pipe' });
          return 'Port 3000 is in use';
        } catch (error) {
          return true; // Port is available
        }
      }
    );

    await this.check(
      'Port availability (54321)',
      () => {
        try {
          execSync('netstat -an | grep :54321', { stdio: 'pipe' });
          return 'Port 54321 is in use';
        } catch (error) {
          return true; // Port is available
        }
      }
    );
  }

  generateHealthReport() {
    log.header('\n🏥 Health Check Report');
    
    const totalTime = Date.now() - this.startTime;
    const score = Math.round((this.passed / this.total) * 100);
    const status = score >= 90 ? 'HEALTHY' : score >= 70 ? 'WARNING' : 'CRITICAL';
    
    console.log(`\n${colors.bright}Health Score: ${score}%${colors.reset}`);
    console.log(`${colors.bright}Status: ${status}${colors.reset}`);
    console.log(`\n${this.passed}/${this.total} health checks passed`);
    console.log(`Total check time: ${totalTime}ms`);
    
    // Display check details
    if (this.checks.length > 0) {
      log.section('\n📋 Check Details:');
      this.checks.forEach(({ title, status, duration, error }) => {
        const statusIcon = status === 'passed' ? '✓' : '✗';
        const statusColor = status === 'passed' ? colors.green : colors.red;
        const durationText = duration ? ` (${duration}ms)` : '';
        
        if (status === 'passed') {
          console.log(`${statusColor}${statusIcon}${colors.reset} ${title}${durationText}`);
        } else {
          console.log(`${statusColor}${statusIcon}${colors.reset} ${title}${durationText} - ${error}`);
        }
      });
    }
    
    // Summary
    const failedChecks = this.checks.filter(c => c.status === 'failed');
    const passedChecks = this.checks.filter(c => c.status === 'passed');
    
    if (failedChecks.length === 0) {
      log.success('\n🎉 All health checks passed! Your application is healthy.');
    } else if (failedChecks.length <= 2) {
      log.warning(`\n⚠️  ${failedChecks.length} health check(s) failed. Review the issues above.`);
    } else {
      log.error(`\n🚨 ${failedChecks.length} health check(s) failed. Critical issues need attention.`);
    }
    
    // Recommendations
    if (failedChecks.length > 0) {
      log.section('\n💡 Recommendations:');
      
      failedChecks.forEach(({ title, error }) => {
        if (title.includes('Node.js')) {
          console.log('• Update Node.js to version 18 or higher');
        } else if (title.includes('npm')) {
          console.log('• Update npm to version 8 or higher');
        } else if (title.includes('Supabase')) {
          console.log('• Start Supabase local instance: supabase start');
        } else if (title.includes('Dependencies')) {
          console.log('• Install dependencies: npm install');
        } else if (title.includes('Port')) {
          console.log('• Stop other services using the required ports');
        } else if (title.includes('Internet')) {
          console.log('• Check your internet connection');
        }
      });
    }
    
    console.log(`\n${colors.cyan}For troubleshooting, see: docs/troubleshooting.md${colors.reset}`);
  }
}

// Run the health check
const checker = new HealthChecker();
checker.runHealthChecks().catch(error => {
  log.error(`Health check failed: ${error.message}`);
  process.exit(1);
});
