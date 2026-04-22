/**
 * Enhanced Supabase Storage Upload with Optimization
 * Replaces the basic upload in app/api/teacher/upload-media/route.ts
 * NOTE: This route requires 'sharp' package: npm install sharp
 */

import { createClient } from '@supabase/supabase-js';
import { query } from '@/lib/db';
import { NextRequest } from 'next/server';

// Import sharp dynamically to handle cases where it's not installed
let sharp: any;
try {
    sharp = require('sharp');
} catch (e) {
    console.warn('Sharp not installed. Image optimization will be disabled. Install with: npm install sharp');
}

function getSupabaseClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

/**
 * Compress image using sharp library (server-side)
 */
async function compressImage(buffer: Uint8Array, mimeType: string): Promise<Uint8Array> {
    if (!sharp) {
        throw new Error('Sharp is not installed. Run: npm install sharp');
    }
    
    let sharpInstance = sharp(buffer);
    
    // Get image metadata
    const metadata = await sharpInstance.metadata();
    
    // Resize if too large (max 1920x1080)
    if (metadata.width && metadata.width > 1920) {
        sharpInstance = sharpInstance.resize(1920, null, {
            fit: 'inside',
            withoutEnlargement: true
        });
    }
    
    // Compress based on format
    if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
        return await sharpInstance
            .jpeg({ quality: 80, progressive: true })
            .toBuffer();
    } else if (mimeType === 'image/png') {
        return await sharpInstance
            .png({ compressionLevel: 9, quality: 80 })
            .toBuffer();
    } else if (mimeType === 'image/webp') {
        return await sharpInstance
            .webp({ quality: 80 })
            .toBuffer();
    }
    
    // For other formats, convert to WebP for best compression
    return await sharpInstance
        .webp({ quality: 80 })
        .toBuffer();
}

/**
 * Generate thumbnail
 */
async function generateThumbnail(buffer: Uint8Array): Promise<Uint8Array> {
    if (!sharp) {
        throw new Error('Sharp is not installed. Run: npm install sharp');
    }
    
    return await sharp(buffer)
        .resize(200, 200, {
            fit: 'cover',
            position: 'center'
        })
        .webp({ quality: 70 })
        .toBuffer();
}

export async function POST(req: NextRequest) {
    try {
        const supabase = getSupabaseClient();
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const uploadedBy = formData.get('uploadedBy') as string;
        const fileType = formData.get('fileType') as string; // 'image' or 'audio'
        const shouldOptimize = formData.get('optimize') !== 'false'; // Default: true

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
        const validImageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
        const validAudioTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/webm'];
        const validTypes = fileType === 'image' ? validImageTypes : validAudioTypes;

        if (!validTypes.includes(file.type)) {
            return Response.json(
                { error: `Invalid file type for ${fileType}. Allowed: ${validTypes.join(', ')}`, code: 'INVALID_FILE_TYPE' },
                { status: 400 }
            );
        }

        // Check file size (10MB max for media, increased limit for uncompressed)
        const maxSize = fileType === 'image' ? 15 * 1024 * 1024 : 10 * 1024 * 1024;
        if (file.size > maxSize) {
            return Response.json(
                { error: `File size exceeds ${maxSize / (1024 * 1024)}MB limit`, code: 'FILE_TOO_LARGE' },
                { status: 400 }
            );
        }

        const arrayBuffer = await file.arrayBuffer();
        let buffer: Buffer | Uint8Array = Buffer.from(arrayBuffer);
        const originalSize = buffer.length;
        let thumbnailBuffer: Buffer | Uint8Array | null = null;
        let finalMimeType = file.type;

        // Optimize images
        if (fileType === 'image' && shouldOptimize) {
            try {
                if (!sharp) {
                    throw new Error('Sharp not installed. Using original image.');
                }
                
                const compressedBuffer = await compressImage(buffer, file.type);
                buffer = compressedBuffer;
                thumbnailBuffer = await generateThumbnail(compressedBuffer);
                
                // If converted to WebP, update mime type
                if (!file.type.includes('webp')) {
                    finalMimeType = 'image/webp';
                }
                
                console.log(`Image optimized: ${originalSize} bytes → ${buffer.length} bytes (${Math.round((1 - buffer.length / originalSize) * 100)}% reduction)`);
            } catch (optimizeError) {
                console.warn('Image optimization failed, using original:', optimizeError);
                // Continue with original buffer if optimization fails
                buffer = Buffer.from(arrayBuffer);
            }
        }

        const bucketName = 'assessment-media';
        const timestamp = Date.now();
        const ext = finalMimeType.includes('webp') ? 'webp' : file.name.split('.').pop();
        const fileName = `${fileType}/${timestamp}-${Math.random().toString(36).substr(2, 9)}.${ext}`;

        // Upload main file to Supabase Storage with cache headers
        const { data, error } = await supabase.storage
            .from(bucketName)
            .upload(fileName, buffer, {
                contentType: finalMimeType,
                cacheControl: '31536000', // 1 year cache
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

        // Upload thumbnail if generated
        let thumbnailUrl: string | null = null;
        if (thumbnailBuffer) {
            const thumbnailFileName = `${fileType}/thumbnails/${timestamp}-${Math.random().toString(36).substr(2, 9)}.webp`;
            const { error: thumbError } = await supabase.storage
                .from(bucketName)
                .upload(thumbnailFileName, thumbnailBuffer, {
                    contentType: 'image/webp',
                    cacheControl: '31536000',
                    upsert: false
                });

            if (!thumbError) {
                const { data: thumbUrlData } = supabase.storage
                    .from(bucketName)
                    .getPublicUrl(thumbnailFileName);
                thumbnailUrl = thumbUrlData.publicUrl;
            }
        }

        // Get public URL with CDN
        const { data: urlData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(fileName);

        const fileUrl = urlData.publicUrl;

        // Save media file record to database with optimization stats
        const mediaResult = await query(
            `INSERT INTO media_files 
             (file_name, file_path, file_type, mime_type, file_size, uploaded_by, bucket_name, 
              original_size, thumbnail_url, optimized)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             RETURNING id`,
            [
                file.name,
                fileName,
                fileType,
                finalMimeType,
                buffer.length,
                uploadedBy,
                bucketName,
                originalSize,
                thumbnailUrl,
                shouldOptimize
            ]
        );

        const compressionRatio = originalSize > 0 
            ? Math.round((1 - buffer.length / originalSize) * 100) 
            : 0;

        return Response.json({
            success: true,
            mediaId: mediaResult.rows[0].id,
            fileName: file.name,
            filePath: fileName,
            fileType: fileType,
            url: fileUrl,
            thumbnailUrl,
            mimeType: finalMimeType,
            size: buffer.length,
            originalSize,
            compressionRatio,
            optimized: shouldOptimize
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

// GET endpoint to list media files (unchanged)
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const fileType = searchParams.get('fileType');
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
        console.error('Get Media Error:', err);
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
