#!/usr/bin/env node
/**
 * Supabase Storage Bucket Setup
 * Creates "assessment-media" bucket for media uploads
 * No external dependencies required
 */

const bucketName = 'assessment-media';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.log('\n⚠️  Environment variables not set. Using manual instructions instead...\n');
    console.log('📋 MANUAL SETUP INSTRUCTIONS:\n');
    console.log('1. Go to: https://app.supabase.com');
    console.log('2. Project: jzuzdycorgdugpbidzyg');
    console.log('3. Left sidebar: Storage');
    console.log('4. Click: "Create a new bucket"');
    console.log('5. Name: assessment-media');
    console.log('6. Check: "Public bucket"');
    console.log('7. Size limit: 10 MB');
    console.log('8. Click: "Create bucket"\n');
    console.log('✅ Done! Bucket will be ready for use.\n');
    process.exit(0);
}

console.log('🔧 Setting up Supabase storage bucket...\n');
console.log('📋 Instructions for Manual Setup:\n');
console.log('Since we\'re in Node.js without fetch, please create the bucket manually:\n');
console.log('1. Go to: https://app.supabase.com');
console.log('2. Login with your credentials');
console.log('3. Select project: jzuzdycorgdugpbidzyg');
console.log('4. Left sidebar → Storage');
console.log('5. Click "Create a new bucket"');
console.log('6. Bucket name: assessment-media');
console.log('7. ✅ Check: "Public bucket"');
console.log('8. File size limit: 10 MB');
console.log('9. Click: "Create bucket"\n');
console.log('Or use Supabase CLI:\n');
console.log(`  npx supabase storage create-bucket ${bucketName} --public\n`);
console.log('Alternative - REST API call:\n');
console.log(`  curl -X POST https://jzuzdycorgdugpbidzyg.supabase.co/storage/v1/bucket \\`);
console.log(`    -H "Authorization: Bearer ${serviceRoleKey.substring(0, 20)}..." \\`);
console.log(`    -H "Content-Type: application/json" \\`);
console.log(`    -d '{"name":"${bucketName}","public":true}'\n`);
console.log('When done, you can test with:\n');
console.log('  npm run test:enhancements\n');
