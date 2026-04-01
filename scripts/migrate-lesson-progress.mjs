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

async function migrate() {
  try {
    // 1. Create lesson_progress table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS lesson_progress (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        lesson_id VARCHAR(50) REFERENCES lessons(id) ON DELETE CASCADE,
        score INTEGER DEFAULT 0,
        completed BOOLEAN DEFAULT FALSE,
        last_item_index INTEGER DEFAULT 0,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, lesson_id)
      );
    `);
    console.log('lesson_progress table checked/created');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await pool.end();
  }
}

migrate();
