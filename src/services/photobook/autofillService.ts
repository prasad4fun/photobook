import {
  PageSpread,
  PhotobookPage,
  ImageAsset,
  AutofillOptions,
  PhotobookElement,
} from '../../types';
import { createImageElement } from './canvasElementService';

/**
 * Autofill Service
 *
 * Automatically populates empty spaces in photobook spreads with images
 * Uses intelligent matching based on image size, orientation, and usage
 */

// ============================================================================
// Main Autofill Function
// ============================================================================

export async function autofillImages(
  spreads: PageSpread[],
  assets: ImageAsset[],
  options: AutofillOptions
): Promise<PageSpread[]> {
  const { strategy, skipUsedImages, targetSpreadIds } = options;

  // Filter assets based on options
  const availableAssets = skipUsedImages
    ? assets.filter((asset) => !asset.isUsed)
    : assets;

  if (availableAssets.length === 0) {
    throw new Error('No available images to autofill');
  }

  // Filter target spreads
  const targetSpreads = targetSpreadIds
    ? spreads.filter((spread) => targetSpreadIds.includes(spread.id))
    : spreads;

  // Process each spread
  const updatedSpreads = spreads.map((spread) => {
    if (!targetSpreads.includes(spread) || spread.isLocked) {
      return spread;
    }

    return fillSpread(spread, availableAssets, strategy);
  });

  return updatedSpreads;
}

// ============================================================================
// Spread Filling Logic
// ============================================================================

function fillSpread(
  spread: PageSpread,
  assets: ImageAsset[],
  strategy: AutofillOptions['strategy']
): PageSpread {
  let assetQueue = [...assets];

  // Shuffle if random strategy
  if (strategy === 'random') {
    assetQueue = shuffleArray(assetQueue);
  }

  // Sort by quality for best-fit strategy
  if (strategy === 'best-fit') {
    // Assume higher resolution = better quality
    assetQueue = assetQueue.sort((a, b) => {
      const aSize = a.originalDimensions?.width || 0;
      const bSize = b.originalDimensions?.width || 0;
      return bSize - aSize;
    });
  }

  const leftPage = spread.leftPage ? fillPage(spread.leftPage, assetQueue) : null;
  const rightPage = fillPage(spread.rightPage, assetQueue);

  return {
    ...spread,
    leftPage,
    rightPage,
  };
}

function fillPage(
  page: PhotobookPage,
  assetQueue: ImageAsset[]
): PhotobookPage {
  // Find empty spaces on the page
  const emptySpaces = detectEmptySpaces(page);

  if (emptySpaces.length === 0 || assetQueue.length === 0) {
    return page;
  }

  const newElements = [...page.elements];

  // Fill each empty space
  for (const space of emptySpaces) {
    if (assetQueue.length === 0) break;

    const asset = assetQueue.shift();
    if (!asset) break;

    const imageElement = createImageElement(
      asset,
      space.x,
      space.y,
      space.width,
      space.height
    );

    newElements.push(imageElement);
  }

  return {
    ...page,
    elements: newElements,
  };
}

// ============================================================================
// Empty Space Detection
// ============================================================================

interface EmptySpace {
  x: number;
  y: number;
  width: number;
  height: number;
  area: number;
}

function detectEmptySpaces(page: PhotobookPage): EmptySpace[] {
  const imageElements = page.elements.filter((el) => el.type === 'image');

  // If page is completely empty, return one large space
  if (imageElements.length === 0) {
    return [
      {
        x: 124, // 5% margin
        y: 175,
        width: 2232, // 90% width
        height: 3158, // 90% height
        area: 2232 * 3158,
      },
    ];
  }

  // If page has images, find gaps (simplified)
  // For now, just divide remaining space into quadrants
  const emptySpaces: EmptySpace[] = [];

  // Check quadrants
  const quadrants = [
    { x: 124, y: 175, width: 1100, height: 1550 }, // Top-left
    { x: 1356, y: 175, width: 1000, height: 1550 }, // Top-right
    { x: 124, y: 1783, width: 1100, height: 1550 }, // Bottom-left
    { x: 1356, y: 1783, width: 1000, height: 1550 }, // Bottom-right
  ];

  for (const quadrant of quadrants) {
    const hasOverlap = imageElements.some((el) => {
      if (el.type !== 'image') return false;
      return isOverlapping(el, quadrant);
    });

    if (!hasOverlap) {
      emptySpaces.push({
        ...quadrant,
        area: quadrant.width * quadrant.height,
      });
    }
  }

  // Sort by area (largest first)
  return emptySpaces.sort((a, b) => b.area - a.area);
}

function isOverlapping(
  element: PhotobookElement,
  space: { x: number; y: number; width: number; height: number }
): boolean {
  return !(
    element.x + element.width < space.x ||
    element.x > space.x + space.width ||
    element.y + element.height < space.y ||
    element.y > space.y + space.height
  );
}

// ============================================================================
// Image Matching
// ============================================================================

export function matchImageToSpace(
  assets: ImageAsset[],
  space: EmptySpace
): ImageAsset | null {
  // Find best matching image for the space
  const spaceRatio = space.width / space.height;

  const scored = assets.map((asset) => {
    const imageRatio =
      asset.originalDimensions?.width && asset.originalDimensions?.height
        ? asset.originalDimensions.width / asset.originalDimensions.height
        : 1.5;

    const ratioScore = 1 - Math.abs(imageRatio - spaceRatio);
    const sizeScore = Math.min(
      (asset.originalDimensions?.width || 1000) / space.width,
      1
    );

    return {
      asset,
      score: ratioScore * 0.6 + sizeScore * 0.4,
    };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored.length > 0 ? scored[0].asset : null;
}

// ============================================================================
// Utilities
// ============================================================================

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ============================================================================
// Autofill Statistics
// ============================================================================

export interface AutofillStats {
  totalSlotsFilled: number;
  imagesUsed: number;
  spreadsAffected: number;
  emptySlots: number;
}

export function calculateAutofillStats(
  originalSpreads: PageSpread[],
  filledSpreads: PageSpread[]
): AutofillStats {
  let totalSlotsFilled = 0;
  let spreadsAffected = 0;
  let emptySlots = 0;

  filledSpreads.forEach((spread, index) => {
    const original = originalSpreads[index];
    const originalImageCount =
      (original.leftPage?.elements.filter((e) => e.type === 'image').length || 0) +
      (original.rightPage?.elements.filter((e) => e.type === 'image').length || 0);

    const filledImageCount =
      (spread.leftPage?.elements.filter((e) => e.type === 'image').length || 0) +
      (spread.rightPage?.elements.filter((e) => e.type === 'image').length || 0);

    const newImages = filledImageCount - originalImageCount;

    if (newImages > 0) {
      totalSlotsFilled += newImages;
      spreadsAffected++;
    }

    // Count empty spaces in filled spread
    const leftEmptyCount = spread.leftPage
      ? detectEmptySpaces(spread.leftPage).length
      : 0;
    const rightEmptyCount = detectEmptySpaces(spread.rightPage).length;
    emptySlots += leftEmptyCount + rightEmptyCount;
  });

  return {
    totalSlotsFilled,
    imagesUsed: totalSlotsFilled,
    spreadsAffected,
    emptySlots,
  };
}
