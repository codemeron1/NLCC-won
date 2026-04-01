import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';
import path from 'path';

// Load from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function migrate() {
  try {
    // 1. Create assignments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS assignments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        due_date TIMESTAMP WITH TIME ZONE,
        reward INTEGER DEFAULT 10,
        icon VARCHAR(50) DEFAULT '📝',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('assignments table checked/created');

    // 2. Create student_assignments table to track progress
    await pool.query(`
      CREATE TABLE IF NOT EXISTS student_assignments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
        status VARCHAR(50) DEFAULT 'assigned',
        completed_at TIMESTAMP WITH TIME ZONE,
        UNIQUE(user_id, assignment_id)
      );
    `);
    console.log('student_assignments table checked/created');

  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await pool.end();
  }
}

migrate();
