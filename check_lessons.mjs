import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

async function check() {
  try {
    const res = await pool.query("SELECT id, title, status, is_archived FROM lessons WHERE is_archived IS NULL");
    console.log(`Lessons with NULL is_archived: ${res.rows.length}`);
    if (res.rows.length > 0) {
        console.log(JSON.stringify(res.rows, null, 2));
    }
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}
check();
