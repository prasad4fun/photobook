import { AZURE_API_URL, getHeaders, azureConfig } from './config';
import { Theme, ImageSummary } from '../../types';
import { captureError, addBreadcrumb } from '../../utils/sentry';

/**
 * Generate themes using GPT-4o with structured JSON output
 * Based on image analysis summaries
 */
export async function generateThemes(imageSummaries: ImageSummary[]): Promise<Theme[]> {
  addBreadcrumb('Starting theme generation', 'azure', { model: 'gpt-4o' });

  try {
    const summaryText = imageSummaries
      .map((summary, idx) => `Image ${idx + 1}: ${summary.description}. Lighting: ${summary.lighting}. Mood: ${summary.mood}`)
      .join('\n');

    // OpenAI-compatible request format for Midas API
    const request = {
      model: azureConfig.deployments.gpt,
      messages: [
        {
          role: 'system',
          content: 'You are a professional photo editing consultant. Generate theme suggestions in JSON format.',
        },
        {
          role: 'user',
          content: `Based on these photo analyses, suggest 4 distinct editing themes.

Photo Analysis:
${summaryText}

Generate 4 themes with these properties:
- theme_id: unique lowercase identifier with underscores
- name: catchy theme name (2-4 words)
- mood: 2-3 word mood description
- lighting: lighting style recommendation
- background: background treatment
- editing_style: specific editing approach

Return only valid JSON with a "themes" array. No markdown, no explanation.`,
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
      throw new Error(`GPT API error: ${response.status} - ${errorText}`);
    }

    const responseData = await response.json();

    // Midas API wraps response in data object
    const data = responseData.data || responseData;
    const content = data.choices?.[0]?.message?.content || '';

    // Parse JSON response
    let parsedContent;
    try {
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      parsedContent = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse GPT response:', content);
      throw new Error('Invalid JSON response from GPT');
    }

    addBreadcrumb('Theme generation completed', 'azure', {
      themeCount: parsedContent.themes?.length,
      tokens: data.usage?.total_tokens,
    });

    return parsedContent.themes || [];
  } catch (error) {
    captureError(error as Error, { service: 'gpt', operation: 'generateThemes' });
    throw error;
  }
}
