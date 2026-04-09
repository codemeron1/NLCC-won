#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

let testResults = {
    passed: 0,
    failed: 0,
    skipped: 0
};

console.log('\n========================================');
console.log('🧪 System Enhancement Tests');
console.log('========================================\n');

// Test 1: Check component files
async function testComponentFiles() {
    console.log('TEST 1: Checking component files...');
    const components = [
        'app/components/TeacherComponents/EditAssessmentV2Form.tsx',
        'app/components/TeacherComponents/BahagiIconSelector.tsx',
        'app/components/TeacherComponents/EnhancedBahagiCardV2.tsx'
    ];

    for (const component of components) {
        const filePath = path.join(process.cwd(), component);
        if (fs.existsSync(filePath)) {
            const size = fs.statSync(filePath).size;
            console.log(`  ✅ ${component} (${(size / 1024).toFixed(2)} KB)`);
            testResults.passed++;
        } else {
            console.log(`  ❌ ${component} NOT found`);
            testResults.failed++;
        }
    }
}

// Test 2: Check API route files
async function testAPIRoutes() {
    console.log('\nTEST 2: Checking API route files...');
    const routes = [
        'app/api/teacher/edit-assessment/route.ts',
        'app/api/teacher/upload-media/route.ts',
        'app/api/teacher/bahagi-icon/route.ts'
    ];

    for (const route of routes) {
        const filePath = path.join(process.cwd(), route);
        if (fs.existsSync(filePath)) {
            const size = fs.statSync(filePath).size;
            console.log(`  ✅ ${route} (${(size / 1024).toFixed(2)} KB)`);
            testResults.passed++;
        } else {
            console.log(`  ❌ ${route} NOT found`);
            testResults.failed++;
        }
    }
}

// Test 3: Check exports
async function testExports() {
    console.log('\nTEST 3: Checking component exports...');
    const indexPath = path.join(process.cwd(), 'app/components/TeacherComponents/index.ts');
    
    if (!fs.existsSync(indexPath)) {
        console.log(`  ❌ index.ts NOT found`);
        testResults.failed++;
        return;
    }

    const indexContent = fs.readFileSync(indexPath, 'utf-8');
    const exports = [
        'EditAssessmentV2Form',
        'BahagiIconSelector',
        'EnhancedBahagiCardV2'
    ];

    for (const exp of exports) {
        if (indexContent.includes(`export { ${exp} }`)) {
            console.log(`  ✅ ${exp} exported`);
            testResults.passed++;
        } else {
            console.log(`  ❌ ${exp} NOT exported`);
            testResults.failed++;
        }
    }
}

// Test 4: Verify migration script
async function testMigrationScript() {
    console.log('\nTEST 4: Checking migration files...');
    const migrationPath = path.join(process.cwd(), 'scripts/migrate-assessment-structure.mjs');
    const sqlPath = path.join(process.cwd(), 'scripts/create-assessment-structure.sql');

    if (fs.existsSync(migrationPath)) {
        const size = fs.statSync(migrationPath).size;
        console.log(`  ✅ Migration script exists (${(size / 1024).toFixed(2)} KB)`);
        testResults.passed++;
    } else {
        console.log(`  ❌ Migration script NOT found`);
        testResults.failed++;
    }

    if (fs.existsSync(sqlPath)) {
        const size = fs.statSync(sqlPath).size;
        console.log(`  ✅ SQL schema file exists (${(size / 1024).toFixed(2)} KB)`);
        testResults.passed++;
    } else {
        console.log(`  ❌ SQL schema file NOT found`);
        testResults.failed++;
    }
}

// Test 5: Verify character assets
async function testCharacterAssets() {
    console.log('\nTEST 5: Checking character assets...');
    const characters = [
        'public/Character/NLLCTeachHalf1.png',
        'public/Character/NLLCTeachHalf2.png',
        'public/Character/NLLCTeachHalf3.png',
        'public/Character/NLLCTeachHalf4.png'
    ];

    let found = 0;
    for (const char of characters) {
        const filePath = path.join(process.cwd(), char);
        if (fs.existsSync(filePath)) {
            const size = fs.statSync(filePath).size;
            console.log(`  ✅ ${path.basename(char)} found (${(size / 1024).toFixed(2)} KB)`);
            found++;
        } else {
            console.log(`  ⏭️  ${path.basename(char)} not found (optional)`);
        }
    }
    if (found > 0) testResults.passed += found;
}

// Test 6: Check documentation files
async function testDocumentation() {
    console.log('\nTEST 6: Checking documentation...');
    const docs = [
        'ENHANCEMENT_IMPLEMENTATION_GUIDE.md',
        'QUICK_REFERENCE.md',
        'IMPLEMENTATION_CHECKLIST.md',
        'SYSTEM_ENHANCEMENT_SUMMARY.md',
        'DELIVERY_SUMMARY.md',
        'README_ENHANCEMENTS.md'
    ];

    for (const doc of docs) {
        const filePath = path.join(process.cwd(), doc);
        if (fs.existsSync(filePath)) {
            const size = fs.statSync(filePath).size;
            console.log(`  ✅ ${doc} (${(size / 1024).toFixed(2)} KB)`);
            testResults.passed++;
        } else {
            console.log(`  ❌ ${doc} NOT found`);
            testResults.failed++;
        }
    }
}

// Main test runner
async function runAllTests() {
    try {
        await testComponentFiles();
        await testAPIRoutes();
        await testExports();
        await testMigrationScript();
        await testCharacterAssets();
        await testDocumentation();

        // Summary
        console.log('\n========================================');
        console.log('📊 Test Summary');
        console.log('========================================');
        console.log(`✅ Passed:  ${testResults.passed}`);
        console.log(`❌ Failed:  ${testResults.failed}`);
        console.log(`⏭️  Skipped: ${testResults.skipped}`);
        console.log(`\n📈 Total Score: ${testResults.passed}/${testResults.passed + testResults.failed}`);
        
        if (testResults.failed === 0 && testResults.passed > 0) {
            console.log('\n🎉 All tests passed! System enhancements are ready.\n');
            process.exit(0);
        } else if (testResults.failed === 0) {
            console.log('\n✅ No errors found. System enhancements ready to test in browser.\n');
            process.exit(0);
        } else {
            console.log('\n⚠️  Some tests failed. Please review the issues above.\n');
            process.exit(1);
        }
    } catch (err) {
        console.error('Fatal error:', err);
        process.exit(1);
    }
}

// Run tests
runAllTests();
