const { createPool } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });

async function purgeArchived() {
  const pool = createPool({ connectionString: process.env.POSTGRES_URL });
  
  try {
    const { rows } = await pool.query('SELECT id, title FROM lessons WHERE is_archived = TRUE');
    console.log(`Found ${rows.length} archived lessons to purge.`);
    
    if (rows.length > 0) {
      for (const lesson of rows) {
        console.log(`Deleting Lesson Items for: ${lesson.title} (${lesson.id})`);
        await pool.query('DELETE FROM lesson_items WHERE lesson_id = $1', [lesson.id]);
        
        console.log(`Deleting Lesson: ${lesson.title}`);
        await pool.query('DELETE FROM lessons WHERE id = $1', [lesson.id]);
      }
      console.log('✅ All archived lessons and their items have been permanently removed.');
    } else {
      console.log('No archived lessons found.');
    }
  } catch (err) {
    console.error('Error purging lessons:', err);
  } finally {
    process.exit(0);
  }
}

purgeArchived();
