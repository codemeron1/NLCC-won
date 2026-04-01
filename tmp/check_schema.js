const { query } = require('./lib/db');

async function checkSchema() {
    try {
        const res = await query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'lessons'
        `);
        console.log('Columns in lessons table:');
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (e) {
        console.error('Error checking schema:', e.message);
    } finally {
        process.exit();
    }
}

checkSchema();
