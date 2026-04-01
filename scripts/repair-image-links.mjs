import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function repairImages() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    const pool = new pg.Pool({
        connectionString: process.env.POSTGRES_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log("🔍 Checking for broken Pollinations links...");
        
        // Check lesson_items
        const itemsRes = await pool.query(
            "SELECT id, image_emoji FROM lesson_items WHERE image_emoji LIKE '%image.pollinations.ai/prompt/%'"
        );
        
        console.log(`Found ${itemsRes.rows.length} broken links in lesson_items.`);

        for (const row of itemsRes.rows) {
            const newUrl = row.image_emoji.replace('image.pollinations.ai/prompt/', 'pollinations.ai/p/');
            await pool.query("UPDATE lesson_items SET image_emoji = $1 WHERE id = $2", [newUrl, row.id]);
            console.log(`✅ Updated item ${row.id}`);
        }

        // Check lessons (icons)
        const lessonsRes = await pool.query(
            "SELECT id, icon FROM lessons WHERE icon LIKE '%image.pollinations.ai/prompt/%'"
        );
        
        console.log(`Found ${lessonsRes.rows.length} broken links in lessons (icons).`);

        for (const row of lessonsRes.rows) {
            const newUrl = row.icon.replace('image.pollinations.ai/prompt/', 'pollinations.ai/p/');
            await pool.query("UPDATE lessons SET icon = $1 WHERE id = $2", [newUrl, row.id]);
            console.log(`✅ Updated lesson icon ${row.id}`);
        }

        console.log("✨ database repair complete!");

    } catch (err) {
        console.error("❌ Repair failed:", err);
    } finally {
        await pool.end();
    }
}

repairImages();
