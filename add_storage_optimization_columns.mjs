/**
 * Add Storage Optimization Columns to media_files table
 * Run this script to add columns for tracking image optimization
 */

import { query } from '../lib/db.js';

async function addStorageOptimizationColumns() {
  console.log('🔧 Adding storage optimization columns to media_files table...\n');

  try {
    // Add columns for optimization tracking
    await query(`
      ALTER TABLE media_files 
      ADD COLUMN IF NOT EXISTS original_size INTEGER,
      ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
      ADD COLUMN IF NOT EXISTS optimized BOOLEAN DEFAULT FALSE;
    `);

    console.log('✅ Successfully added optimization columns:');
    console.log('   - original_size: INTEGER (size before compression)');
    console.log('   - thumbnail_url: TEXT (URL to thumbnail version)');
    console.log('   - optimized: BOOLEAN (whether file was optimized)');

    // Verify columns were added
    const result = await query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'media_files' 
      AND column_name IN ('original_size', 'thumbnail_url', 'optimized')
      ORDER BY column_name;
    `);

    console.log('\n📋 Column details:');
    result.rows.forEach((col) => {
      console.log(`   ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });

    console.log('\n✨ Migration complete!');
    console.log('\nNext steps:');
    console.log('1. Update your upload code to use the optimized route');
    console.log('2. Run storage audit: GET /api/storage/cleanup?details=true');
    console.log('3. Deploy to Vercel with optimizations enabled');

  } catch (err) {
    console.error('❌ Migration failed:', err);
    throw err;
  }
}

// Run migration
addStorageOptimizationColumns()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
