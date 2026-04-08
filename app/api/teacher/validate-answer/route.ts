import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface AssessmentQuestion {
  type: string;
  correctAnswer: string | string[] | Record<string, string>;
}

interface StudentAnswer {
  type: string;
  answer: string | string[] | Record<string, string>;
}

function validateAnswer(assessment: AssessmentQuestion, studentAnswer: StudentAnswer): boolean {
  if (assessment.type !== studentAnswer.type) {
    return false;
  }

  switch (assessment.type) {
    case 'multiple-choice':
    case 'short-answer':
      return String(assessment.correctAnswer).toLowerCase().trim() === 
             String(studentAnswer.answer).toLowerCase().trim();

    case 'checkbox':
      // For checkboxes, compare arrays
      const correctArr = Array.isArray(assessment.correctAnswer) ? assessment.correctAnswer : [assessment.correctAnswer];
      const studentArr = Array.isArray(studentAnswer.answer) ? studentAnswer.answer : [studentAnswer.answer];
      return JSON.stringify(correctArr.sort()) === JSON.stringify(studentArr.sort());

    case 'matching':
      // For matching, compare object values
      const correctMatching = assessment.correctAnswer as Record<string, string>;
      const studentMatching = studentAnswer.answer as Record<string, string>;
      return JSON.stringify(correctMatching) === JSON.stringify(studentMatching);

    case 'scramble-word':
      // For scramble word, compare the arranged words
      return JSON.stringify(assessment.correctAnswer) === JSON.stringify(studentAnswer.answer);

    case 'audio':
      // Audio answers should be validated server-side via speech-to-text
      // This is a placeholder - actual implementation would use speech recognition API
      return true;

    default:
      return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { assessmentId, studentId, answer } = body;

    if (!assessmentId || !studentId || !answer) {
      return NextResponse.json(
        { error: 'Assessment ID, student ID, and answer are required' },
        { status: 400 }
      );
    }

    // Fetch the assessment to get correct answer
    const assessmentResult = await query(
      `SELECT id, type, correct_answer, points FROM bahagi_assessment WHERE id = $1`,
      [assessmentId]
    );

    if (!assessmentResult.rows || assessmentResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    const assessment = assessmentResult.rows[0];
    const correctAnswer = assessment.correct_answer ? JSON.parse(assessment.correct_answer) : null;

    // Validate the answer
    const isCorrect = validateAnswer(
      { type: assessment.type, correctAnswer },
      { type: assessment.type, answer }
    );

    const earnedPoints = isCorrect ? assessment.points : 0;

    // Save the answer to database
    const result = await query(
      `INSERT INTO yunit_answers (assessment_id, student_id, answer, is_correct, earned_points, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING id, assessment_id, student_id, answer, is_correct, earned_points, created_at`,
      [assessmentId, studentId, JSON.stringify(answer), isCorrect, earnedPoints]
    );

    return NextResponse.json({
      success: true,
      isCorrect,
      earnedPoints,
      totalPoints: assessment.points,
      message: isCorrect ? '✅ Correct answer!' : '❌ Incorrect answer',
      answer: result.rows[0]
    });
  } catch (error: any) {
    console.error('Validate Answer Error:', error);
    return NextResponse.json(
      { error: 'Failed to validate answer', details: error?.message },
      { status: 500 }
    );
  }
}
