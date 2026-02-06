import { ImageUpload, ImageSummary, Theme, OrderDetails } from '../types';

/**
 * Mock data for testing
 */

export const mockImage: ImageUpload = {
  id: 'img_test_1',
  file: new File(['test'], 'test.jpg', { type: 'image/jpeg' }),
  preview: 'blob:http://localhost/test',
  name: 'test.jpg',
  size: 1024,
};

export const mockImages: ImageUpload[] = [
  mockImage,
  {
    id: 'img_test_2',
    file: new File(['test2'], 'test2.jpg', { type: 'image/jpeg' }),
    preview: 'blob:http://localhost/test2',
    name: 'test2.jpg',
    size: 2048,
  },
  {
    id: 'img_test_3',
    file: new File(['test3'], 'test3.jpg', { type: 'image/jpeg' }),
    preview: 'blob:http://localhost/test3',
    name: 'test3.jpg',
    size: 3072,
  },
  {
    id: 'img_test_4',
    file: new File(['test4'], 'test4.jpg', { type: 'image/jpeg' }),
    preview: 'blob:http://localhost/test4',
    name: 'test4.jpg',
    size: 4096,
  },
  {
    id: 'img_test_5',
    file: new File(['test5'], 'test5.jpg', { type: 'image/jpeg' }),
    preview: 'blob:http://localhost/test5',
    name: 'test5.jpg',
    size: 5120,
  },
];

export const mockImageSummary: ImageSummary = {
  image_id: 'img_test_1',
  description: 'Professional portrait with good composition',
  lighting: 'Natural lighting',
  mood: 'Positive and cheerful',
};

export const mockImageSummaries: ImageSummary[] = mockImages.map((img, idx) => ({
  image_id: img.id,
  description: `Professional photo ${idx + 1} with good composition`,
  lighting: 'Natural',
  mood: 'Positive',
}));

export const mockTheme: Theme = {
  theme_id: 'warm_family_portrait',
  name: 'Warm Family Portrait',
  mood: 'Joyful, intimate',
  lighting: 'Soft natural light',
  background: 'Neutral indoor',
  editing_style: 'Warm tones, gentle contrast',
};

export const mockThemes: Theme[] = [
  mockTheme,
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
];

export const mockOrderDetails: OrderDetails = {
  package: 'digital',
  price: 999,
  imageCount: 5,
  theme: mockTheme,
};
