import { createPool } from '@vercel/postgres';

const pool = createPool({
  connectionString: process.env.POSTGRES_URL,
});

export const query = (text: string, params?: any[]) => pool.query(text, params);

export default pool;
