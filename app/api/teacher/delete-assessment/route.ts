import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Assessment ID is required' },
        { status: 400 }
      );
    }

    // Delete all answers for this assessment
    await query(
      `DELETE FROM yunit_answers WHERE assessment_id = $1`,
      [id]
    );

    // Delete the assessment
    const result = await query(
      `DELETE FROM bahagi_assessment WHERE id = $1 RETURNING id, title, bahagi_id`,
      [id]
    );

    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Assessment deleted permanently',
      assessment: result.rows[0]
    });
  } catch (error: any) {
    console.error('Delete Assessment Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete assessment', details: error?.message },
      { status: 500 }
    );
  }
}
