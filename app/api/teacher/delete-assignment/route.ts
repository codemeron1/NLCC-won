import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Assignment ID is required' }, { status: 400 });
    }

    // Delete student assignments first (foreign key constraint)
    await query("DELETE FROM student_assignments WHERE assignment_id = $1", [id]);
    
    // Delete assignment
    await query("DELETE FROM assignments WHERE id = $1", [id]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete Assignment Error:', error);
    return NextResponse.json({ error: 'Failed to delete assignment', details: error.message }, { status: 500 });
  }
}
