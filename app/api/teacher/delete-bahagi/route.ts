import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Bahagi ID is required' },
        { status: 400 }
      );
    }

    // First, delete all related assessments and their answers
    await query(
      `DELETE FROM yunit_answers 
       WHERE assessment_id IN (
         SELECT id FROM bahagi_assessment WHERE bahagi_id = $1
       )`,
      [id]
    );

    // Delete all assessments
    await query(
      `DELETE FROM bahagi_assessment WHERE bahagi_id = $1`,
      [id]
    );

    // Delete all lessons (yunits)
    await query(
      `DELETE FROM lesson WHERE bahagi_id = $1`,
      [id]
    );

    // Delete all rewards
    await query(
      `DELETE FROM bahagi_reward WHERE bahagi_id = $1`,
      [id]
    );

    // Finally, delete the bahagi itself
    const result = await query(
      `DELETE FROM bahagi WHERE id = $1 RETURNING id, title`,
      [id]
    );

    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Bahagi not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Bahagi and all related content deleted permanently',
      bahagi: result.rows[0]
    });
  } catch (error: any) {
    console.error('Delete Bahagi Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete bahagi', details: error?.message },
      { status: 500 }
    );
  }
}
