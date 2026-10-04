/**
 * Image compression and optimization utility for UziShop
 * Provides fast client-side resizing and compression to prevent lag,
 * timeouts, and high memory usage when uploading photos from mobile/desktop.
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0 (default 0.82)
  mimeType?: 'image/jpeg' | 'image/webp' | 'image/png';
  cropSquare?: boolean; // Center-crop to a clean 1:1 ratio (perfect for avatars)
}

export interface CompressionResult {
  file: File;
  dataUrl: string;
  originalSizeKb: number;
  compressedSizeKb: number;
  reductionPercent: number;
  width: number;
  height: number;
}

/**
 * Resizes and compresses an image file in the browser using HTML5 Canvas.
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const {
    maxWidth = 400,
    maxHeight = 400,
    quality = 0.82,
    mimeType = 'image/jpeg',
    cropSquare = false,
  } = options;

  return new Promise((resolve, reject) => {
    // If not an image, return error
    if (!file.type.startsWith('image/')) {
      return reject(new Error('Selected file is not an image'));
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const naturalWidth = img.naturalWidth || img.width;
      const naturalHeight = img.naturalHeight || img.height;

      let targetWidth: number;
      let targetHeight: number;
      let sx = 0;
      let sy = 0;
      let sWidth = naturalWidth;
      let sHeight = naturalHeight;

      if (cropSquare) {
        // Center crop to a 1:1 square
        const side = Math.min(naturalWidth, naturalHeight);
        sx = Math.max(0, Math.floor((naturalWidth - side) / 2));
        sy = Math.max(0, Math.floor((naturalHeight - side) / 2));
        sWidth = side;
        sHeight = side;

        // Scale to desired max dimensions (e.g. 400x400)
        const targetSide = Math.min(maxWidth, maxHeight, side);
        targetWidth = targetSide;
        targetHeight = targetSide;
      } else {
        // Proportional scale
        let scale = Math.min(maxWidth / naturalWidth, maxHeight / naturalHeight, 1);
        targetWidth = Math.max(1, Math.round(naturalWidth * scale));
        targetHeight = Math.max(1, Math.round(naturalHeight * scale));
      }

      // Draw onto canvas
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject(new Error('Failed to create canvas 2D context'));
      }

      // High-quality image rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // For JPEG, fill white background in case source has transparency
      if (mimeType === 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, targetWidth, targetHeight);
      }

      ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetWidth, targetHeight);

      // Convert to Blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            return reject(new Error('Canvas to Blob conversion failed'));
          }

          // Build a new clean File instance
          const extension = mimeType === 'image/webp' ? 'webp' : 'jpg';
          const cleanName = file.name.replace(/\.[^/.]+$/, '') + `_optimized.${extension}`;
          const compressedFile = new File([blob], cleanName, {
            type: mimeType,
            lastModified: Date.now(),
          });

          // Generate fast local Data URL for immediate responsive preview
          const dataUrl = canvas.toDataURL(mimeType, quality);

          const originalSizeKb = Math.round(file.size / 1024);
          const compressedSizeKb = Math.round(blob.size / 1024);
          const reductionPercent = originalSizeKb > 0 
            ? Math.max(0, Math.round(((originalSizeKb - compressedSizeKb) / originalSizeKb) * 100))
            : 0;

          resolve({
            file: compressedFile,
            dataUrl,
            originalSizeKb,
            compressedSizeKb,
            reductionPercent,
            width: targetWidth,
            height: targetHeight,
          });
        },
        mimeType,
        quality
      );
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image for processing: ' + String(err)));
    };

    img.src = objectUrl;
  });
}

/**
 * Specifically tuned compression for profile pictures/avatars:
 * 400x400 square center-cropped, 82% quality, reduced from ~10MB to ~30-50KB!
 */
export async function compressProfileImage(file: File): Promise<CompressionResult> {
  return compressImage(file, {
    maxWidth: 400,
    maxHeight: 400,
    cropSquare: true,
    quality: 0.82,
    mimeType: 'image/jpeg',
  });
}

/**
 * Specifically tuned compression for item listing photos:
 * Max 1024px, preserving original aspect ratio.
 */
export async function compressProductImage(file: File): Promise<CompressionResult> {
  return compressImage(file, {
    maxWidth: 1024,
    maxHeight: 1024,
    cropSquare: false,
    quality: 0.82,
    mimeType: 'image/jpeg',
  });
}
