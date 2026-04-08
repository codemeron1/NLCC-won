import { config } from 'dotenv';
import { Client } from 'pg';

config({ path: '.env.local' });

let connStr = process.env.DATABASE_URL;
if (connStr && !connStr.includes('sslmode')) {
  connStr += (connStr.includes('?') ? '&' : '?') + 'sslmode=disable';
}

const client = new Client({
  connectionString: connStr,
  ssl: false
});

async function diagnoseYunitIssue() {
  try {
    await client.connect();
    console.log('🔍 DIAGNOSING YUNIT CREATION FAILURE\n');

    // Check what tables exist
    console.log('📋 Checking Bahagi-related tables:');
    try {
      const bahagiTable = await client.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('bahagi', 'bahagis', 'lesson', 'yunits')`);
      console.log('✅ Tables found:', bahagiTable.rows.map(r => r.table_name).join(', '));
    } catch (e) {
      console.log('❌ Error checking tables:', e.message);
    }

    // Check bahagi table structure if it exists
    console.log('\n📊 Checking bahagi table columns:');
    try {
      const bahagiCols = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'bahagi'
        ORDER BY ordinal_position
      `);
      if (bahagiCols.rows.length === 0) {
        console.log('⚠️  bahagi table not found');
      } else {
        bahagiCols.rows.forEach(col => {
          console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'nullable'}`);
        });
      }
    } catch (e) {
      console.log('❌ Error checking bahagi:', e.message);
    }

    // Check yunits table structure if it exists
    console.log('\ン📊 Checking yunits table columns:');
    try {
      const yunitCols = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'yunits'
        ORDER BY ordinal_position
      `);
      if (yunitCols.rows.length === 0) {
        console.log('⚠️  yunits table not found');
      } else {
        yunitCols.rows.forEach(col => {
          console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'nullable'}`);
        });
      }
    } catch (e) {
      console.log('❌ Error checking yunits:', e.message);
    }

    // Check lesson table structure if it exists
    console.log('\n📊 Checking lesson table columns:');
    try {
      const lessonCols = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'lesson'
        ORDER BY ordinal_position
      `);
      if (lessonCols.rows.length === 0) {
        console.log('⚠️  lesson table not found');
      } else {
        lessonCols.rows.forEach(col => {
          console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'nullable'}`);
        });
      }
    } catch (e) {
      console.log('❌ Error checking lesson:', e.message);
    }

    // Check for foreign key constraints
    console.log('\n🔗 Checking Foreign Key Constraints:');
    try {
      const fkConstraints = await client.query(`
        SELECT constraint_name, table_name, column_name, foreign_table_name, foreign_column_name
        FROM information_schema.key_column_usage
        WHERE table_schema = 'public' AND table_name IN ('bahagi', 'lesson', 'yunits', 'bahagi_assessment', 'assessments')
        AND foreign_table_name IS NOT NULL
      `);
      if (fkConstraints.rows.length === 0) {
        console.log('⚠️  No foreign keys found');
      } else {
        fkConstraints.rows.forEach(fk => {
          console.log(`   - ${fk.table_name}.${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}`);
        });
      }
    } catch (e) {
      console.log('❌ Error checking foreign keys:', e.message);
    }

    // Try to find sample bahagi/yunit to understand the relationship
    console.log('\n🧪 Testing with sample data:');
    try {
      const bahagiSample = await client.query(`SELECT id, title FROM bahagi LIMIT 1`);
      if (bahagiSample.rows.length > 0) {
        const bahagiId = bahagiSample.rows[0].id;
        console.log(`✅ Found bahagi: ID=${bahagiId}, Title="${bahagiSample.rows[0].title}"`);
        console.log(`   bahagi.id type: ${typeof bahagiId}`);
        
        // Try to find yunits with this bahagi_id
        try {
          const yunitTest = await client.query(`SELECT id, title FROM yunits WHERE bahagi_id = $1`, [bahagiId]);
          console.log(`   Yunits linked to this bahagi: ${yunitTest.rows.length}`);
          if (yunitTest.rows.length > 0) {
            console.log(`   ✅ Sample yunit: ${yunitTest.rows[0].title}`);
          }
        } catch (e) {
          console.log(`   ❌ Error querying yunits with this bahagi_id: ${e.message}`);
        }
      } else {
        console.log('⚠️  No bahagi records found in database');
      }
    } catch (e) {
      console.log('❌ Error retrieving sample bahagi:', e.message);
    }

  } catch (error) {
    console.error('❌ Critical error:', error.message);
  } finally {
    await client.end();
  }
}

diagnoseYunitIssue();
