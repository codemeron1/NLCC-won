import { query } from '../lib/db.js';
import fs from 'fs';
import path from 'path';

const scriptPath = path.join(process.cwd(), 'scripts', 'create-assessment-structure.sql');
const sql = fs.readFileSync(scriptPath, 'utf-8');

async function migrateAssessmentStructure() {
    try {
        console.log('🔄 Starting Assessment Structure Migration...\n');
        
        // Split and execute individual statements
        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        for (const statement of statements) {
            console.log(`⏳ Executing: ${statement.substring(0, 60)}...`);
            try {
                const result = await query(statement);
                console.log(`✅ Success\n`);
            } catch (err) {
                if (err.message.includes('already exists') || 
                    err.message.includes('duplicate') ||
                    err.message.includes('ALREADY EXISTS')) {
                    console.log(`ℹ️  Already exists (skipped)\n`);
                } else {
                    console.error(`❌ Error: ${err.message}\n`);
                }
            }
        }

        // Verify schema
        console.log('\n📊 Verifying Schema...\n');
        
        const tables = ['questions', 'options', 'media_files'];
        for (const table of tables) {
            try {
                const result = await query(`
                    SELECT EXISTS (
                        SELECT 1 FROM information_schema.tables 
                        WHERE table_name = '${table}'
                    )
                `);
                if (result.rows[0].exists) {
                    console.log(`✅ ${table} table exists`);
                } else {
                    console.log(`❌ ${table} table NOT found`);
                }
            } catch (err) {
                console.log(`⚠️  Could not verify ${table}`);
            }
        }

        // Verify bahagi table updates
        try {
            const result = await query(`
                SELECT column_name FROM information_schema.columns 
                WHERE table_name = 'bahagi' 
                AND column_name IN ('icon_path', 'icon_type')
            `);
            if (result.rows.length === 2) {
                console.log(`✅ Bahagi table updated with icon columns`);
            } else {
                console.log(`⚠️  Bahagi icon columns may not have been added`);
            }
        } catch (err) {
            console.log(`⚠️  Could not verify Bahagi table`);
        }

        console.log('\n✅ Migration completed successfully!\n');
        
    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    }
}

migrateAssessmentStructure();
