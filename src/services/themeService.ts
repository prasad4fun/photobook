import { analyzeImages } from './azure/claudeService';
import { generateThemes } from './azure/gptService';
import { streamThemePreview } from './azure/geminiService';
import { imagesToBase64 } from './imageService';
import { ImageUpload, ImageSummary, Theme } from '../types';
import { USE_MOCK_API, MOCK_THEMES, MOCK_STREAMING_MESSAGES } from '../utils/constants';
import { captureError } from '../utils/sentry';
import { analytics } from '../utils/analytics';

/**
 * Complete theme generation workflow
 * 1. Analyze images with Claude
 * 2. Generate themes with GPT-4o
 * 3. Return both summaries and themes
 */
export async function generateThemesFromImages(
  images: ImageUpload[],
  onProgress?: (step: string, progress: number) => void
): Promise<{ summaries: ImageSummary[]; themes: Theme[] }> {
  const startTime = Date.now();

  try {
    // Use mock data if flag is set
    if (USE_MOCK_API) {
      return await mockThemeGeneration(images, onProgress);
    }

    onProgress?.('Converting images...', 0);

    // Step 1: Convert images to base64
    const base64Images = await imagesToBase64(images);

    onProgress?.('Analyzing images...', 20);

    // Step 2: Analyze each image with Claude
    const summaries = await analyzeImages(base64Images, (current, total) => {
      const progressPercent = 20 + (current / total) * 40;
      onProgress?.(`Analyzing image ${current}/${total}...`, progressPercent);
    });

    onProgress?.('Generating themes...', 70);

    // Step 3: Generate themes based on analysis
    const themes = await generateThemes(summaries);

    onProgress?.('Complete!', 100);

    const duration = Date.now() - startTime;
    analytics.analysisCompleted(images[0]?.id || 'unknown', duration);

    return { summaries, themes };
  } catch (error) {
    captureError(error as Error, {
      operation: 'generateThemesFromImages',
      imageCount: images.length,
    });
    throw error;
  }
}

/**
 * Stream theme preview text during analysis
 */
export async function* streamAnalysisPreview(
  summaries: ImageSummary[]
): AsyncGenerator<string, void, unknown> {
  if (USE_MOCK_API) {
    // Mock streaming for development
    for (const message of MOCK_STREAMING_MESSAGES) {
      await new Promise((resolve) => setTimeout(resolve, 2500));
      yield message;
    }
    return;
  }

  try {
    for await (const chunk of streamThemePreview(summaries)) {
      yield chunk;
    }
  } catch (error) {
    captureError(error as Error, { operation: 'streamAnalysisPreview' });
    // Silently fail streaming, don't break the flow
  }
}

/**
 * Mock theme generation for development/testing
 */
async function mockThemeGeneration(
  images: ImageUpload[],
  onProgress?: (step: string, progress: number) => void
): Promise<{ summaries: ImageSummary[]; themes: Theme[] }> {
  // Simulate processing delay
  onProgress?.('Analyzing images...', 0);
  await new Promise((resolve) => setTimeout(resolve, 1000));

  onProgress?.('Analyzing images...', 30);

  const mockSummaries: ImageSummary[] = images.map((img, idx) => ({
    image_id: img.id,
    description: `Professional photo ${idx + 1} with good composition`,
    lighting: 'Natural',
    mood: 'Positive',
  }));

  await new Promise((resolve) => setTimeout(resolve, 1000));
  onProgress?.('Generating themes...', 70);

  await new Promise((resolve) => setTimeout(resolve, 1000));
  onProgress?.('Complete!', 100);

  return {
    summaries: mockSummaries,
    themes: MOCK_THEMES,
  };
}
