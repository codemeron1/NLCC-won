import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local
dotenv.config({ path: join(__dirname, '.env.local') });

const { Pool } = pg;

let connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

// Add libpqcompat for SSL compatibility with Supabase
if (connectionString && !connectionString.includes('uselibpqcompat')) {
  connectionString += (connectionString.includes('?') ? '&' : '?') + 'uselibpqcompat=true';
}

console.log('🔗 Using connection:', connectionString ? 'Found' : 'NOT FOUND');

const pool = new Pool({
  connectionString: connectionString,
  ssl: connectionString?.includes('supabase') ? { rejectUnauthorized: false } : false,
});

async function testEnrolledClasses() {
  try {
    console.log('🔍 Checking for students and their enrollments...\n');
    
    // Get a student
    const studentQuery = await pool.query(`
      SELECT id, first_name, last_name, email, role
      FROM users
      WHERE role = 'student'
      LIMIT 1
    `);
    
    if (studentQuery.rows.length === 0) {
      console.log('❌ No students found in database');
      return;
    }
    
    const student = studentQuery.rows[0];
    console.log('📚 Testing with student:');
    console.log(`   ID: ${student.id}`);
    console.log(`   Name: ${student.first_name} ${student.last_name}`);
    console.log(`   Email: ${student.email}\n`);
    
    // Check enrollments
    const enrollmentQuery = await pool.query(`
      SELECT ce.id, ce.class_id, ce.student_id, c.name as class_name
      FROM class_enrollments ce
      JOIN classes c ON ce.class_id = c.id
      WHERE ce.student_id = $1
    `, [student.id]);
    
    console.log(`📝 Enrollments found: ${enrollmentQuery.rows.length}`);
    if (enrollmentQuery.rows.length > 0) {
      enrollmentQuery.rows.forEach((enrollment, index) => {
        console.log(`   ${index + 1}. Class: ${enrollment.class_name} (ID: ${enrollment.class_id})`);
      });
    } else {
      console.log('   ⚠️  Student has no class enrollments');
    }
    
    console.log('\n🔄 Testing the API query...\n');
    
    // Test the exact query from the API
    const apiQuery = await pool.query(`
      SELECT DISTINCT 
        c.id,
        c.name,
        t.id as teacher_id,
        t.first_name || ' ' || t.last_name as teacher_name,
        t.email as teacher_email,
        COUNT(DISTINCT b.id) as bahagi_count
      FROM classes c
      JOIN class_enrollments ce ON c.id = ce.class_id
      JOIN users t ON c.teacher_id = t.id
      LEFT JOIN bahagis b ON b.teacher_id = c.teacher_id AND b.is_archived = false
      WHERE ce.student_id = $1
      GROUP BY c.id, c.name, t.id, t.first_name, t.last_name, t.email
      ORDER BY c.name
    `, [student.id]);
    
    console.log(`✅ API Query Result: ${apiQuery.rows.length} classes`);
    if (apiQuery.rows.length > 0) {
      apiQuery.rows.forEach((row, index) => {
        console.log(`   ${index + 1}. ${row.name}`);
        console.log(`      Teacher: ${row.teacher_name} (${row.teacher_email})`);
        console.log(`      Bahagis: ${row.bahagi_count}`);
      });
    }
    
    // Now test the actual API endpoint
    console.log('\n🌐 Testing HTTP endpoint...\n');
    
    const response = await fetch(`http://localhost:3000/api/student/enrolled-classes?studentId=${student.id}`);
    const data = await response.json();
    
    console.log('Response Status:', response.status);
    console.log('Response Data:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

testEnrolledClasses();
