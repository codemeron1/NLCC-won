import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env.local') });

// Test teacher: Maria Santos
const teacherId = 'ba70c802-29ac-421d-b5c9-863486d7312e';

async function testTeacherAPI() {
  try {
    console.log('🧪 Testing Teacher Stats API Fix\n');
    console.log(`Teacher ID: ${teacherId}`);
    console.log(`Teacher: Maria Santos (has 11 classes)\n`);
    
    // Test the API endpoint
    const url = `http://localhost:3000/api/teacher/stats?teacherId=${teacherId}`;
    console.log(`📡 Calling: ${url}\n`);
    
    const response = await fetch(url);
    
    console.log(`✅ Status: ${response.status} ${response.statusText}\n`);
    
    const data = await response.json();
    
    console.log('📦 Response Structure:\n');
    console.log(`   success: ${data.success}`);
    console.log(`   data: ${data.data ? 'Present' : 'Missing'}`);
    
    if (data.success && data.data) {
      console.log('\n✅ Response format is CORRECT!\n');
      console.log('📊 Data contents:');
      console.log(`   Classes: ${data.data.classes?.length || 0}`);
      console.log(`   Students: ${data.data.students?.length || 0}`);
      console.log(`   Stats: ${data.data.stats?.length || 0}`);
      
      if (data.data.classes && data.data.classes.length > 0) {
        console.log('\n🏫 First 3 classes:');
        data.data.classes.slice(0, 3).forEach((cls, i) => {
          console.log(`   ${i + 1}. ${cls.name} (${cls.student_count} students, ${cls.lesson_count} lessons)`);
        });
      }
      
      console.log('\n✅ FIX SUCCESSFUL! Teacher should now see their classes.');
    } else {
      console.log('\n❌ Response format is INCORRECT');
      console.log('Raw response:', JSON.stringify(data, null, 2));
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

testTeacherAPI();
