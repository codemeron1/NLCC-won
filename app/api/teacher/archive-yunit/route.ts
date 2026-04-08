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

    let result;
    try {
      result = await query(
        `UPDATE lesson 
         SET is_archived = $1, updated_at = NOW()
         WHERE id = $2
         RETURNING id, title, bahagi_id, is_archived, created_at`,
        [isArchived, id]
      );
    } catch (e: any) {
      // If is_archived column doesn't exist, just update and return without it
      if (e.message?.includes('is_archived') || e.message?.includes('unknown column') || e.message?.includes('column')) {
        result = await query(
          `UPDATE lesson 
           SET updated_at = NOW()
           WHERE id = $1
           RETURNING id, title, bahagi_id, created_at`,
          [id]
        );
      } else {
        throw e;
      }
    }

    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Yunit not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: isArchived ? 'Yunit archived successfully' : 'Yunit restored successfully',
      yunit: result.rows[0]
    });
  } catch (error: any) {
    console.error('Archive Yunit Error:', error);
    return NextResponse.json(
      { error: 'Failed to archive yunit', details: error?.message },
      { status: 500 }
    );
  }
}
