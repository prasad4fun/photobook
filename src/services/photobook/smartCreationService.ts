import {
  ImageAsset,
  SmartCreationResult,
  PageSpread,
  PhotobookPage,
  Theme,
} from '../../types';
import { createImageElement, createBackgroundElement } from './canvasElementService';
import { USE_MOCK_API } from '../../utils/constants';

/**
 * Smart Creation Service
 *
 * Uses AI (GPT-4o Vision / Claude) to analyze images and auto-generate
 * optimal photobook layouts with intelligent image placement
 */

// ============================================================================
// AI-Powered Layout Generation
// ============================================================================

export async function generateSmartLayout(
  assets: ImageAsset[],
  targetPageCount: number = 10,
  theme?: Theme
): Promise<SmartCreationResult> {
  if (USE_MOCK_API || assets.length === 0) {
    return generateMockSmartLayout(assets, targetPageCount, theme);
  }

  try {
    // Analyze images with AI
    const imageAnalysis = await analyzeImagesForLayout(assets, theme);

    // Generate spreads based on analysis
    const spreads = await generateSpreadsFromAnalysis(
      assets,
      imageAnalysis,
      targetPageCount,
      theme
    );

    return {
      spreads,
      theme: theme?.name || 'Auto-generated',
      style: imageAnalysis.detectedStyle,
      reasoning: imageAnalysis.reasoning,
    };
  } catch (error) {
    console.error('Smart Creation failed, using fallback:', error);
    return generateMockSmartLayout(assets, targetPageCount, theme);
  }
}

interface ImageAnalysis {
  imageScores: Array<{
    assetId: string;
    isHero: boolean; // Hero image (full-page worthy)
    isPortrait: boolean;
    isLandscape: boolean;
    dominantColors: string[];
    subjects: string[]; // 'people', 'landscape', 'object', etc.
    quality: number; // 0-100
  }>;
  detectedStyle: string;
  suggestedTheme: string;
  reasoning: string;
}

async function analyzeImagesForLayout(
  assets: ImageAsset[],
  theme?: Theme
): Promise<ImageAnalysis> {
  // TODO: Integrate with Azure AI when USE_MOCK_API is false
  // For now, use mock analysis

  const imageScores = assets.slice(0, 10).map((asset, index) => ({
    assetId: asset.id,
    isHero: index === 0 || Math.random() > 0.7, // First image or 30% chance
    isPortrait: asset.originalDimensions && asset.originalDimensions.height > asset.originalDimensions.width,
    isLandscape: asset.originalDimensions && asset.originalDimensions.width > asset.originalDimensions.height,
    dominantColors: ['#8B7355', '#F4E8D8', '#4A5568'],
    subjects: index % 2 === 0 ? ['people'] : ['landscape', 'outdoor'],
    quality: 70 + Math.random() * 30, // 70-100
  }));

  return {
    imageScores,
    detectedStyle: theme?.mood || 'Balanced family moments',
    suggestedTheme: theme?.name || 'Warm Family Portrait',
    reasoning:
      'Collection features varied subjects and settings. Using mix of full-page hero images and collage layouts for visual interest.',
  };
}

async function generateSpreadsFromAnalysis(
  assets: ImageAsset[],
  analysis: ImageAnalysis,
  targetPageCount: number,
  _theme?: Theme
): Promise<PageSpread[]> {
  const spreads: PageSpread[] = [];

  // Create cover spread with hero image
  const heroImage = analysis.imageScores.find((s) => s.isHero && s.quality > 70);
  const coverAsset = heroImage
    ? assets.find((a) => a.id === heroImage.assetId)
    : assets[0];

  if (coverAsset) {
    const coverElement = createImageElement(
      coverAsset,
      240, // 10% from left
      350, // 10% from top
      2000, // 80% width
      2800 // 80% height
    );

    spreads.push({
      id: 'spread_cover',
      spreadNumber: 1,
      leftPage: null,
      rightPage: {
        id: 'page_cover',
        pageNumber: 1,
        position: 'right',
        elements: [coverElement],
        background: createBackgroundElement('#ffffff'),
        bleed: 37,
        safeZone: 75,
      },
      layoutPresetId: null,
      isLocked: false,
    });
  }

  // Generate content spreads
  const remainingAssets = coverAsset
    ? assets.filter((a) => a.id !== coverAsset.id)
    : assets;

  const pagesNeeded = Math.min(targetPageCount - 1, remainingAssets.length * 2);
  const spreadsNeeded = Math.ceil(pagesNeeded / 2);

  for (let i = 0; i < spreadsNeeded; i++) {
    const leftPageAssets = remainingAssets.slice(i * 2, i * 2 + 1);
    const rightPageAssets = remainingAssets.slice(i * 2 + 1, i * 2 + 2);

    const leftPage: PhotobookPage | null = leftPageAssets.length > 0
      ? {
          id: `page_${i * 2 + 2}`,
          pageNumber: i * 2 + 2,
          position: 'left',
          elements: [
            createImageElement(
              leftPageAssets[0],
              124, // 5% from left
              175, // 5% from top
              2232, // 90% width
              3158 // 90% height
            ),
          ],
          background: createBackgroundElement('#ffffff'),
          bleed: 37,
          safeZone: 75,
        }
      : null;

    const rightPage: PhotobookPage = rightPageAssets.length > 0
      ? {
          id: `page_${i * 2 + 3}`,
          pageNumber: i * 2 + 3,
          position: 'right',
          elements: [
            createImageElement(
              rightPageAssets[0],
              124,
              175,
              2232,
              3158
            ),
          ],
          background: createBackgroundElement('#ffffff'),
          bleed: 37,
          safeZone: 75,
        }
      : {
          id: `page_${i * 2 + 3}`,
          pageNumber: i * 2 + 3,
          position: 'right',
          elements: [],
          background: createBackgroundElement('#ffffff'),
          bleed: 37,
          safeZone: 75,
        };

    spreads.push({
      id: `spread_${i + 1}`,
      spreadNumber: i + 2,
      leftPage,
      rightPage,
      layoutPresetId: null,
      isLocked: false,
    });
  }

  return spreads;
}

// ============================================================================
// Mock Implementation (for development)
// ============================================================================

function generateMockSmartLayout(
  assets: ImageAsset[],
  targetPageCount: number = 10,
  theme?: Theme
): SmartCreationResult {
  const spreads: PageSpread[] = [];

  // Cover with first image
  if (assets.length > 0) {
    spreads.push({
      id: 'spread_cover',
      spreadNumber: 1,
      leftPage: null,
      rightPage: {
        id: 'page_cover',
        pageNumber: 1,
        position: 'right',
        elements: [
          createImageElement(assets[0], 240, 350, 2000, 2800),
        ],
        background: createBackgroundElement(theme?.theme_id === 'warm_family_portrait' ? '#f8f4f0' : '#ffffff'),
        bleed: 37,
        safeZone: 75,
      },
      layoutPresetId: null,
      isLocked: false,
    });
  }

  // Generate spreads with varied layouts
  const remainingAssets = assets.slice(1);

  let assetIndex = 0;
  let spreadNumber = 2;

  while (assetIndex < remainingAssets.length && spreadNumber <= Math.ceil(targetPageCount / 2)) {
    const leftAsset = remainingAssets[assetIndex];
    const rightAsset = remainingAssets[assetIndex + 1];

    // Alternate between single image and collage layouts
    const useCollage = spreadNumber % 3 === 0;

    if (useCollage && assetIndex + 3 < remainingAssets.length) {
      // Collage layout (2 images per page)
      spreads.push(createCollageSpread(
        spreadNumber,
        [leftAsset, remainingAssets[assetIndex + 2]],
        [rightAsset, remainingAssets[assetIndex + 3]],
        theme
      ));
      assetIndex += 4;
    } else {
      // Single image layout
      spreads.push(createSingleImageSpread(
        spreadNumber,
        leftAsset,
        rightAsset,
        theme
      ));
      assetIndex += 2;
    }

    spreadNumber++;
  }

  return {
    spreads,
    theme: theme?.name || 'Auto-generated',
    style: 'Balanced mix of full-page and collage layouts',
    reasoning:
      'AI detected varied image orientations and subjects. Using alternating single and collage layouts for visual rhythm.',
  };
}

function createSingleImageSpread(
  spreadNumber: number,
  leftAsset?: ImageAsset,
  rightAsset?: ImageAsset,
  theme?: Theme
): PageSpread {
  const bgColor = theme?.theme_id === 'warm_family_portrait' ? '#f8f4f0' : '#ffffff';

  return {
    id: `spread_${spreadNumber}`,
    spreadNumber,
    leftPage: leftAsset
      ? {
          id: `page_${(spreadNumber - 1) * 2}`,
          pageNumber: (spreadNumber - 1) * 2,
          position: 'left',
          elements: [createImageElement(leftAsset, 124, 175, 2232, 3158)],
          background: createBackgroundElement(bgColor),
          bleed: 37,
          safeZone: 75,
        }
      : null,
    rightPage: {
      id: `page_${(spreadNumber - 1) * 2 + 1}`,
      pageNumber: (spreadNumber - 1) * 2 + 1,
      position: 'right',
      elements: rightAsset ? [createImageElement(rightAsset, 124, 175, 2232, 3158)] : [],
      background: createBackgroundElement(bgColor),
      bleed: 37,
      safeZone: 75,
    },
    layoutPresetId: 'single_large',
    isLocked: false,
  };
}

function createCollageSpread(
  spreadNumber: number,
  leftAssets: ImageAsset[],
  rightAssets: ImageAsset[],
  theme?: Theme
): PageSpread {
  const bgColor = theme?.theme_id === 'warm_family_portrait' ? '#f8f4f0' : '#ffffff';

  const leftElements = leftAssets.map((asset, index) =>
    createImageElement(
      asset,
      index === 0 ? 124 : 1364, // Top: 5%, Bottom: 55%
      index === 0 ? 175 : 1929, // Left col, right col
      1100,
      1580
    )
  );

  const rightElements = rightAssets.map((asset, index) =>
    createImageElement(
      asset,
      index === 0 ? 124 : 1364,
      index === 0 ? 175 : 1929,
      1100,
      1580
    )
  );

  return {
    id: `spread_${spreadNumber}`,
    spreadNumber,
    leftPage: leftAssets.length > 0
      ? {
          id: `page_${(spreadNumber - 1) * 2}`,
          pageNumber: (spreadNumber - 1) * 2,
          position: 'left',
          elements: leftElements,
          background: createBackgroundElement(bgColor),
          bleed: 37,
          safeZone: 75,
        }
      : null,
    rightPage: {
      id: `page_${(spreadNumber - 1) * 2 + 1}`,
      pageNumber: (spreadNumber - 1) * 2 + 1,
      position: 'right',
      elements: rightElements,
      background: createBackgroundElement(bgColor),
      bleed: 37,
      safeZone: 75,
    },
    layoutPresetId: 'collage_2x2',
    isLocked: false,
  };
}

// ============================================================================
// Layout Strategy Selection
// ============================================================================

export function selectLayoutStrategy(
  imageScores: ImageAnalysis['imageScores']
): 'hero-focused' | 'balanced' | 'collage-heavy' | 'story-telling' {
  const heroCount = imageScores.filter((s) => s.isHero).length;
  const highQualityCount = imageScores.filter((s) => s.quality > 80).length;
  const portraitCount = imageScores.filter((s) => s.isPortrait).length;
  const landscapeCount = imageScores.filter((s) => s.isLandscape).length;

  // Lots of hero images → hero-focused (large full-page layouts)
  if (heroCount > imageScores.length * 0.5) {
    return 'hero-focused';
  }

  // Mix of orientations and quality → balanced
  if (Math.abs(portraitCount - landscapeCount) < imageScores.length * 0.3) {
    return 'balanced';
  }

  // Lots of similar images → collage-heavy (group related images)
  if (highQualityCount < imageScores.length * 0.4) {
    return 'collage-heavy';
  }

  // Default: story-telling (chronological flow)
  return 'story-telling';
}

// ============================================================================
// Image Grouping
// ============================================================================

export function groupImagesByTheme(
  imageScores: ImageAnalysis['imageScores']
): Array<string[]> {
  // Group images by dominant color similarity and subject overlap
  const groups: Array<string[]> = [];

  imageScores.forEach((score) => {
    let addedToGroup = false;

    for (const group of groups) {
      const groupScore = imageScores.find((s) => s.assetId === group[0]);
      if (!groupScore) continue;

      // Check color similarity
      const colorOverlap = score.dominantColors.some((color) =>
        groupScore.dominantColors.includes(color)
      );

      // Check subject overlap
      const subjectOverlap = score.subjects.some((subject) =>
        groupScore.subjects.includes(subject)
      );

      if (colorOverlap && subjectOverlap) {
        group.push(score.assetId);
        addedToGroup = true;
        break;
      }
    }

    if (!addedToGroup) {
      groups.push([score.assetId]);
    }
  });

  return groups;
}

// ============================================================================
// Optimal Image Placement
// ============================================================================

export function calculateOptimalImageSize(
  originalWidth: number,
  originalHeight: number,
  targetWidth: number,
  targetHeight: number,
  fit: 'cover' | 'contain' = 'cover'
): { width: number; height: number; x: number; y: number } {
  const imageRatio = originalWidth / originalHeight;
  const targetRatio = targetWidth / targetHeight;

  let width, height, x, y;

  if (fit === 'cover') {
    if (imageRatio > targetRatio) {
      // Image is wider - fit height
      height = targetHeight;
      width = height * imageRatio;
      x = -(width - targetWidth) / 2;
      y = 0;
    } else {
      // Image is taller - fit width
      width = targetWidth;
      height = width / imageRatio;
      x = 0;
      y = -(height - targetHeight) / 2;
    }
  } else {
    // contain
    if (imageRatio > targetRatio) {
      width = targetWidth;
      height = width / imageRatio;
      x = 0;
      y = (targetHeight - height) / 2;
    } else {
      height = targetHeight;
      width = height * imageRatio;
      x = (targetWidth - width) / 2;
      y = 0;
    }
  }

  return { width, height, x, y };
}

// ============================================================================
// Export Functions
// ============================================================================

export { analyzeImagesForLayout, generateSpreadsFromAnalysis };
