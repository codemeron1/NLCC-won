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

async function checkLessons() {
  try {
    const res = await pool.query('SELECT id, title, status FROM lessons');
    console.log('Lessons in DB:');
    console.table(res.rows);
  } catch (err) {
    console.error('Check failed:', err);
  } finally {
    await pool.end();
  }
}

checkLessons();
