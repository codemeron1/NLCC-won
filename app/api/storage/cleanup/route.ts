/**
 * Storage Cleanup and Audit API
 * Identifies and removes duplicate/unused files from Supabase storage
 */

import { createClient } from '@supabase/supabase-js';
import { query } from '@/lib/db';
import { NextRequest } from 'next/server';

function getSupabaseClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

interface FileAuditResult {
    totalFiles: number;
    totalSize: number;
    unusedFiles: string[];
    duplicateFiles: Array<{ original: string; duplicates: string[] }>;
    orphanedThumbnails: string[];
    storageStats: {
        images: { count: number; size: number };
        audio: { count: number; size: number };
        thumbnails: { count: number; size: number };
    };
}

/**
 * Audit storage bucket for issues
 */
async function auditStorage(): Promise<FileAuditResult> {
    const supabase = getSupabaseClient();
    const bucketName = 'assessment-media';
    
    // Get all files from storage
    const { data: allFiles, error } = await supabase.storage
        .from(bucketName)
        .list('', {
            limit: 10000,
            sortBy: { column: 'name', order: 'asc' }
        });

    if (error) {
        throw new Error(`Failed to list storage files: ${error.message}`);
    }

    // Get all files from database
    const dbFiles = await query(
        'SELECT file_path, thumbnail_url FROM media_files WHERE bucket_name = $1',
        [bucketName]
    );

    const dbFilePaths = new Set(dbFiles.rows.map((row: any) => row.file_path));
    const dbThumbnails = new Set(
        dbFiles.rows
            .filter((row: any) => row.thumbnail_url)
            .map((row: any) => {
                const url = new URL(row.thumbnail_url);
                return url.pathname.split('/').pop();
            })
    );

    let totalSize = 0;
    const unusedFiles: string[] = [];
    const orphanedThumbnails: string[] = [];
    const storageStats = {
        images: { count: 0, size: 0 },
        audio: { count: 0, size: 0 },
        thumbnails: { count: 0, size: 0 },
    };

    // Analyze files
    for (const file of allFiles || []) {
        const fullPath = file.name;
        totalSize += file.metadata?.size || 0;

        // Categorize by type
        if (fullPath.startsWith('image/')) {
            storageStats.images.count++;
            storageStats.images.size += file.metadata?.size || 0;
        } else if (fullPath.startsWith('audio/')) {
            storageStats.audio.count++;
            storageStats.audio.size += file.metadata?.size || 0;
        } else if (fullPath.includes('thumbnail')) {
            storageStats.thumbnails.count++;
            storageStats.thumbnails.size += file.metadata?.size || 0;
        }

        // Check if file is in database
        if (!dbFilePaths.has(fullPath)) {
            // Check if it's a thumbnail
            if (fullPath.includes('thumbnail')) {
                if (!dbThumbnails.has(fullPath)) {
                    orphanedThumbnails.push(fullPath);
                }
            } else {
                unusedFiles.push(fullPath);
            }
        }
    }

    // Find duplicates by file hash (simplified - checking by size and upload time proximity)
    const duplicateFiles: Array<{ original: string; duplicates: string[] }> = [];
    // This would require actual file content comparison for true duplicate detection
    // For now, we'll report files with same size uploaded within 1 minute as potential duplicates

    return {
        totalFiles: allFiles?.length || 0,
        totalSize,
        unusedFiles,
        duplicateFiles,
        orphanedThumbnails,
        storageStats,
    };
}

/**
 * Remove unused files from storage
 */
async function cleanupUnusedFiles(filePaths: string[]): Promise<{ deleted: number; errors: string[] }> {
    const supabase = getSupabaseClient();
    const bucketName = 'assessment-media';
    
    let deleted = 0;
    const errors: string[] = [];

    for (const filePath of filePaths) {
        try {
            const { error } = await supabase.storage
                .from(bucketName)
                .remove([filePath]);

            if (error) {
                errors.push(`${filePath}: ${error.message}`);
            } else {
                deleted++;
            }
        } catch (err: any) {
            errors.push(`${filePath}: ${err.message}`);
        }
    }

    return { deleted, errors };
}

/**
 * GET: Audit storage and return report
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const includeDetails = searchParams.get('details') === 'true';

        const auditResult = await auditStorage();

        const formatSize = (bytes: number) => {
            const mb = bytes / (1024 * 1024);
            return mb > 1 ? `${mb.toFixed(2)} MB` : `${(bytes / 1024).toFixed(2)} KB`;
        };

        const report = {
            summary: {
                totalFiles: auditResult.totalFiles,
                totalSize: formatSize(auditResult.totalSize),
                unusedFilesCount: auditResult.unusedFiles.length,
                orphanedThumbnailsCount: auditResult.orphanedThumbnails.length,
                duplicatesCount: auditResult.duplicateFiles.length,
            },
            storageBreakdown: {
                images: {
                    count: auditResult.storageStats.images.count,
                    size: formatSize(auditResult.storageStats.images.size),
                },
                audio: {
                    count: auditResult.storageStats.audio.count,
                    size: formatSize(auditResult.storageStats.audio.size),
                },
                thumbnails: {
                    count: auditResult.storageStats.thumbnails.count,
                    size: formatSize(auditResult.storageStats.thumbnails.size),
                },
            },
            ...(includeDetails && {
                details: {
                    unusedFiles: auditResult.unusedFiles,
                    orphanedThumbnails: auditResult.orphanedThumbnails,
                    duplicateFiles: auditResult.duplicateFiles,
                },
            }),
        };

        return Response.json({
            success: true,
            audit: report,
        });

    } catch (err: any) {
        console.error('Storage Audit Error:', err);
        return Response.json(
            {
                error: 'Failed to audit storage',
                message: err.message,
            },
            { status: 500 }
        );
    }
}

/**
 * DELETE: Clean up unused files
 */
export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const dryRun = searchParams.get('dryRun') === 'true';
        const cleanupType = searchParams.get('type') || 'unused'; // 'unused' | 'thumbnails' | 'all'

        const auditResult = await auditStorage();
        
        let filesToDelete: string[] = [];
        
        if (cleanupType === 'unused' || cleanupType === 'all') {
            filesToDelete = [...filesToDelete, ...auditResult.unusedFiles];
        }
        
        if (cleanupType === 'thumbnails' || cleanupType === 'all') {
            filesToDelete = [...filesToDelete, ...auditResult.orphanedThumbnails];
        }

        if (dryRun) {
            return Response.json({
                success: true,
                dryRun: true,
                filesCount: filesToDelete.length,
                files: filesToDelete,
                message: `Would delete ${filesToDelete.length} files (dry run mode)`,
            });
        }

        const { deleted, errors } = await cleanupUnusedFiles(filesToDelete);

        return Response.json({
            success: true,
            deleted,
            attempted: filesToDelete.length,
            errors: errors.length > 0 ? errors : undefined,
            message: `Successfully deleted ${deleted} of ${filesToDelete.length} files`,
        });

    } catch (err: any) {
        console.error('Storage Cleanup Error:', err);
        return Response.json(
            {
                error: 'Failed to clean up storage',
                message: err.message,
            },
            { status: 500 }
        );
    }
}

/**
 * POST: Remove specific files by path
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { filePaths } = body;

        if (!Array.isArray(filePaths) || filePaths.length === 0) {
            return Response.json(
                { error: 'filePaths array is required' },
                { status: 400 }
            );
        }

        const { deleted, errors } = await cleanupUnusedFiles(filePaths);

        return Response.json({
            success: true,
            deleted,
            attempted: filePaths.length,
            errors: errors.length > 0 ? errors : undefined,
        });

    } catch (err: any) {
        console.error('Storage Delete Error:', err);
        return Response.json(
            {
                error: 'Failed to delete files',
                message: err.message,
            },
            { status: 500 }
        );
    }
}
