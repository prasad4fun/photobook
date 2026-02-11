/**
 * PhotoBook Generator - Creates photobook structure from photos
 */

import type {
  StudioPhoto,
  StudioPhotoBook,
  StudioPhotoBookConfig,
  StudioPage,
  StudioPhotoElement,
  StudioTextElement,
  StudioLayoutTemplate,
  StudioPhotoSlot,
} from '../../types';
import { STUDIO_PAGE_DIMENSIONS } from '../../types';

/**
 * Generate a photobook from selected photos
 */
export function generatePhotoBook(
  photos: StudioPhoto[],
  config: StudioPhotoBookConfig
): StudioPhotoBook {
  const photoBook: StudioPhotoBook = {
    id: `photobook-${Date.now()}`,
    createdAt: new Date(),
    updatedAt: new Date(),
    pages: [],
    config,
  };

  // Create cover page
  photoBook.pages.push(createCoverPage(photos[0], config));

  // Create content pages
  const contentPages = createContentPages(photos, config);
  photoBook.pages.push(...contentPages);

  // Create back cover
  photoBook.pages.push(createBackPage(config));

  return photoBook;
}

/**
 * Create cover page
 */
function createCoverPage(coverPhoto: StudioPhoto, config: StudioPhotoBookConfig): StudioPage {
  const coverLayout = getLayoutTemplate('cover-single');
  const elements: (StudioPhotoElement | StudioTextElement)[] = [];

  // Add title text element at top center
  const titleElement: StudioTextElement = {
    id: `element-text-${Date.now()}`,
    type: 'text',
    content: 'Enter title',
    x: 25,            // Centered: 25% from left
    y: 5,             // 5% from top
    width: 50,        // 50% of page width
    height: 15,       // 15% of page height
    fontSize: 504.17, // 121pt at 300 DPI
    fontFamily: 'Londrina Solid',
    fontWeight: '900',
    fontStyle: 'normal',
    textAlign: 'center',
    color: '#000000',
    lineHeight: 1.2,
    rotation: 0,
    zIndex: 100,
  };
  elements.push(titleElement);

  // Add photo placeholder below title (70% height, centered)
  if (coverPhoto && coverLayout.photoSlots.length > 0) {
    const photoElement: StudioPhotoElement = {
      id: `element-${Date.now()}-0`,
      type: 'photo',
      photoId: coverPhoto.id,
      x: 15,            // Centered: 15% from left
      y: 20,            // 20% from top (below title)
      width: 70,        // 70% of page width
      height: 70,       // 70% of page height
      rotation: 0,
      zIndex: 50,       // Below text (zIndex 100)
      slotId: coverLayout.photoSlots[0].id,
    };
    elements.push(photoElement);
  }

  return {
    id: `page-cover`,
    pageNumber: 1,
    type: 'cover',
    elements,
    layout: {
      id: 'cover-single',
      name: 'Cover Single Photo',
      template: coverLayout,
    },
    background: {
      type: 'color',
      color: '#ffffff',
    },
  };
}

/**
 * Create content pages
 */
function createContentPages(photos: StudioPhoto[], config: StudioPhotoBookConfig): StudioPage[] {
  const pages: StudioPage[] = [];
  const photosPerPage = 4; // Using grid layout
  const contentPhotos = photos.slice(1); // Skip first photo (used for cover)

  let photoIndex = 0;
  let pageNumber = 2; // Start after cover

  while (photoIndex < contentPhotos.length) {
    const pagePhotos = contentPhotos.slice(photoIndex, photoIndex + photosPerPage);
    const layout = getLayoutTemplate(`grid-${Math.min(pagePhotos.length, 4)}`);

    const elements: StudioPhotoElement[] = pagePhotos.map((photo, idx) => {
      const slot = layout.photoSlots[idx];
      return {
        id: `element-${Date.now()}-${photoIndex + idx}`,
        type: 'photo',
        photoId: photo.id,
        x: slot.x,
        y: slot.y,
        width: slot.width,
        height: slot.height,
        rotation: 0,
        zIndex: idx + 1,
        slotId: slot.id,
      };
    });

    pages.push({
      id: `page-${pageNumber}`,
      pageNumber,
      type: 'content',
      elements,
      layout: {
        id: `grid-${pagePhotos.length}`,
        name: `Grid ${pagePhotos.length} Photos`,
        template: layout,
      },
      background: {
        type: 'color',
        color: '#ffffff',
      },
    });

    photoIndex += photosPerPage;
    pageNumber++;
  }

  return pages;
}

/**
 * Create back cover page
 */
function createBackPage(config: StudioPhotoBookConfig): StudioPage {
  // Create 2x2 grid layout for 4 photos (covering top 60% of page)
  const backCoverTemplate: StudioLayoutTemplate = {
    photoSlots: [
      // Top-left photo
      {
        id: 'back-slot-1',
        x: 15,        // 15% from left
        y: 10,        // 10% from top
        width: 32,    // 32% width (with 3% gaps)
        height: 25,   // 25% height
        zIndex: 1,
      },
      // Top-right photo
      {
        id: 'back-slot-2',
        x: 50,        // 15 + 32 + 3 = 50%
        y: 10,
        width: 32,
        height: 25,
        zIndex: 1,
      },
      // Bottom-left photo
      {
        id: 'back-slot-3',
        x: 15,
        y: 38,        // 10 + 25 + 3 = 38%
        width: 32,
        height: 25,
        zIndex: 1,
      },
      // Bottom-right photo
      {
        id: 'back-slot-4',
        x: 50,
        y: 38,
        width: 32,
        height: 25,
        zIndex: 1,
      },
    ],
  };

  // Create 4 empty photo placeholder elements
  const photoElements: StudioPhotoElement[] = backCoverTemplate.photoSlots.map((slot, idx) => ({
    id: `element-${Date.now()}-${idx}`,
    type: 'photo',
    photoId: undefined,  // Empty placeholder
    x: slot.x,
    y: slot.y,
    width: slot.width,
    height: slot.height,
    rotation: 0,
    zIndex: slot.zIndex,
    slotId: slot.id,
  }));

  // Caption text element below photos
  const currentYear = new Date().getFullYear();
  const captionElement: StudioTextElement = {
    id: `element-text-${Date.now()}`,
    type: 'text',
    content: 'Enter caption',  // Placeholder for user to edit
    x: 25,            // Centered: 25% from left
    y: 70,            // 70% from top (below photo grid at 63%)
    width: 50,        // 50% of page width
    height: 15,       // 15% of page height
    fontSize: 208.33, // 50pt at 300 DPI
    fontFamily: 'Londrina Solid',
    fontWeight: '900',
    fontStyle: 'normal',
    textAlign: 'center',
    color: '#000000',
    lineHeight: 1.2,
    rotation: 0,
    zIndex: 100,
  };

  return {
    id: 'page-back',
    pageNumber: 999, // Will be renumbered
    type: 'back-cover',
    elements: [...photoElements, captionElement],  // 4 photos + caption
    layout: {
      id: 'back-grid-4',
      name: '4 Photo Grid',
      template: backCoverTemplate,
    },
    background: {
      type: 'color',
      color: '#f3f4f6',
    },
  };
}

/**
 * Get predefined layout templates
 */
export function getLayoutTemplate(layoutId: string): StudioLayoutTemplate {
  const layouts: Record<string, StudioLayoutTemplate> = {
    'cover-single': {
      photoSlots: [
        {
          id: 'slot-1',
          x: 10,
          y: 10,
          width: 80,
          height: 80,
          zIndex: 1,
        },
      ],
    },
    'grid-1': {
      photoSlots: [
        {
          id: 'slot-1',
          x: 10,
          y: 10,
          width: 80,
          height: 80,
          zIndex: 1,
        },
      ],
    },
    'grid-2': {
      photoSlots: [
        {
          id: 'slot-1',
          x: 5,
          y: 10,
          width: 42,
          height: 80,
          zIndex: 1,
        },
        {
          id: 'slot-2',
          x: 53,
          y: 10,
          width: 42,
          height: 80,
          zIndex: 1,
        },
      ],
    },
    'grid-3': {
      photoSlots: [
        {
          id: 'slot-1',
          x: 10,
          y: 5,
          width: 80,
          height: 38,
          zIndex: 1,
        },
        {
          id: 'slot-2',
          x: 10,
          y: 48,
          width: 38,
          height: 38,
          zIndex: 1,
        },
        {
          id: 'slot-3',
          x: 52,
          y: 48,
          width: 38,
          height: 38,
          zIndex: 1,
        },
      ],
    },
    'grid-4': {
      photoSlots: [
        {
          id: 'slot-1',
          x: 5,
          y: 5,
          width: 42,
          height: 42,
          zIndex: 1,
        },
        {
          id: 'slot-2',
          x: 53,
          y: 5,
          width: 42,
          height: 42,
          zIndex: 1,
        },
        {
          id: 'slot-3',
          x: 5,
          y: 53,
          width: 42,
          height: 42,
          zIndex: 1,
        },
        {
          id: 'slot-4',
          x: 53,
          y: 53,
          width: 42,
          height: 42,
          zIndex: 1,
        },
      ],
    },
    'empty': {
      photoSlots: [],
    },
  };

  return layouts[layoutId] || layouts['empty'];
}

/**
 * Get all available layouts
 */
export function getAvailableLayouts() {
  return [
    {
      id: 'grid-1',
      name: 'Single Photo',
      preview: '/layouts/grid-1.png',
      template: getLayoutTemplate('grid-1'),
      category: 'single' as const,
    },
    {
      id: 'grid-2',
      name: 'Two Column',
      preview: '/layouts/grid-2.png',
      template: getLayoutTemplate('grid-2'),
      category: 'grid' as const,
    },
    {
      id: 'grid-3',
      name: 'Three Photos',
      preview: '/layouts/grid-3.png',
      template: getLayoutTemplate('grid-3'),
      category: 'grid' as const,
    },
    {
      id: 'grid-4',
      name: 'Four Grid',
      preview: '/layouts/grid-4.png',
      template: getLayoutTemplate('grid-4'),
      category: 'grid' as const,
    },
  ];
}

/**
 * Apply layout to existing page
 */
export function applyLayoutToPage(
  page: StudioPage,
  layoutId: string,
  photos: StudioPhoto[]
): StudioPage {
  const layout = getLayoutTemplate(layoutId);
  const existingPhotoElements = page.elements.filter(
    (el) => el.type === 'photo'
  ) as StudioPhotoElement[];

  const newElements: StudioPhotoElement[] = [];

  // Map existing photos to new slots
  existingPhotoElements.forEach((photoEl, idx) => {
    if (idx < layout.photoSlots.length) {
      const slot = layout.photoSlots[idx];
      newElements.push({
        ...photoEl,
        x: slot.x,
        y: slot.y,
        width: slot.width,
        height: slot.height,
        slotId: slot.id,
      });
    } else {
      // Keep as free-floating if no slot available
      newElements.push(photoEl);
    }
  });

  // Preserve non-photo elements
  const nonPhotoElements = page.elements.filter((el) => el.type !== 'photo');

  return {
    ...page,
    elements: [...newElements, ...nonPhotoElements],
    layout: {
      id: layoutId,
      name: `Layout ${layoutId}`,
      template: layout,
    },
  };
}

/**
 * Calculate page dimensions based on config
 */
export function getPageDimensions(config: StudioPhotoBookConfig) {
  if (config.dimensions) {
    return config.dimensions;
  }

  const sizeConfig = STUDIO_PAGE_DIMENSIONS[config.pageSize];
  return sizeConfig[config.orientation];
}
