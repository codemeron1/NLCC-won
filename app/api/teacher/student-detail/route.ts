import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });
    }

    // Get student info
    const studentRes = await query("SELECT id, first_name, last_name, email, class_name, created_at FROM users WHERE id = $1", [studentId]);
    if (studentRes.rows.length === 0) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }
    const student = studentRes.rows[0];

    // Get lesson progress
    const progressRes = await query(`
      SELECT p.score, p.completed, p.updated_at, l.title, l.icon 
      FROM lesson_progress p
      JOIN lessons l ON p.lesson_id = l.id
      WHERE p.user_id = $1
      ORDER BY p.updated_at DESC
    `, [studentId]);

    // Get recent activity
    const activityRes = await query(`
      SELECT action, type, details, created_at 
      FROM activity_logs 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT 10
    `, [studentId]);

    // Get assignments status
    const assignmentsRes = await query(`
      SELECT a.title, a.icon, sa.status, sa.completed_at, a.due_date, a.reward, sa.proof_url
      FROM student_assignments sa
      JOIN assignments a ON sa.assignment_id = a.id
      WHERE sa.user_id = $1
      ORDER BY a.created_at DESC
    `, [studentId]);

    return NextResponse.json({ 
      student: {
          id: student.id,
          name: `${student.first_name || ''} ${student.last_name || ''}`.trim(),
          email: student.email,
          className: student.class_name,
          class_name: student.class_name,
          joinedAt: student.created_at
      },
      progress: progressRes.rows,
      activities: activityRes.rows,
      assignments: assignmentsRes.rows
    });
  } catch (error: any) {
    console.error('Fetch Student Detail Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
