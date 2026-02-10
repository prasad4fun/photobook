/**
 * Sticker/Clipart Library
 * Organized by categories for easy browsing
 */

export interface StickerItem {
  id: string;
  name: string;
  url: string;
  category: StickerCategory;
  keywords: string[];
  width?: number;  // Aspect ratio helper
  height?: number;
}

export type StickerCategory =
  | 'holidays'
  | 'travel'
  | 'kids-baby'
  | 'wedding'
  | 'shapes-frames'
  | 'seasonal';

export const STICKER_CATEGORIES: { id: StickerCategory; label: string }[] = [
  { id: 'holidays', label: 'Holidays' },
  { id: 'travel', label: 'Travel' },
  { id: 'kids-baby', label: 'Kids / Baby' },
  { id: 'wedding', label: 'Wedding' },
  { id: 'shapes-frames', label: 'Shapes & Frames' },
  { id: 'seasonal', label: 'Seasonal' },
];

/**
 * Sticker Library
 * Using emoji and Unicode symbols as clipart
 * In production, replace with actual SVG/PNG URLs
 */
export const STICKER_LIBRARY: StickerItem[] = [
  // Holidays
  {
    id: 'holiday-christmas-tree',
    name: 'Christmas Tree',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="80" font-size="80">🎄</text></svg>',
    category: 'holidays',
    keywords: ['christmas', 'tree', 'holiday', 'festive'],
  },
  {
    id: 'holiday-gift',
    name: 'Gift',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="80" font-size="80">🎁</text></svg>',
    category: 'holidays',
    keywords: ['gift', 'present', 'birthday', 'christmas'],
  },
  {
    id: 'holiday-santa',
    name: 'Santa',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="80" font-size="80">🎅</text></svg>',
    category: 'holidays',
    keywords: ['santa', 'christmas', 'holiday'],
  },
  {
    id: 'holiday-balloon',
    name: 'Balloon',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="80" font-size="80">🎈</text></svg>',
    category: 'holidays',
    keywords: ['balloon', 'party', 'birthday', 'celebration'],
  },
  {
    id: 'holiday-cake',
    name: 'Birthday Cake',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="80" font-size="80">🎂</text></svg>',
    category: 'holidays',
    keywords: ['cake', 'birthday', 'celebration', 'party'],
  },
  {
    id: 'holiday-fireworks',
    name: 'Fireworks',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="80" font-size="80">🎆</text></svg>',
    category: 'holidays',
    keywords: ['fireworks', 'celebration', 'new year', 'party'],
  },

  // Travel
  {
    id: 'travel-airplane',
    name: 'Airplane',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="80" font-size="80">✈️</text></svg>',
    category: 'travel',
    keywords: ['airplane', 'travel', 'flight', 'vacation'],
  },
  {
    id: 'travel-globe',
    name: 'Globe',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="80" font-size="80">🌍</text></svg>',
    category: 'travel',
    keywords: ['globe', 'world', 'travel', 'earth'],
  },
  {
    id: 'travel-camera',
    name: 'Camera',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="80" font-size="80">📷</text></svg>',
    category: 'travel',
    keywords: ['camera', 'photo', 'photography', 'memories'],
  },
  {
    id: 'travel-compass',
    name: 'Compass',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="80" font-size="80">🧭</text></svg>',
    category: 'travel',
    keywords: ['compass', 'navigation', 'adventure', 'explore'],
  },
  {
    id: 'travel-beach',
    name: 'Beach Umbrella',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="80" font-size="80">🏖️</text></svg>',
    category: 'travel',
    keywords: ['beach', 'umbrella', 'vacation', 'summer'],
  },
  {
    id: 'travel-mountain',
    name: 'Mountain',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="80" font-size="80">⛰️</text></svg>',
    category: 'travel',
    keywords: ['mountain', 'hiking', 'nature', 'adventure'],
  },

  // Kids / Baby
  {
    id: 'kids-teddy-bear',
    name: 'Teddy Bear',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="80" font-size="80">🧸</text></svg>',
    category: 'kids-baby',
    keywords: ['teddy', 'bear', 'toy', 'baby', 'kids'],
  },
  {
    id: 'kids-baby-bottle',
    name: 'Baby Bottle',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="80" font-size="80">🍼</text></svg>',
    category: 'kids-baby',
    keywords: ['bottle', 'baby', 'infant', 'feeding'],
  },
  {
    id: 'kids-star',
    name: 'Star',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="80" font-size="80">⭐</text></svg>',
    category: 'kids-baby',
    keywords: ['star', 'sparkle', 'magic', 'kids'],
  },
  {
    id: 'kids-rainbow',
    name: 'Rainbow',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="80" font-size="80">🌈</text></svg>',
    category: 'kids-baby',
    keywords: ['rainbow', 'color', 'kids', 'happy'],
  },
  {
    id: 'kids-butterfly',
    name: 'Butterfly',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="80" font-size="80">🦋</text></svg>',
    category: 'kids-baby',
    keywords: ['butterfly', 'nature', 'kids', 'spring'],
  },
  {
    id: 'kids-balloon-animal',
    name: 'Balloon Dog',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="80" font-size="80">🐶</text></svg>',
    category: 'kids-baby',
    keywords: ['dog', 'animal', 'pet', 'kids'],
  },

  // Wedding
  {
    id: 'wedding-rings',
    name: 'Wedding Rings',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="80" font-size="80">💍</text></svg>',
    category: 'wedding',
    keywords: ['rings', 'wedding', 'marriage', 'love'],
  },
  {
    id: 'wedding-heart',
    name: 'Heart',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="80" font-size="80">❤️</text></svg>',
    category: 'wedding',
    keywords: ['heart', 'love', 'romance', 'wedding'],
  },
  {
    id: 'wedding-bouquet',
    name: 'Bouquet',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="80" font-size="80">💐</text></svg>',
    category: 'wedding',
    keywords: ['bouquet', 'flowers', 'wedding', 'bride'],
  },
  {
    id: 'wedding-champagne',
    name: 'Champagne',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="80" font-size="80">🥂</text></svg>',
    category: 'wedding',
    keywords: ['champagne', 'toast', 'celebration', 'wedding'],
  },
  {
    id: 'wedding-church',
    name: 'Church',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="80" font-size="80">⛪</text></svg>',
    category: 'wedding',
    keywords: ['church', 'ceremony', 'wedding', 'marriage'],
  },
  {
    id: 'wedding-couple',
    name: 'Couple',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="80" font-size="80">👰</text></svg>',
    category: 'wedding',
    keywords: ['couple', 'bride', 'wedding', 'marriage'],
  },

  // Shapes & Frames
  {
    id: 'frame-circle',
    name: 'Circle Frame',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="none" stroke="%23666" stroke-width="4"/></svg>',
    category: 'shapes-frames',
    keywords: ['circle', 'frame', 'border', 'shape'],
  },
  {
    id: 'frame-square',
    name: 'Square Frame',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="10" y="10" width="80" height="80" fill="none" stroke="%23666" stroke-width="4"/></svg>',
    category: 'shapes-frames',
    keywords: ['square', 'frame', 'border', 'shape'],
  },
  {
    id: 'frame-heart',
    name: 'Heart Frame',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="80" font-size="80">♥️</text></svg>',
    category: 'shapes-frames',
    keywords: ['heart', 'frame', 'love', 'shape'],
  },
  {
    id: 'frame-star',
    name: 'Star Frame',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="80" font-size="80">⭐</text></svg>',
    category: 'shapes-frames',
    keywords: ['star', 'frame', 'shape'],
  },
  {
    id: 'frame-ribbon',
    name: 'Ribbon',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="80" font-size="80">🎀</text></svg>',
    category: 'shapes-frames',
    keywords: ['ribbon', 'decoration', 'frame'],
  },
  {
    id: 'frame-sparkle',
    name: 'Sparkle',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="80" font-size="80">✨</text></svg>',
    category: 'shapes-frames',
    keywords: ['sparkle', 'magic', 'decoration'],
  },

  // Seasonal
  {
    id: 'seasonal-snowflake',
    name: 'Snowflake',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="80" font-size="80">❄️</text></svg>',
    category: 'seasonal',
    keywords: ['snowflake', 'winter', 'snow', 'cold'],
  },
  {
    id: 'seasonal-sun',
    name: 'Sun',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="80" font-size="80">☀️</text></svg>',
    category: 'seasonal',
    keywords: ['sun', 'summer', 'sunny', 'bright'],
  },
  {
    id: 'seasonal-leaf',
    name: 'Fall Leaf',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="80" font-size="80">🍂</text></svg>',
    category: 'seasonal',
    keywords: ['leaf', 'fall', 'autumn', 'nature'],
  },
  {
    id: 'seasonal-flower',
    name: 'Spring Flower',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="80" font-size="80">🌸</text></svg>',
    category: 'seasonal',
    keywords: ['flower', 'spring', 'bloom', 'nature'],
  },
  {
    id: 'seasonal-pumpkin',
    name: 'Pumpkin',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="80" font-size="80">🎃</text></svg>',
    category: 'seasonal',
    keywords: ['pumpkin', 'halloween', 'fall', 'autumn'],
  },
  {
    id: 'seasonal-snowman',
    name: 'Snowman',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="80" font-size="80">⛄</text></svg>',
    category: 'seasonal',
    keywords: ['snowman', 'winter', 'snow', 'christmas'],
  },
];

/**
 * Search stickers by keyword
 */
export function searchStickers(query: string): StickerItem[] {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return STICKER_LIBRARY;

  return STICKER_LIBRARY.filter((sticker) =>
    sticker.name.toLowerCase().includes(lowerQuery) ||
    sticker.keywords.some((keyword) => keyword.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get stickers by category
 */
export function getStickersByCategory(category: StickerCategory): StickerItem[] {
  return STICKER_LIBRARY.filter((sticker) => sticker.category === category);
}
