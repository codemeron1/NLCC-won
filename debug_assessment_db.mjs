import pkg from 'pg';
const { Pool } = pkg;

// Using Supabase-style connection
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const query = (text, params) => pool.query(text, params);

async function checkAssessment() {
  try {
    // Check table schema
    const result = await query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'bahagi_assessment'
      ORDER BY ordinal_position
    `);
    
    if (result.rows.length === 0) {
      console.log('❌ Table bahagi_assessment does not exist!');
      
      // Check what assessment tables exist
      const tables = await query(`
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name LIKE '%assessment%'
      `);
      console.log('\nAssessment-related tables found:');
      tables.rows.forEach(t => console.log('  -', t.table_name));
      
      return;
    }
    
    console.log('✅ Table bahagi_assessment exists\n');
    console.log('Columns:');
    result.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(NOT NULL)'}`);
    });
    
    // Try a test insert to see what columns are required
    console.log('\nAttempting test insert...');
    try {
      const testResult = await query(`
        INSERT INTO bahagi_assessment (bahagi_id, lesson_id, title, type, options, correct_answer, points, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        RETURNING id
      `, [1, 1, 'Test', 'multiple-choice', null, null, 10]);
      console.log('✅ Insert successful (test record ID:', testResult.rows[0].id, ')');
      
      // Clean up
      await query('DELETE FROM bahagi_assessment WHERE id = $1', [testResult.rows[0].id]);
    } catch (e) {
      console.log('❌ Insert failed:', e.message);
    }
    
  } catch (error) {
    console.error('Connection error:', error.message);
  } finally {
    await pool.end();
  }
}

checkAssessment();
