import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get('assignmentId');

    if (!assignmentId) {
      return NextResponse.json({ error: 'Assignment ID is required' }, { status: 400 });
    }

    // Get all students who completed this specific assignment
    // We join with the users table to get student names and details
    const res = await query(`
      SELECT 
        u.id, 
        u.first_name, 
        u.last_name, 
        u.email, 
        sa.status, 
        sa.completed_at,
        sa.proof_url
      FROM student_assignments sa
      JOIN users u ON sa.user_id = u.id
      WHERE sa.assignment_id = $1 AND sa.status = 'completed'
      ORDER BY sa.completed_at DESC
    `, [assignmentId]);

    // Format the response to be consistent with our frontend expectations
    const completions = res.rows.map(row => ({
      id: row.id,
      name: `${row.first_name || ''} ${row.last_name || ''}`.trim() || row.email?.split('@')[0],
      email: row.email,
      completedAt: row.completed_at,
      status: row.status,
      proofUrl: row.proof_url
    }));

    return NextResponse.json({ completions });
  } catch (error: any) {
    console.error('Fetch Assignment Stats Error:', error);
    return NextResponse.json({ error: 'Failed to fetch assignment statistics', details: error.message }, { status: 500 });
  }
}
