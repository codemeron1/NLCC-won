import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { bahagiId, classId, lessonId, title, type, options, correctAnswer, points, reward, questions, instructions } = body;

    if (!bahagiId && classId) {
      bahagiId = classId;
    }

    const typeMap: {[key: string]: string} = {
      'media-audio': 'audio',
      'scramble': 'scramble-word'
    };
    if (type && typeMap[type]) {
      type = typeMap[type];
    }

    if (!bahagiId || !title || !type) {
      return NextResponse.json(
        { error: 'Bahagi ID, title, and type are required' },
        { status: 400 }
      );
    }

    const validTypes = [
      'multiple-choice',
      'short-answer',
      'checkbox',
      'audio',
      'matching',
      'scramble-word'
    ];

    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid assessment type. Valid types: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    const pointsValue = points ? parseInt(points) : (reward ? parseInt(reward) : 10);

    // Try inserting with enhanced schema columns first
    let result;
    try {
      result = await query(
        `INSERT INTO bahagi_assessment (
          bahagi_id, lesson_id, title, type, options, correct_answer, points, content, assessment_order, is_published, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
         RETURNING id, bahagi_id, lesson_id, title, type, options, correct_answer, points, content, created_at`,
        [
          bahagiId,
          lessonId || null,
          title,
          type,
          options ? JSON.stringify(options) : null,
          correctAnswer ? JSON.stringify(correctAnswer) : null,
          pointsValue,
          JSON.stringify({ instructions: instructions || '', questions: questions || null }),
          0,
          true
        ]
      );
    } catch (e: any) {
      // If enhanced columns don't exist, try with base schema
      if (e.message?.includes('column') || e.message?.includes('does not exist')) {
        result = await query(
          `INSERT INTO bahagi_assessment (
            bahagi_id, title, type, content, assessment_order, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
           RETURNING id, bahagi_id, title, type, content, created_at`,
          [
            bahagiId,
            title,
            type,
            JSON.stringify({
              instructions: instructions || '',
              questions: questions || null,
              options: options || null,
              correctAnswer: correctAnswer || null,
              points: pointsValue,
              lessonId: lessonId || null
            }),
            0
          ]
        );
      } else {
        throw e;
      }
    }

    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Failed to create assessment' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      assessment: result.rows[0]
    });
  } catch (error: any) {
    console.error('Create Assessment Error:', error?.message);
    return NextResponse.json(
      { error: 'Failed to create assessment', details: error?.message },
      { status: 500 }
    );
  }
}


export async function GET(request: NextRequest) {
  try {
    const bahagiId = request.nextUrl.searchParams.get('bahagiId');
    const lessonId = request.nextUrl.searchParams.get('lessonId');

    if (!bahagiId) {
      return NextResponse.json(
        { error: 'Bahagi ID is required', assessments: [] },
        { status: 200 }
      );
    }

    let result;

    // Try with enhanced schema first
    try {
      let queryStr = `SELECT id, bahagi_id, lesson_id, title, type, options, correct_answer, points, content, assessment_order, is_published, is_archived, created_at, updated_at
                      FROM bahagi_assessment
                      WHERE bahagi_id = $1`;
      let params: any[] = [bahagiId];

      if (lessonId) {
        queryStr += ` AND lesson_id = $2`;
        params.push(lessonId);
      }

      queryStr += ` ORDER BY assessment_order, created_at DESC`;

      result = await query(queryStr, params);
    } catch (e: any) {
      // Fall back to base schema if enhanced columns don't exist
      if (e.message?.includes('column') || e.message?.includes('does not exist')) {
        let queryStr = `SELECT id, bahagi_id, title, type, content, assessment_order, created_at, updated_at
                        FROM bahagi_assessment
                        WHERE bahagi_id = $1`;
        let params: any[] = [bahagiId];

        if (lessonId) {
          queryStr += ` AND id = $2`;  // Note: lessonId might not exist, so skip for base schema
          // params.push(lessonId);
        }

        queryStr += ` ORDER BY assessment_order, created_at DESC`;

        result = await query(queryStr, [bahagiId]);
      } else {
        throw e;
      }
    }

    // Transform response to parse JSONB content if present
    const assessments = (result.rows || []).map(row => {
      const assessment: any = { ...row };
      if (row.content && typeof row.content === 'string') {
        try {
          assessment.content = JSON.parse(row.content);
        } catch (e) {
          // Leave as string if parse fails
        }
      }
      return assessment;
    });

    return NextResponse.json({ assessments });
  } catch (error: any) {
    console.error('Get Assessments Error:', error?.message);
    return NextResponse.json({
      assessments: []
    });
  }
}
