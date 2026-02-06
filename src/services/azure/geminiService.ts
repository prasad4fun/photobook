import { AZURE_API_URL, getHeaders, azureConfig } from './config';
import { ImageSummary } from '../../types';
import { captureError, addBreadcrumb } from '../../utils/sentry';

/**
 * Stream theme preview text using Gemini 2.5 Pro
 * Provides real-time feedback during analysis
 */
export async function* streamThemePreview(
  imageSummaries: ImageSummary[]
): AsyncGenerator<string, void, unknown> {
  addBreadcrumb('Starting theme preview stream', 'azure', { model: 'gemini' });

  try {
    const summaryText = imageSummaries
      .map((s, idx) => `Image ${idx + 1}: ${s.description}`)
      .slice(0, 3) // Only use first 3 for preview
      .join('. ');

    // OpenAI-compatible request format for Midas API
    const request = {
      model: azureConfig.deployments.gemini,
      messages: [
        {
          role: 'user',
          content: `Based on these photos: ${summaryText}

Generate 5 short, insightful observations about the photos that would help in theme generation. Each observation should be one sentence. Start each with an action verb like "Detecting", "Identifying", "Recognizing", "Finding", "Analyzing".`,
        },
      ],
      max_tokens: 200,
      temperature: 0.8,
      stream: true,
    };

    const response = await fetch(AZURE_API_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    // Handle streaming response
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('No response body reader available');
    }

    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');

      // Keep the last incomplete line in the buffer
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);

          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content || '';

            if (content) {
              yield content;
            }
          } catch (e) {
            // Skip invalid JSON lines
            continue;
          }
        }
      }
    }

    addBreadcrumb('Theme preview stream completed', 'azure');
  } catch (error) {
    captureError(error as Error, { service: 'gemini', operation: 'streamThemePreview' });
    throw error;
  }
}

/**
 * Get streaming text as a single concatenated string (fallback for non-streaming UIs)
 */
export async function getThemePreviewText(imageSummaries: ImageSummary[]): Promise<string> {
  let fullText = '';

  for await (const chunk of streamThemePreview(imageSummaries)) {
    fullText += chunk;
  }

  return fullText;
}
