import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, description, isPublished } = body;

    if (!id || !title) {
      return NextResponse.json(
        { error: 'ID and title are required' },
        { status: 400 }
      );
    }

    const result = await query(
      `UPDATE bahagi 
       SET title = $1, description = $2, is_published = $3, updated_at = NOW()
       WHERE id = $4
       RETURNING id, title, description, is_published, is_archived, created_at, updated_at`,
      [title, description || null, isPublished !== undefined ? isPublished : false, id]
    );

    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Bahagi not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      bahagi: result.rows[0]
    });
  } catch (error: any) {
    console.error('Update Bahagi Error:', error);
    return NextResponse.json(
      { error: 'Failed to update bahagi', details: error?.message },
      { status: 500 }
    );
  }
}
