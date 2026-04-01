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
    const res = await pool.query("SELECT id, first_name, lrn, class_name FROM users LIMIT 1");
    if (res.rows.length > 0) {
        console.log('Columns:');
        console.log(Object.keys(res.rows[0]));
    }
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}
check();
