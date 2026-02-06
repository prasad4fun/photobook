import { Theme, ImageUpload, GeneratedImage } from '../types';
import { captureError, addBreadcrumb } from '../utils/sentry';

/**
 * Mock Theme Service
 *
 * Simulates themed image generation by applying filter presets.
 * This is a placeholder until real image generation API is integrated.
 *
 * Features:
 * - Theme-specific filter presets (brightness, contrast, saturation, hue)
 * - Canvas-based image processing
 * - Realistic generation delays
 * - Progress callbacks
 */

// ============================================================================
// Theme Filter Presets
// ============================================================================

interface ThemeFilterPreset {
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
  saturation: number; // -100 to 100
  hue: number; // -180 to 180
  sepia?: number; // 0 to 100
  grayscale?: number; // 0 to 100
  blur?: number; // 0 to 10 (px)
  vignette?: number; // 0 to 100
}

const THEME_PRESETS: Record<string, ThemeFilterPreset> = {
  warm_family_portrait: {
    brightness: 15,
    contrast: 5,
    saturation: 10,
    hue: 10, // Warmer tones
    sepia: 15,
    vignette: 20,
  },
  cinematic_moments: {
    brightness: -10,
    contrast: 35,
    saturation: -20,
    hue: -5, // Cooler tones
    vignette: 40,
  },
  bright_cheerful: {
    brightness: 25,
    contrast: -5,
    saturation: 20,
    hue: 5,
  },
  elegant_classic: {
    brightness: 5,
    contrast: 10,
    saturation: -5,
    hue: 0,
    sepia: 10,
  },
};

// ============================================================================
// Main Mock Generation Function
// ============================================================================

export async function generateMockThemedImages(
  images: ImageUpload[],
  theme: Theme,
  onProgress?: (completed: number, total: number, currentImageName: string) => void
): Promise<GeneratedImage[]> {
  addBreadcrumb('Starting mock theme generation', 'theme', {
    theme: theme.theme_id,
    imageCount: images.length,
  });

  const generatedImages: GeneratedImage[] = [];

  for (let i = 0; i < images.length; i++) {
    const image = images[i];

    try {
      // Simulate processing time (1-2 seconds per image)
      await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));

      // Apply theme filters
      const themedBase64 = await applyThemeFilters(image.preview, theme);

      const generatedImage: GeneratedImage = {
        image_id: image.id,
        original_base64: extractBase64(image.preview),
        themed_base64: themedBase64,
        theme_id: theme.theme_id,
        generation_params: {
          model: 'mock',
          prompt: buildMockPrompt(theme),
          adjustments: THEME_PRESETS[theme.theme_id] || THEME_PRESETS.warm_family_portrait,
        },
        timestamp: new Date(),
      };

      generatedImages.push(generatedImage);

      if (onProgress) {
        onProgress(i + 1, images.length, image.name);
      }
    } catch (error) {
      captureError(error as Error, {
        service: 'mockTheme',
        operation: 'generateMockThemedImages',
        imageIndex: i,
      });

      // Fallback: use original image
      generatedImages.push({
        image_id: image.id,
        original_base64: extractBase64(image.preview),
        themed_base64: extractBase64(image.preview),
        theme_id: theme.theme_id,
        generation_params: {
          model: 'mock',
          prompt: '',
          adjustments: {},
        },
        timestamp: new Date(),
      });
    }
  }

  addBreadcrumb('Mock theme generation complete', 'theme', {
    generated: generatedImages.length,
  });

  return generatedImages;
}

// ============================================================================
// Filter Application
// ============================================================================

async function applyThemeFilters(imageDataUrl: string, theme: Theme): Promise<string> {
  const preset = THEME_PRESETS[theme.theme_id] || THEME_PRESETS.warm_family_portrait;

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

      // Build CSS filter string
      const filterString = buildFilterString(preset);

      // Apply filters and draw
      ctx.filter = filterString;
      ctx.drawImage(img, 0, 0);

      // Apply vignette effect if specified
      if (preset.vignette && preset.vignette > 0) {
        applyVignette(ctx, canvas.width, canvas.height, preset.vignette);
      }

      // Export as base64
      const themedBase64 = canvas.toDataURL('image/jpeg', 0.92).split(',')[1];
      resolve(themedBase64);
    };

    img.onerror = () => reject(new Error('Failed to load image'));

    img.src = imageDataUrl;
  });
}

function buildFilterString(preset: ThemeFilterPreset): string {
  const filters: string[] = [];

  // Brightness
  if (preset.brightness !== 0) {
    const value = 100 + preset.brightness;
    filters.push(`brightness(${value}%)`);
  }

  // Contrast
  if (preset.contrast !== 0) {
    const value = 100 + preset.contrast;
    filters.push(`contrast(${value}%)`);
  }

  // Saturation
  if (preset.saturation !== 0) {
    const value = 100 + preset.saturation;
    filters.push(`saturate(${value}%)`);
  }

  // Hue rotation
  if (preset.hue !== 0) {
    filters.push(`hue-rotate(${preset.hue}deg)`);
  }

  // Sepia
  if (preset.sepia && preset.sepia > 0) {
    filters.push(`sepia(${preset.sepia}%)`);
  }

  // Grayscale
  if (preset.grayscale && preset.grayscale > 0) {
    filters.push(`grayscale(${preset.grayscale}%)`);
  }

  // Blur
  if (preset.blur && preset.blur > 0) {
    filters.push(`blur(${preset.blur}px)`);
  }

  return filters.length > 0 ? filters.join(' ') : 'none';
}

function applyVignette(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  intensity: number
): void {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  const centerX = width / 2;
  const centerY = height / 2;
  const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const dx = x - centerX;
      const dy = y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Calculate vignette factor (1 at center, darker at edges)
      const vignetteFactor = 1 - (dist / maxDist) * (intensity / 100);

      data[idx] *= vignetteFactor; // R
      data[idx + 1] *= vignetteFactor; // G
      data[idx + 2] *= vignetteFactor; // B
      // Alpha unchanged
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

// ============================================================================
// Utility Functions
// ============================================================================

function extractBase64(dataUrl: string): string {
  if (dataUrl.includes('base64,')) {
    return dataUrl.split('base64,')[1];
  }
  return dataUrl;
}

function buildMockPrompt(theme: Theme): string {
  return `Transform this photo to match "${theme.name}" theme: ${theme.mood} mood, ${theme.lighting} lighting, ${theme.background} background, ${theme.editing_style} editing style.`;
}

// ============================================================================
// Single Image Processing
// ============================================================================

export async function applyMockThemeToSingleImage(
  imageDataUrl: string,
  theme: Theme
): Promise<string> {
  addBreadcrumb('Applying mock theme to single image', 'theme', {
    theme: theme.theme_id,
  });

  try {
    return await applyThemeFilters(imageDataUrl, theme);
  } catch (error) {
    captureError(error as Error, {
      service: 'mockTheme',
      operation: 'applyMockThemeToSingleImage',
    });
    // Return original on error
    return extractBase64(imageDataUrl);
  }
}

// ============================================================================
// Preset Management
// ============================================================================

export function getThemePreset(themeId: string): ThemeFilterPreset {
  return THEME_PRESETS[themeId] || THEME_PRESETS.warm_family_portrait;
}

export function getAllThemePresets(): Record<string, ThemeFilterPreset> {
  return { ...THEME_PRESETS };
}

export function createCustomPreset(
  name: string,
  preset: ThemeFilterPreset
): void {
  THEME_PRESETS[name] = preset;
}

// ============================================================================
// Preview Generation (No Delay)
// ============================================================================

export async function generateQuickPreview(
  imageDataUrl: string,
  theme: Theme
): Promise<string> {
  // Same as applyThemeFilters but without delay simulation
  return applyThemeFilters(imageDataUrl, theme);
}

// ============================================================================
// Batch Processing with Custom Presets
// ============================================================================

export async function applyCustomFiltersToImages(
  images: ImageUpload[],
  customPreset: ThemeFilterPreset,
  onProgress?: (completed: number, total: number) => void
): Promise<string[]> {
  const processed: string[] = [];

  for (let i = 0; i < images.length; i++) {
    try {
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = images[i].preview;
      });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        processed.push(extractBase64(images[i].preview));
        continue;
      }

      canvas.width = img.width;
      canvas.height = img.height;

      ctx.filter = buildFilterString(customPreset);
      ctx.drawImage(img, 0, 0);

      if (customPreset.vignette && customPreset.vignette > 0) {
        applyVignette(ctx, canvas.width, canvas.height, customPreset.vignette);
      }

      const processedBase64 = canvas.toDataURL('image/jpeg', 0.92).split(',')[1];
      processed.push(processedBase64);

      if (onProgress) {
        onProgress(i + 1, images.length);
      }
    } catch (error) {
      console.error(`Failed to process image ${i}:`, error);
      processed.push(extractBase64(images[i].preview));
    }
  }

  return processed;
}

// ============================================================================
// Advanced Filter Effects
// ============================================================================

export async function applyFilmGrain(
  imageDataUrl: string,
  intensity: number = 50
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
      const data = imageData.data;

      // Add random noise
      for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * intensity;
        data[i] += noise; // R
        data[i + 1] += noise; // G
        data[i + 2] += noise; // B
      }

      ctx.putImageData(imageData, 0, 0);

      const grainedBase64 = canvas.toDataURL('image/jpeg', 0.92).split(',')[1];
      resolve(grainedBase64);
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageDataUrl;
  });
}

export async function applyColorTint(
  imageDataUrl: string,
  tintColor: { r: number; g: number; b: number },
  intensity: number = 30
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
      const data = imageData.data;

      const factor = intensity / 100;

      for (let i = 0; i < data.length; i += 4) {
        data[i] = data[i] * (1 - factor) + tintColor.r * factor; // R
        data[i + 1] = data[i + 1] * (1 - factor) + tintColor.g * factor; // G
        data[i + 2] = data[i + 2] * (1 - factor) + tintColor.b * factor; // B
      }

      ctx.putImageData(imageData, 0, 0);

      const tintedBase64 = canvas.toDataURL('image/jpeg', 0.92).split(',')[1];
      resolve(tintedBase64);
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageDataUrl;
  });
}
