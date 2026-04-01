import { query } from './lib/db';

async function setup() {
    try {
        console.log('Adding columns to lessons table...');
        await query(`
            ALTER TABLE lessons 
            ADD COLUMN IF NOT EXISTS class_name VARCHAR(255),
            ADD COLUMN IF NOT EXISTS teacher_id VARCHAR(255);
        `);
        console.log('Successfully updated lessons table.');
    } catch (e) {
        console.error('Error updating table:', e.message);
    } finally {
        process.exit();
    }
}

setup();
