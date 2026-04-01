const { query } = require('./lib/db');

async function checkLessons() {
    try {
        const res = await query(`SELECT id, title, status, is_archived, class_name FROM lessons`);
        console.log('--- Current Lessons in DB ---');
        console.table(res.rows);
    } catch (e) {
        console.error('Error checking lessons:', e.message);
    } finally {
        process.exit();
    }
}

checkLessons();
