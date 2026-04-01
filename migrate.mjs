import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function migrate() {
  try {
    // 1. Create activity_logs table
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
    console.log('activity_logs table checked/created');
    
    // 2. Add lrn and class_name columns to users table
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS lrn VARCHAR(12) UNIQUE;`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS class_name VARCHAR(50);`);
    console.log('users table columns checked/added');

    // 3. Create lessons table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS lessons (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        students_count INTEGER DEFAULT 0,
        rating DECIMAL(3,2) DEFAULT 5.00,
        status VARCHAR(50) DEFAULT 'Published',
        icon VARCHAR(50),
        color VARCHAR(50),
        description TEXT,
        is_archived BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('lessons table checked/created');

    // Add is_archived column if it doesn't exist (for existing tables)
    await pool.query(`ALTER TABLE lessons ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;`);
    console.log('lessons table is_archived column checked/added');

    // 4. Seed lessons if empty
    const lessonsExist = await pool.query('SELECT count(*) FROM lessons');
    if (parseInt(lessonsExist.rows[0].count) === 0) {
      const lessons = [
        { id: 'alpabeto', title: 'Alpabetong Filipino', category: 'Basics', icon: '🅰️', color: 'bg-brand-sky', description: 'Matuto ng alpabetong Filipino at ang kanilang mga tunog.' },
        { id: 'pantig', title: 'Mga Pantig', category: 'Reading', icon: '🔡', color: 'bg-brand-purple', description: 'Pagsamahin ang mga titik upang bumuo ng mga pantig.' },
        { id: 'kulay', title: 'Mga Kulay', category: 'Vocabulary', icon: '🎨', color: 'bg-brand-coral', description: 'Tukuyin ang iba\'t ibang kulay sa Tagalog.' },
        { id: 'bilang', title: 'Mga Bilang', category: 'Basics', icon: '🔢', color: 'bg-brand-orange', description: 'Pagbibilang mula isa hanggang sampu.' }
      ];

      for (const l of lessons) {
        await pool.query(
          'INSERT INTO lessons (id, title, category, icon, color, description, students_count, rating, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
          [l.id, l.title, l.category, l.icon, l.color, l.description, Math.floor(Math.random() * 5000), (4 + Math.random()).toFixed(1), 'Published']
        );
      }
      console.log('lessons table seeded');
    }

  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await pool.end();
    process.exit();
  }
}

migrate();
