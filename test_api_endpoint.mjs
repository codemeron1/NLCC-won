const studentId = '0af7476f-5bae-4d42-9826-4b616e1978f9'; // Juan Dela Cruz

async function testAPI() {
  try {
    console.log('🌐 Testing API endpoint...\n');
    
    const url = `http://localhost:3000/api/student/enrolled-classes?studentId=${studentId}`;
    console.log(`   URL: ${url}\n`);
    
    const response = await fetch(url);
    
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Headers:`, response.headers.get('content-type'));
    
    const data = await response.json();
    
    console.log('\n📦 Response Data:');
    console.log(JSON.stringify(data, null, 2));
    
    if (!data.success && !data.error) {
      console.log('\n⚠️  Response doesn\'t match expected format');
      console.log('   Expected: { success, data } or { success, error }');
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
  }
}

testAPI();
