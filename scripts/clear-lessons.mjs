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

async function clearLessons() {
  try {
    console.log('Clearing all lessons and items...');
    // Delete lesson_items first due to foreign key constraints
    await pool.query('DELETE FROM lesson_items');
    // Delete lesson_progress
    await pool.query('DELETE FROM lesson_progress');
    // Finally delete lessons
    await pool.query('DELETE FROM lessons');
    console.log('Database cleared! The library is now empty and ready for Teachers.');
  } catch (err) {
    console.error('Error clearing lessons:', err);
  } finally {
    await pool.end();
  }
}

clearLessons();
