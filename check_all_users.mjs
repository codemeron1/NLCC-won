import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env.local') });

const { Pool } = pg;

let connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
if (connectionString && !connectionString.includes('uselibpqcompat')) {
  connectionString += (connectionString.includes('?') ? '&' : '?') + 'uselibpqcompat=true';
}

const pool = new Pool({
  connectionString: connectionString,
  ssl: connectionString?.includes('supabase') ? { rejectUnauthorized: false } : false,
});

async function checkUsers() {
  try {
    console.log('🔍 Checking ALL users in database...\n');
    
    const result = await pool.query(`
      SELECT id, first_name, last_name, email, role, created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT 20
    `);
    
    if (result.rows.length === 0) {
      console.log('❌ NO USERS FOUND IN DATABASE!');
      console.log('\n📝 You need to create users first.');
      console.log('   Run scripts to create teachers and students.');
    } else {
      console.log(`✅ Found ${result.rows.length} users:\n`);
      result.rows.forEach((user, i) => {
        console.log(`${i + 1}. [${user.role.toUpperCase().padEnd(7)}] ${user.first_name} ${user.last_name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   ID: ${user.id}`);
        console.log('');
      });
      
      // Count by role
      const roleCount = await pool.query(`
        SELECT role, COUNT(*) as count
        FROM users
        GROUP BY role
      `);
      
      console.log('\n📊 User counts by role:');
      roleCount.rows.forEach(row => {
        console.log(`   ${row.role}: ${row.count}`);
      });
    }
    
    // Check classes
    console.log('\n🏫 Checking classes...');
    const classResult = await pool.query('SELECT COUNT(*) as count FROM classes');
    console.log(`   Total classes: ${classResult.rows[0].count}`);
    
    // Check enrollments
    console.log('\n👥 Checking enrollments...');
    const enrollResult = await pool.query('SELECT COUNT(*) as count FROM class_enrollments');
    console.log(`   Total enrollments: ${enrollResult.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkUsers();
