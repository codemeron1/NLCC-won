import { createClient } from '@supabase/supabase-js';
import { query } from '@/lib/db';
import { NextRequest } from 'next/server';

function getSupabaseClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

export async function POST(req: NextRequest) {
    try {
        const supabase = getSupabaseClient();
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const uploadedBy = formData.get('uploadedBy') as string;
        const fileType = formData.get('fileType') as string; // 'image' or 'audio'

        if (!file || !uploadedBy || !fileType) {
            return Response.json(
                { error: 'Missing required fields: file, uploadedBy, fileType', code: 'MISSING_PARAM' },
                { status: 400 }
            );
        }

        if (!['image', 'audio'].includes(fileType)) {
            return Response.json(
                { error: 'fileType must be "image" or "audio"', code: 'INVALID_TYPE' },
                { status: 400 }
            );
        }

        // Validate file type
        const validImageTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
        const validAudioTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4'];
        const validTypes = fileType === 'image' ? validImageTypes : validAudioTypes;

        if (!validTypes.includes(file.type)) {
            return Response.json(
                { error: `Invalid file type for ${fileType}`, code: 'INVALID_FILE_TYPE' },
                { status: 400 }
            );
        }

        // Check file size (10MB max for media)
        if (file.size > 10 * 1024 * 1024) {
            return Response.json(
                { error: 'File size exceeds 10MB limit', code: 'FILE_TOO_LARGE' },
                { status: 400 }
            );
        }

        const buffer = await file.arrayBuffer();
        const bucketName = 'assessment-media';
        const timestamp = Date.now();
        const ext = file.name.split('.').pop();
        const fileName = `${fileType}/${timestamp}-${Math.random().toString(36).substr(2, 9)}.${ext}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from(bucketName)
            .upload(fileName, buffer, {
                contentType: file.type,
                upsert: false
            });

        if (error) {
            console.error('Supabase upload error:', error);
            
            // Check if bucket exists
            if (error.message.includes('Bucket not exists')) {
                return Response.json(
                    {
                        error: 'Media bucket not configured. Please set up Supabase storage bucket.',
                        code: 'BUCKET_NOT_FOUND',
                        setupGuide: 'Create a bucket named "assessment-media" in Supabase Storage'
                    },
                    { status: 500 }
                );
            }

            throw error;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(fileName);

        const fileUrl = urlData.publicUrl;

        // Save media file record to database
        const mediaResult = await query(
            `INSERT INTO media_files 
             (file_name, file_path, file_type, mime_type, file_size, uploaded_by, bucket_name)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING id`,
            [
                file.name,
                fileName,
                fileType,
                file.type,
                file.size,
                uploadedBy,
                bucketName
            ]
        );

        return Response.json({
            success: true,
            mediaId: mediaResult.rows[0].id,
            fileName: file.name,
            filePath: fileName,
            fileType: fileType,
            url: fileUrl,
            mimeType: file.type,
            size: file.size
        });

    } catch (err: any) {
        console.error('Media Upload Error:', {
            message: err.message,
            stack: err.stack,
            code: err.code
        });

        return Response.json(
            {
                error: 'Failed to upload media file',
                message: err.message,
                code: 'UPLOAD_ERROR'
            },
            { status: 500 }
        );
    }
}

// GET endpoint to list media files
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const fileType = searchParams.get('fileType'); // 'image', 'audio', or null for all
        const uploadedBy = searchParams.get('uploadedBy');

        let sql = 'SELECT * FROM media_files WHERE 1=1';
        const params = [];

        if (fileType) {
            sql += ' AND file_type = $' + (params.length + 1);
            params.push(fileType);
        }

        if (uploadedBy) {
            sql += ' AND uploaded_by = $' + (params.length + 1);
            params.push(uploadedBy);
        }

        sql += ' ORDER BY uploaded_at DESC LIMIT 100';

        const result = await query(sql, params);

        return Response.json({
            success: true,
            mediaFiles: result.rows
        });

    } catch (err: any) {
        console.error('Get Media Error:', {
            message: err.message,
            stack: err.stack,
            code: err.code
        });

        return Response.json(
            {
                error: 'Failed to fetch media files',
                message: err.message,
                code: 'DB_ERROR'
            },
            { status: 500 }
        );
    }
}
