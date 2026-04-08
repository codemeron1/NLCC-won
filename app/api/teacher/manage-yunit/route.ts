import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bahagiId, title, description, discussion, mediaUrl } = body;

    if (!bahagiId || !title) {
      return NextResponse.json(
        { error: 'Bahagi ID and title are required' },
        { status: 400 }
      );
    }

    // Try with media_url column, fall back if it doesn't exist
    let result;
    try {
      result = await query(
        `INSERT INTO lesson (
          bahagi_id, title, subtitle, discussion, media_url, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
         RETURNING id, bahagi_id, title, subtitle, discussion, media_url, created_at`,
        [bahagiId, title, description || null, discussion || null, mediaUrl || null]
      );
    } catch (e: any) {
      // If media_url column doesn't exist, try without it
      if (e.message?.includes('media_url') || e.message?.includes('unknown column')) {
        result = await query(
          `INSERT INTO lesson (
            bahagi_id, title, subtitle, discussion, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, NOW(), NOW())
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
      success: true,
      yunit: result.rows[0]
    });
  } catch (error: any) {
    console.error('Create Yunit Error:', error);
    return NextResponse.json(
      { error: 'Failed to create yunit', details: error?.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const bahagiId = request.nextUrl.searchParams.get('bahagiId');

    if (!bahagiId) {
      return NextResponse.json(
        { error: 'Bahagi ID is required' },
        { status: 400 }
      );
    }

    // Try with media_url column, fall back if it doesn't exist
    let result;
    try {
      result = await query(
        `SELECT id, bahagi_id, title, subtitle, discussion, media_url, created_at, updated_at
         FROM lesson
         WHERE bahagi_id = $1
         ORDER BY created_at DESC`,
        [bahagiId]
      );
    } catch (e: any) {
      // If media_url column doesn't exist, try without it
      if (e.message?.includes('media_url') || e.message?.includes('unknown column')) {
        result = await query(
          `SELECT id, bahagi_id, title, subtitle, discussion, created_at, updated_at
           FROM lesson
           WHERE bahagi_id = $1
           ORDER BY created_at DESC`,
          [bahagiId]
        );
      } else {
        throw e;
      }
    }

    return NextResponse.json({
      yunits: result.rows || []
    });
  } catch (error: any) {
    console.error('Get Yunits Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch yunits', details: error?.message },
      { status: 500 }
    );
  }
}
