import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { id, title, description, reward, dueDate, icon } = await request.json();

    if (!title) {
        return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Automatically initialize schema if missing
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

    await query(`
      CREATE TABLE IF NOT EXISTS student_assignments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
        status VARCHAR(50) DEFAULT 'assigned',
        completed_at TIMESTAMP WITH TIME ZONE,
        UNIQUE(user_id, assignment_id)
      )
    `);

    let res;
    if (id) {
      // UPDATE existing assignment
      res = await query(
        "UPDATE assignments SET title = $1, description = $2, due_date = $3, reward = $4, icon = $5 WHERE id = $6 RETURNING *",
        [title, description || '', dueDate || null, parseInt(reward) || 10, icon || '📝', id]
      );
    } else {
      // INSERT new assignment
      res = await query(
        "INSERT INTO assignments (title, description, due_date, reward, icon) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [title, description || '', dueDate || null, parseInt(reward) || 10, icon || '📝']
      );
    }

    return NextResponse.json({ success: true, assignment: res.rows[0] });
  } catch (error: any) {
    console.error('Create Assignment Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
