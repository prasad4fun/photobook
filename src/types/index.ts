/**
 * Core type definitions for AI Photo Themes application
 */

export interface ImageUpload {
  id: string;
  file: File;
  preview: string;
  name: string;
  size: number;
}

export interface ImageSummary {
  image_id: string;
  description: string;
  lighting: string;
  mood: string;
}

export interface Theme {
  theme_id: string;
  name: string;
  mood: string;
  lighting: string;
  background: string;
  editing_style: string;
}

export interface OrderDetails {
  package: 'digital' | 'photobook';
  price: number;
  imageCount: number;
  theme: Theme;
}

export interface StudioJob {
  jobId: string;
  customerName?: string;
  createdAt: Date;
  status: 'pending' | 'processing' | 'review' | 'approved' | 'completed';
  imageCount: number;
  selectedTheme?: Theme;
  orderDetails?: OrderDetails;
}

// ============================================================================
// Editor Types
// ============================================================================

export interface EditorState {
  mode: 'view' | 'edit' | 'template' | 'ai-suggest';
  selectedImageId: string | null;
  layerStack: EditorLayer[];
  history: EditorHistoryState[];
  historyIndex: number;
  template: PhotoTemplate | null;
}

export interface EditorHistoryState {
  timestamp: Date;
  layerStack: EditorLayer[];
  description: string;
}

export interface EditorLayer {
  id: string;
  type: 'image' | 'text' | 'shape' | 'filter';
  name?: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  blendMode: string;
  imageProps?: ImageLayerProps;
  textProps?: TextLayerProps;
  shapeProps?: ShapeLayerProps;
  filterProps?: FilterLayerProps;
}

export interface ImageLayerProps {
  src: string;
  originalSrc: string;
  themeSrc?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
  saturation: number; // -100 to 100
  hue: number; // -180 to 180
  filters: ImageFilter[];
}

export interface ImageFilter {
  type: 'blur' | 'sharpen' | 'vintage' | 'bw' | 'sepia' | 'vignette';
  intensity: number; // 0 to 100
}

export interface TextLayerProps {
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  fill: string;
  align: 'left' | 'center' | 'right';
  rotation: number;
}

export interface ShapeLayerProps {
  type: 'rectangle' | 'circle' | 'line';
  x: number;
  y: number;
  width: number;
  height: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

export interface FilterLayerProps {
  filterId: string;
  params: Record<string, number>;
}

// ============================================================================
// Template Types
// ============================================================================

export interface PhotoTemplate {
  template_id: string;
  name: string;
  theme_id: string;
  category: 'single' | 'collage' | 'grid' | 'story';
  layout: TemplateLayout;
  previewUrl: string;
}

export interface TemplateLayout {
  pageSize: { width: number; height: number };
  imageSlots: ImageSlot[];
  textSlots: TextSlot[];
  decorativeElements: DecorativeElement[];
  background?: {
    color: string;
    gradient?: string | null;
  };
}

export interface ImageSlot {
  id: string;
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
  width: number; // Percentage 0-100
  height: number; // Percentage 0-100
  zIndex?: number;
  rotation?: number;
  borderRadius?: number;
  dropShadow?: ShadowStyle;
  frame?: FrameStyle;
  imageId?: string | null; // ID of image assigned to this slot
}

export interface TextSlot {
  id: string;
  x: number;
  y: number;
  width: number;
  placeholder: string;
  defaultStyle: TextStyle;
}

export interface DecorativeElement {
  id: string;
  type: 'shape' | 'icon' | 'pattern';
  x: number;
  y: number;
  asset: string;
}

export interface FrameStyle {
  type: 'simple' | 'ornate' | 'polaroid' | 'film';
  color: string;
  thickness: number;
}

export interface ShadowStyle {
  offsetX: number;
  offsetY: number;
  blur: number;
  color: string;
}

export interface TextStyle {
  fontSize: number;
  fontFamily: string;
  color: string;
  weight: number;
}

// ============================================================================
// AI Suggestion Types
// ============================================================================

export interface AISuggestion {
  suggestion_id: string;
  image_id: string;
  type: 'adjustment' | 'crop' | 'filter' | 'composition';
  title: string;
  description: string;
  confidence: number; // 0-1
  adjustments: AdjustmentParams;
  preview?: string;
}

export interface AdjustmentParams {
  brightness?: number;
  contrast?: number;
  saturation?: number;
  hue?: number;
  crop?: CropParams;
  filter?: string;
}

export interface CropParams {
  x: number;
  y: number;
  width: number;
  height: number;
}

// ============================================================================
// PDF Export Types
// ============================================================================

export interface PDFExportOptions {
  format: 'A4' | 'Letter' | '8x10' | '5x7' | 'square';
  orientation: 'portrait' | 'landscape';
  dpi: 300 | 600;
  colorSpace: 'RGB' | 'CMYK';
  includeCover: boolean;
  includeBackCover: boolean;
  margins: { top: number; right: number; bottom: number; left: number };
}

export interface PDFPage {
  pageNumber: number;
  template: PhotoTemplate;
  images: PDFPageImage[];
  texts: PDFPageText[];
}

export interface PDFPageImage {
  slotId: string;
  imageData: string;
  layerId: string;
}

export interface PDFPageText {
  slotId: string;
  text: string;
  style: TextStyle;
}

// ============================================================================
// Generated Image Types
// ============================================================================

export interface GeneratedImage {
  image_id: string;
  original_base64: string;
  themed_base64: string;
  theme_id: string;
  generation_params: GenerationParams;
  timestamp: Date;
}

export interface GenerationParams {
  model: 'mock' | 'external-api';
  prompt: string;
  adjustments: AdjustmentParams;
}

// ============================================================================
// Extended SessionData
// ============================================================================

export interface SessionData {
  jobId: string | null;
  uploadedImages: ImageUpload[];
  imageSummaries: ImageSummary[];
  themes: Theme[];
  selectedTheme: Theme | null;
  orderDetails: OrderDetails | null;
  // Theme editor state
  generatedImages: GeneratedImage[];
  editorState: EditorState;
  selectedTemplate: PhotoTemplate | null;
  aiSuggestions: AISuggestion[];
  pdfExportOptions: PDFExportOptions;
  // Photobook editor state
  photobookEditorState: PhotobookEditorState | null;
}

export type Screen =
  | 'landing'
  | 'upload'
  | 'analysis'
  | 'theme-preview'
  | 'editor' // Theme editor with adjustments
  | 'photobook-editor' // Pixory-style photobook editor
  | 'photobook-studio' // PhotoBook Studio - react-konva based editor (demo)
  | 'confirmation'
  | 'processing'
  | 'delivery'
  | 'studio-dashboard';

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface AzureAIRequest {
  model: string;
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string | Array<{
      type: 'text' | 'image';
      text?: string;
      source?: {
        type: 'base64';
        data: string;
      };
    }>;
  }>;
  max_tokens?: number;
  temperature?: number;
  stream?: boolean;
}

export interface AzureAIResponse {
  id: string;
  model: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// ============================================================================
// Pixory Photobook Editor Types
// ============================================================================

/**
 * Main photobook editor state (spread-based editing)
 */
export interface PhotobookEditorState {
  projectId: string;
  projectName: string;
  spreads: PageSpread[];
  assets: ImageAsset[];
  selectedTool: EditorTool | null;
  selectedElementIds: string[];
  zoom: number; // 25, 50, 75, 100, 125, 150, 200
  viewMode: 'one-page' | 'all-pages';
  clipboardElements: PhotobookElement[];
  history: PhotobookHistoryState[];
  historyIndex: number;
  isDirty: boolean; // Unsaved changes
  lastSaved: Date | null;
}

/**
 * History state for undo/redo
 */
export interface PhotobookHistoryState {
  timestamp: Date;
  description: string;
  spreads: PageSpread[];
  assets: ImageAsset[];
}

/**
 * Available editor tools
 */
export type EditorTool =
  | 'select'
  | 'text'
  | 'photo'
  | 'layout'
  | 'rectangle'
  | 'ellipse'
  | 'background'
  | 'sticker';

/**
 * Page spread (two-page layout)
 */
export interface PageSpread {
  id: string;
  spreadNumber: number; // 1 = cover, 2 = pages 2-3, etc.
  leftPage: PhotobookPage | null; // null for cover spread
  rightPage: PhotobookPage;
  layoutPresetId: string | null;
  isLocked: boolean;
}

/**
 * Individual page within a spread
 */
export interface PhotobookPage {
  id: string;
  pageNumber: number; // 1-based
  position: 'left' | 'right';
  elements: PhotobookElement[];
  background: BackgroundElement;
  bleed: number; // in pixels
  safeZone: number; // in pixels
}

/**
 * Union type for all photobook elements
 */
export type PhotobookElement =
  | TextElement
  | ImageElement
  | ShapeElement
  | BackgroundElement
  | StickerElement;

/**
 * Base properties for all elements
 */
export interface BaseElement {
  id: string;
  type: 'text' | 'image' | 'shape' | 'background' | 'sticker';
  x: number; // pixels from left edge of page
  y: number; // pixels from top edge of page
  width: number;
  height: number;
  rotation: number; // degrees
  zIndex: number;
  opacity: number; // 0-100
  locked: boolean;
  visible: boolean;
  name?: string;
}

/**
 * Text element
 */
export interface TextElement extends BaseElement {
  type: 'text';
  content: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number; // 100-900
  fontStyle: 'normal' | 'italic';
  color: string;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  lineHeight: number;
  letterSpacing: number;
  textDecoration: 'none' | 'underline' | 'line-through';
  verticalAlign: 'top' | 'middle' | 'bottom';
  padding: { top: number; right: number; bottom: number; left: number };
}

/**
 * Image element with cropping and filters
 */
export interface ImageElement extends BaseElement {
  type: 'image';
  assetId: string; // References ImageAsset
  cropData: CropData | null;
  filters: PhotobookImageFilter[];
  borderRadius: number;
  border: BorderStyle | null;
  shadow: ShadowStyle | null;
  flipX: boolean;
  flipY: boolean;
}

/**
 * Shape element (rectangle, ellipse)
 */
export interface ShapeElement extends BaseElement {
  type: 'shape';
  shapeType: 'rectangle' | 'ellipse' | 'line' | 'polygon';
  fill: string | null;
  stroke: string | null;
  strokeWidth: number;
  borderRadius: number; // for rectangles
  points?: number[]; // for polygon/line
}

/**
 * Background element
 */
export interface BackgroundElement extends BaseElement {
  type: 'background';
  backgroundType: 'color' | 'gradient' | 'image' | 'pattern';
  color?: string;
  gradient?: GradientStyle;
  imageAssetId?: string;
  pattern?: PatternStyle;
}

/**
 * Sticker/decorative element
 */
export interface StickerElement extends BaseElement {
  type: 'sticker';
  stickerAssetId: string;
  category: string; // 'hearts', 'stars', 'frames', etc.
}

/**
 * Crop data for images
 */
export interface CropData {
  x: number; // Crop start X (pixels in original image)
  y: number; // Crop start Y
  width: number; // Crop width
  height: number; // Crop height
  originalWidth: number;
  originalHeight: number;
  scale: number; // Zoom level within frame
}

/**
 * Image filters for photobook
 */
export interface PhotobookImageFilter {
  type: 'blur' | 'sharpen' | 'brightness' | 'contrast' | 'saturation' | 'hue' | 'vintage' | 'bw' | 'sepia' | 'vignette';
  value: number; // Filter-specific value
}

/**
 * Border style
 */
export interface BorderStyle {
  width: number;
  color: string;
  style: 'solid' | 'dashed' | 'dotted';
}

/**
 * Gradient style
 */
export interface GradientStyle {
  type: 'linear' | 'radial';
  angle: number; // for linear
  stops: GradientStop[];
}

export interface GradientStop {
  color: string;
  position: number; // 0-100
}

/**
 * Pattern style
 */
export interface PatternStyle {
  patternId: string;
  scale: number;
  rotation: number;
  opacity: number;
}

/**
 * Image asset in the photobook (extends ImageUpload)
 */
export interface ImageAsset extends ImageUpload {
  isUsed: boolean;
  usageCount: number; // How many times used in photobook
  usedInPages: number[]; // Page numbers where used
  addedAt: Date;
  tags: string[];
  originalDimensions: { width: number; height: number };
  thumbnail?: string; // Smaller preview for sidebar
}

/**
 * Layout preset for spreads
 */
export interface LayoutPreset {
  id: string;
  name: string;
  category: 'portrait' | 'landscape' | 'mixed' | 'text-heavy' | 'image-heavy';
  thumbnailUrl: string;
  spreadTemplate: SpreadTemplate;
}

/**
 * Spread template (layout blueprint)
 */
export interface SpreadTemplate {
  leftPageTemplate: PageTemplate | null;
  rightPageTemplate: PageTemplate;
}

/**
 * Page template (element blueprint)
 */
export interface PageTemplate {
  elements: PhotobookElement[];
  background: BackgroundElement;
}

/**
 * Background asset
 */
export interface BackgroundAsset {
  id: string;
  name: string;
  type: 'color' | 'gradient' | 'image' | 'pattern';
  thumbnailUrl: string;
  assetData: string; // color code, gradient definition, or image URL
  category: string;
}

/**
 * Sticker asset
 */
export interface StickerAsset {
  id: string;
  name: string;
  category: string;
  thumbnailUrl: string;
  svgData: string; // SVG path or image URL
  tags: string[];
}

/**
 * Smart Creation result (AI-generated layout)
 */
export interface SmartCreationResult {
  spreads: PageSpread[];
  theme: string;
  style: string;
  reasoning: string;
}

/**
 * Autofill options
 */
export interface AutofillOptions {
  strategy: 'sequential' | 'random' | 'best-fit';
  skipUsedImages: boolean;
  applyFilters: boolean;
  targetSpreadIds?: string[];
}

/**
 * Extended SessionData for Pixory
 */
export interface PhotobookSessionData extends SessionData {
  photobookEditorState: PhotobookEditorState | null;
  backgroundAssets: BackgroundAsset[];
  stickerAssets: StickerAsset[];
  layoutPresets: LayoutPreset[];
}

// ============================================================================
// PhotoBook Studio Types (react-konva based editor)
// ============================================================================

/**
 * Studio Photo - Individual photo in the studio editor
 * v2.0: Includes quality tracking
 */
export interface StudioPhoto {
  id: string;
  url: string;
  thumbnailUrl?: string;
  width: number;
  height: number;
  fileSize: number;
  fileName: string;
  addedAt: Date;
  qualityScore?: number;           // 0-100, calculated from resolution vs. print size
  qualityWarning?: boolean;        // True if resolution is insufficient
  qualityMessage?: string;         // User-facing message for tooltip
}

/**
 * Studio Page Type
 */
export type StudioPageType = 'cover' | 'back-cover' | 'back-of-cover' | 'content';

/**
 * Studio PhotoBook Configuration
 */
export interface StudioPhotoBookConfig {
  pageSize: 'A4' | 'Square';
  orientation: 'portrait' | 'landscape';
  dimensions?: { width: number; height: number };
  coverType: 'hardcover' | 'softcover';
  binding: 'spiral' | 'perfect' | 'saddle-stitch';
  maxPages?: number;               // Default: 20
  editablePageTypes?: StudioPageType[];  // Pages that can be edited
  viewMode?: 'single' | 'spread';  // Default: 'spread'
}

/**
 * Studio PhotoBook - Complete photobook with pages and config
 */
export interface StudioPhotoBook {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  pages: StudioPage[];
  config: StudioPhotoBookConfig;
  spineTitle?: string;
}

/**
 * Studio Page - Individual page in photobook
 */
export interface StudioPage {
  id: string;
  pageNumber: number;
  type: StudioPageType;
  elements: StudioPageElement[];
  layout: StudioPageLayout;
  background?: StudioBackground;
  isEditable?: boolean;             // False for back-of-cover pages
  spreadPair?: string;              // Page ID of spread partner
}

/**
 * Studio Page Layout
 */
export interface StudioPageLayout {
  id: string;
  name: string;
  template: StudioLayoutTemplate;
}

/**
 * Studio Layout Template
 */
export interface StudioLayoutTemplate {
  photoSlots: StudioPhotoSlot[];
  textAreas?: StudioTextAreaConstraint[];
}

/**
 * Studio Photo Slot - Predefined area for photos
 */
export interface StudioPhotoSlot {
  id: string;
  x: number; // Percentage 0-100
  y: number;
  width: number;
  height: number;
  zIndex: number;
  aspectRatio?: number;
}

/**
 * Studio Text Area Constraint
 */
export interface StudioTextAreaConstraint {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Studio Background
 */
export interface StudioBackground {
  type: 'color' | 'gradient' | 'pattern';
  color?: string;
  gradient?: StudioGradient;
  patternUrl?: string;
}

/**
 * Studio Gradient
 */
export interface StudioGradient {
  type: 'linear' | 'radial';
  colors: string[];
  angle?: number;
}

/**
 * Studio Page Element - Discriminated union of all element types
 */
export type StudioPageElement = StudioPhotoElement | StudioTextElement | StudioShapeElement | StudioStickerElement;

/**
 * Studio Base Element - Common properties for all elements
 */
export interface StudioBaseElement {
  id: string;
  type: 'photo' | 'text' | 'shape' | 'sticker';
  x: number; // Percentage 0-100
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  locked?: boolean;
}

/**
 * Studio Photo Element - Photo on a page
 * photoId is optional to support empty placeholders
 */
export interface StudioPhotoElement extends StudioBaseElement {
  type: 'photo';
  photoId?: string; // Optional - placeholder when undefined
  cropArea?: StudioCropArea;
  filters?: StudioImageFilters;
  slotId?: string;
  transform?: StudioPhotoTransform;
  frame?: StudioFrameStyle;
  effect?: StudioPhotoEffect;
}

/**
 * Studio Photo Transform - v2.0
 */
export interface StudioPhotoTransform {
  zoom: number;                    // 1.0 to 3.0 (1.0 = cover fit, minimum)
  fit: 'fill' | 'fit' | 'stretch' | 'cover'; // Fit mode within slot
  rotation: number;                // Degrees (0, 90, 180, 270)
  flipHorizontal: boolean;
  flipVertical: boolean;
  panX: number;                    // -0.5 to 0.5 normalized pan offset (0 = centered)
  panY: number;                    // -0.5 to 0.5 normalized pan offset (0 = centered)
}

/**
 * Studio Frame Style - v2.0
 */
export interface StudioFrameStyle {
  enabled: boolean;
  color: string;                   // Hex color
  width: number;                   // Pixels (1-20)
  style: 'solid' | 'dashed' | 'dotted' | 'double';
}

/**
 * Studio Photo Effect - v2.0
 */
export interface StudioPhotoEffect {
  type: 'none' | 'sepia' | 'grayscale' | 'vintage' | 'warm' | 'cool' | 'vignette';
  intensity: number;               // 0-100
}

/**
 * Studio Crop Area
 */
export interface StudioCropArea {
  x: number; // Percentage of original image
  y: number;
  width: number;
  height: number;
}

/**
 * Studio Image Filters
 */
export interface StudioImageFilters {
  brightness: number; // -100 to 100
  contrast: number;
  saturation: number;
  blur: number; // 0 to 10
  grayscale: boolean;
}

/**
 * Studio Text Element - Text on a page
 */
export interface StudioTextElement extends StudioBaseElement {
  type: 'text';
  content: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  fontStyle: 'normal' | 'italic';
  textAlign: 'left' | 'center' | 'right' | 'justify';
  color: string;
  backgroundColor?: string;
  padding?: number;
  lineHeight: number;
  letterSpacing?: number;
}

/**
 * Studio Shape Element - Shape on a page with v2.0 categories
 */
export interface StudioShapeElement extends StudioBaseElement {
  type: 'shape';
  shapeCategory?: 'basic' | 'stars' | 'banners' | 'callouts';
  shapeType: 'rectangle' | 'circle' | 'oval' | 'triangle' | 'polygon' | 'star-5' | 'star-6' | 'star-8' | 'burst' | 'ribbon' | 'banner-wave' | 'banner-fold' | 'speech-bubble' | 'thought-bubble' | 'callout-rounded' | 'callout-cloud';
  fillColor?: string;
  strokeColor?: string;
  strokeWidth: number;
  cornerRadius?: number;
  points?: StudioPoint[];
  border?: StudioBorderStyle;
}

/**
 * Studio Border Style - v2.0
 */
export interface StudioBorderStyle {
  enabled: boolean;
  color: string;
  width: number;                   // 1-20 pixels
  style: 'solid' | 'dashed' | 'dotted';
}

/**
 * Studio Sticker Element - Sticker on a page
 */
export interface StudioStickerElement extends StudioBaseElement {
  type: 'sticker';
  stickerId: string;
  stickerUrl: string;
  flipHorizontal?: boolean;
  flipVertical?: boolean;
}

/**
 * Studio Point - For polygon shapes
 */
export interface StudioPoint {
  x: number;
  y: number;
}

/**
 * Left Panel View Type - Controls which view is shown in the left panel
 */
export type LeftPanelView = 'photos' | 'layouts' | 'stickers' | 'shapes';

/**
 * PhotoBook Studio Editor State
 */
export interface PhotoBookEditorState {
  mode: 'selection' | 'edit';
  selectedPhotos: StudioPhoto[];
  photoBook: StudioPhotoBook | null;
  currentPageId: string | null;
  selectedElementIds: string[];
  hoveredPhotoId: string | null;
  hoveredPageId: string | null;
  clipboard: StudioPageElement | null;
  history: StudioPhotoBookSnapshot[];
  historyIndex: number;
  leftPanelView: LeftPanelView;
  currentSpreadIndex: number;
  zoomLevel: number;
}

/**
 * Studio PhotoBook Snapshot - For undo/redo
 */
export interface StudioPhotoBookSnapshot {
  photoBook: StudioPhotoBook;
  timestamp: Date;
  action: string;
}

/**
 * PhotoBook Studio Screen Props
 */
export interface PhotoBookStudioScreenProps {
  initialPhotos?: StudioPhoto[];
  onSave: (photoBook: StudioPhotoBook) => void;
  onCancel: () => void;
  maxPhotos?: number;
  bookConfig?: StudioPhotoBookConfig;
  features?: PhotoBookStudioFeatures;
}

/**
 * PhotoBook Studio Features - Feature flags
 */
export interface PhotoBookStudioFeatures {
  enableShapes?: boolean;
  enableStickers?: boolean;
  enableTextFormatting?: boolean;
  enableCustomLayouts?: boolean;
}

/**
 * Studio Editor Tool
 */
export type StudioEditorTool = 'select' | 'text' | 'photo' | 'shape' | 'sticker' | 'layout';

/**
 * Studio Layout Preset
 */
export interface StudioLayoutPreset {
  id: string;
  name: string;
  preview: string;
  template: StudioLayoutTemplate;
  category: 'single' | 'grid' | 'collage' | 'custom';
}

/**
 * Studio Spread - v2.0: Two-page spread view
 */
export interface StudioSpread {
  id: string;
  leftPage: StudioPage | null;
  rightPage: StudioPage | null;
  spreadNumber: number;
  label: string;
}

/**
 * Studio Quality Metrics - v2.0: Photo quality tracking
 */
export interface StudioQualityMetrics {
  score: number;
  warning: boolean;
  message: string;
}

/**
 * Studio Page Layout Enhanced - v2.0
 */
export interface StudioPageLayoutEnhanced extends StudioPageLayout {
  minSlots?: number;
  maxSlots?: number;
  isFlexible?: boolean;
}

/**
 * Studio Sticker - Sticker asset
 */
export interface StudioSticker {
  id: string;
  name: string;
  url: string;
  category?: string;
  thumbnailUrl?: string;
}

/**
 * Default Studio Page Configuration
 */
export const STUDIO_DEFAULT_PAGE_CONFIG: StudioPhotoBookConfig = {
  pageSize: 'A4',
  orientation: 'portrait',
  coverType: 'hardcover',
  binding: 'perfect',
  maxPages: 20,
  editablePageTypes: ['cover', 'content'],
  viewMode: 'spread',
};

/**
 * Default Studio Text Element
 * Note: fontSize is in pixels at 300 DPI canvas resolution
 * 60.6 points = 252.5 pixels at 300 DPI (60.6 / 72 * 300)
 */
export const STUDIO_DEFAULT_TEXT_ELEMENT: Omit<StudioTextElement, 'id' | 'x' | 'y'> = {
  type: 'text',
  content: 'Enter text',
  fontFamily: 'Londrina Solid',
  fontSize: 252.5,
  fontWeight: '900',
  fontStyle: 'normal',
  textAlign: 'left',
  color: '#000000',
  width: 30,
  height: 10,
  rotation: 0,
  zIndex: 100,
  lineHeight: 1.2,
};

/**
 * Default Studio Shape Element
 */
export const STUDIO_DEFAULT_SHAPE_ELEMENT: Omit<StudioShapeElement, 'id' | 'x' | 'y'> = {
  type: 'shape',
  shapeType: 'rectangle',
  width: 20,
  height: 15,
  rotation: 0,
  zIndex: 50,
  fillColor: '#3b82f6',
  strokeColor: '#1e40af',
  strokeWidth: 2,
  cornerRadius: 0,
};

/**
 * Studio Page Dimensions (300 DPI)
 */
export const STUDIO_PAGE_DIMENSIONS = {
  A4: {
    portrait: { width: 2480, height: 3508 },
    landscape: { width: 3508, height: 2480 },
  },
  Square: {
    portrait: { width: 3000, height: 3000 },
    landscape: { width: 3000, height: 3000 },
  },
};

/**
 * Studio Constants
 */
export const STUDIO_MAX_HISTORY_SIZE = 50;
export const STUDIO_DEFAULT_MAX_PHOTOS = 100;
export const STUDIO_MAX_ELEMENTS_PER_PAGE = 50;
