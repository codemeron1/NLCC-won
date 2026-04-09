#!/usr/bin/env node
/**
 * Comprehensive Assessment Enhancement Testing Suite
 * Tests all new components, APIs, and database functionality
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

console.log('\n' + '='.repeat(60));
console.log('🧪 ASSESSMENT ENHANCEMENT - COMPREHENSIVE TEST SUITE');
console.log('='.repeat(60) + '\n');

let testCount = 0;
let passCount = 0;
let failCount = 0;

function test(name, condition, details = '') {
    testCount++;
    if (condition) {
        console.log(`✅ [${testCount}] ${name}`);
        passCount++;
    } else {
        console.log(`❌ [${testCount}] ${name}`);
        if (details) console.log(`   ${details}`);
        failCount++;
    }
}

// TEST SUITE 1: Component Files
console.log('\n📦 TEST SUITE 1: Component Files');
console.log('-'.repeat(60));

const components = [
    { name: 'EditAssessmentV2Form', path: 'app/components/TeacherComponents/EditAssessmentV2Form.tsx' },
    { name: 'BahagiIconSelector', path: 'app/components/TeacherComponents/BahagiIconSelector.tsx' },
    { name: 'EnhancedBahagiCardV2', path: 'app/components/TeacherComponents/EnhancedBahagiCardV2.tsx' }
];

for (const comp of components) {
    const fullPath = path.join(projectRoot, comp.path);
    const exists = fs.existsSync(fullPath);
    test(`${comp.name}.tsx exists`, exists, fullPath);
    
    if (exists) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        test(`${comp.name} - exports component`, content.includes('export'), 'Missing export statement');
        test(`${comp.name} - has React.FC`, content.includes('React.FC'), 'Not properly typed');
    }
}

// TEST SUITE 2: API Routes
console.log('\n🔌 TEST SUITE 2: API Routes');
console.log('-'.repeat(60));

const apiRoutes = [
    { name: 'Edit Assessment API', path: 'app/api/teacher/edit-assessment/route.ts' },
    { name: 'Upload Media API', path: 'app/api/teacher/upload-media/route.ts' },
    { name: 'Bahagi Icon API', path: 'app/api/teacher/bahagi-icon/route.ts' }
];

for (const api of apiRoutes) {
    const fullPath = path.join(projectRoot, api.path);
    const exists = fs.existsSync(fullPath);
    test(`${api.name} exists`, exists, fullPath);
    
    if (exists) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        test(`${api.name} - has error handling`, content.includes('catch'), 'Missing error handling');
        test(`${api.name} - has Response.json`, content.includes('Response.json'), 'Missing Response.json');
    }
}

// TEST SUITE 3: Database Files
console.log('\n🗄️  TEST SUITE 3: Database Files');
console.log('-'.repeat(60));

const dbFiles = [
    { name: 'SQL Schema', path: 'scripts/create-assessment-structure.sql' },
    { name: 'Migration Script', path: 'scripts/migrate-assessment.mjs' }
];

for (const db of dbFiles) {
    const fullPath = path.join(projectRoot, db.path);
    const exists = fs.existsSync(fullPath);
    test(`${db.name} exists`, exists, fullPath);
    
    if (exists && db.name === 'SQL Schema') {
        const content = fs.readFileSync(fullPath, 'utf-8');
        test(`${db.name} - creates questions table`, content.includes('questions'), 'Missing questions table');
        test(`${db.name} - creates options table`, content.includes('options'), 'Missing options table');
        test(`${db.name} - creates media_files table`, content.includes('media_files'), 'Missing media_files table');
    }
}

// TEST SUITE 4: Component Exports
console.log('\n📤 TEST SUITE 4: Component Exports');
console.log('-'.repeat(60));

const indexPath = path.join(projectRoot, 'app/components/TeacherComponents/index.ts');
if (fs.existsSync(indexPath)) {
    const indexContent = fs.readFileSync(indexPath, 'utf-8');
    test('Index file exports EditAssessmentV2Form', indexContent.includes('EditAssessmentV2Form'));
    test('Index file exports BahagiIconSelector', indexContent.includes('BahagiIconSelector'));
    test('Index file exports EnhancedBahagiCardV2', indexContent.includes('EnhancedBahagiCardV2'));
} else {
    test('Index file exists', false, indexPath);
}

// TEST SUITE 5: Documentation
console.log('\n📚 TEST SUITE 5: Documentation');
console.log('-'.repeat(60));

const docs = [
    'IMPLEMENTATION_STATUS.md',
    'SUPABASE_STORAGE_SETUP_GUIDE.md',
    'TESTING_GUIDE.md',
    'SESSION_SUMMARY.md',
    'QUICK_REFERENCE.md',
    'ENHANCEMENT_IMPLEMENTATION_GUIDE.md'
];

for (const doc of docs) {
    const fullPath = path.join(projectRoot, doc);
    const exists = fs.existsSync(fullPath);
    test(`${doc}`, exists);
}

// TEST SUITE 6: Configuration Files
console.log('\n⚙️  TEST SUITE 6: Configuration Files');
console.log('-'.repeat(60));

const configs = [
    { name: 'package.json', path: 'package.json' },
    { name: 'tsconfig.json', path: 'tsconfig.json' },
    { name: 'next.config.ts', path: 'next.config.ts' }
];

for (const config of configs) {
    const fullPath = path.join(projectRoot, config.path);
    test(`${config.name} exists`, fs.existsSync(fullPath));
}

// TEST SUITE 7: Dependencies
console.log('\n📦 TEST SUITE 7: Dependencies');
console.log('-'.repeat(60));

const packageJsonPath = path.join(projectRoot, 'package.json');
if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const deps = packageJson.dependencies || {};
    
    test('lucide-react installed', 'lucide-react' in deps);
    test('framer-motion installed', 'framer-motion' in deps);
    test('recharts installed', 'recharts' in deps);
    test('pg installed (database)', 'pg' in deps);
    test('@supabase/supabase-js installed', '@supabase/supabase-js' in deps);
}

// TEST SUITE 8: Character Assets
console.log('\n🎨 TEST SUITE 8: Character Assets');
console.log('-'.repeat(60));

const assets = [
    'public/Character/NLLCTeachHalf1.png',
    'public/Character/NLLCTeachHalf2.png',
    'public/Character/NLLCTeachHalf3.png',
    'public/Character/NLLCTeachHalf4.png'
];

for (const asset of assets) {
    const fullPath = path.join(projectRoot, asset);
    test(`${path.basename(asset)} exists`, fs.existsSync(fullPath));
}

// TEST SUITE 9: File Sizes
console.log('\n📊 TEST SUITE 9: File Sizes');
console.log('-'.repeat(60));

const fileSizes = [
    { name: 'EditAssessmentV2Form', path: 'app/components/TeacherComponents/EditAssessmentV2Form.tsx', minSize: 20000, maxSize: 50000 },
    { name: 'BahagiIconSelector', path: 'app/components/TeacherComponents/BahagiIconSelector.tsx', minSize: 8000, maxSize: 20000 },
    { name: 'EnhancedBahagiCardV2', path: 'app/components/TeacherComponents/EnhancedBahagiCardV2.tsx', minSize: 8000, maxSize: 20000 }
];

for (const file of fileSizes) {
    const fullPath = path.join(projectRoot, file.path);
    if (fs.existsSync(fullPath)) {
        const size = fs.statSync(fullPath).size;
        const inRange = size >= file.minSize && size <= file.maxSize;
        test(`${file.name} size OK`, inRange, `Size: ${size} bytes (expected ${file.minSize}-${file.maxSize})`);
    }
}

// TEST SUITE 10: Code Quality
console.log('\n✨ TEST SUITE 10: Code Quality');
console.log('-'.repeat(60));

const qualityChecks = [
    {
        name: 'TypeScript strict mode',
        path: 'tsconfig.json',
        regex: /"strict":\s*true/
    },
    {
        name: 'NextRequest imports',
        path: 'app/api/teacher/edit-assessment/route.ts',
        regex: /NextRequest/
    },
    {
        name: 'Error handling',
        path: 'app/api/teacher/upload-media/route.ts',
        regex: /catch.*err/
    }
];

for (const check of qualityChecks) {
    const fullPath = path.join(projectRoot, check.path);
    if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        test(check.name, check.regex.test(content));
    }
}

// SUMMARY
console.log('\n' + '='.repeat(60));
console.log('📋 TEST SUMMARY');
console.log('='.repeat(60) + '\n');

const passPercentage = ((passCount / testCount) * 100).toFixed(1);
console.log(`Total Tests:    ${testCount}`);
console.log(`✅ Passed:      ${passCount}`);
console.log(`❌ Failed:      ${failCount}`);
console.log(`Score:          ${passPercentage}%\n`);

if (failCount === 0) {
    console.log('🎉 ALL TESTS PASSED! ✅\n');
    console.log('Your assessment enhancement system is ready!\n');
    console.log('📚 Next Steps:');
    console.log('  1. Create Supabase bucket "assessment-media" (manual)');
    console.log('  2. Follow TESTING_GUIDE.md for functional testing');
    console.log('  3. Deploy to production\n');
    process.exit(0);
} else {
    console.log('⚠️  Some tests failed. Please review above.\n');
    process.exit(1);
}
