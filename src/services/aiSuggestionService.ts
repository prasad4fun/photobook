import { AZURE_API_URL, getHeaders, azureConfig } from './azure/config';
import { AISuggestion, Theme, ImageLayerProps } from '../types';
import { USE_MOCK_API } from '../utils/constants';
import { captureError, addBreadcrumb } from '../utils/sentry';

/**
 * AI Suggestion Service
 *
 * Uses GPT-4o Vision API to analyze images and suggest optimal adjustments
 * based on the selected theme. Returns 3-5 contextual suggestions with
 * confidence scores.
 */

// ============================================================================
// Main API Functions
// ============================================================================

export async function generateSuggestions(
  imageBase64: string,
  theme: Theme,
  currentAdjustments: ImageLayerProps
): Promise<AISuggestion[]> {
  if (USE_MOCK_API) {
    return generateMockSuggestions(theme);
  }

  addBreadcrumb('Generating AI suggestions', 'ai', { theme: theme.theme_id });

  try {
    const prompt = buildSuggestionPrompt(theme, currentAdjustments);

    const request = {
      model: azureConfig.deployments.gpt,
      messages: [
        {
          role: 'system',
          content: 'You are an expert photo editor. Analyze images and provide specific adjustment suggestions in JSON format.',
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt,
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
      max_tokens: 800,
      temperature: 0.7,
    };

    const response = await fetch(AZURE_API_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GPT-4o API error: ${response.status} - ${errorText}`);
    }

    const responseData = await response.json();
    const data = responseData.data || responseData;
    const content = data.choices?.[0]?.message?.content || '';

    // Parse JSON response
    const suggestions = parseSuggestionsFromResponse(content);

    addBreadcrumb('AI suggestions generated', 'ai', {
      count: suggestions.length,
      tokens: data.usage?.total_tokens,
    });

    return suggestions;
  } catch (error) {
    captureError(error as Error, {
      service: 'aiSuggestion',
      operation: 'generateSuggestions',
    });
    // Fallback to mock suggestions on error
    return generateMockSuggestions(theme);
  }
}

// ============================================================================
// Prompt Engineering
// ============================================================================

function buildSuggestionPrompt(theme: Theme, currentAdjustments: ImageLayerProps): string {
  return `You are analyzing this image for a "${theme.name}" themed photo album.

**Theme Specifications:**
- Target mood: ${theme.mood}
- Desired lighting: ${theme.lighting}
- Background style: ${theme.background}
- Editing style: ${theme.editing_style}

**Current Adjustments:**
- Brightness: ${currentAdjustments.brightness}
- Contrast: ${currentAdjustments.contrast}
- Saturation: ${currentAdjustments.saturation}
- Hue: ${currentAdjustments.hue}
- Filters: ${currentAdjustments.filters.map(f => f.type).join(', ') || 'none'}

Analyze the image and suggest 3-5 ADDITIONAL adjustments to better match the theme.

**Requirements:**
1. Each suggestion must have a specific numeric value (-100 to 100)
2. Include confidence score (0 to 1) based on how well it matches the theme
3. Provide a brief explanation (max 15 words) for each suggestion
4. Focus on adjustments that complement current settings

Return ONLY valid JSON array format:
[
  {
    "type": "brightness" | "contrast" | "saturation" | "hue" | "filter",
    "title": "Brief title (max 5 words)",
    "description": "Why this helps (max 15 words)",
    "adjustments": {
      "brightness": number (-100 to 100),
      "contrast": number (-100 to 100),
      "saturation": number (-100 to 100),
      "hue": number (-180 to 180)
    },
    "confidence": number (0 to 1)
  }
]

No explanation, only JSON array.`;
}

// ============================================================================
// Response Parsing
// ============================================================================

function parseSuggestionsFromResponse(content: string): AISuggestion[] {
  try {
    // Remove markdown code blocks if present
    const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();

    // Try to parse as JSON
    const parsed = JSON.parse(cleanContent);

    // Ensure it's an array
    const suggestionsArray = Array.isArray(parsed) ? parsed : [parsed];

    // Convert to AISuggestion format
    return suggestionsArray.map((item, index) => ({
      suggestion_id: `sug_${Date.now()}_${index}`,
      image_id: 'current',
      type: item.type || 'adjustment',
      title: item.title || 'Adjustment Suggestion',
      description: item.description || 'Improve image quality',
      confidence: item.confidence || 0.7,
      adjustments: {
        brightness: item.adjustments?.brightness || 0,
        contrast: item.adjustments?.contrast || 0,
        saturation: item.adjustments?.saturation || 0,
        hue: item.adjustments?.hue || 0,
        filter: item.adjustments?.filter,
      },
    }));
  } catch (error) {
    console.error('Failed to parse AI suggestions:', error);
    return [];
  }
}

// ============================================================================
// Mock Suggestions (Fallback)
// ============================================================================

function generateMockSuggestions(theme: Theme): AISuggestion[] {
  const themePresets: Record<string, AISuggestion[]> = {
    warm_family_portrait: [
      {
        suggestion_id: 'sug_warm_1',
        image_id: 'current',
        type: 'adjustment',
        title: 'Warm Glow',
        description: 'Increase brightness and warmth for cozy family feel',
        confidence: 0.92,
        adjustments: {
          brightness: 15,
          contrast: 5,
          saturation: 10,
          hue: 10,
        },
      },
      {
        suggestion_id: 'sug_warm_2',
        image_id: 'current',
        type: 'adjustment',
        title: 'Soft Contrast',
        description: 'Gentle contrast boost highlights facial features beautifully',
        confidence: 0.88,
        adjustments: {
          brightness: 5,
          contrast: 12,
          saturation: 5,
        },
      },
      {
        suggestion_id: 'sug_warm_3',
        image_id: 'current',
        type: 'adjustment',
        title: 'Golden Tones',
        description: 'Shift hue slightly warmer for golden hour effect',
        confidence: 0.85,
        adjustments: {
          hue: 15,
          saturation: 8,
        },
      },
    ],
    cinematic_moments: [
      {
        suggestion_id: 'sug_cine_1',
        image_id: 'current',
        type: 'adjustment',
        title: 'Dramatic Shadows',
        description: 'Increase contrast and reduce brightness for film noir mood',
        confidence: 0.94,
        adjustments: {
          brightness: -10,
          contrast: 35,
          saturation: -10,
        },
      },
      {
        suggestion_id: 'sug_cine_2',
        image_id: 'current',
        type: 'adjustment',
        title: 'Desaturate',
        description: 'Lower saturation for that classic cinema look',
        confidence: 0.89,
        adjustments: {
          saturation: -20,
          contrast: 15,
        },
      },
      {
        suggestion_id: 'sug_cine_3',
        image_id: 'current',
        type: 'adjustment',
        title: 'Cool Tones',
        description: 'Shift to cooler hues for dramatic atmosphere',
        confidence: 0.87,
        adjustments: {
          hue: -15,
          brightness: -5,
        },
      },
    ],
    bright_cheerful: [
      {
        suggestion_id: 'sug_bright_1',
        image_id: 'current',
        type: 'adjustment',
        title: 'Max Brightness',
        description: 'Boost brightness significantly for energetic happy feel',
        confidence: 0.95,
        adjustments: {
          brightness: 25,
          saturation: 15,
        },
      },
      {
        suggestion_id: 'sug_bright_2',
        image_id: 'current',
        type: 'adjustment',
        title: 'Vibrant Colors',
        description: 'Increase saturation to make colors pop cheerfully',
        confidence: 0.91,
        adjustments: {
          saturation: 20,
          contrast: -5,
        },
      },
      {
        suggestion_id: 'sug_bright_3',
        image_id: 'current',
        type: 'adjustment',
        title: 'Light Airy Feel',
        description: 'Reduce contrast for soft cheerful atmosphere',
        confidence: 0.88,
        adjustments: {
          brightness: 15,
          contrast: -10,
        },
      },
    ],
    elegant_classic: [
      {
        suggestion_id: 'sug_elegant_1',
        image_id: 'current',
        type: 'adjustment',
        title: 'Subtle Enhancement',
        description: 'Small boost to contrast for refined elegant look',
        confidence: 0.90,
        adjustments: {
          contrast: 10,
          brightness: 5,
        },
      },
      {
        suggestion_id: 'sug_elegant_2',
        image_id: 'current',
        type: 'adjustment',
        title: 'Natural Saturation',
        description: 'Slight saturation increase maintains classic elegance',
        confidence: 0.86,
        adjustments: {
          saturation: 5,
        },
      },
      {
        suggestion_id: 'sug_elegant_3',
        image_id: 'current',
        type: 'adjustment',
        title: 'Balanced Tones',
        description: 'Perfect balance for timeless sophisticated style',
        confidence: 0.84,
        adjustments: {
          brightness: 3,
          contrast: 8,
          saturation: 3,
        },
      },
    ],
  };

  return themePresets[theme.theme_id] || themePresets.warm_family_portrait;
}

// ============================================================================
// Apply Suggestion to Adjustments
// ============================================================================

export function applySuggestion(
  suggestion: AISuggestion,
  currentAdjustments: ImageLayerProps
): ImageLayerProps {
  return {
    ...currentAdjustments,
    brightness: currentAdjustments.brightness + (suggestion.adjustments.brightness || 0),
    contrast: currentAdjustments.contrast + (suggestion.adjustments.contrast || 0),
    saturation: currentAdjustments.saturation + (suggestion.adjustments.saturation || 0),
    hue: currentAdjustments.hue + (suggestion.adjustments.hue || 0),
  };
}

// ============================================================================
// Suggestion Refresh
// ============================================================================

export async function refreshSuggestions(
  imageBase64: string,
  theme: Theme,
  currentAdjustments: ImageLayerProps
): Promise<AISuggestion[]> {
  // Add slight delay to prevent rapid API calls
  await new Promise((resolve) => setTimeout(resolve, 500));
  return generateSuggestions(imageBase64, theme, currentAdjustments);
}
