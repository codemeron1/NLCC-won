import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, isArchived } = body;

    if (!id || isArchived === undefined) {
      return NextResponse.json(
        { error: 'ID and archive status are required' },
        { status: 400 }
      );
    }

    const result = await query(
      `UPDATE bahagi_assessment 
       SET is_archived = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, title, is_archived, created_at`,
      [isArchived, id]
    );

    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: isArchived ? 'Assessment archived successfully' : 'Assessment restored successfully',
      assessment: result.rows[0]
    });
  } catch (error: any) {
    console.error('Archive Assessment Error:', error);
    return NextResponse.json(
      { error: 'Failed to archive assessment', details: error?.message },
      { status: 500 }
    );
  }
}
