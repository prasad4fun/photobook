import {
  AZURE_ENDPOINT,
  AZURE_API_KEY,
  CLAUDE_DEPLOYMENT,
  GPT_DEPLOYMENT,
  GEMINI_DEPLOYMENT,
} from '../../utils/constants';

export const azureConfig = {
  endpoint: AZURE_ENDPOINT || 'https://midas.ai.bosch.com',
  apiKey: AZURE_API_KEY, // Optional - Midas may not require authentication
  deployments: {
    claude: CLAUDE_DEPLOYMENT || 'Claude-Sonnet-4',
    gpt: GPT_DEPLOYMENT || 'GPT 4o',
    gemini: GEMINI_DEPLOYMENT || 'Gemini-2.5-pro',
  },
  apiVersion: 'v2',
};

// Midas API endpoint
export const AZURE_API_URL = `${azureConfig.endpoint}/ss1/api/${azureConfig.apiVersion}/llm/completions`;

export function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Add authorization header only if API key is provided
  if (azureConfig.apiKey) {
    headers['Authorization'] = `Bearer ${azureConfig.apiKey}`;
  }

  return headers;
}
