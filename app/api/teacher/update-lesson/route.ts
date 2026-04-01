import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function PATCH(request: Request) {
  try {
    const { id, title, description, icon, items } = await request.json();

    if (!id || !title) {
      return NextResponse.json({ error: 'Lesson ID and Title are required' }, { status: 400 });
    }

    // Update lesson metadata
    await query(
      `UPDATE lessons 
       SET title = $1, description = $2, icon = $3, updated_at = NOW() 
       WHERE id = $4`,
      [title, description || '', icon || '📚', id]
    );

    // Update items: Simple approach - delete and re-insert
    if (items && Array.isArray(items)) {
      await query("DELETE FROM lesson_items WHERE lesson_id = $1", [id]);
      
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        await query(
          `INSERT INTO lesson_items (lesson_id, primary_text, secondary_text, image_emoji, pronunciation, item_order, link_url) 
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            id, 
            item.primaryText || item.word || '', 
            item.secondaryText || item.sentence || '', 
            item.imageEmoji || item.image || '⭐', 
            item.pronunciation || '', 
            i,
            item.linkUrl || null
          ]
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update Lesson Error:', error);
    return NextResponse.json({ error: 'Failed to update lesson', details: error.message }, { status: 500 });
  }
}
