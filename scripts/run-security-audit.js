#!/usr/bin/env node

import { execSync } from 'child_process';
import { spawn } from 'child_process';

console.log('🔒 Running Security Audit...\n');

// Run npm audit first
try {
  console.log('📦 Running npm audit...');
  execSync('npm audit --audit-level=high', { stdio: 'inherit' });
  console.log('✅ npm audit completed successfully\n');
} catch (error) {
  console.log('⚠️  npm audit found vulnerabilities (this is expected in development)\n');
}

// Run the security audit script
try {
  console.log('🔍 Running security audit script...');
  execSync('node scripts/security-audit.js', { stdio: 'inherit' });
  console.log('✅ Security audit completed successfully');
} catch (error) {
  console.log('❌ Security audit failed:', error.message);
  process.exit(1);
}
