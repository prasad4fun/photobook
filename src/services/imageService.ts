import { ImageUpload } from '../types';

/**
 * Compress image before upload to reduce size
 */
export async function compressImage(file: File, maxWidth = 1920, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        // Maintain aspect ratio
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to base64
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
              const base64 = reader.result as string;
              // Remove data URL prefix to get pure base64
              const base64Data = base64.split(',')[1];
              resolve(base64Data);
            };
            reader.readAsDataURL(blob);
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Convert image file to base64
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const base64 = reader.result as string;
      const base64Data = base64.split(',')[1];
      resolve(base64Data);
    };

    reader.onerror = () => reject(new Error('Failed to convert file to base64'));
    reader.readAsDataURL(file);
  });
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const validTypes = ['image/jpeg', 'image/png'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Only JPEG and PNG formats are supported',
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size must be less than 10MB',
    };
  }

  return { valid: true };
}

/**
 * Process uploaded images - compress and prepare for upload
 */
export async function processUploadedImages(files: File[]): Promise<ImageUpload[]> {
  const processedImages: ImageUpload[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const validation = validateImageFile(file);

    if (!validation.valid) {
      console.error(`File ${file.name} validation failed:`, validation.error);
      continue;
    }

    try {
      const preview = URL.createObjectURL(file);

      processedImages.push({
        id: `img_${Date.now()}_${i}`,
        file,
        preview,
        name: file.name,
        size: file.size,
      });
    } catch (error) {
      console.error(`Failed to process file ${file.name}:`, error);
    }
  }

  return processedImages;
}

/**
 * Batch convert images to base64 for API calls
 */
export async function imagesToBase64(images: ImageUpload[]): Promise<string[]> {
  const base64Images: string[] = [];

  for (const image of images) {
    try {
      const base64 = await compressImage(image.file);
      base64Images.push(base64);
    } catch (error) {
      console.error(`Failed to convert ${image.name} to base64:`, error);
      // Continue with other images
    }
  }

  return base64Images;
}
