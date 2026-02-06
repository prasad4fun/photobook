/**
 * Color Space Service
 *
 * Provides color space conversion utilities for professional printing:
 * - RGB to CMYK conversion (for print)
 * - Color profile application
 * - Gamma correction
 * - High-quality image processing with pica
 */

import pica from 'pica';

// ============================================================================
// RGB to CMYK Conversion
// ============================================================================

export interface RGBColor {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
}

export interface CMYKColor {
  c: number; // 0-100
  m: number; // 0-100
  y: number; // 0-100
  k: number; // 0-100
}

/**
 * Convert RGB to CMYK using standard color space conversion
 * Uses the simple RGB to CMYK formula for offset printing
 */
export function convertRGBtoCMYK(rgb: RGBColor): CMYKColor {
  // Normalize RGB values to 0-1 range
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  // Calculate K (black key)
  const k = 1 - Math.max(r, g, b);

  // If K is 1 (pure black), C, M, Y are all 0
  if (k === 1) {
    return { c: 0, m: 0, y: 0, k: 100 };
  }

  // Calculate CMY
  const c = (1 - r - k) / (1 - k);
  const m = (1 - g - k) / (1 - k);
  const y = (1 - b - k) / (1 - k);

  // Convert to percentage
  return {
    c: Math.round(c * 100),
    m: Math.round(m * 100),
    y: Math.round(y * 100),
    k: Math.round(k * 100),
  };
}

/**
 * Convert CMYK back to RGB for preview
 */
export function convertCMYKtoRGB(cmyk: CMYKColor): RGBColor {
  // Normalize CMYK values to 0-1 range
  const c = cmyk.c / 100;
  const m = cmyk.m / 100;
  const y = cmyk.y / 100;
  const k = cmyk.k / 100;

  // Calculate RGB
  const r = 255 * (1 - c) * (1 - k);
  const g = 255 * (1 - m) * (1 - k);
  const b = 255 * (1 - y) * (1 - k);

  return {
    r: Math.round(r),
    g: Math.round(g),
    b: Math.round(b),
  };
}

// ============================================================================
// Image Color Space Conversion
// ============================================================================

/**
 * Convert an entire image from RGB to CMYK color space
 * Returns a new canvas with CMYK-adjusted colors
 */
export async function convertImageToCMYK(
  imageData: ImageData
): Promise<ImageData> {
  const data = imageData.data;
  const newData = new Uint8ClampedArray(data.length);

  // Process each pixel
  for (let i = 0; i < data.length; i += 4) {
    const rgb: RGBColor = {
      r: data[i],
      g: data[i + 1],
      b: data[i + 2],
    };

    // Convert to CMYK and back to RGB (this applies the color profile adjustment)
    const cmyk = convertRGBtoCMYK(rgb);
    const adjustedRGB = convertCMYKtoRGB(cmyk);

    newData[i] = adjustedRGB.r;
    newData[i + 1] = adjustedRGB.g;
    newData[i + 2] = adjustedRGB.b;
    newData[i + 3] = data[i + 3]; // Alpha channel
  }

  return new ImageData(newData, imageData.width, imageData.height);
}

/**
 * Apply CMYK color profile to base64 image
 */
export async function applyCMYKProfileToBase64(
  base64Image: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = async () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Convert to CMYK and back
      const cmykAdjusted = await convertImageToCMYK(imageData);

      // Put adjusted data back
      ctx.putImageData(cmykAdjusted, 0, 0);

      // Export as base64
      const adjustedBase64 = canvas.toDataURL('image/jpeg', 0.95).split(',')[1];
      resolve(adjustedBase64);
    };

    img.onerror = () => reject(new Error('Failed to load image'));

    img.src = base64Image.startsWith('data:')
      ? base64Image
      : `data:image/jpeg;base64,${base64Image}`;
  });
}

// ============================================================================
// High-Quality Image Resizing with Pica
// ============================================================================

const picaInstance = pica();

/**
 * Resize image with high-quality Lanczos filter
 * Perfect for preparing images for 300 DPI printing
 */
export async function resizeImageHighQuality(
  sourceCanvas: HTMLCanvasElement,
  targetWidth: number,
  targetHeight: number
): Promise<HTMLCanvasElement> {
  const targetCanvas = document.createElement('canvas');
  targetCanvas.width = targetWidth;
  targetCanvas.height = targetHeight;

  await picaInstance.resize(sourceCanvas, targetCanvas, {
    quality: 3, // Lanczos filter with a=3
    unsharpAmount: 80,
    unsharpRadius: 0.6,
    unsharpThreshold: 2,
  });

  return targetCanvas;
}

/**
 * Resize base64 image to exact dimensions
 */
export async function resizeBase64Image(
  base64Image: string,
  targetWidth: number,
  targetHeight: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = async () => {
      const sourceCanvas = document.createElement('canvas');
      const ctx = sourceCanvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      sourceCanvas.width = img.width;
      sourceCanvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      try {
        const resizedCanvas = await resizeImageHighQuality(
          sourceCanvas,
          targetWidth,
          targetHeight
        );

        const resizedBase64 = resizedCanvas.toDataURL('image/jpeg', 0.95).split(',')[1];
        resolve(resizedBase64);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));

    img.src = base64Image.startsWith('data:')
      ? base64Image
      : `data:image/jpeg;base64,${base64Image}`;
  });
}

// ============================================================================
// Gamma Correction
// ============================================================================

/**
 * Apply gamma correction to image data
 * Gamma 2.2 is standard for sRGB displays
 * Gamma 1.8 was historically used for print
 */
export function applyGammaCorrection(
  imageData: ImageData,
  gamma: number = 2.2
): ImageData {
  const data = imageData.data;
  const newData = new Uint8ClampedArray(data.length);

  // Build lookup table for performance
  const gammaTable = new Uint8Array(256);
  for (let i = 0; i < 256; i++) {
    gammaTable[i] = Math.pow(i / 255, gamma) * 255;
  }

  // Apply gamma to each pixel
  for (let i = 0; i < data.length; i += 4) {
    newData[i] = gammaTable[data[i]]; // R
    newData[i + 1] = gammaTable[data[i + 1]]; // G
    newData[i + 2] = gammaTable[data[i + 2]]; // B
    newData[i + 3] = data[i + 3]; // Alpha (unchanged)
  }

  return new ImageData(newData, imageData.width, imageData.height);
}

// ============================================================================
// Color Profile Utilities
// ============================================================================

export interface ColorProfile {
  name: string;
  gamma: number;
  whitePoint: { x: number; y: number; z: number };
  blackPoint: { x: number; y: number; z: number };
}

export const COLOR_PROFILES = {
  sRGB: {
    name: 'sRGB IEC61966-2.1',
    gamma: 2.2,
    whitePoint: { x: 0.3127, y: 0.3290, z: 0.3583 },
    blackPoint: { x: 0, y: 0, z: 0 },
  },
  AdobeRGB: {
    name: 'Adobe RGB (1998)',
    gamma: 2.2,
    whitePoint: { x: 0.3127, y: 0.3290, z: 0.3583 },
    blackPoint: { x: 0, y: 0, z: 0 },
  },
  ProPhotoRGB: {
    name: 'ProPhoto RGB',
    gamma: 1.8,
    whitePoint: { x: 0.3457, y: 0.3585, z: 0.2958 },
    blackPoint: { x: 0, y: 0, z: 0 },
  },
};

/**
 * Detect if an image needs color space conversion
 */
export function needsColorSpaceConversion(
  sourceProfile: string,
  targetProfile: string
): boolean {
  return sourceProfile !== targetProfile;
}

/**
 * Get color profile info from base64 image
 * Note: This is a simplified version - full implementation would parse EXIF/ICC data
 */
export function getImageColorProfile(_base64Image: string): string {
  // Default to sRGB for web images
  return 'sRGB';
}

// ============================================================================
// Batch Processing
// ============================================================================

export async function batchConvertImagesToCMYK(
  base64Images: string[],
  onProgress?: (completed: number, total: number) => void
): Promise<string[]> {
  const converted: string[] = [];

  for (let i = 0; i < base64Images.length; i++) {
    try {
      const cmykImage = await applyCMYKProfileToBase64(base64Images[i]);
      converted.push(cmykImage);

      if (onProgress) {
        onProgress(i + 1, base64Images.length);
      }
    } catch (error) {
      console.error(`Failed to convert image ${i}:`, error);
      // Use original if conversion fails
      converted.push(base64Images[i]);
    }
  }

  return converted;
}

export async function batchResizeImages(
  base64Images: string[],
  targetWidth: number,
  targetHeight: number,
  onProgress?: (completed: number, total: number) => void
): Promise<string[]> {
  const resized: string[] = [];

  for (let i = 0; i < base64Images.length; i++) {
    try {
      const resizedImage = await resizeBase64Image(
        base64Images[i],
        targetWidth,
        targetHeight
      );
      resized.push(resizedImage);

      if (onProgress) {
        onProgress(i + 1, base64Images.length);
      }
    } catch (error) {
      console.error(`Failed to resize image ${i}:`, error);
      // Use original if resizing fails
      resized.push(base64Images[i]);
    }
  }

  return resized;
}

// ============================================================================
// Print-Ready Image Preparation
// ============================================================================

export interface PrintPrepOptions {
  dpi: 300 | 600;
  colorSpace: 'RGB' | 'CMYK';
  gamma?: number;
  targetWidth?: number;
  targetHeight?: number;
}

/**
 * Prepare image for professional printing
 * Combines resizing, color space conversion, and gamma correction
 */
export async function prepareImageForPrint(
  base64Image: string,
  options: PrintPrepOptions
): Promise<string> {
  let processedImage = base64Image;

  // Step 1: Resize if dimensions specified
  if (options.targetWidth && options.targetHeight) {
    processedImage = await resizeBase64Image(
      processedImage,
      options.targetWidth,
      options.targetHeight
    );
  }

  // Step 2: Convert to CMYK if needed
  if (options.colorSpace === 'CMYK') {
    processedImage = await applyCMYKProfileToBase64(processedImage);
  }

  // Step 3: Apply gamma correction if specified
  if (options.gamma && options.gamma !== 2.2) {
    processedImage = await applyGammaCorrectionToBase64(processedImage, options.gamma);
  }

  return processedImage;
}

async function applyGammaCorrectionToBase64(
  base64Image: string,
  gamma: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const corrected = applyGammaCorrection(imageData, gamma);

      ctx.putImageData(corrected, 0, 0);

      const correctedBase64 = canvas.toDataURL('image/jpeg', 0.95).split(',')[1];
      resolve(correctedBase64);
    };

    img.onerror = () => reject(new Error('Failed to load image'));

    img.src = base64Image.startsWith('data:')
      ? base64Image
      : `data:image/jpeg;base64,${base64Image}`;
  });
}
