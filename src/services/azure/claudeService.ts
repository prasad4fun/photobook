import { AZURE_API_URL, getHeaders, azureConfig } from './config';
import { ImageSummary } from '../../types';
import { captureError, addBreadcrumb } from '../../utils/sentry';

/**
 * Analyze a single image using Claude Sonnet-4 with Vision
 * Returns description, lighting, mood for professional photo editing
 * Supports base64 encoded images via OpenAI Vision API format
 */
export async function analyzeImage(imageBase64: string, imageName?: string): Promise<ImageSummary> {
  addBreadcrumb('Starting image analysis', 'azure', { model: 'claude', hasImage: !!imageBase64 });

  try {
    // OpenAI Vision API format for Midas API
    const request = {
      model: azureConfig.deployments.claude,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this photo${imageName ? ` (${imageName})` : ''} for professional editing. Provide exactly 3 lines:
Line 1: Brief description of the subject and composition
Line 2: Lighting quality and type (natural, studio, indoor, outdoor, etc.)
Line 3: Overall mood/emotion conveyed

Keep each line concise (1 sentence max). Focus on editing-relevant details. No numbering, just plain text lines.`
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ]
        }
      ],
      max_tokens: 200,
      temperature: 0.3,
    };

    const response = await fetch(AZURE_API_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Claude API error: ${response.status} - ${errorText}`);
    }

    const responseData = await response.json();

    // Midas API wraps response in data object
    const data = responseData.data || responseData;
    const content = data.choices?.[0]?.message?.content || '';

    // Parse the response
    const lines = content.split('\n').filter((line: string) => line.trim());
    const description = lines[0] || 'Professional photo with good composition';
    const lighting = lines[1] || 'Natural lighting';
    const mood = lines[2] || 'Positive and engaging mood';

    addBreadcrumb('Image analysis completed', 'azure', {
      tokens: data.usage?.total_tokens,
      contentLength: content.length,
    });

    return {
      image_id: `img_${Date.now()}`,
      description,
      lighting,
      mood,
    };
  } catch (error) {
    captureError(error as Error, { service: 'claude', operation: 'analyzeImage' });
    throw error;
  }
}

/**
 * Batch analyze multiple images
 */
export async function analyzeImages(
  imagesBase64: string[],
  onProgress?: (index: number, total: number) => void
): Promise<ImageSummary[]> {
  const summaries: ImageSummary[] = [];

  for (let i = 0; i < imagesBase64.length; i++) {
    try {
      const summary = await analyzeImage(imagesBase64[i]);
      summaries.push(summary);
      onProgress?.(i + 1, imagesBase64.length);
    } catch (error) {
      console.error(`Failed to analyze image ${i + 1}:`, error);
      // Continue with other images even if one fails
      summaries.push({
        image_id: `img_${Date.now()}_${i}`,
        description: 'Analysis failed',
        lighting: 'Unknown',
        mood: 'Unknown',
      });
    }
  }

  return summaries;
}
