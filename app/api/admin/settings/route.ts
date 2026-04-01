import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // 1. Ensure table exists
    await query(`
      CREATE TABLE IF NOT EXISTS system_settings (
        key VARCHAR(255) PRIMARY KEY,
        value TEXT,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Insert default if missing
    await query(`
      INSERT INTO system_settings (key, value)
      VALUES ('maintenance_mode', 'false')
      ON CONFLICT (key) DO NOTHING
    `);

    // 3. Get all settings
    const result = await query("SELECT key, value FROM system_settings");
    const settings = result.rows.reduce((acc: any, row: any) => {
      acc[row.key] = row.value === 'true';
      return acc;
    }, {});

    return NextResponse.json(settings);
  } catch (error: any) {
    console.error('Settings API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { key, value } = await request.json();

    if (!key) {
      return NextResponse.json({ error: 'Key is required' }, { status: 400 });
    }

    await query(
      "UPDATE system_settings SET value = $1, updated_at = CURRENT_TIMESTAMP WHERE key = $2",
      [String(value), key]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update Settings Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
