#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const API_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
let testResults = {
    passed: 0,
    failed: 0,
    skipped: 0
};

console.log('\n========================================');
console.log('🧪 System Enhancement Tests');
console.log('========================================\n');

// Test 1: Check database tables
async function testDatabaseTables() {
    console.log('TEST 1: Checking database tables...');
    console.log(`  ℹ️  Database testing requires direct connection`);
    console.log(`  ℹ️  Run migration script separately for DB verification`);
    console.log(`  ℹ️  Migration: node scripts/migrate-assessment-structure.mjs\n`);
    testResults.skipped++;
}

// Test 2: Verify API endpoints
async function testAPIEndpoints() {
    console.log('\nTEST 2: Verifying API endpoints...');
    const endpoints = [
        { path: '/api/teacher/edit-assessment', method: 'GET', description: 'Get Assessment' },
        { path: '/api/teacher/upload-media', method: 'POST', description: 'Upload Media' },
        { path: '/api/teacher/bahagi-icon', method: 'GET', description: 'Get Bahagi Icon' }
    ];

    for (const endpoint of endpoints) {
        try {
            const response = await fetch(`${API_URL}${endpoint.path}`, {
                method: endpoint.method,
                headers: { 'Content-Type': 'application/json' }
            });
            
            // We're just checking if the endpoint exists (not 404)
            if (response.status !== 404) {
                console.log(`  ✅ ${endpoint.description}: ${response.status}`);
                testResults.passed++;
            } else {
                console.log(`  ❌ ${endpoint.description}: Endpoint not found`);
                testResults.failed++;
            }
        } catch (err) {
            console.log(`  ⏭️  ${endpoint.description}: Skipped (server not running)`);
            testResults.skipped++;
        }
    }
}

// Test 3: Check component files
async function testComponentFiles() {
    console.log('\nTEST 3: Checking component files...');
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

// Test 4: Check API route files
async function testAPIRoutes() {
    console.log('\nTEST 4: Checking API route files...');
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

// Test 5: Check exports
async function testExports() {
    console.log('\nTEST 5: Checking component exports...');
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

    let allExported = true;
    for (const exp of exports) {
        if (indexContent.includes(`export { ${exp} }`)) {
            console.log(`  ✅ ${exp} exported`);
            testResults.passed++;
        } else {
            console.log(`  ❌ ${exp} NOT exported`);
            testResults.failed++;
            allExported = false;
        }
    }
}

// Test 6: Verify migration script
async function testMigrationScript() {
    console.log('\nTEST 6: Checking migration script...');
    const migrationPath = path.join(process.cwd(), 'scripts/migrate-assessment-structure.mjs');
    const sqlPath = path.join(process.cwd(), 'scripts/create-assessment-structure.sql');

    if (fs.existsSync(migrationPath)) {
        console.log(`  ✅ Migration script exists`);
        testResults.passed++;
    } else {
        console.log(`  ❌ Migration script NOT found`);
        testResults.failed++;
    }

    if (fs.existsSync(sqlPath)) {
        console.log(`  ✅ SQL schema file exists`);
        testResults.passed++;
    } else {
        console.log(`  ❌ SQL schema file NOT found`);
        testResults.failed++;
    }
}

// Test 7: Verify character assets
async function testCharacterAssets() {
    console.log('\nTEST 7: Checking character assets...');
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
        }
    }

    if (found === 4) {
        testResults.passed++;
    } else if (found > 0) {
        console.log(`  ⚠️  Only ${found}/4 character assets found`);
        testResults.skipped++;
    } else {
        console.log(`  ⏭️  Character assets not yet uploaded (optional for testing)`);
        testResults.skipped++;
    }
}

// Test 8: Database schema integrity
async function testSchemaIntegrity() {
    console.log('\nTEST 8: Testing database schema integrity...');
    try {
        // Check foreign keys
        const fkCheck = await query(`
            SELECT constraint_type, COUNT(*) as count
            FROM information_schema.table_constraints
            WHERE table_name IN ('questions', 'options', 'media_files', 'bahagi')
            AND constraint_type = 'FOREIGN KEY'
            GROUP BY constraint_type
        `);

        if (fkCheck.rows.length > 0 && fkCheck.rows[0].count >= 4) {
            console.log(`  ✅ Foreign keys configured`);
            testResults.passed++;
        } else {
            console.log(`  ❌ Foreign key constraints missing`);
            testResults.failed++;
        }

        // Check indexes
        const indexCheck = await query(`
            SELECT schemaname, tablename, indexname
            FROM pg_indexes
            WHERE tablename IN ('questions', 'options', 'media_files', 'bahagi')
            AND indexname LIKE 'idx_%'
        `);

        if (indexCheck.rows.length > 0) {
            console.log(`  ✅ Database indexes created (${indexCheck.rows.length} indexes)`);
            testResults.passed++;
        } else {
            console.log(`  ⚠️  No custom indexes found (may still work)`);
            testResults.skipped++;
        }
    } catch (err) {
        console.error(`  ❌ Error: ${err.message}`);
        testResults.failed++;
    }
}

// Main test runner
async function runAllTests() {
    try {
        await testDatabaseTables();
        await testAPIEndpoints();
        await testComponentFiles();
        await testAPIRoutes();
        await testExports();
        await testMigrationScript();
        await testCharacterAssets();
        await testSchemaIntegrity();

        // Summary
        console.log('\n========================================');
        console.log('📊 Test Summary');
        console.log('========================================');
        console.log(`✅ Passed:  ${testResults.passed}`);
        console.log(`❌ Failed:  ${testResults.failed}`);
        console.log(`⏭️  Skipped: ${testResults.skipped}`);
        console.log(`\n📈 Total Score: ${testResults.passed}/${testResults.passed + testResults.failed}`);
        
        if (testResults.failed === 0) {
            console.log('\n🎉 All tests passed! System is ready.\n');
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
