import Konva from 'konva';
import {
  EditorState,
  ImageLayerProps,
  EditorHistoryState,
} from '../types';

/**
 * Canvas Editor Service
 *
 * Provides Konva.js operations for the photo editor:
 * - Stage initialization and management
 * - Image layer operations
 * - Adjustment application (brightness, contrast, saturation, hue)
 * - Filter presets (vintage, BW, sepia, vignette)
 * - High-resolution export (300 DPI)
 * - Undo/redo history management
 */

// ============================================================================
// Stage Management
// ============================================================================

export function initializeStage(
  containerId: string,
  width: number,
  height: number
): Konva.Stage {
  const stage = new Konva.Stage({
    container: containerId,
    width,
    height,
  });

  // Add main layer for images
  const mainLayer = new Konva.Layer();
  stage.add(mainLayer);

  return stage;
}

export function resizeStage(stage: Konva.Stage, width: number, height: number): void {
  stage.width(width);
  stage.height(height);
}

// ============================================================================
// Image Layer Operations
// ============================================================================

export async function addImageLayer(
  stage: Konva.Stage,
  imageProps: ImageLayerProps
): Promise<Konva.Image> {
  const layer = stage.getLayers()[0];

  // Load image
  const image = await loadImage(imageProps.src);

  // Create Konva image node
  const konvaImage = new Konva.Image({
    image,
    x: imageProps.x,
    y: imageProps.y,
    width: imageProps.width,
    height: imageProps.height,
    rotation: imageProps.rotation,
    scaleX: imageProps.scaleX,
    scaleY: imageProps.scaleY,
    draggable: false,
  });

  layer.add(konvaImage);
  layer.draw();

  return konvaImage;
}

export function removeImageLayer(stage: Konva.Stage, layerId: string): void {
  const layer = stage.getLayers()[0];
  const node = layer.findOne(`#${layerId}`);
  if (node) {
    node.destroy();
    layer.draw();
  }
}

// ============================================================================
// Adjustment Application
// ============================================================================

export function applyAdjustments(
  konvaImage: Konva.Image,
  adjustments: ImageLayerProps
): void {
  const filters: any[] = [];

  // Brightness
  if (adjustments.brightness !== 0) {
    filters.push(Konva.Filters.Brighten);
    konvaImage.brightness(adjustments.brightness / 100);
  }

  // Contrast
  if (adjustments.contrast !== 0) {
    filters.push(Konva.Filters.Contrast);
    konvaImage.contrast(adjustments.contrast);
  }

  // Saturation
  if (adjustments.saturation !== 0) {
    filters.push(Konva.Filters.HSL);
    konvaImage.saturation(adjustments.saturation / 100);
  }

  // Hue
  if (adjustments.hue !== 0) {
    filters.push(Konva.Filters.HSL);
    konvaImage.hue(adjustments.hue);
  }

  // Apply filters
  konvaImage.filters(filters);
  konvaImage.cache();
  konvaImage.getLayer()?.batchDraw();
}

export function applyFilter(
  konvaImage: Konva.Image,
  filterType: string,
  intensity: number = 100
): void {
  const filters: any[] = konvaImage.filters() || [];

  switch (filterType) {
    case 'vintage':
      applyVintageFilter(konvaImage, intensity);
      break;
    case 'bw':
      filters.push(Konva.Filters.Grayscale);
      break;
    case 'sepia':
      filters.push(Konva.Filters.Sepia);
      break;
    case 'vignette':
      applyVignetteFilter(konvaImage, intensity);
      break;
    case 'blur':
      filters.push(Konva.Filters.Blur);
      konvaImage.blurRadius((intensity / 100) * 20);
      break;
    case 'sharpen':
      filters.push(Konva.Filters.Sharpen);
      konvaImage.sharpen((intensity / 100) * 2);
      break;
  }

  konvaImage.filters(filters);
  konvaImage.cache();
  konvaImage.getLayer()?.batchDraw();
}

// ============================================================================
// Filter Implementations
// ============================================================================

function applyVintageFilter(konvaImage: Konva.Image, intensity: number): void {
  // Vintage = Sepia + desaturation + vignette + slight blur
  const filters: any[] = [];
  filters.push(Konva.Filters.Sepia);
  filters.push(Konva.Filters.HSL);
  konvaImage.saturation(-0.2 * (intensity / 100));

  konvaImage.filters(filters);
}

function applyVignetteFilter(konvaImage: Konva.Image, intensity: number): void {
  // Custom vignette filter (darkens edges)
  const customFilter = (imageData: ImageData) => {
    const { data, width, height } = imageData;
    const centerX = width / 2;
    const centerY = height / 2;
    const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const dx = x - centerX;
        const dy = y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const vignette = 1 - (dist / maxDist) * (intensity / 100);

        data[idx] *= vignette; // R
        data[idx + 1] *= vignette; // G
        data[idx + 2] *= vignette; // B
      }
    }
  };

  const filters = konvaImage.filters() || [];
  filters.push(customFilter);
  konvaImage.filters(filters);
}

// ============================================================================
// Export Operations
// ============================================================================

export async function exportCanvasAs300DPI(
  stage: Konva.Stage,
  targetWidth: number = 2480 // A4 at 300 DPI
): Promise<string> {
  const layer = stage.getLayers()[0];
  const originalWidth = stage.width();

  // Calculate scale for 300 DPI
  const scale = targetWidth / originalWidth;

  // Export at high resolution
  const dataURL = layer.toDataURL({
    pixelRatio: scale,
    mimeType: 'image/jpeg',
    quality: 0.95,
  });

  return dataURL.split(',')[1]; // Return base64 without data URL prefix
}

export function exportCurrentView(stage: Konva.Stage): string {
  const layer = stage.getLayers()[0];
  const dataURL = layer.toDataURL({
    mimeType: 'image/jpeg',
    quality: 0.9,
  });

  return dataURL.split(',')[1];
}

// ============================================================================
// History Management
// ============================================================================

export function createHistorySnapshot(
  editorState: EditorState,
  description: string
): EditorHistoryState {
  return {
    timestamp: new Date(),
    layerStack: JSON.parse(JSON.stringify(editorState.layerStack)), // Deep clone
    description,
  };
}

export function restoreFromSnapshot(
  stage: Konva.Stage,
  snapshot: EditorHistoryState
): void {
  const layer = stage.getLayers()[0];

  // Clear current layers
  layer.destroyChildren();

  // Restore layers from snapshot
  // Note: This is a simplified version. Full implementation would
  // recreate all Konva nodes from the snapshot data
  snapshot.layerStack.forEach(async (editorLayer) => {
    if (editorLayer.type === 'image' && editorLayer.imageProps) {
      await addImageLayer(stage, editorLayer.imageProps);
    }
  });

  layer.batchDraw();
}

// ============================================================================
// Utility Functions
// ============================================================================

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export function fitImageToStage(
  imageWidth: number,
  imageHeight: number,
  stageWidth: number,
  stageHeight: number
): { width: number; height: number; x: number; y: number } {
  const imageAspect = imageWidth / imageHeight;
  const stageAspect = stageWidth / stageHeight;

  let width: number;
  let height: number;

  if (imageAspect > stageAspect) {
    // Image is wider than stage
    width = stageWidth;
    height = stageWidth / imageAspect;
  } else {
    // Image is taller than stage
    height = stageHeight;
    width = stageHeight * imageAspect;
  }

  // Center the image
  const x = (stageWidth - width) / 2;
  const y = (stageHeight - height) / 2;

  return { width, height, x, y };
}

export function resetAdjustments(konvaImage: Konva.Image): void {
  konvaImage.brightness(0);
  konvaImage.contrast(0);
  konvaImage.saturation(0);
  konvaImage.hue(0);
  konvaImage.filters([]);
  konvaImage.clearCache();
  konvaImage.getLayer()?.batchDraw();
}

// ============================================================================
// Preset Adjustments
// ============================================================================

export const FILTER_PRESETS = {
  none: {
    brightness: 0,
    contrast: 0,
    saturation: 0,
    hue: 0,
    filters: [],
  },
  vintage: {
    brightness: 5,
    contrast: 10,
    saturation: -20,
    hue: 0,
    filters: [{ type: 'sepia', intensity: 40 }],
  },
  dramatic: {
    brightness: -10,
    contrast: 40,
    saturation: 10,
    hue: 0,
    filters: [{ type: 'vignette', intensity: 60 }],
  },
  bright: {
    brightness: 20,
    contrast: -5,
    saturation: 15,
    hue: 0,
    filters: [],
  },
  cool: {
    brightness: 0,
    contrast: 10,
    saturation: -10,
    hue: -10,
    filters: [],
  },
  warm: {
    brightness: 10,
    contrast: 5,
    saturation: 10,
    hue: 15,
    filters: [],
  },
};

export function applyPreset(
  konvaImage: Konva.Image,
  presetName: keyof typeof FILTER_PRESETS
): void {
  const preset = FILTER_PRESETS[presetName];

  // Reset first
  resetAdjustments(konvaImage);

  // Apply preset adjustments
  const adjustments: ImageLayerProps = {
    src: '',
    originalSrc: '',
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    brightness: preset.brightness,
    contrast: preset.contrast,
    saturation: preset.saturation,
    hue: preset.hue,
    filters: [],
  };

  applyAdjustments(konvaImage, adjustments);

  // Apply filters
  preset.filters.forEach((filter) => {
    applyFilter(konvaImage, filter.type as string, filter.intensity);
  });
}
