/**
 * Application-wide constants
 */

// Image constraints
export const MIN_IMAGES = 2;
export const MAX_IMAGES = 30;
export const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png'];
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

// Processing timings (milliseconds)
export const ANALYSIS_STEP_DURATION = 3000;
export const IMAGE_ANALYSIS_DELAY = 500;
export const STREAMING_MESSAGE_DELAY = 2500;
export const THEME_CARD_ANIMATION_DELAY = 800;

// Order processing
export const PROCESSING_DURATION = 18000; // 18 seconds for mock
export const ESTIMATED_PROCESSING_TIME = 20; // 20 minutes

// Pricing
export const DIGITAL_PACKAGE_PRICE = 999;
export const PHOTOBOOK_PACKAGE_PRICE = 2499;

// API Configuration
export const AZURE_ENDPOINT = process.env.REACT_APP_AZURE_ENDPOINT || '';
export const AZURE_API_KEY = process.env.REACT_APP_AZURE_API_KEY || '';
export const CLAUDE_DEPLOYMENT = process.env.REACT_APP_CLAUDE_DEPLOYMENT || 'claude-sonnet-4';
export const GPT_DEPLOYMENT = process.env.REACT_APP_GPT_DEPLOYMENT || 'gpt-4o';
export const GEMINI_DEPLOYMENT = process.env.REACT_APP_GEMINI_DEPLOYMENT || 'gemini-2.5-pro';

// Feature flags
export const USE_MOCK_API = process.env.REACT_APP_USE_MOCK_API === 'true';
export const ENABLE_STREAMING = process.env.REACT_APP_ENABLE_STREAMING === 'true';

// Sentry
export const SENTRY_DSN = process.env.REACT_APP_SENTRY_DSN || '';
export const SENTRY_ENV = process.env.REACT_APP_SENTRY_ENV || 'development';

// Analytics
export const GA_TRACKING_ID = process.env.REACT_APP_GA_TRACKING_ID || '';

// Mock data for development
export const MOCK_STREAMING_MESSAGES = [
  'Detecting warm natural lighting in family portraits...',
  'Identifying indoor settings with soft backgrounds...',
  'Recognizing joyful expressions and candid moments...',
  'Finding cultural elements and traditional attire...',
  'Analyzing color palettes and tonal consistency...',
];

export const MOCK_THEMES: Array<{
  theme_id: string;
  name: string;
  mood: string;
  lighting: string;
  background: string;
  editing_style: string;
}> = [
  {
    theme_id: 'warm_family_portrait',
    name: 'Warm Family Portrait',
    mood: 'Joyful, intimate',
    lighting: 'Soft natural light',
    background: 'Neutral indoor',
    editing_style: 'Warm tones, gentle contrast',
  },
  {
    theme_id: 'cinematic_moments',
    name: 'Cinematic Moments',
    mood: 'Dramatic, timeless',
    lighting: 'Controlled studio lighting',
    background: 'Dark with highlights',
    editing_style: 'Film-like grading, deep shadows',
  },
  {
    theme_id: 'bright_cheerful',
    name: 'Bright & Cheerful',
    mood: 'Energetic, happy',
    lighting: 'Bright natural light',
    background: 'Light pastels',
    editing_style: 'Vibrant colors, high key',
  },
  {
    theme_id: 'elegant_classic',
    name: 'Elegant Classic',
    mood: 'Sophisticated, refined',
    lighting: 'Balanced studio light',
    background: 'Timeless neutrals',
    editing_style: 'Subtle enhancement, natural tones',
  },
];
