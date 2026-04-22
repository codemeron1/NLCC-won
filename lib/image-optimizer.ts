/**
 * Image Optimization Utilities
 * Compress and optimize images before uploading to Supabase Storage
 */

/**
 * Compress an image file before upload
 * @param file - The original image file
 * @param maxWidth - Maximum width in pixels (default: 1920)
 * @param maxHeight - Maximum height in pixels (default: 1080)
 * @param quality - JPEG quality 0-1 (default: 0.8)
 * @returns Compressed image as Blob
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;

      // Calculate new dimensions while maintaining aspect ratio
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // Enable image smoothing for better quality
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      ctx.drawImage(img, 0, 0, width, height);

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        file.type === 'image/png' ? 'image/png' : 'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Convert image to WebP format for better compression
 * @param file - The original image file
 * @param quality - WebP quality 0-1 (default: 0.8)
 * @returns WebP image as Blob
 */
export async function convertToWebP(
  file: File,
  quality: number = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to convert to WebP'));
          }
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Generate thumbnail for an image
 * @param file - The original image file
 * @param size - Thumbnail size (default: 200x200)
 * @returns Thumbnail as Blob
 */
export async function generateThumbnail(
  file: File,
  size: number = 200
): Promise<Blob> {
  return compressImage(file, size, size, 0.7);
}

/**
 * Validate and optimize image before upload
 * @param file - The image file to process
 * @param options - Optimization options
 * @returns Optimized file ready for upload
 */
export async function optimizeImageForUpload(
  file: File,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    convertToWebP?: boolean;
    generateThumbnail?: boolean;
  } = {}
): Promise<{
  optimized: Blob;
  thumbnail?: Blob;
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
}> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    convertToWebP: shouldConvertToWebP = false,
    generateThumbnail: shouldGenerateThumbnail = false,
  } = options;

  // Validate file type
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid image type. Supported: JPEG, PNG, GIF, WebP');
  }

  const originalSize = file.size;

  // Compress or convert image
  let optimized: Blob;
  if (shouldConvertToWebP && file.type !== 'image/webp') {
    optimized = await convertToWebP(file, quality);
  } else {
    optimized = await compressImage(file, maxWidth, maxHeight, quality);
  }

  // Generate thumbnail if requested
  let thumbnail: Blob | undefined;
  if (shouldGenerateThumbnail) {
    thumbnail = await generateThumbnail(file);
  }

  const optimizedSize = optimized.size;
  const compressionRatio = ((originalSize - optimizedSize) / originalSize) * 100;

  return {
    optimized,
    thumbnail,
    originalSize,
    optimizedSize,
    compressionRatio,
  };
}

/**
 * Client-side file size validator
 */
export function validateFileSize(file: File, maxSizeMB: number = 10): boolean {
  const maxBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxBytes;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
