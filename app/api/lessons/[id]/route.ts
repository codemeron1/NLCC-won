import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch lesson metadata
    const lessonRes = await query('SELECT * FROM lessons WHERE id = $1', [id]);
    if (lessonRes.rows.length === 0) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    const lesson = lessonRes.rows[0];

    const itemsRes = await query(`
      SELECT primary_text, secondary_text, image_emoji, pronunciation, item_order, metadata, link_url
      FROM lesson_items 
      WHERE lesson_id = $1 
      ORDER BY item_order ASC
    `, [id]);

    // Map to the format LessonScreen expects
    const items = itemsRes.rows.map(item => ({
        // Base fields
        primary: item.primary_text,
        secondary: item.secondary_text,
        image: item.image_emoji,
        pronunciation: item.pronunciation,
        link_url: item.link_url,
        
        // Universal fallbacks for generated lessons
        word: item.primary_text,
        sentence: item.secondary_text,
        
        // Specific overrides for standard lessons
        ...(lesson.id === 'alpabeto' && { letter: item.primary_text }),
        ...(lesson.id === 'pantig' && { syllable: item.primary_text }),
        
        // Ensure image mapping is consistent
        image_mapped: item.image_emoji
    }));

    return NextResponse.json({
        ...lesson,
        items: items.map(i => ({
            ...i,
            image: i.image_mapped // LessonScreen uses .image
        }))
    });
  } catch (error: any) {
    console.error('Fetch Lesson Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
