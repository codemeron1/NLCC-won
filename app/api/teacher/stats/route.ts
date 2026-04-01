import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');

    if (!teacherId) {
      return NextResponse.json({ error: 'Teacher ID is required' }, { status: 400 });
    }

    // 0. Fetch Teacher's Class
    const teacherRes = await query('SELECT class_name FROM users WHERE id = $1', [teacherId]);
    const teacherClass = teacherRes.rows[0]?.class_name;

    // 1. Get students for this teacher's class (only show students in the same class)
    // If teacher has no class, maybe show no students or all? 
    // Usually, they should only see their assigned class.
    const studentsRes = await query(`
      SELECT 
          u.id, 
          u.first_name, 
          u.last_name, 
          u.email,
          u.role,
          u.class_name,
          COALESCE((SELECT AVG(score) FROM lesson_progress WHERE user_id = u.id), 0) as progress,
          (SELECT created_at FROM activity_logs WHERE user_id = u.id ORDER BY created_at DESC LIMIT 1) as last_active
      FROM users u
      WHERE u.role = 'USER' ${teacherClass ? 'AND u.class_name = $1' : ''}
      ORDER BY u.created_at DESC
    `, teacherClass ? [teacherClass] : []);

    // ... (formatting students logic remains same, but we use the filtered results)
    const students = studentsRes.rows.map(s => {
        let status = 'Offline';
        let lastActiveStr = 'Never';
        if (s.last_active) {
            const diffMinutes = Math.floor((Date.now() - new Date(s.last_active).getTime()) / 60000);
            if (diffMinutes < 15) status = 'Online';
            else if (diffMinutes < 60) status = 'Idle';
            
            if (diffMinutes === 0) lastActiveStr = 'Just now';
            else if (diffMinutes < 60) lastActiveStr = `${diffMinutes}m ago`;
            else if (diffMinutes < 1440) lastActiveStr = `${Math.floor(diffMinutes/60)}h ago`;
            else lastActiveStr = `${Math.floor(diffMinutes/1440)}d ago`;
        }
        
        return {
            id: s.id,
            name: `${s.first_name || ''} ${s.last_name || ''}`.trim() || s.email?.split('@')[0] || 'Unknown Student',
            progress: Math.min(100, Math.round(Number(s.progress))),
            lastActive: lastActiveStr,
            status,
            email: s.email,
            role: s.role,
            className: s.class_name,
            class_name: s.class_name
        };
    });

    // 3. Compute overall stats
    const totalStudents = students.length;
    let activeTodayCount = 0;
    let totalScoreSum = 0;
    
    students.forEach(s => {
       totalScoreSum += s.progress;
       if (s.lastActive.includes('Just now') || s.lastActive.includes('m ago') || s.lastActive.includes('h ago')) {
           activeTodayCount++;
       }
    });

    const classAvg = totalStudents > 0 ? Math.round(totalScoreSum / totalStudents) : 0;
    
    const lessonsRes = await query("SELECT count(*) FROM lessons WHERE is_archived IS NOT TRUE");
    const totalLessons = parseInt(lessonsRes.rows[0].count, 10) || 0;

    const stats = [
        { label: 'Total Students', value: totalStudents.toString(), icon: '👥', color: 'text-brand-purple' },
        { label: 'Class Average', value: `${classAvg}%`, icon: '📈', color: 'text-emerald-400' },
        { label: 'Login Today', value: `${activeTodayCount} Students`, icon: '👤', color: 'text-amber-500' },
        { label: 'Total Lessons', value: totalLessons.toString(), icon: '📝', color: 'text-brand-sky' },
    ];

    const classes = teacherClass ? [
        { 
            id: 'class-' + teacherClass.toLowerCase().replace(' ', '-'), 
            name: teacherClass, 
            students: totalStudents, 
            progress: classAvg, 
            nextLesson: 'Lesson Plan Active', 
            color: teacherClass === 'Kinder 1' ? 'border-brand-sky' : 'border-brand-purple' 
        }
    ] : [];
    
    // 4. Weekly chart data — avg score per day for the last 7 days
    const weeklyRes = await query(`
      SELECT
        TO_CHAR(lp.updated_at, 'Dy') as day,
        ROUND(AVG(lp.score)) as avg_score,
        DATE_TRUNC('day', lp.updated_at) as day_date
      FROM lesson_progress lp
      JOIN users u ON lp.user_id = u.id
      WHERE u.role = 'USER'
        ${teacherClass ? 'AND u.class_name = $1' : ''}
        AND lp.updated_at >= NOW() - INTERVAL '7 days'
      GROUP BY day_date, day
      ORDER BY day_date ASC
    `, teacherClass ? [teacherClass] : []);

    // Build a full 7-day list with 0 fill for missing days
    const weekDays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const today = new Date();
    const weeklyChart = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i));
      const label = weekDays[d.getDay()];
      const found = weeklyRes.rows.find(r => r.day.trim() === label);
      return { label, value: found ? Math.round(Number(found.avg_score)) : 0 };
    });

    // 5. Monthly chart data — avg score per week for the last 4 weeks
    const monthlyRes = await query(`
      SELECT
        'Week ' || TO_CHAR(DATE_TRUNC('week', lp.updated_at), 'W') as week_label,
        ROUND(AVG(lp.score)) as avg_score,
        DATE_TRUNC('week', lp.updated_at) as week_date
      FROM lesson_progress lp
      JOIN users u ON lp.user_id = u.id
      WHERE u.role = 'USER'
        ${teacherClass ? 'AND u.class_name = $1' : ''}
        AND lp.updated_at >= NOW() - INTERVAL '28 days'
      GROUP BY week_date, week_label
      ORDER BY week_date ASC
      LIMIT 4
    `, teacherClass ? [teacherClass] : []);

    const monthlyChart = Array.from({ length: 4 }, (_, i) => {
      const found = monthlyRes.rows[i];
      return { label: found?.week_label || `Week ${i + 1}`, value: found ? Math.round(Number(found.avg_score)) : 0 };
    });

    return NextResponse.json({
        stats,
        students,
        classes,
        weeklyChart,
        monthlyChart,
        _debug: {
            rawRows: studentsRes.rows.length,
            processedStudents: students.length,
            teacherIdPassed: teacherId
        }
    });
  } catch (error: any) {
    console.error('Teacher Stats API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
