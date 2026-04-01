import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get learned words (sum of items in completed lessons)
    const learnedWordsRes = await query(`
      SELECT COALESCE(COUNT(li.id), 0) as total
      FROM lesson_progress p
      JOIN lesson_items li ON p.lesson_id = li.lesson_id
      WHERE p.user_id = $1 AND p.completed = true
    `, [userId]);

    // Get average score
    const avgScoreRes = await query(`
        SELECT COALESCE(AVG(score), 0) as avg
        FROM lesson_progress
        WHERE user_id = $1 AND completed = true
    `, [userId]);

    // Get total stars from assignments
    const totalStarsRes = await query(`
        SELECT COALESCE(SUM(a.reward), 0) as total
        FROM student_assignments sa
        JOIN assignments a ON sa.assignment_id = a.id
        WHERE sa.user_id = $1 AND sa.status = 'completed'
    `, [userId]);

    // Get time spent (estimate from activity logs)
    const activityCountRes = await query(`
        SELECT COUNT(*) as total
        FROM activity_logs
        WHERE user_id = $1
    `, [userId]);
    const studyHours = Math.floor(Number(activityCountRes.rows[0].total) / 4); // Fake but dynamic

    const stats = [
        { label: 'Natutunang Salita', value: learnedWordsRes.rows[0].total.toString(), color: 'text-indigo-700', trend: '+100%' },
        { label: 'Mastery Level', value: `${Math.round(Number(avgScoreRes.rows[0].avg))}%`, color: 'text-green-700', trend: '+5%' },
        { label: 'Kabuuang Stars', value: totalStarsRes.rows[0].total.toLocaleString(), color: 'text-amber-700', trend: '+10' },
        { label: 'Matutunan Level', value: `Level ${Math.ceil(Number(learnedWordsRes.rows[0].total) / 10)}`, color: 'text-purple-700', trend: 'Active' },
    ];

    // Real curriculum progress
    const progressRes = await query(`
        SELECT l.title as label, p.score as val
        FROM lesson_progress p
        JOIN lessons l ON p.lesson_id = l.id
        WHERE p.user_id = $1
        ORDER BY p.updated_at DESC
        LIMIT 5
    `, [userId]);

    const progress = progressRes.rows.map(row => ({
        ...row,
        color: Number(row.val) > 70 ? 'bg-brand-sky' : Number(row.val) > 40 ? 'bg-brand-purple' : 'bg-brand-coral'
    }));

    // If no progress, provide placeholders so it doesn't look empty
    if (progress.length === 0) {
        progress.push({ label: 'Magsimula ng Aralin', val: 0, color: 'bg-slate-200' });
    }

    const achievements = [
        { icon: Number(learnedWordsRes.rows[0].total) > 0 ? '🏅' : '❓', label: 'First Word', color: 'bg-brand-sky' },
        { icon: Number(avgScoreRes.rows[0].avg) > 80 ? '🎯' : '❓', label: 'Mastery', color: 'bg-brand-purple' },
        { icon: Number(totalStarsRes.rows[0].total) > 100 ? '🚀' : '❓', label: 'Star Collector', color: 'bg-brand-coral' },
        { icon: Number(activityCountRes.rows[0].total) > 10 ? '🔥' : '❓', label: 'Active', color: 'bg-brand-orange' }
    ];

    return NextResponse.json({
        stats,
        progress: progress.length > 0 ? progress : [
            { label: 'Simulan ang Alpabeto', val: 0, color: 'bg-slate-200' }
        ],
        achievements
    });
  } catch (error: any) {
    console.error('User Stats API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
