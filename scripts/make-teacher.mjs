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

async function makeTeacher() {
  const email = process.argv[2];
  if (!email) {
    console.error('Please provide an email: node scripts/make-teacher.mjs user@example.com');
    process.exit(1);
  }

  try {
    const res = await pool.query(
      "UPDATE users SET role = 'TEACHER' WHERE email = $1 RETURNING *",
      [email]
    );

    if (res.rowCount === 0) {
      console.log(`User with email ${email} not found.`);
    } else {
      console.log(`User ${email} is now a TEACHER.`);
      console.log(res.rows[0]);
    }
  } catch (err) {
    console.error('Error updating user role:', err);
  } finally {
    await pool.end();
  }
}

makeTeacher();
