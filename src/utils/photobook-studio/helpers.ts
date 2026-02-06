/**
 * Helper Utilities
 */

import type { StudioPhotoSlot, StudioPageElement, StudioPage, StudioSpread } from '../../types';

/**
 * Generate unique ID
 */
export function generateId(prefix = 'id'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Clamp value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Convert File to base64 URL
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Load image and get dimensions
 */
export async function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/**
 * Create thumbnail from image file
 */
export async function createThumbnail(
  file: File,
  maxWidth = 400,
  maxHeight = 400
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
  const maxSize = 50 * 1024 * 1024; // 50MB

  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Supported: JPEG, PNG, WebP, HEIC',
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${formatFileSize(maxSize)}`,
    };
  }

  return { valid: true };
}

/**
 * Check if two rectangles intersect (for selection box)
 */
export function rectanglesIntersect(
  rect1: { x: number; y: number; width: number; height: number },
  rect2: { x: number; y: number; width: number; height: number }
): boolean {
  return !(
    rect1.x > rect2.x + rect2.width ||
    rect1.x + rect1.width < rect2.x ||
    rect1.y > rect2.y + rect2.height ||
    rect1.y + rect1.height < rect2.y
  );
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

// ============================================================================
// v2.0 - Photo Quality Utilities
// ============================================================================

export interface QualityMetrics {
  score: number;
  warning: boolean;
  message: string;
}

/**
 * Calculate photo quality score based on resolution vs. print requirements
 * v2.0 feature
 *
 * Updated logic: Assumes average photobook has 3 photos per page (1/3 page each)
 * This is more realistic than assuming one photo fills the entire page.
 */
export function calculatePhotoQuality(
  photo: { width: number; height: number },
  pageSize: 'A4' | 'Square',
  printDPI = 150,
  avgPhotosPerPage = 3 // Typical photobook has 2-6 photos per page
): QualityMetrics {
  // Determine required resolution based on page size
  const pageDimensions = {
    A4: { width: 8.27, height: 11.69 }, // inches
    Square: { width: 10, height: 10 },
  };

  const pageDim = pageDimensions[pageSize];
  const pagePixelsWidth = pageDim.width * printDPI;
  const pagePixelsHeight = pageDim.height * printDPI;
  const fullPagePixels = pagePixelsWidth * pagePixelsHeight;

  // Calculate required pixels for typical slot size (1/N of page)
  const slotAreaFraction = 1 / avgPhotosPerPage; // e.g., 1/3 = 33% of page
  const requiredPixels = fullPagePixels * slotAreaFraction;

  // Calculate actual pixels
  const actualPixels = photo.width * photo.height;

  // Calculate score (0-100)
  // Score = 100 when photo matches or exceeds required pixels
  const score = Math.min(100, (actualPixels / requiredPixels) * 100);

  // Determine warning threshold
  // Lower threshold (40%) since we're now using realistic slot sizes
  // 40% of slot size = acceptable for photobooks
  const warning = score < 40;
  const message = warning
    ? 'Poor photo quality. We recommend changing the photo to one with higher resolution, otherwise the print might be blurred.'
    : '';

  return { score: Math.round(score), warning, message };
}

// ============================================================================
// v2.0 - Layout Manipulation Utilities
// ============================================================================

/**
 * Add a photo slot to layout and redistribute
 * v2.0 feature
 */
export function addPhotoSlot(currentSlots: StudioPhotoSlot[]): StudioPhotoSlot[] {
  const newSlotCount = currentSlots.length + 1;
  return redistributeSlots(newSlotCount);
}

/**
 * Remove a photo slot from layout and redistribute
 * v2.0 feature
 */
export function removePhotoSlot(currentSlots: StudioPhotoSlot[], slotIdToRemove?: string): StudioPhotoSlot[] {
  let slots = [...currentSlots];

  // Determine which slot to remove
  if (slotIdToRemove) {
    slots = slots.filter((s) => s.id !== slotIdToRemove);
  } else {
    // Remove last slot by default
    slots = slots.slice(0, -1);
  }

  return redistributeSlots(slots.length);
}

/**
 * Shuffle photo slot positions while maintaining count
 * v2.0 feature
 */
export function shufflePhotoSlots(currentSlots: StudioPhotoSlot[]): StudioPhotoSlot[] {
  const positions = currentSlots.map((s) => ({ x: s.x, y: s.y }));

  // Fisher-Yates shuffle
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }

  // Reassign positions to slots
  return currentSlots.map((slot, i) => ({
    ...slot,
    x: positions[i].x,
    y: positions[i].y,
  }));
}

/**
 * Redistribute photo slots following exact user-specified layouts
 * Layouts designed for full canvas coverage with varied visual interest
 * v2.0 feature - Enhanced with user-specified patterns
 */
function redistributeSlots(slotCount: number): StudioPhotoSlot[] {
  if (slotCount <= 0) return [];

  const gap = 1.5; // 1.5% gap between slots
  const newSlots: StudioPhotoSlot[] = [];

  // User-specified layouts for slots 1-9
  switch (slotCount) {
    case 1:
      // Full page - single large photo
      newSlots.push({
        id: generateId('slot'),
        x: gap,
        y: gap,
        width: 100 - 2 * gap,
        height: 100 - 2 * gap,
        zIndex: 0,
      });
      break;

    case 2:
      // Two equal vertical columns
      newSlots.push(
        {
          id: generateId('slot'),
          x: gap,
          y: gap,
          width: 50 - 1.5 * gap,
          height: 100 - 2 * gap,
          zIndex: 0,
        },
        {
          id: generateId('slot'),
          x: 50 + 0.5 * gap,
          y: gap,
          width: 50 - 1.5 * gap,
          height: 100 - 2 * gap,
          zIndex: 1,
        }
      );
      break;

    case 3:
      // Left square, bottom-left square, right tall column
      newSlots.push(
        {
          id: generateId('slot'),
          x: gap,
          y: gap,
          width: 47 - 1.5 * gap,
          height: 48 - 1.5 * gap,
          zIndex: 0,
        },
        {
          id: generateId('slot'),
          x: gap,
          y: 48 + 0.5 * gap,
          width: 47 - 1.5 * gap,
          height: 52 - 1.5 * gap,
          zIndex: 1,
        },
        {
          id: generateId('slot'),
          x: 47 + 0.5 * gap,
          y: gap,
          width: 53 - 1.5 * gap,
          height: 100 - 2 * gap,
          zIndex: 2,
        }
      );
      break;

    case 4:
      // 2x2 equal grid
      newSlots.push(
        {
          id: generateId('slot'),
          x: gap,
          y: gap,
          width: 50 - 1.5 * gap,
          height: 50 - 1.5 * gap,
          zIndex: 0,
        },
        {
          id: generateId('slot'),
          x: 50 + 0.5 * gap,
          y: gap,
          width: 50 - 1.5 * gap,
          height: 50 - 1.5 * gap,
          zIndex: 1,
        },
        {
          id: generateId('slot'),
          x: gap,
          y: 50 + 0.5 * gap,
          width: 50 - 1.5 * gap,
          height: 50 - 1.5 * gap,
          zIndex: 2,
        },
        {
          id: generateId('slot'),
          x: 50 + 0.5 * gap,
          y: 50 + 0.5 * gap,
          width: 50 - 1.5 * gap,
          height: 50 - 1.5 * gap,
          zIndex: 3,
        }
      );
      break;

    case 5:
      // Large left (65% x 55%), 2 stacked top-right, small bottom-left, large bottom-right
      newSlots.push(
        {
          id: generateId('slot'),
          x: gap,
          y: gap,
          width: 65 - 1.5 * gap,
          height: 55 - 1.5 * gap,
          zIndex: 0,
        },
        {
          id: generateId('slot'),
          x: 65 + 0.5 * gap,
          y: gap,
          width: 35 - 1.5 * gap,
          height: 27 - gap,
          zIndex: 1,
        },
        {
          id: generateId('slot'),
          x: 65 + 0.5 * gap,
          y: 27 + gap,
          width: 35 - 1.5 * gap,
          height: 28 - 1.5 * gap,
          zIndex: 2,
        },
        {
          id: generateId('slot'),
          x: gap,
          y: 55 + 0.5 * gap,
          width: 35 - 1.5 * gap,
          height: 45 - 1.5 * gap,
          zIndex: 3,
        },
        {
          id: generateId('slot'),
          x: 35 + 0.5 * gap,
          y: 55 + 0.5 * gap,
          width: 65 - 1.5 * gap,
          height: 45 - 1.5 * gap,
          zIndex: 4,
        }
      );
      break;

    case 6:
      // 3x2 equal grid
      for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 3; col++) {
          newSlots.push({
            id: generateId('slot'),
            x: gap + col * (33.33 + 0.33 * gap),
            y: gap + row * (50 + 0.5 * gap),
            width: 33.33 - 1.33 * gap,
            height: 50 - 1.5 * gap,
            zIndex: row * 3 + col,
          });
        }
      }
      break;

    case 7:
      // Not specified in images - using sensible default: large top + 2x3 bottom grid
      newSlots.push(
        {
          id: generateId('slot'),
          x: gap,
          y: gap,
          width: 100 - 2 * gap,
          height: 50 - 1.5 * gap,
          zIndex: 0,
        }
      );
      for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 3; col++) {
          newSlots.push({
            id: generateId('slot'),
            x: gap + col * (33.33 + 0.33 * gap),
            y: 50 + 0.5 * gap + row * (25 + 0.5 * gap),
            width: 33.33 - 1.33 * gap,
            height: 25 - 1.25 * gap,
            zIndex: row * 3 + col + 1,
          });
        }
      }
      break;

    case 8:
      // 4x2 equal grid
      for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 4; col++) {
          newSlots.push({
            id: generateId('slot'),
            x: gap + col * (25 + 0.25 * gap),
            y: gap + row * (50 + 0.5 * gap),
            width: 25 - 1.25 * gap,
            height: 50 - 1.5 * gap,
            zIndex: row * 4 + col,
          });
        }
      }
      break;

    case 9:
      // 3x3 equal grid
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          newSlots.push({
            id: generateId('slot'),
            x: gap + col * (33.33 + 0.33 * gap),
            y: gap + row * (33.33 + 0.33 * gap),
            width: 33.33 - 1.33 * gap,
            height: 33.33 - 1.33 * gap,
            zIndex: row * 3 + col,
          });
        }
      }
      break;

    default:
      // Fallback for counts > 9: simple grid
      const columns = Math.ceil(Math.sqrt(slotCount));
      const rows = Math.ceil(slotCount / columns);
      const slotWidth = (100 - (columns + 1) * gap) / columns;
      const slotHeight = (100 - (rows + 1) * gap) / rows;

      for (let i = 0; i < slotCount; i++) {
        const col = i % columns;
        const row = Math.floor(i / columns);
        newSlots.push({
          id: generateId('slot'),
          x: gap + col * (slotWidth + gap),
          y: gap + row * (slotHeight + gap),
          width: slotWidth,
          height: slotHeight,
          zIndex: i,
        });
      }
  }

  return newSlots;
}

// ============================================================================
// v2.0 - Element Layer Order Utilities
// ============================================================================

/**
 * Reorder element z-index
 * v2.0 feature
 */
export function reorderElement(
  elements: StudioPageElement[],
  elementId: string,
  direction: 'forward' | 'backward' | 'front' | 'back'
): StudioPageElement[] {
  const sortedElements = [...elements].sort((a, b) => a.zIndex - b.zIndex);
  const elementIndex = sortedElements.findIndex((e) => e.id === elementId);
  if (elementIndex === -1) return elements;

  const element = sortedElements[elementIndex];
  const maxZIndex = Math.max(...sortedElements.map((e) => e.zIndex));
  const minZIndex = Math.min(...sortedElements.map((e) => e.zIndex));

  switch (direction) {
    case 'front':
      element.zIndex = maxZIndex + 1;
      break;
    case 'back':
      element.zIndex = minZIndex - 1;
      break;
    case 'forward':
      if (elementIndex < sortedElements.length - 1) {
        const nextElement = sortedElements[elementIndex + 1];
        [element.zIndex, nextElement.zIndex] = [nextElement.zIndex, element.zIndex];
      }
      break;
    case 'backward':
      if (elementIndex > 0) {
        const prevElement = sortedElements[elementIndex - 1];
        [element.zIndex, prevElement.zIndex] = [prevElement.zIndex, element.zIndex];
      }
      break;
  }

  // Normalize zIndex (ensure sequential starting from 0)
  return sortedElements
    .sort((a, b) => a.zIndex - b.zIndex)
    .map((e, i) => ({ ...e, zIndex: i }));
}

// ============================================================================
// v2.0 - Spread View Utilities
// ============================================================================

export interface Spread {
  id: string;
  leftPage: StudioPage | null;
  rightPage: StudioPage | null;
  spreadNumber: number;
  label: string;
}

/**
 * Create page spreads from pages array
 * v2.0 feature
 */
export function createSpreads(pages: StudioPage[]): StudioSpread[] {
  const spreads: StudioSpread[] = [];

  // Find cover and back cover
  const backCover = pages.find((p) => p.type === 'back-cover');
  const frontCover = pages.find((p) => p.type === 'cover');

  // Spread 0: Back Cover + Front Cover
  if (backCover && frontCover) {
    spreads.push({
      id: 'spread-0',
      leftPage: backCover,
      rightPage: frontCover,
      spreadNumber: 0,
      label: 'Cover',
    });
  }

  // Content pages (pair by page number)
  const contentPages = pages
    .filter((p) => p.type === 'content' || p.type === 'back-of-cover')
    .sort((a, b) => a.pageNumber - b.pageNumber);

  for (let i = 0; i < contentPages.length; i += 2) {
    const leftPage = contentPages[i];
    const rightPage = contentPages[i + 1] || null;

    spreads.push({
      id: `spread-${spreads.length}`,
      leftPage,
      rightPage,
      spreadNumber: spreads.length,
      label: rightPage
        ? `Page ${leftPage.pageNumber}-${rightPage.pageNumber}`
        : `Page ${leftPage.pageNumber}`,
    });
  }

  return spreads;
}
