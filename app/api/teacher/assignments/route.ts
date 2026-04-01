import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    await query(`
      CREATE TABLE IF NOT EXISTS assignments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        due_date TIMESTAMP WITH TIME ZONE,
        reward INTEGER DEFAULT 10,
        icon VARCHAR(50) DEFAULT '📝',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    let res;
    if (userId) {
      res = await query(`
        SELECT a.*, sa.status, sa.completed_at 
        FROM assignments a
        LEFT JOIN student_assignments sa ON a.id = sa.assignment_id AND sa.user_id = $1
        ORDER BY a.created_at DESC
      `, [userId]);
    } else {
      res = await query("SELECT * FROM assignments ORDER BY created_at DESC");
    }

    return NextResponse.json({ assignments: res.rows });
  } catch (error: any) {
    console.error('Fetch Assignments Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
