import { createPool } from '@vercel/postgres';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const pool = createPool({
  connectionString: process.env.POSTGRES_URL,
});

async function migrate() {
  try {
    console.log('Starting migration via @vercel/postgres...');
    
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS lrn VARCHAR(12) UNIQUE;`);
    console.log('LRN column check/add DONE');
    
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS class_name VARCHAR(50);`);
    console.log('class_name column check/add DONE');
    
    // Create activity_logs if not exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        action VARCHAR(255) NOT NULL,
        type VARCHAR(50) DEFAULT 'system',
        details TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('activity_logs table check/create DONE');
    
    console.log('Migration SUCCESS');
  } catch (err) {
    console.error('Migration FAILED:', err);
  } finally {
    process.exit();
  }
}

migrate();
