import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Ensure table exists
async function ensureTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS lesson_links (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      teacher_id UUID,
      title VARCHAR(255) NOT NULL,
      url TEXT NOT NULL,
      description TEXT,
      icon VARCHAR(50) DEFAULT '🔗',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

export async function GET() {
  try {
    await ensureTable();
    const res = await query(
      'SELECT * FROM lesson_links ORDER BY created_at DESC'
    );
    return NextResponse.json({ links: res.rows });
  } catch (error: any) {
    console.error('Lesson Links GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureTable();
    const { teacherId, title, url, description, icon } = await request.json();

    if (!title || !url) {
      return NextResponse.json({ error: 'Title and URL are required' }, { status: 400 });
    }

    // Basic URL validation
    try { new URL(url); } catch {
      return NextResponse.json({ error: 'Please enter a valid URL' }, { status: 400 });
    }

    const res = await query(
      `INSERT INTO lesson_links (teacher_id, title, url, description, icon)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [teacherId || null, title, url, description || '', icon || '🔗']
    );

    return NextResponse.json({ link: res.rows[0] });
  } catch (error: any) {
    console.error('Lesson Links POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    await query('DELETE FROM lesson_links WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Lesson Links DELETE Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
