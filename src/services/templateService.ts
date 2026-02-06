import { PhotoTemplate, TemplateLayout, ImageSlot, ImageUpload } from '../types';

/**
 * Template Service
 *
 * Manages photobook templates with customizable layouts.
 * Provides theme-specific templates for single portrait, collage,
 * grid, and story layouts.
 */

// ============================================================================
// Template Definitions
// ============================================================================

const TEMPLATES: PhotoTemplate[] = [
  // Warm Family Portrait Templates
  {
    template_id: 'warm_single_portrait',
    name: 'Single Portrait',
    theme_id: 'warm_family_portrait',
    category: 'single',
    layout: {
      pageSize: { width: 2480, height: 3508 }, // A4 at 300 DPI
      imageSlots: [
        {
          id: 'main',
          x: 10,
          y: 10,
          width: 80,
          height: 80,
          zIndex: 1,
          rotation: 0,
          borderRadius: 0,
          imageId: null,
        },
      ],
      textSlots: [],
      decorativeElements: [],
      background: {
        color: '#f8f4f0',
        gradient: 'linear-gradient(135deg, #f8f4f0 0%, #e8ddd0 100%)',
      },
    },
    previewUrl: '/templates/warm_single_portrait.jpg',
  },
  {
    template_id: 'warm_collage_4',
    name: 'Warm Memories Collage',
    theme_id: 'warm_family_portrait',
    category: 'collage',
    layout: {
      pageSize: { width: 2480, height: 3508 }, // A4 at 300 DPI
      imageSlots: [
        {
          id: 'slot1',
          x: 5,
          y: 5,
          width: 45,
          height: 45,
          zIndex: 1,
          rotation: -2,
          borderRadius: 4,
          imageId: null,
        },
        {
          id: 'slot2',
          x: 52,
          y: 5,
          width: 43,
          height: 45,
          zIndex: 1,
          rotation: 1,
          borderRadius: 4,
          imageId: null,
        },
        {
          id: 'slot3',
          x: 5,
          y: 52,
          width: 43,
          height: 43,
          zIndex: 1,
          rotation: 1,
          borderRadius: 4,
          imageId: null,
        },
        {
          id: 'slot4',
          x: 52,
          y: 52,
          width: 43,
          height: 43,
          zIndex: 1,
          rotation: -1,
          borderRadius: 4,
          imageId: null,
        },
      ],
      textSlots: [],
      decorativeElements: [],
      background: {
        color: '#f8f4f0',
        gradient: 'linear-gradient(135deg, #f8f4f0 0%, #e8ddd0 100%)',
      },
    },
    previewUrl: '/templates/warm_collage_4.jpg',
  },
  {
    template_id: 'warm_story_layout',
    name: 'Family Story',
    theme_id: 'warm_family_portrait',
    category: 'story',
    layout: {
      pageSize: { width: 2480, height: 3508 }, // A4 at 300 DPI
      imageSlots: [
        {
          id: 'hero',
          x: 5,
          y: 5,
          width: 90,
          height: 50,
          zIndex: 1,
          rotation: 0,
          borderRadius: 8,
          imageId: null,
        },
        {
          id: 'detail1',
          x: 5,
          y: 58,
          width: 28,
          height: 37,
          zIndex: 1,
          rotation: 0,
          borderRadius: 4,
          imageId: null,
        },
        {
          id: 'detail2',
          x: 36,
          y: 58,
          width: 28,
          height: 37,
          zIndex: 1,
          rotation: 0,
          borderRadius: 4,
          imageId: null,
        },
        {
          id: 'detail3',
          x: 67,
          y: 58,
          width: 28,
          height: 37,
          zIndex: 1,
          rotation: 0,
          borderRadius: 4,
          imageId: null,
        },
      ],
      textSlots: [],
      decorativeElements: [],
      background: {
        color: '#f8f4f0',
        gradient: 'linear-gradient(135deg, #f8f4f0 0%, #e8ddd0 100%)',
      },
    },
    previewUrl: '/templates/warm_story_layout.jpg',
  },

  // Cinematic Moments Templates
  {
    template_id: 'cinematic_single',
    name: 'Cinematic Frame',
    theme_id: 'cinematic_moments',
    category: 'single',
    layout: {
      pageSize: { width: 2480, height: 3508 }, // A4 at 300 DPI
      imageSlots: [
        {
          id: 'main',
          x: 5,
          y: 15,
          width: 90,
          height: 70,
          zIndex: 1,
          rotation: 0,
          borderRadius: 0,
          imageId: null,
        },
      ],
      textSlots: [],
      decorativeElements: [],
      background: {
        color: '#1a1a1a',
        gradient: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
      },
    },
    previewUrl: '/templates/cinematic_single.jpg',
  },
  {
    template_id: 'cinematic_grid_6',
    name: 'Cinematic Grid',
    theme_id: 'cinematic_moments',
    category: 'grid',
    layout: {
      pageSize: { width: 2480, height: 3508 }, // A4 at 300 DPI
      imageSlots: [
        {
          id: 'slot1',
          x: 5,
          y: 5,
          width: 28,
          height: 28,
          zIndex: 1,
          rotation: 0,
          borderRadius: 0,
          imageId: null,
        },
        {
          id: 'slot2',
          x: 36,
          y: 5,
          width: 28,
          height: 28,
          zIndex: 1,
          rotation: 0,
          borderRadius: 0,
          imageId: null,
        },
        {
          id: 'slot3',
          x: 67,
          y: 5,
          width: 28,
          height: 28,
          zIndex: 1,
          rotation: 0,
          borderRadius: 0,
          imageId: null,
        },
        {
          id: 'slot4',
          x: 5,
          y: 36,
          width: 28,
          height: 28,
          zIndex: 1,
          rotation: 0,
          borderRadius: 0,
          imageId: null,
        },
        {
          id: 'slot5',
          x: 36,
          y: 36,
          width: 28,
          height: 28,
          zIndex: 1,
          rotation: 0,
          borderRadius: 0,
          imageId: null,
        },
        {
          id: 'slot6',
          x: 67,
          y: 36,
          width: 28,
          height: 28,
          zIndex: 1,
          rotation: 0,
          borderRadius: 0,
          imageId: null,
        },
      ],
      textSlots: [],
      decorativeElements: [],
      background: {
        color: '#1a1a1a',
        gradient: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
      },
    },
    previewUrl: '/templates/cinematic_grid_6.jpg',
  },

  // Bright & Cheerful Templates
  {
    template_id: 'bright_full_bleed',
    name: 'Full Bleed Bright',
    theme_id: 'bright_cheerful',
    category: 'single',
    layout: {
      pageSize: { width: 2480, height: 3508 }, // A4 at 300 DPI
      imageSlots: [
        {
          id: 'main',
          x: 0,
          y: 0,
          width: 100,
          height: 100,
          zIndex: 1,
          rotation: 0,
          borderRadius: 0,
          imageId: null,
        },
      ],
      textSlots: [],
      decorativeElements: [],
      background: {
        color: '#ffffff',
        gradient: null,
      },
    },
    previewUrl: '/templates/bright_full_bleed.jpg',
  },
  {
    template_id: 'bright_collage_5',
    name: 'Cheerful Moments',
    theme_id: 'bright_cheerful',
    category: 'collage',
    layout: {
      pageSize: { width: 2480, height: 3508 }, // A4 at 300 DPI
      imageSlots: [
        {
          id: 'hero',
          x: 5,
          y: 5,
          width: 60,
          height: 60,
          zIndex: 2,
          rotation: 0,
          borderRadius: 12,
          imageId: null,
        },
        {
          id: 'mini1',
          x: 68,
          y: 5,
          width: 27,
          height: 27,
          zIndex: 1,
          rotation: 0,
          borderRadius: 8,
          imageId: null,
        },
        {
          id: 'mini2',
          x: 68,
          y: 35,
          width: 27,
          height: 27,
          zIndex: 1,
          rotation: 0,
          borderRadius: 8,
          imageId: null,
        },
        {
          id: 'bottom1',
          x: 5,
          y: 68,
          width: 27,
          height: 27,
          zIndex: 1,
          rotation: 0,
          borderRadius: 8,
          imageId: null,
        },
        {
          id: 'bottom2',
          x: 68,
          y: 65,
          width: 27,
          height: 30,
          zIndex: 1,
          rotation: 0,
          borderRadius: 8,
          imageId: null,
        },
      ],
      textSlots: [],
      decorativeElements: [],
      background: {
        color: '#fff8f0',
        gradient: 'linear-gradient(135deg, #fff8f0 0%, #ffe8d0 100%)',
      },
    },
    previewUrl: '/templates/bright_collage_5.jpg',
  },

  // Elegant & Classic Templates
  {
    template_id: 'elegant_portrait',
    name: 'Classic Portrait',
    theme_id: 'elegant_classic',
    category: 'single',
    layout: {
      pageSize: { width: 2480, height: 3508 }, // A4 at 300 DPI
      imageSlots: [
        {
          id: 'main',
          x: 15,
          y: 10,
          width: 70,
          height: 80,
          zIndex: 1,
          rotation: 0,
          borderRadius: 2,
          imageId: null,
        },
      ],
      textSlots: [],
      decorativeElements: [],
      background: {
        color: '#f5f5f0',
        gradient: 'linear-gradient(135deg, #f5f5f0 0%, #e5e5dc 100%)',
      },
    },
    previewUrl: '/templates/elegant_portrait.jpg',
  },
  {
    template_id: 'elegant_triptych',
    name: 'Elegant Triptych',
    theme_id: 'elegant_classic',
    category: 'story',
    layout: {
      pageSize: { width: 2480, height: 3508 }, // A4 at 300 DPI
      imageSlots: [
        {
          id: 'left',
          x: 5,
          y: 10,
          width: 28,
          height: 80,
          zIndex: 1,
          rotation: 0,
          borderRadius: 2,
          imageId: null,
        },
        {
          id: 'center',
          x: 36,
          y: 10,
          width: 28,
          height: 80,
          zIndex: 1,
          rotation: 0,
          borderRadius: 2,
          imageId: null,
        },
        {
          id: 'right',
          x: 67,
          y: 10,
          width: 28,
          height: 80,
          zIndex: 1,
          rotation: 0,
          borderRadius: 2,
          imageId: null,
        },
      ],
      textSlots: [],
      decorativeElements: [],
      background: {
        color: '#f5f5f0',
        gradient: 'linear-gradient(135deg, #f5f5f0 0%, #e5e5dc 100%)',
      },
    },
    previewUrl: '/templates/elegant_triptych.jpg',
  },
];

// ============================================================================
// Template Access Functions
// ============================================================================

export function getAllTemplates(): PhotoTemplate[] {
  return TEMPLATES;
}

export function getTemplatesForTheme(themeId: string): PhotoTemplate[] {
  return TEMPLATES.filter((template) => template.theme_id === themeId);
}

export function getTemplateById(templateId: string): PhotoTemplate | undefined {
  return TEMPLATES.find((template) => template.template_id === templateId);
}

export function getTemplatesByCategory(
  category: 'single' | 'collage' | 'grid' | 'story'
): PhotoTemplate[] {
  return TEMPLATES.filter((template) => template.category === category);
}

// ============================================================================
// Template Layout Operations
// ============================================================================

export function loadTemplateLayout(templateId: string): TemplateLayout | null {
  const template = getTemplateById(templateId);
  return template ? template.layout : null;
}

export function mapImagesToSlots(
  template: PhotoTemplate,
  images: ImageUpload[]
): TemplateLayout {
  const layout = { ...template.layout };
  const imageSlots = [...layout.imageSlots];

  // Auto-assign images to slots in order
  for (let i = 0; i < Math.min(images.length, imageSlots.length); i++) {
    imageSlots[i] = {
      ...imageSlots[i],
      imageId: images[i].id,
    };
  }

  return {
    ...layout,
    imageSlots,
  };
}

export function updateSlotImage(
  layout: TemplateLayout,
  slotId: string,
  imageId: string | null
): TemplateLayout {
  return {
    ...layout,
    imageSlots: layout.imageSlots.map((slot) =>
      slot.id === slotId ? { ...slot, imageId } : slot
    ),
  };
}

export function getSlotByPosition(
  layout: TemplateLayout,
  x: number,
  y: number
): ImageSlot | null {
  // Find slot at click position (x, y are percentages 0-100)
  return (
    layout.imageSlots.find(
      (slot) =>
        x >= slot.x &&
        x <= slot.x + slot.width &&
        y >= slot.y &&
        y <= slot.y + slot.height
    ) || null
  );
}

// ============================================================================
// Template Validation
// ============================================================================

export function validateTemplateLayout(layout: TemplateLayout): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check slot count
  if (layout.imageSlots.length === 0) {
    errors.push('Template must have at least one slot');
  }

  // Check slot positioning (all values should be 0-100)
  layout.imageSlots.forEach((slot, index) => {
    if (slot.x < 0 || slot.x > 100) {
      errors.push(`Slot ${index + 1}: x position out of bounds (0-100)`);
    }
    if (slot.y < 0 || slot.y > 100) {
      errors.push(`Slot ${index + 1}: y position out of bounds (0-100)`);
    }
    if (slot.width <= 0 || slot.x + slot.width > 100) {
      errors.push(`Slot ${index + 1}: width out of bounds`);
    }
    if (slot.height <= 0 || slot.y + slot.height > 100) {
      errors.push(`Slot ${index + 1}: height out of bounds`);
    }
  });

  // Check for overlapping slots (optional - collage templates may overlap)
  // This is just a warning, not an error
  for (let i = 0; i < layout.imageSlots.length; i++) {
    for (let j = i + 1; j < layout.imageSlots.length; j++) {
      const slot1 = layout.imageSlots[i];
      const slot2 = layout.imageSlots[j];

      const overlaps =
        slot1.x < slot2.x + slot2.width &&
        slot1.x + slot1.width > slot2.x &&
        slot1.y < slot2.y + slot2.height &&
        slot1.y + slot1.height > slot2.y;

      if (overlaps && slot1.zIndex === slot2.zIndex) {
        errors.push(
          `Warning: Slots ${i + 1} and ${j + 1} overlap with same z-index`
        );
      }
    }
  }

  return {
    isValid: errors.filter((e) => !e.startsWith('Warning')).length === 0,
    errors,
  };
}

// ============================================================================
// Template Utilities
// ============================================================================

export function calculateSlotDimensions(
  slot: ImageSlot,
  pageWidth: number,
  pageHeight: number
): {
  x: number;
  y: number;
  width: number;
  height: number;
} {
  return {
    x: (slot.x / 100) * pageWidth,
    y: (slot.y / 100) * pageHeight,
    width: (slot.width / 100) * pageWidth,
    height: (slot.height / 100) * pageHeight,
  };
}

export function getFilledSlots(layout: TemplateLayout): ImageSlot[] {
  return layout.imageSlots.filter((slot) => slot.imageId !== null && slot.imageId !== undefined);
}

export function getEmptySlots(layout: TemplateLayout): ImageSlot[] {
  return layout.imageSlots.filter((slot) => slot.imageId === null || slot.imageId === undefined);
}

export function isLayoutComplete(layout: TemplateLayout): boolean {
  return layout.imageSlots.every((slot) => slot.imageId !== null && slot.imageId !== undefined);
}

// ============================================================================
// Template Cloning
// ============================================================================

export function cloneTemplate(template: PhotoTemplate): PhotoTemplate {
  return {
    ...template,
    template_id: `${template.template_id}_clone_${Date.now()}`,
    name: `${template.name} (Copy)`,
    layout: {
      ...template.layout,
      imageSlots: template.layout.imageSlots.map((slot) => ({ ...slot })),
      textSlots: template.layout.textSlots.map((slot) => ({ ...slot })),
      decorativeElements: template.layout.decorativeElements.map((el) => ({ ...el })),
    },
  };
}
