import {
  PhotobookElement,
  ImageElement,
  TextElement,
  ShapeElement,
  BackgroundElement,
  StickerElement,
  ImageAsset,
  CropData,
} from '../../types';

/**
 * Canvas Element Service
 *
 * Handles creation, manipulation, and validation of photobook elements
 */

const SPREAD_WIDTH = 2480; // A4 at 300 DPI
const SPREAD_HEIGHT = 3508;

// ============================================================================
// Element Creation
// ============================================================================

export function createImageElement(
  asset: ImageAsset,
  x: number,
  y: number,
  width: number = 800,
  height: number = 600
): ImageElement {
  return {
    id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'image',
    assetId: asset.id,
    x,
    y,
    width,
    height,
    rotation: 0,
    zIndex: 1,
    opacity: 100,
    locked: false,
    visible: true,
    cropData: null,
    filters: [],
    borderRadius: 0,
    border: null,
    shadow: null,
    flipX: false,
    flipY: false,
    name: asset.name,
  };
}

export function createTextElement(
  x: number,
  y: number,
  content: string = 'Double-click to edit'
): TextElement {
  return {
    id: `text_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'text',
    content,
    x,
    y,
    width: 400,
    height: 100,
    rotation: 0,
    zIndex: 2,
    opacity: 100,
    locked: false,
    visible: true,
    fontFamily: 'Arial',
    fontSize: 32,
    fontWeight: 400,
    fontStyle: 'normal',
    color: '#000000',
    textAlign: 'left',
    lineHeight: 1.2,
    letterSpacing: 0,
    textDecoration: 'none',
    verticalAlign: 'top',
    padding: { top: 0, right: 0, bottom: 0, left: 0 },
    name: 'Text',
  };
}

export function createShapeElement(
  shapeType: 'rectangle' | 'ellipse',
  x: number,
  y: number,
  width: number = 300,
  height: number = 300
): ShapeElement {
  return {
    id: `shape_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'shape',
    shapeType,
    x,
    y,
    width,
    height,
    rotation: 0,
    zIndex: 1,
    opacity: 100,
    locked: false,
    visible: true,
    fill: '#e5e7eb',
    stroke: '#6b7280',
    strokeWidth: 2,
    borderRadius: shapeType === 'rectangle' ? 8 : 0,
    name: `${shapeType.charAt(0).toUpperCase() + shapeType.slice(1)}`,
  };
}

export function createBackgroundElement(
  color: string = '#ffffff'
): BackgroundElement {
  return {
    id: `bg_${Date.now()}`,
    type: 'background',
    backgroundType: 'color',
    color,
    x: 0,
    y: 0,
    width: SPREAD_WIDTH,
    height: SPREAD_HEIGHT,
    rotation: 0,
    zIndex: 0,
    opacity: 100,
    locked: true,
    visible: true,
  };
}

export function createStickerElement(
  stickerAssetId: string,
  category: string,
  x: number,
  y: number
): StickerElement {
  return {
    id: `sticker_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'sticker',
    stickerAssetId,
    category,
    x,
    y,
    width: 200,
    height: 200,
    rotation: 0,
    zIndex: 3,
    opacity: 100,
    locked: false,
    visible: true,
    name: 'Sticker',
  };
}

// ============================================================================
// Element Manipulation
// ============================================================================

export function moveElement(
  element: PhotobookElement,
  deltaX: number,
  deltaY: number
): PhotobookElement {
  return {
    ...element,
    x: element.x + deltaX,
    y: element.y + deltaY,
  };
}

export function resizeElement(
  element: PhotobookElement,
  newWidth: number,
  newHeight: number
): PhotobookElement {
  return {
    ...element,
    width: Math.max(10, newWidth),
    height: Math.max(10, newHeight),
  };
}

export function rotateElement(
  element: PhotobookElement,
  rotation: number
): PhotobookElement {
  return {
    ...element,
    rotation: rotation % 360,
  };
}

export function updateElementZIndex(
  element: PhotobookElement,
  zIndex: number
): PhotobookElement {
  return {
    ...element,
    zIndex,
  };
}

export function toggleElementLock(element: PhotobookElement): PhotobookElement {
  return {
    ...element,
    locked: !element.locked,
  };
}

export function toggleElementVisibility(element: PhotobookElement): PhotobookElement {
  return {
    ...element,
    visible: !element.visible,
  };
}

export function updateElementOpacity(
  element: PhotobookElement,
  opacity: number
): PhotobookElement {
  return {
    ...element,
    opacity: Math.max(0, Math.min(100, opacity)),
  };
}

// ============================================================================
// Image-Specific Operations
// ============================================================================

export function cropImage(
  element: ImageElement,
  cropData: CropData
): ImageElement {
  return {
    ...element,
    cropData,
  };
}

export function flipImage(
  element: ImageElement,
  axis: 'horizontal' | 'vertical'
): ImageElement {
  if (axis === 'horizontal') {
    return { ...element, flipX: !element.flipX };
  }
  return { ...element, flipY: !element.flipY };
}

export function addImageFilter(
  element: ImageElement,
  filterType: string,
  value: number
): ImageElement {
  const existingFilterIndex = element.filters.findIndex(
    (f) => f.type === filterType
  );

  const filters = [...element.filters];
  if (existingFilterIndex >= 0) {
    filters[existingFilterIndex] = { type: filterType as any, value };
  } else {
    filters.push({ type: filterType as any, value });
  }

  return { ...element, filters };
}

export function removeImageFilter(
  element: ImageElement,
  filterType: string
): ImageElement {
  return {
    ...element,
    filters: element.filters.filter((f) => f.type !== filterType),
  };
}

// ============================================================================
// Text-Specific Operations
// ============================================================================

export function updateTextContent(
  element: TextElement,
  content: string
): TextElement {
  return { ...element, content };
}

export function updateTextStyle(
  element: TextElement,
  style: Partial<Pick<TextElement, 'fontFamily' | 'fontSize' | 'fontWeight' | 'fontStyle' | 'color' | 'textAlign'>>
): TextElement {
  return { ...element, ...style };
}

// ============================================================================
// Collision Detection & Snapping
// ============================================================================

export function isPointInElement(
  element: PhotobookElement,
  x: number,
  y: number
): boolean {
  return (
    x >= element.x &&
    x <= element.x + element.width &&
    y >= element.y &&
    y <= element.y + element.height
  );
}

export function getElementBounds(element: PhotobookElement): {
  left: number;
  top: number;
  right: number;
  bottom: number;
  centerX: number;
  centerY: number;
} {
  return {
    left: element.x,
    top: element.y,
    right: element.x + element.width,
    bottom: element.y + element.height,
    centerX: element.x + element.width / 2,
    centerY: element.y + element.height / 2,
  };
}

export function doElementsOverlap(
  element1: PhotobookElement,
  element2: PhotobookElement
): boolean {
  const bounds1 = getElementBounds(element1);
  const bounds2 = getElementBounds(element2);

  return !(
    bounds1.right < bounds2.left ||
    bounds1.left > bounds2.right ||
    bounds1.bottom < bounds2.top ||
    bounds1.top > bounds2.bottom
  );
}

export function snapToGrid(
  value: number,
  gridSize: number = 10
): number {
  return Math.round(value / gridSize) * gridSize;
}

export function snapElementToGrid(
  element: PhotobookElement,
  gridSize: number = 10
): PhotobookElement {
  return {
    ...element,
    x: snapToGrid(element.x, gridSize),
    y: snapToGrid(element.y, gridSize),
  };
}

// ============================================================================
// Element Validation
// ============================================================================

export function isElementInBounds(
  element: PhotobookElement,
  pageWidth: number = SPREAD_WIDTH / 2,
  pageHeight: number = SPREAD_HEIGHT
): boolean {
  return (
    element.x >= 0 &&
    element.y >= 0 &&
    element.x + element.width <= pageWidth &&
    element.y + element.height <= pageHeight
  );
}

export function constrainElementToBounds(
  element: PhotobookElement,
  pageWidth: number = SPREAD_WIDTH / 2,
  pageHeight: number = SPREAD_HEIGHT
): PhotobookElement {
  const maxX = pageWidth - element.width;
  const maxY = pageHeight - element.height;

  return {
    ...element,
    x: Math.max(0, Math.min(element.x, maxX)),
    y: Math.max(0, Math.min(element.y, maxY)),
  };
}

// ============================================================================
// Element Sorting
// ============================================================================

export function sortElementsByZIndex(elements: PhotobookElement[]): PhotobookElement[] {
  return [...elements].sort((a, b) => a.zIndex - b.zIndex);
}

export function bringToFront(
  elements: PhotobookElement[],
  elementId: string
): PhotobookElement[] {
  const maxZIndex = Math.max(...elements.map((e) => e.zIndex));
  return elements.map((el) =>
    el.id === elementId ? { ...el, zIndex: maxZIndex + 1 } : el
  );
}

export function sendToBack(
  elements: PhotobookElement[],
  elementId: string
): PhotobookElement[] {
  const minZIndex = Math.min(...elements.map((e) => e.zIndex));
  return elements.map((el) =>
    el.id === elementId ? { ...el, zIndex: minZIndex - 1 } : el
  );
}

export function bringForward(
  elements: PhotobookElement[],
  elementId: string
): PhotobookElement[] {
  const sorted = sortElementsByZIndex(elements);
  const index = sorted.findIndex((e) => e.id === elementId);

  if (index === -1 || index === sorted.length - 1) return elements;

  const nextZIndex = sorted[index + 1].zIndex;

  return elements.map((el) =>
    el.id === elementId ? { ...el, zIndex: nextZIndex + 1 } : el
  );
}

export function sendBackward(
  elements: PhotobookElement[],
  elementId: string
): PhotobookElement[] {
  const sorted = sortElementsByZIndex(elements);
  const index = sorted.findIndex((e) => e.id === elementId);

  if (index === -1 || index === 0) return elements;

  const prevZIndex = sorted[index - 1].zIndex;

  return elements.map((el) =>
    el.id === elementId ? { ...el, zIndex: prevZIndex - 1 } : el
  );
}

// ============================================================================
// Element Duplication
// ============================================================================

export function duplicateElement(element: PhotobookElement): PhotobookElement {
  return {
    ...element,
    id: `${element.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    x: element.x + 20,
    y: element.y + 20,
    name: element.name ? `${element.name} (Copy)` : undefined,
  };
}

// ============================================================================
// Element Export
// ============================================================================

export function getElementAsJSON(element: PhotobookElement): string {
  return JSON.stringify(element, null, 2);
}

export function parseElementFromJSON(json: string): PhotobookElement | null {
  try {
    const element = JSON.parse(json);
    // Basic validation
    if (!element.id || !element.type) return null;
    return element;
  } catch {
    return null;
  }
}
