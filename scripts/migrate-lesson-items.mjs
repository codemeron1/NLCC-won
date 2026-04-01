import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function migrate() {
  try {
    // 1. Create lesson_items table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS lesson_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        lesson_id VARCHAR(50) REFERENCES lessons(id) ON DELETE CASCADE,
        primary_text VARCHAR(255) NOT NULL,
        secondary_text VARCHAR(255),
        image_emoji VARCHAR(50),
        pronunciation VARCHAR(255),
        item_order INTEGER DEFAULT 0,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('lesson_items table created');

    // 2. Seed from LESSON_DATA
    const LESSON_DATA = {
        alpabeto: {
            title: 'Alpabetong Filipino',
            items: [
                { letter: 'A', word: 'Aso', image: '🐕', pronunciation: 'Ah-soh' },
                { letter: 'B', word: 'Bahay', image: '🏠', pronunciation: 'Bah-hai' },
                { letter: 'K', word: 'Kambing', image: '🐐', pronunciation: 'Kam-bing' },
                { letter: 'D', word: 'Daga', image: '🐁', pronunciation: 'Da-gah' },
                { letter: 'E', word: 'Eroplano', image: '✈️', pronunciation: 'Eh-ro-pla-no' },
                { letter: 'G', word: 'Gatas', image: '🥛', pronunciation: 'Ga-tas' },
            ],
        },
        pantig: {
            title: 'Mga Pantig',
            items: [
                { syllable: 'Ba', word: 'Balon', image: '🎈' },
                { syllable: 'Be', word: 'Bibe', image: '🦆' },
                { syllable: 'Bi', word: 'Bigas', image: '🍚' },
                { syllable: 'Bo', word: 'Bola', image: '⚽' },
                { syllable: 'Bu', word: 'Buko', image: '🥥' },
            ],
        },
        salita: {
            title: 'Mga Salitang Pangunahing',
            items: [
                { word: 'Araw', image: '☀️', sentence: 'Maliwanag ang araw.' },
                { word: 'Puno', image: '🌳', sentence: 'Malaki ang puno.' },
                { word: 'Isda', image: '🐟', sentence: 'Lumalangoy ang isda.' },
                { word: 'Aklat', image: '📚', sentence: 'Nagbabasa ako ng aklat.' },
            ],
        },
        pagbasa: {
            title: 'Pagbasa ng Pangungusap',
            items: [
                { word: 'Ako ay bata.', image: '👶', sentence: 'Ako ay isang masayang bata.' },
                { word: 'Mahal ko ang pamilya ko.', image: '👨‍👩‍👧‍👦', sentence: 'Sila ang aking mahal.' },
                { word: 'Masarap ang prutas.', image: '🍎', sentence: 'Kumakain ako ng mansanas.' },
            ],
        },
        kulay: {
            title: 'Mga Kulay',
            items: [
                { word: 'Pula', image: '🍎', sentence: 'Kulay pula ang mansanas.' },
                { word: 'Asul', image: '🦋', sentence: 'Kulay asul ang paruparo.' },
                { word: 'Dilaw', image: '🍌', sentence: 'Kulay dilaw ang saging.' },
                { word: 'Berde', image: '🍃', sentence: 'Kulay berde ang dahon.' },
            ],
        },
        bilang: {
            title: 'Mga Bilang',
            items: [
                { word: 'Isa', image: '1️⃣', sentence: 'Isa lang ang aking ilong.' },
                { word: 'Dalawa', image: '2️⃣', sentence: 'Dalawa ang aking mga mata.' },
                { word: 'Tatlo', image: '3️⃣', sentence: 'Tatlo ang aking mga daliri (halimbawa).' },
                { word: 'Apat', image: '4️⃣', sentence: 'Apat ang paa ng aso.' },
                { word: 'Lima', image: '5️⃣', sentence: 'Lima ang daliri sa isang kamay.' },
            ],
        }
    };

    for (const [lessonId, data] of Object.entries(LESSON_DATA)) {
        // Ensure lesson exists
        const lessonExists = await pool.query('SELECT id FROM lessons WHERE id = $1', [lessonId]);
        if (lessonExists.rows.length === 0) {
            console.log(`Creating missing lesson: ${lessonId}`);
            await pool.query(
                'INSERT INTO lessons (id, title, category, status, icon, color) VALUES ($1, $2, $3, $4, $5, $6)',
                [lessonId, data.title, 'Reading', 'Published', '📚', 'bg-brand-purple']
            );
        }

        // Check if items already exist
        const exists = await pool.query('SELECT count(*) FROM lesson_items WHERE lesson_id = $1', [lessonId]);
        if (parseInt(exists.rows[0].count) === 0) {
            console.log(`Seeding items for lesson: ${lessonId}`);
            for (let i = 0; i < data.items.length; i++) {
                const item = data.items[i];
                await pool.query(
                    'INSERT INTO lesson_items (lesson_id, primary_text, secondary_text, image_emoji, pronunciation, item_order) VALUES ($1, $2, $3, $4, $5, $6)',
                    [
                        lessonId, 
                        item.letter || item.syllable || item.word, 
                        item.word || item.sentence, 
                        item.image, 
                        item.pronunciation || null,
                        i
                    ]
                );
            }
        }
    }
    console.log('Seeding complete');

  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await pool.end();
  }
}

migrate();
