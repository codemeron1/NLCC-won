import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const res = await query(
      'SELECT lesson_id, score, completed, last_item_index FROM lesson_progress WHERE user_id = $1',
      [userId]
    );

    return NextResponse.json({ progress: res.rows });
  } catch (error: any) {
    console.error('Fetch Progress Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId, lessonId, lastItemIndex, completed, score } = await request.json();

    if (!userId || !lessonId) {
      return NextResponse.json({ error: 'User ID and Lesson ID are required' }, { status: 400 });
    }

    await query(`
      INSERT INTO lesson_progress (user_id, lesson_id, last_item_index, completed, score, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      ON CONFLICT (user_id, lesson_id)
      DO UPDATE SET 
        last_item_index = EXCLUDED.last_item_index,
        completed = CASE WHEN EXCLUDED.completed = TRUE THEN TRUE ELSE lesson_progress.completed END,
        score = GREATEST(lesson_progress.score, EXCLUDED.score),
        updated_at = NOW()
    `, [userId, lessonId, lastItemIndex, completed || false, score || 0]);

    // Log activity if completed
    if (completed) {
        await query(
            "INSERT INTO activity_logs (user_id, action, type, details) VALUES ($1, $2, $3, $4)",
            [userId, 'Lesson Completed', 'lesson', `Completed: ${lessonId}`]
        );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update Progress Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
