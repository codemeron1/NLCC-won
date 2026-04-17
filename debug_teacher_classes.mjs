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

async function debugTeacherClasses() {
  try {
    console.log('🔍 Checking teacher class visibility issue...\n');
    
    // Get all teachers
    const teachersResult = await pool.query(`
      SELECT id, first_name, last_name, email, role
      FROM users
      WHERE role = 'TEACHER'
      ORDER BY created_at DESC
    `);
    
    if (teachersResult.rows.length === 0) {
      console.log('❌ No teachers found');
      return;
    }
    
    console.log(`📚 Found ${teachersResult.rows.length} teachers\n`);
    
    for (const teacher of teachersResult.rows) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`👨‍🏫 Teacher: ${teacher.first_name} ${teacher.last_name}`);
      console.log(`   Email: ${teacher.email}`);
      console.log(`   ID: ${teacher.id}`);
      console.log(`${'='.repeat(60)}\n`);
      
      // Check classes in database
      const classesResult = await pool.query(`
        SELECT id, name, teacher_id, is_archived, created_at
        FROM classes
        WHERE teacher_id = $1
        ORDER BY created_at DESC
      `, [teacher.id]);
      
      console.log(`📋 Classes in database (WHERE teacher_id = '${teacher.id}'):`);
      console.log(`   Total: ${classesResult.rows.length}\n`);
      
      if (classesResult.rows.length > 0) {
        classesResult.rows.forEach((cls, i) => {
          console.log(`   ${i + 1}. ${cls.name}`);
          console.log(`      ID: ${cls.id}`);
          console.log(`      Teacher ID: ${cls.teacher_id}`);
          console.log(`      Archived: ${cls.is_archived}`);
          console.log(`      Created: ${new Date(cls.created_at).toLocaleString()}`);
          console.log('');
        });
      } else {
        console.log('   ⚠️  No classes found for this teacher\n');
      }
      
      // Now test the exact API query
      console.log(`🔄 Testing API query (same query as /api/teacher/stats):\n`);
      
      const apiResult = await pool.query(`
        SELECT 
            c.id,
            c.name,
            c.teacher_id,
            c.is_archived,
            c.created_at,
            (SELECT COUNT(*) FROM users WHERE role = 'USER' AND class_name = c.name)::INT as student_count,
            (SELECT COUNT(*) FROM lessons WHERE class_name = c.name AND teacher_id::uuid = c.teacher_id)::INT as lesson_count
        FROM classes c
        WHERE c.teacher_id = $1 AND c.is_archived = FALSE
        GROUP BY c.id, c.name, c.teacher_id, c.is_archived, c.created_at
        ORDER BY c.created_at DESC
      `, [teacher.id]);
      
      console.log(`   API Query Result: ${apiResult.rows.length} classes\n`);
      
      if (apiResult.rows.length > 0) {
        apiResult.rows.forEach((cls, i) => {
          console.log(`   ${i + 1}. ${cls.name}`);
          console.log(`      Students: ${cls.student_count}`);
          console.log(`      Lessons: ${cls.lesson_count}`);
          console.log('');
        });
      }
      
      // Check enrollments
      const enrollmentsResult = await pool.query(`
        SELECT 
          ce.id,
          ce.class_id,
          ce.student_id,
          c.name as class_name,
          u.first_name || ' ' || u.last_name as student_name
        FROM class_enrollments ce
        JOIN classes c ON ce.class_id = c.id
        JOIN users u ON ce.student_id = u.id
        WHERE c.teacher_id = $1
      `, [teacher.id]);
      
      console.log(`👥 Enrollments: ${enrollmentsResult.rows.length}\n`);
      if (enrollmentsResult.rows.length > 0) {
        enrollmentsResult.rows.forEach((enr, i) => {
          console.log(`   ${i + 1}. ${enr.student_name} → ${enr.class_name}`);
        });
        console.log('');
      }
    }
    
    // Also check ALL classes regardless of teacher
    console.log('\n' + '='.repeat(60));
    console.log('📊 ALL CLASSES IN DATABASE:');
    console.log('='.repeat(60) + '\n');
    
    const allClassesResult = await pool.query(`
      SELECT 
        c.id, 
        c.name, 
        c.teacher_id,
        c.is_archived,
        t.first_name || ' ' || t.last_name as teacher_name,
        (SELECT COUNT(*) FROM class_enrollments WHERE class_id = c.id) as enrollment_count
      FROM classes c
      LEFT JOIN users t ON c.teacher_id = t.id
      ORDER BY c.created_at DESC
    `);
    
    console.log(`Total classes: ${allClassesResult.rows.length}\n`);
    
    allClassesResult.rows.forEach((cls, i) => {
      console.log(`${i + 1}. ${cls.name}`);
      console.log(`   Teacher: ${cls.teacher_name || 'UNKNOWN'}`);
      console.log(`   Teacher ID: ${cls.teacher_id}`);
      console.log(`   Enrollments: ${cls.enrollment_count}`);
      console.log(`   Archived: ${cls.is_archived}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

debugTeacherClasses();
