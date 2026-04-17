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

async function checkJuanDeLaCruz() {
  try {
    const studentId = '0af7476f-5bae-4d42-9826-4b616e1978f9'; // Juan Dela Cruz
    
    console.log('🔍 Checking student: Juan Dela Cruz\n');
    console.log(`   ID: ${studentId}\n`);
    
    // Check enrollment
    const enrollResult = await pool.query(`
      SELECT ce.id, ce.class_id, c.name as class_name, c.teacher_id,
             t.first_name || ' ' || t.last_name as teacher_name
      FROM class_enrollments ce
      JOIN classes c ON ce.class_id = c.id
      JOIN users t ON c.teacher_id = t.id
      WHERE ce.student_id = $1
    `, [studentId]);
    
    console.log(`📝 Enrollments: ${enrollResult.rows.length}`);
    if (enrollResult.rows.length > 0) {
      enrollResult.rows.forEach((row, i) => {
        console.log(`   ${i + 1}. Class: ${row.class_name}`);
        console.log(`      Teacher: ${row.teacher_name}`);      
        console.log(`      Class ID: ${row.class_id}`);
      });
    } else {
      console.log('   ⚠️  No enrollments found!\n');
      console.log('📌 Let\'s enroll Juan in a class...\n');
      
      // Get a class
      const classResult = await pool.query(`
        SELECT id, name, teacher_id FROM classes LIMIT 1
      `);
      
      if (classResult.rows.length > 0) {
        const classInfo = classResult.rows[0];
        console.log(`   Enrolling in: ${classInfo.name}`);
        
        // Enroll the student
        await pool.query(`
          INSERT INTO class_enrollments (student_id, class_id)
          VALUES ($1, $2)
          ON CONFLICT DO NOTHING
        `, [studentId, classInfo.id]);
        
        console.log('   ✅ Enrolled successfully!');
      }
    }
    
    console.log('\n🔄 Testing API query...\n');
    
    // Test the API query
    const apiResult = await pool.query(`
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
    `, [studentId]);
    
    console.log(`✅ API Query Result: ${apiResult.rows.length} classes`);
    apiResult.rows.forEach((row, i) => {
      console.log(`   ${i + 1}. ${row.name}`);
      console.log(`      Teacher: ${row.teacher_name}`);
      console.log(`      Bahagis: ${row.bahagi_count}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

checkJuanDeLaCruz();
