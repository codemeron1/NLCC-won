import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('CREATE YUNIT - Received body:', body);
    
    const { bahagiId, title, description, discussion, mediaUrl } = body;

    console.log('CREATE YUNIT - Parsed params:', {
      bahagiId: bahagiId || 'MISSING',
      title: title ? `"${title}"` : 'MISSING',
      description: description || 'not provided',
      discussion: discussion ? `"${discussion.substring(0, 50)}..."` : 'not provided',
      mediaUrl: mediaUrl || 'not provided'
    });

    if (!bahagiId || !title) {
      return NextResponse.json(
        { error: 'Bahagi ID and title are required' },
        { status: 400 }
      );
    }

    // Create yunit (lesson) in database
    console.log('CREATE YUNIT - About to INSERT into lesson table');
    
    // Try with media_url column, fall back if it doesn't exist
    let result;
    try {
      result = await query(
        `INSERT INTO lesson (bahagi_id, title, subtitle, discussion, media_url, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
         RETURNING id, bahagi_id, title, subtitle, discussion, media_url, created_at, updated_at`,
        [bahagiId, title, description || null, discussion || null, mediaUrl || null]
      );
    } catch (e: any) {
      // If media_url column doesn't exist, try without it
      if (e.message?.includes('media_url') || e.message?.includes('unknown column') || e.message?.includes('column')) {
        result = await query(
          `INSERT INTO lesson (bahagi_id, title, subtitle, discussion, created_at, updated_at)
           VALUES ($1, $2, $3, $4, NOW(), NOW())
           RETURNING id, bahagi_id, title, subtitle, discussion, created_at, updated_at`,
          [bahagiId, title, description || null, discussion || null]
        );
      } else {
        throw e;
      }
    }

    console.log('CREATE YUNIT - Query result:', result);

    if (!result.rows || result.rows.length === 0) {
      console.error('CREATE YUNIT - No rows returned from INSERT');
      return NextResponse.json(
        { error: 'Failed to create yunit' },
        { status: 500 }
      );
    }

    const yunitData = result.rows[0];
    console.log('CREATE YUNIT - Success! Created:', yunitData.id);

    return NextResponse.json({
      yunit: {
        id: yunitData.id,
        bahagi_id: yunitData.bahagi_id,
        title: yunitData.title,
        subtitle: yunitData.subtitle,
        discussion: yunitData.discussion,
        mediaUrl: yunitData.media_url,
        created_at: yunitData.created_at
      }
    });
  } catch (error: any) {
    console.error('CRITICAL: Create Yunit Error:', {
        message: error?.message,
        stack: error?.stack,
        code: error?.code,
        detail: error?.detail
    });
    return NextResponse.json(
      { error: 'Failed to create yunit', details: error.message },
      { status: 500 }
    );
  }
}
