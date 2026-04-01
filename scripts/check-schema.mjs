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

async function checkSchema() {
  try {
    const res = await pool.query(`
      SELECT column_name, data_type, character_maximum_length 
      FROM information_schema.columns 
      WHERE table_name IN ('lessons', 'lesson_items')
      AND column_name IN ('icon', 'image_emoji');
    `);
    console.log('Current Column Info:');
    console.table(res.rows);
  } catch (err) {
    console.error('Check failed:', err);
  } finally {
    await pool.end();
  }
}

checkSchema();
