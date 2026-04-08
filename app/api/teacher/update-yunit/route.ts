import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, description, discussion, mediaUrl } = body;

    if (!id || !title) {
      return NextResponse.json(
        { error: 'ID and title are required' },
        { status: 400 }
      );
    }

    const result = await query(
      `UPDATE lesson 
       SET title = $1, subtitle = $2, discussion = $3, media_url = $4, updated_at = NOW()
       WHERE id = $5
       RETURNING id, bahagi_id, title, subtitle, discussion, media_url, created_at`,
      [
        title,
        description || null,
        discussion || null,
        mediaUrl || null,
        id
      ]
    ).catch(async (e: any) => {
      // If media_url column doesn't exist, try without it
      if (e.message?.includes('media_url') || e.message?.includes('unknown column') || e.message?.includes('column')) {
        return await query(
          `UPDATE lesson 
           SET title = $1, subtitle = $2, discussion = $3, updated_at = NOW()
           WHERE id = $4
           RETURNING id, bahagi_id, title, subtitle, discussion, created_at`,
          [
            title,
            description || null,
            discussion || null,
            id
          ]
        );
      }
      throw e;
    });

    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Yunit not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      yunit: result.rows[0]
    });
  } catch (error: any) {
    console.error('Update Yunit Error:', error);
    return NextResponse.json(
      { error: 'Failed to update yunit', details: error?.message },
      { status: 500 }
    );
  }
}
