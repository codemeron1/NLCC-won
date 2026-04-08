import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, discussion, mediaUrl, bahagiId } = body;

    if (!title || !bahagiId) {
      return NextResponse.json(
        { error: 'Title and bahagi ID are required' },
        { status: 400 }
      );
    }

    // Verify bahagi exists
    const bahagiCheck = await query(
      `SELECT id, title FROM bahagi WHERE id = $1`,
      [bahagiId]
    );

    if (bahagiCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Bahagi not found' },
        { status: 404 }
      );
    }

    // Create yunit (lesson) linked to bahagi
    let result;
    try {
      result = await query(
        `INSERT INTO lesson (bahagi_id, title, subtitle, discussion, media_url, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
         RETURNING id, bahagi_id, title, subtitle, discussion, media_url, created_at`,
        [bahagiId, title, description || null, discussion || null, mediaUrl || null]
      );
    } catch (e: any) {
      // If media_url column doesn't exist, try without it
      if (e.message?.includes('media_url') || e.message?.includes('unknown column') || e.message?.includes('column')) {
        result = await query(
          `INSERT INTO lesson (bahagi_id, title, subtitle, discussion, created_at, updated_at)
           VALUES ($1, $2, $3, $4, NOW(), NOW())
           RETURNING id, bahagi_id, title, subtitle, discussion, created_at`,
          [bahagiId, title, description || null, discussion || null]
        );
      } else {
        throw e;
      }
    }

    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Failed to create yunit' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      yunit: result.rows[0]
    });
  } catch (error: any) {
    console.error('CRITICAL: Create Yunit Error:', {
      message: error?.message,
      stack: error?.stack,
      code: error?.code,
      detail: error?.detail
    });
    return NextResponse.json(
      { error: 'Failed to create yunit', details: error?.message },
      { status: 500 }
    );
  }
}
