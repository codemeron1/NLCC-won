import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, type, options, correctAnswer, points, isPublished } = body;

    if (!id || !title) {
      return NextResponse.json(
        { error: 'ID and title are required' },
        { status: 400 }
      );
    }

    const result = await query(
      `UPDATE bahagi_assessment 
       SET title = $1, type = $2, options = $3, correct_answer = $4, 
           points = $5, is_published = $6, updated_at = NOW()
       WHERE id = $7
       RETURNING id, bahagi_id, lesson_id, title, type, options, correct_answer, points, is_published, created_at`,
      [
        title,
        type || 'multiple-choice',
        options ? JSON.stringify(options) : null,
        correctAnswer ? JSON.stringify(correctAnswer) : null,
        points || 10,
        isPublished !== undefined ? isPublished : false,
        id
      ]
    );

    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      assessment: result.rows[0]
    });
  } catch (error: any) {
    console.error('Update Assessment Error:', error);
    return NextResponse.json(
      { error: 'Failed to update assessment', details: error?.message },
      { status: 500 }
    );
  }
}
