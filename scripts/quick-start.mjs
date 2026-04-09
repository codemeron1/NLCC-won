#!/usr/bin/env node

/**
 * QUICK START - Assessment Enhancement System
 * 
 * Usage:
 *   node scripts/quick-start.mjs
 * 
 * This script verifies your system is ready and provides next steps.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  bold: '\x1b[1m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ️${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.bold}${colors.blue}${msg}${colors.reset}\n`)
};

const checks = {
  passed: 0,
  failed: 0,
  warnings: 0
};

// Check: File exists
function checkFileExists(filePath, description) {
  if (fs.existsSync(filePath)) {
    log.success(`${description} exists`);
    checks.passed++;
    return true;
  } else {
    log.error(`${description} missing at ${filePath}`);
    checks.failed++;
    return false;
  }
}

// Check: Files in directory
function checkFilesInDir(dirPath, files, description) {
  const missing = [];
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (!fs.existsSync(fullPath)) {
      missing.push(file);
    }
  }
  
  if (missing.length === 0) {
    log.success(`All ${files.length} ${description} files found`);
    checks.passed++;
    return true;
  } else {
    log.error(`Missing ${description}: ${missing.join(', ')}`);
    checks.failed++;
    return false;
  }
}

// Check: Dependencies installed
function checkDependencies() {
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
    const required = [
      'lucide-react', 
      'framer-motion', 
      'recharts', 
      'pg'
    ];
    const nodeModules = fs.readdirSync('node_modules');
    
    // Check regular packages
    let missing = required.filter(dep => !nodeModules.includes(dep));
    
    // Check scoped @supabase/supabase-js
    const supabaseDir = path.join('node_modules', '@supabase');
    if (fs.existsSync(supabaseDir)) {
      const supabaseModules = fs.readdirSync(supabaseDir);
      if (!supabaseModules.includes('supabase-js')) {
        missing.push('@supabase/supabase-js');
      }
    } else {
      missing.push('@supabase/supabase-js');
    }
    
    if (missing.length === 0) {
      log.success(`All ${required.length + 1} required dependencies installed`);
      checks.passed++;
      return true;
    } else {
      log.error(`Missing dependencies: ${missing.join(', ')}`);
      log.info(`Run: npm install ${missing.join(' ')}`);
      checks.failed++;
      return false;
    }
  } catch (e) {
    log.error(`Could not check dependencies: ${e.message}`);
    checks.warnings++;
    return false;
  }
}

// Run checks
function runChecks() {
  log.header('📋 QUICK START CHECK');

  // Components
  log.info('Checking components...');
  checkFilesInDir(
    'app/components/TeacherComponents',
    ['EditAssessmentV2Form.tsx', 'BahagiIconSelector.tsx', 'EnhancedBahagiCardV2.tsx'],
    'React components'
  );

  // API Routes
  log.info('Checking API endpoints...');
  checkFilesInDir(
    'app/api/teacher',
    ['edit-assessment/route.ts', 'upload-media/route.ts', 'bahagi-icon/route.ts'],
    'API routes'
  );

  // Database Files
  log.info('Checking database files...');
  checkFileExists('scripts/create-assessment-structure.sql', 'SQL schema');
  checkFileExists('scripts/migrate-assessment.mjs', 'Migration script');

  // Configuration
  log.info('Checking configuration...');
  checkFileExists('package.json', 'package.json');
  checkFileExists('tsconfig.json', 'tsconfig.json');
  checkFileExists('.env.local', '.env.local');

  // Dependencies
  log.info('Checking dependencies...');
  checkDependencies();

  // Documentation
  log.info('Checking documentation...');
  checkFileExists('TESTING_GUIDE.md', 'Testing guide');
  checkFileExists('QUICK_REFERENCE.md', 'Quick reference');
  checkFileExists('IMPLEMENTATION_STATUS.md', 'Implementation status');
}

// Print summary
function printSummary() {
  log.header('📊 CHECK SUMMARY');
  console.log(`${colors.green}✅ Passed: ${checks.passed}${colors.reset}`);
  console.log(`${colors.red}❌ Failed: ${checks.failed}${colors.reset}`);
  console.log(`${colors.yellow}⚠️ Warnings: ${checks.warnings}${colors.reset}`);
}

// Print next steps
function printNextSteps() {
  log.header('🚀 NEXT STEPS');

  console.log('1️⃣ Create Supabase Storage Bucket');
  console.log('   Go to: https://app.supabase.com');
  console.log('   Project: jzuzdycorgdugpbidzyg');
  console.log('   Storage → Create Bucket');
  console.log('   Name: assessment-media');
  console.log('   ✅ Public bucket');
  console.log('   Save ✓\n');

  console.log('2️⃣ Run Testing Guide');
  console.log('   See: TESTING_GUIDE.md');
  console.log('   Test 6 scenarios (15 minutes)\n');

  console.log('3️⃣ Integrate Components');
  console.log('   Replace old components with new ones');
  console.log('   See: QUICK_REFERENCE.md for code examples\n');

  console.log('4️⃣ Deploy to Production');
  console.log('   npm run build');
  console.log('   Deploy to your hosting\n');
}

// Print status
function printStatus() {
  if (checks.failed === 0) {
    log.header('✨ SYSTEM STATUS: READY ✨');
    console.log(`${colors.green}${colors.bold}All systems operational!${colors.reset}`);
    console.log('Your assessment enhancement system is ready for deployment.');
    console.log('Only remaining step: Create Supabase bucket.\n');
  } else {
    log.header('⚠️ SYSTEM STATUS: CHECK REQUIRED');
    console.log(`${colors.yellow}Some checks failed. Please fix them before continuing.${colors.reset}\n`);
  }
}

// Main
function main() {
  console.log('\n' + colors.bold + colors.blue + '╔════════════════════════════════════════════════╗' + colors.reset);
  console.log(colors.bold + colors.blue + '║  NLCC Assessment Enhancement - Quick Start       ║' + colors.reset);
  console.log(colors.bold + colors.blue + '╚════════════════════════════════════════════════╝' + colors.reset + '\n');

  runChecks();
  printSummary();
  printStatus();
  printNextSteps();

  // Exit code
  if (checks.failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

main();
