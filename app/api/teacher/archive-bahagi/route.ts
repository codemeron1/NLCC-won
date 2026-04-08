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
      `UPDATE bahagi 
       SET is_archived = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, title, is_archived, created_at, updated_at`,
      [isArchived, id]
    );

    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Bahagi not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: isArchived ? 'Bahagi archived successfully' : 'Bahagi restored successfully',
      bahagi: result.rows[0]
    });
  } catch (error: any) {
    console.error('Archive Bahagi Error:', error);
    return NextResponse.json(
      { error: 'Failed to archive bahagi', details: error?.message },
      { status: 500 }
    );
  }
}
