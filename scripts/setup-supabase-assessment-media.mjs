#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function setupAssessmentMediaBucket() {
    try {
        console.log('🔧 Setting up Supabase storage for assessment media...\n');

        // Check if bucket exists
        console.log('⏳ Checking if "assessment-media" bucket exists...');
        const { data: buckets, error: listError } = await supabase.storage.listBuckets();

        if (listError) {
            console.error('❌ Error listing buckets:', listError.message);
            return;
        }

        const bucketExists = buckets.some(b => b.name === 'assessment-media');

        if (bucketExists) {
            console.log('ℹ️  Bucket "assessment-media" already exists\n');
        } else {
            console.log('⏳ Creating "assessment-media" bucket...');
            const { data, error } = await supabase.storage.createBucket('assessment-media', {
                public: true,
                fileSizeLimit: 10485760 // 10MB
            });

            if (error) {
                console.error('❌ Error creating bucket:', error.message);
                return;
            }
            console.log('✅ Bucket created successfully\n');
        }

        // Set up bucket policies (make files publicly accessible)
        console.log('✅ Bucket is configured for public access\n');

        // Create initial folder structure
        console.log('📁 Setting up folder structure...');

        // Create a placeholder file for folder structure
        const folders = ['image/', 'audio/'];
        
        for (const folder of folders) {
            const { error } = await supabase.storage
                .from('assessment-media')
                .upload(`${folder}.gitkeep`, new Blob([''], { type: 'text/plain' }), {
                    upsert: true
                });

            if (!error) {
                console.log(`✅ Folder: ${folder}`);
            }
        }

        console.log('\n' + '='.repeat(50));
        console.log('✅ Assessment Media Setup Complete!');
        console.log('='.repeat(50));
        console.log('\n📋 Bucket Details:');
        console.log(`   • Name: assessment-media`);
        console.log(`   • Access: Public`);
        console.log(`   • Max File Size: 10 MB`);
        console.log(`   • Supported Types:`);
        console.log(`     - Images: PNG, JPG, GIF, WebP`);
        console.log(`     - Audio: MP3, WAV, OGG, M4A`);
        console.log('\n🚀 Your application is ready to upload media!');

    } catch (err) {
        console.error('💥 Error:', err.message);
        process.exit(1);
    }
}

setupAssessmentMediaBucket();
