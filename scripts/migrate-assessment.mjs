#!/usr/bin/env node

import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

// Setup database connection
let connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ Error: POSTGRES_URL or DATABASE_URL environment variable not set');
  process.exit(1);
}

// Add libpqcompat for SSL compatibility with Supabase
if (!connectionString.includes('uselibpqcompat')) {
  connectionString += (connectionString.includes('?') ? '&' : '?') + 'uselibpqcompat=true';
}

const pool = new Pool({
  connectionString: connectionString,
  ssl: connectionString?.includes('supabase') ? { rejectUnauthorized: false } : false,
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Starting Assessment Structure Migration...\n');
    
    const scriptPath = path.join(process.cwd(), 'scripts', 'create-assessment-structure.sql');
    const fileContent = fs.readFileSync(scriptPath, 'utf-8');

    // Remove comments and split by semicolons more carefully
    const lines = fileContent.split('\n');
    let currentStatement = '';
    const statements = [];

    for (let line of lines) {
      // Remove comment after --
      const commentIndex = line.indexOf('--');
      if (commentIndex !== -1) {
        line = line.substring(0, commentIndex);
      }
      
      line = line.trim();
      if (!line) continue;
      
      currentStatement += ' ' + line;
      
      if (line.endsWith(';')) {
        statements.push(currentStatement.trim());
        currentStatement = '';
      }
    }

    console.log(`📝 Found ${statements.length} SQL statements\n`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      if (!stmt || stmt.length < 5) continue;

      const preview = stmt.substring(0, 60).replace(/\n/g, ' ').trim();
      console.log(`[${i + 1}/${statements.length}] ⏳ ${preview}...`);
      
      try {
        const result = await client.query(stmt);
        console.log(`           ✅ Success`);
        successCount++;
      } catch (err) {
        const errMsg = err.message || '';
        if (errMsg.includes('already exists') || errMsg.includes('duplicate')) {
          console.log(`           ℹ️ Already exists`);
        } else {
          console.log(`           ❌ ${errMsg.substring(0, 80)}`);
          errorCount++;
        }
      }
    }

    // Verify tables were created
    console.log('\n📊 Verifying Schema Creation...\n');
    
    const tables = ['questions', 'options', 'media_files'];
    for (const table of tables) {
      try {
        const result = await client.query(`
          SELECT COUNT(*) as col_count FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = $1
        `, [table]);
        
        if (result.rows[0].col_count > 0) {
          console.log(`✅ Table '${table}' created successfully (${result.rows[0].col_count} columns)`);
        } else {
          console.log(`❌ Table '${table}' not found`);
        }
      } catch (err) {
        console.log(`❌ Error checking '${table}': ${err.message.substring(0, 60)}`);
      }
    }

    // Check Bahagi columns
    console.log('\n👤 Verifying Bahagi Table Updates...\n');
    try {
      const result = await client.query(`
        SELECT column_name FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'bahagi'
        ORDER BY column_name
      `);
      
      const cols = result.rows.map(r => r.column_name);
      const hasIconPath = cols.includes('icon_path');
      const hasIconType = cols.includes('icon_type');

      console.log(`${hasIconPath ? '✅' : '❌'} icon_path column`);
      console.log(`${hasIconType ? '✅' : '❌'} icon_type column`);
    } catch (err) {
      console.log(`❌ Error: ${err.message}`);
    }

    console.log('\n' + '='.repeat(50));
    console.log(`✅ Completed: ${successCount} | ❌ Errors: ${errorCount}`);
    console.log('='.repeat(50));

    if (errorCount === 0) {
      console.log('🎉 Migration successful!');
    } else {
      console.log('⚠️ Migration completed with errors.');
    }

  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch(err => {
  console.error('💥 Fatal error:', err.message);
  process.exit(1);
});
