import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function updateSchema() {
  try {
    console.log('Expanding ID column lengths...');
    
    // First, update lesson_items.lesson_id
    await pool.query(`ALTER TABLE lesson_items ALTER COLUMN lesson_id TYPE VARCHAR(255);`);
    console.log('Updated lesson_items.lesson_id to VARCHAR(255)');
    
    // Then update lessons.id
    // Note: Changing the type of a primary key used as a foreign key can be tricky, 
    // but in Postgres, increasing VARCHAR length is usually fine.
    await pool.query(`ALTER TABLE lessons ALTER COLUMN id TYPE VARCHAR(255);`);
    console.log('Updated lessons.id to VARCHAR(255)');
    
    // Also ensure icon/image are TEXT just in case
    await pool.query(`ALTER TABLE lessons ALTER COLUMN icon TYPE TEXT;`);
    await pool.query(`ALTER TABLE lesson_items ALTER COLUMN image_emoji TYPE TEXT;`);
    
    console.log('Schema expansion successful!');
  } catch (err) {
    console.error('Schema update failed:', err);
  } finally {
    await pool.end();
  }
}

updateSchema();
