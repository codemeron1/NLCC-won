import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Lesson ID is required' }, { status: 400 });
    }

    // Soft delete (archive) the lesson instead of hard delete
    await query("UPDATE lessons SET is_archived = TRUE WHERE id = $1", [id]);

    return NextResponse.json({ success: true, archived: true });
  } catch (error: any) {
    console.error('Archive Lesson Error:', error);
    return NextResponse.json({ error: 'Failed to archive lesson', details: error.message }, { status: 500 });
  }
}
