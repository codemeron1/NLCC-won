import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Direct PostgreSQL query
    const userRes = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (userRes.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = userRes.rows[0];

    // Fetch related preferences and notifications
    const prefRes = await query('SELECT * FROM preferences WHERE user_id = $1', [user.id]);
    const notifRes = await query('SELECT * FROM notifications WHERE user_id = $1', [user.id]);

    const preferences = prefRes.rows[0];
    const notifications = notifRes.rows[0];

    return NextResponse.json({
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      role: user.role,
      lrn: user.lrn,
      class_name: user.class_name,
      className: user.class_name,
      preferences: preferences ? {
        darkMode: preferences.dark_mode,
        soundEffects: preferences.sound_effects,
        learningLanguage: preferences.learning_language,
        dailyGoal: preferences.daily_goal
      } : null,
      notifications: notifications ? {
        dailyReminders: notifications.daily_reminders,
        friendActivity: notifications.friend_activity,
        weeklyReport: notifications.weekly_report
      } : null,
    });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, preferences, notifications } = body;

    // Check if user exists
    let userId;
    const existingUser = await query('SELECT * FROM users WHERE email = $1', [email]);

    if (existingUser.rows.length > 0) {
      // Update existing
      const updateRes = await query(
        'UPDATE users SET first_name = $1, last_name = $2, updated_at = NOW() WHERE email = $3 RETURNING id',
        [firstName, lastName, email]
      );
      userId = updateRes.rows[0].id;
    } else {
      // Create new
      const insertRes = await query(
        'INSERT INTO users (first_name, last_name, email, role, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING id',
        [firstName, lastName, email, 'USER']
      );
      userId = insertRes.rows[0].id;
    }

    // Upsert preferences
    if (preferences) {
        await query(
            `INSERT INTO preferences (user_id, dark_mode, sound_effects, learning_language, daily_goal) 
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (user_id) DO UPDATE SET 
             dark_mode = EXCLUDED.dark_mode, 
             sound_effects = EXCLUDED.sound_effects, 
             learning_language = EXCLUDED.learning_language, 
             daily_goal = EXCLUDED.daily_goal`,
            [userId, preferences.darkMode, preferences.soundEffects, preferences.learningLanguage, preferences.dailyGoal]
        );
    }

    // Upsert notifications
    if (notifications) {
        await query(
            `INSERT INTO notifications (user_id, daily_reminders, friend_activity, weekly_report) 
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (user_id) DO UPDATE SET 
             daily_reminders = EXCLUDED.daily_reminders, 
             friend_activity = EXCLUDED.friend_activity, 
             weekly_report = EXCLUDED.weekly_report`,
            [userId, notifications.dailyReminders, notifications.friendActivity, notifications.weeklyReport]
        );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

