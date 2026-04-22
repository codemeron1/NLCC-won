/**
 * Supabase Storage Helper Functions
 * Utility functions for optimized storage operations
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export function getStorageClient() {
  return createClient(supabaseUrl, supabaseServiceKey);
}

/**
 * Upload file with optimized settings
 */
export async function uploadWithCache(
  bucketName: string,
  fileName: string,
  fileBody: Buffer | Blob,
  options: {
    contentType?: string;
    cacheControl?: string;
    upsert?: boolean;
  } = {}
) {
  const supabase = getStorageClient();
  
  const {
    contentType = 'application/octet-stream',
    cacheControl = '31536000', // 1 year
    upsert = false,
  } = options;

  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, fileBody, {
      contentType,
      cacheControl,
      upsert,
    });

  if (error) {
    throw error;
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(fileName);

  return {
    path: data.path,
    url: urlData.publicUrl,
  };
}

/**
 * Get file with signed URL (for private files)
 */
export async function getSignedUrl(
  bucketName: string,
  filePath: string,
  expiresIn: number = 3600 // 1 hour default
) {
  const supabase = getStorageClient();
  
  const { data, error } = await supabase.storage
    .from(bucketName)
    .createSignedUrl(filePath, expiresIn);

  if (error) {
    throw error;
  }

  return data.signedUrl;
}

/**
 * Delete file from storage
 */
export async function deleteFile(bucketName: string, filePath: string) {
  const supabase = getStorageClient();
  
  const { error } = await supabase.storage
    .from(bucketName)
    .remove([filePath]);

  if (error) {
    throw error;
  }

  return true;
}

/**
 * List files in a folder
 */
export async function listFiles(
  bucketName: string,
  folder: string = '',
  options: {
    limit?: number;
    offset?: number;
    sortBy?: { column: string; order: 'asc' | 'desc' };
  } = {}
) {
  const supabase = getStorageClient();
  
  const { data, error } = await supabase.storage
    .from(bucketName)
    .list(folder, {
      limit: options.limit || 100,
      offset: options.offset || 0,
      sortBy: options.sortBy || { column: 'name', order: 'asc' },
    });

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Get storage bucket info
 */
export async function getBucketInfo(bucketName: string) {
  const supabase = getStorageClient();
  
  const { data, error } = await supabase.storage.getBucket(bucketName);

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Generate a unique filename
 */
export function generateFileName(
  originalName: string,
  prefix: string = ''
): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  const ext = originalName.split('.').pop();
  return `${prefix}${timestamp}-${random}.${ext}`;
}

/**
 * Parse Supabase storage URL to get bucket and path
 */
export function parseStorageUrl(url: string): {
  bucket: string;
  path: string;
} | null {
  try {
    const urlObj = new URL(url);
    const parts = urlObj.pathname.split('/');
    
    // Format: /storage/v1/object/public/bucket-name/path/to/file
    if (parts[1] === 'storage' && parts[4] === 'public') {
      return {
        bucket: parts[5],
        path: parts.slice(6).join('/'),
      };
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Check if file exists in storage
 */
export async function fileExists(
  bucketName: string,
  filePath: string
): Promise<boolean> {
  const supabase = getStorageClient();
  
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list(filePath.split('/').slice(0, -1).join('/'), {
        limit: 1,
        search: filePath.split('/').pop(),
      });

    return !error && data && data.length > 0;
  } catch {
    return false;
  }
}

/**
 * Copy file within storage
 */
export async function copyFile(
  bucketName: string,
  fromPath: string,
  toPath: string
) {
  const supabase = getStorageClient();
  
  const { error } = await supabase.storage
    .from(bucketName)
    .copy(fromPath, toPath);

  if (error) {
    throw error;
  }

  return true;
}

/**
 * Move file within storage
 */
export async function moveFile(
  bucketName: string,
  fromPath: string,
  toPath: string
) {
  const supabase = getStorageClient();
  
  const { error } = await supabase.storage
    .from(bucketName)
    .move(fromPath, toPath);

  if (error) {
    throw error;
  }

  return true;
}
