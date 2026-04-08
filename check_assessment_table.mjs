import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'nlcc_db',
  user: 'postgres',
  password: 'root'
});

await client.connect();

try {
  // Check if bahagi_assessment table exists
  const tables = await client.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bahagi_assessment'"
  );
  
  if (tables.rows.length === 0) {
    console.log('❌ Table "bahagi_assessment" does NOT exist');
  } else {
    console.log('✅ Table "bahagi_assessment" exists');
    
    // Check columns
    const columns = await client.query(
      "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'bahagi_assessment' ORDER BY ordinal_position"
    );
    
    console.log('\nColumns:');
    columns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(NULL)' : '(NOT NULL)'}`);
    });
  }
  
  // Check all tables
  const allTables = await client.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
  );
  
  console.log('\nAll tables in database:');
  allTables.rows.forEach(t => console.log(`  - ${t.table_name}`));
} catch (error) {
  console.error('Error:', error.message);
} finally {
  await client.end();
}
