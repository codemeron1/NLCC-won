import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { userId, assignmentId, proofUrl } = await request.json();

    if (!userId || !assignmentId) {
      return NextResponse.json({ error: 'User ID and Assignment ID are required' }, { status: 400 });
    }

    // Quick Migration: Add proof_url if it doesn't exist
    try {
      await query(`
        ALTER TABLE student_assignments 
        ADD COLUMN IF NOT EXISTS proof_url TEXT
      `);
    } catch (e) {
      console.warn('Migration warning:', e);
    }

    // Insert or Update the student assignment status
    await query(`
      INSERT INTO student_assignments (user_id, assignment_id, status, completed_at, proof_url)
      VALUES ($1, $2, 'completed', CURRENT_TIMESTAMP, $3)
      ON CONFLICT (user_id, assignment_id) 
      DO UPDATE SET status = 'completed', completed_at = CURRENT_TIMESTAMP, proof_url = $3
    `, [userId, assignmentId, proofUrl || null]);

    // Log activity
    const assignmentRes = await query("SELECT title FROM assignments WHERE id = $1", [assignmentId]);
    const title = assignmentRes.rows[0]?.title || 'assignment';
    
    await query(`
      INSERT INTO activity_logs (user_id, action, type, details)
      VALUES ($1, 'Completed Assignment', 'assignment', $2)
    `, [userId, `Natapos ang assignment: ${title}` + (proofUrl ? ' (May kasamang litrato)' : '')]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Submit Assignment Error:', error);
    return NextResponse.json({ error: 'Failed to submit assignment', details: error.message }, { status: 500 });
  }
}
