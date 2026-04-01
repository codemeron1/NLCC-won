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
    const res = await pool.query("SELECT * FROM lessons LIMIT 1");
    if (res.rows.length > 0) {
        console.log('Columns in first row:');
        console.log(Object.keys(res.rows[0]));
    } else {
        console.log('No lessons found. Checking schema info...');
        const schema = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'lessons'");
        console.log('Columns:');
        console.log(schema.rows.map(r => r.column_name));
    }
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}
check();
