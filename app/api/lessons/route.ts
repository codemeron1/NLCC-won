import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const className = searchParams.get('className');
    
    let whereClause = "WHERE status = 'Published' AND is_archived IS NOT TRUE";
    let params: any[] = [];
    
    // Normalize className
    const normalizedClassName = (className && className !== 'undefined' && className !== 'null' && className !== 'all') ? className : null;

    if (normalizedClassName) {
      // If student HAS a class, show lessons for that class, OR general lessons, OR lessons with no class specified
      whereClause += " AND (class_name = $1 OR class_name = 'General' OR class_name IS NULL OR class_name = '')";
      params.push(normalizedClassName);
    } else {
      // If student has NO class, ONLY show general/public lessons
      whereClause += " AND (class_name = 'General' OR class_name IS NULL OR class_name = '')";
    }

    const res = await query(`
      SELECT id, title, description, category, icon, color, status, students_count, rating, class_name
      FROM lessons 
      ${whereClause}
      ORDER BY created_at DESC
    `, params);
    
    return NextResponse.json({ success: true, lessons: res.rows });
  } catch (error: any) {
    console.error('Fetch Published Lessons Error:', error);
    return NextResponse.json({ error: 'Failed to fetch lessons', details: error.message }, { status: 500 });
  }
}
