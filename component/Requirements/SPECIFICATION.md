# PhotoBook Editing Page - Technical Specification

## Document Purpose
This specification defines the functional requirements, data models, component architecture, and interaction patterns for the PhotoBook Editing Page component. It is intended to be implementation-ready without requiring further clarification.

---

## 1. Component Overview

### 1.1 Responsibility
The PhotoBook Editing Page is a standalone, reusable component that manages the complete lifecycle of photobook creation:
- Photo selection and management (add/remove)
- Photobook generation from selected photos
- Page-by-page editing (layouts, text, shapes, stickers)
- State persistence and undo/redo capability

### 1.2 Component Modes
The component operates in two distinct modes:

1. **Selection Mode**: User curates photos before generating the photobook
2. **Edit Mode**: User modifies the generated photobook page-by-page

### 1.3 Inputs (Props)
```typescript
interface PhotoBookEditorProps {
  // Initial photos (optional, can start empty)
  initialPhotos?: Photo[];

  // Callback when user saves/finalizes the photobook
  onSave: (photoBook: PhotoBook) => void;

  // Callback when user cancels
  onCancel: () => void;

  // Maximum number of photos allowed (default: 100)
  maxPhotos?: number;

  // Photobook configuration
  bookConfig?: PhotoBookConfig;

  // Feature flags
  features?: {
    enableShapes?: boolean;
    enableStickers?: boolean;
    enableTextFormatting?: boolean;
    enableCustomLayouts?: boolean;
  };
}
```

### 1.4 Outputs
The component communicates with the parent via callbacks:
- `onSave(photoBook)` - User confirms the photobook
- `onCancel()` - User exits without saving

---

## 2. Data Models

### 2.1 Core Types

```typescript
interface Photo {
  id: string;                    // Unique identifier
  url: string;                   // Image source URL or data URL
  thumbnailUrl?: string;         // Optimized thumbnail
  width: number;                 // Original dimensions
  height: number;
  fileSize: number;              // Bytes
  fileName: string;
  addedAt: Date;
}

interface PhotoBook {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  pages: Page[];
  config: PhotoBookConfig;
}

interface PhotoBookConfig {
  pageSize: 'A4' | 'A5' | 'Square' | 'Custom'; //TODO: lets only fix to A4 and Square
  orientation: 'portrait' | 'landscape';
  dimensions?: { width: number; height: number }; // For custom sizes
  coverType: 'hardcover' | 'softcover';
  binding: 'spiral' | 'perfect' | 'saddle-stitch';
}

interface Page {
  id: string;
  pageNumber: number;            // 1-indexed
  type: 'cover' | 'content' | 'back';
  elements: PageElement[];
  layout: PageLayout;
  background?: Background;
}

interface PageLayout {
  id: string;
  name: string;                  // e.g., "Single Full", "Two Column", "Grid 3x3"
  template: LayoutTemplate;      // Defines photo placeholder positions
}

interface LayoutTemplate {
  photoSlots: PhotoSlot[];       // Fixed positions for photos
  textAreas?: TextAreaConstraint[]; // Suggested text zones
}

interface PhotoSlot {
  id: string;
  x: number;                     // Percentage (0-100)
  y: number;
  width: number;
  height: number;
  zIndex: number;
  aspectRatio?: number;          // Optional constraint
}

type PageElement = PhotoElement | TextElement | ShapeElement | StickerElement;

interface BaseElement {
  id: string;
  type: 'photo' | 'text' | 'shape' | 'sticker';
  x: number;                     // Percentage (0-100)
  y: number;
  width: number;
  height: number;
  rotation: number;              // Degrees
  zIndex: number;
  locked?: boolean;              // Prevent accidental edits
}

interface PhotoElement extends BaseElement {
  type: 'photo';
  photoId: string;               // References Photo.id
  cropArea?: CropArea;
  filters?: ImageFilters;
  slotId?: string;               // If placed in a layout slot
}

interface CropArea {
  x: number;                     // Percentage of original image
  y: number;
  width: number;
  height: number;
}

interface ImageFilters {
  brightness: number;            // -100 to 100
  contrast: number;
  saturation: number;
  blur: number;                  // 0 to 10
  grayscale: boolean;
}

interface TextElement extends BaseElement {
  type: 'text';
  content: string;
  fontFamily: string;
  fontSize: number;              // Points
  fontWeight: 'normal' | 'bold' | '100' | '200' | ... | '900';
  fontStyle: 'normal' | 'italic';
  textAlign: 'left' | 'center' | 'right' | 'justify';
  color: string;                 // Hex or rgba
  backgroundColor?: string;
  padding?: number;
  lineHeight: number;            // Multiplier (e.g., 1.5)
  letterSpacing?: number;        // Pixels
}

interface ShapeElement extends BaseElement {
  type: 'shape';
  shapeType: 'rectangle' | 'circle' | 'triangle' | 'line' | 'polygon';
  fillColor?: string;
  strokeColor?: string;
  strokeWidth: number;
  cornerRadius?: number;         // For rectangles
  points?: Point[];              // For polygons
}

interface StickerElement extends BaseElement {
  type: 'sticker';
  stickerId: string;             // References sticker library
  stickerUrl: string;
}

interface Point {
  x: number;
  y: number;
}

interface Background {
  type: 'color' | 'gradient' | 'pattern';
  color?: string;
  gradient?: Gradient;
  patternUrl?: string;
}

interface Gradient {
  type: 'linear' | 'radial';
  colors: string[];
  angle?: number;                // For linear
}
```

### 2.2 State Models

```typescript
interface PhotoBookEditorState {
  mode: 'selection' | 'edit';

  // Selection mode state
  selectedPhotos: Photo[];

  // Edit mode state
  photoBook: PhotoBook | null;
  currentPageId: string | null;  // Which page is being edited
  selectedElementIds: string[];  // Multi-select support

  // UI state
  hoveredPhotoId: string | null; // For showing delete icon
  hoveredPageId: string | null;  // For showing edit icon
  clipboard: PageElement | null; // Copy/paste support

  // History for undo/redo
  history: PhotoBookSnapshot[];
  historyIndex: number;
}

interface PhotoBookSnapshot {
  photoBook: PhotoBook;
  timestamp: Date;
  action: string;                // Description for debugging
}
```

---

## 3. Component Architecture

### 3.1 Component Hierarchy

<!-- TODO: Generato photobook button on the right panel of selection mode - on click EditMode to be linked  -->

```
PhotoBookEditor (root)
├── SelectionMode
│   ├── PhotoGrid (left panel)
│   │   └── PhotoCard (per photo)
│   │       └── DeleteButton (hover overlay)
│   └── AddPhotosButton (right panel)
│
└── EditMode
    ├── SourcePhotosPanel (left panel)
    │   └── PhotoThumbnail (per photo)
    │
    ├── PageViewerPanel (right panel - two states)
    │   ├── ThumbnailView (default state)
    │   │   └── PageThumbnail (per page)
    │   │       └── EditButton (hover overlay)
    │   │
    │   └── DetailView (when page selected)
    │       ├── PageCanvas (main editing area)
    │       │   ├── ElementRenderer (per element)
    │       │   ├── SelectionBox (for selected elements)
    │       │   └── DragHandles (resize/rotate)
    │       │
    │       ├── EditToolbar (top)
    │       │   ├── AddTextButton
    │       │   ├── ChangeLayoutButton
    │       │   ├── AddPhotoButton
    │       │   ├── AddShapeButton
    │       │   └── AddStickerButton
    │       │
    │       └── PageThumbnailStrip (bottom)
    │           └── SmallPageThumbnail (per page)
    │
    └── PageControlButtons (bottom right)
        ├── AddPageButton
        └── RemovePageButton
```

### 3.2 Sub-Component Specifications

#### 3.2.1 PhotoCard
**Purpose**: Display a photo with delete capability

**Props**:
```typescript
interface PhotoCardProps {
  photo: Photo;
  onDelete: (photoId: string) => void;
  isHovered: boolean;
  onHoverChange: (photoId: string | null) => void;
}
```

**Behavior**:
- Display photo thumbnail
- On hover: show semi-transparent overlay with delete icon (top-left)
- On delete click: trigger `onDelete` callback
- Show photo filename (truncated if long)

---

#### 3.2.2 AddPhotosButton
**Purpose**: Trigger photo selection dialog

**Props**:
```typescript
interface AddPhotosButtonProps {
  onPhotosAdded: (photos: File[]) => void;
  maxPhotos: number;
  currentCount: number;
}
```

**Behavior**:
- Open file picker (accept: image/*)
- Support multi-select
- Validate: file type, size, total count
- Return File[] to parent

---

#### 3.2.3 PageThumbnail
**Purpose**: Display page preview with edit trigger

**Props**:
```typescript
interface PageThumbnailProps {
  page: Page;
  isSelected: boolean;
  isHovered: boolean;
  onEdit: (pageId: string) => void;
  onHoverChange: (pageId: string | null) => void;
}
```

**Behavior**:
- Render page at thumbnail size (auto-generated from PageCanvas)
- Show page number badge
- On hover: show edit icon (top-left)
- On edit click: trigger `onEdit`

---

#### 3.2.4 PageCanvas
**Purpose**: Main editing surface for page content

**Props**:
```typescript
interface PageCanvasProps {
  page: Page;
  photos: Photo[];
  selectedElementIds: string[];
  onElementSelect: (elementIds: string[], multiSelect: boolean) => void;
  onElementUpdate: (elementId: string, updates: Partial<PageElement>) => void;
  onElementDelete: (elementIds: string[]) => void;
  onElementReorder: (elementId: string, direction: 'forward' | 'backward' | 'front' | 'back') => void;
  zoom: number; // 0.1 to 2.0
}
```

**Behavior**:
- Render all page elements in order (by zIndex)
- Support element selection (click)
- Support multi-select (Cmd/Ctrl + click or drag selection box)
- Show bounding box with resize/rotate handles for selected elements
- Support drag-to-move
- Support drag handles to resize
- Support rotation handle
- Keyboard shortcuts:
  - Delete/Backspace: delete selected
  - Cmd/Ctrl+C: copy
  - Cmd/Ctrl+V: paste
  - Cmd/Ctrl+D: duplicate
  - Arrow keys: nudge 1px (10px with Shift)

**Interaction Categories**:
1. **Photo elements**: Click to select, drag to move, handles to resize, double-click to crop
2. **Text elements**: Click to select, double-click to edit text inline
3. **Shape/Sticker elements**: Click to select, drag to move, handles to resize/rotate

---

#### 3.2.5 EditToolbar
**Purpose**: Provide element creation tools

**Props**:
```typescript
interface EditToolbarProps {
  onAddText: () => void;
  onChangeLayout: () => void;
  onAddPhoto: () => void;
  onAddShape: () => void;
  onAddSticker: () => void;
  features: {
    enableShapes: boolean;
    enableStickers: boolean;
    enableTextFormatting: boolean;
    enableCustomLayouts: boolean;
  };
}
```

**Behavior**:
- Render buttons for each tool (conditionally based on features)
- On tool click: trigger corresponding callback
- Show tooltip on hover

---

#### 3.2.6 TextFormatToolbar
**Purpose**: Format text elements

**Props**:
```typescript
interface TextFormatToolbarProps {
  element: TextElement;
  onUpdate: (updates: Partial<TextElement>) => void;
  onDelete: () => void;
}
```

**Behavior**:
- Show when text element is selected
- Position near selected text (contextual toolbar)
- Controls:
  - Font family dropdown
  - Font size input
  - Font weight buttons (normal, bold)
  - Text align buttons (left, center, right, justify)
  - Color picker
  - Delete button

---

#### 3.2.7 PhotoPlaceholder
**Purpose**: Placeholder for adding photos to page

**Props**:
```typescript
interface PhotoPlaceholderProps {
  slot: PhotoSlot;
  onPhotoSelect: (photoId: string) => void;
  availablePhotos: Photo[];
}
```

**Behavior**:
- Display dashed border box
- Show "Drag here" text
- On click: show photo picker modal with available photos
- Support drag-and-drop from SourcePhotosPanel
- On photo selected: create PhotoElement in slot

---

## 4. User Interactions & Flows

### 4.1 Selection Mode Flows

#### Flow 1: Add Photos
1. User clicks "Add more photos" button
2. File picker opens (multi-select enabled)
3. User selects files
4. System validates each file:
   - Type: image/* only
   - Size: warn if > 10MB, reject if > 50MB
   - Format: support JPEG, PNG, WebP, HEIC
5. System processes files:
   - Generate unique ID
   - Create thumbnail (max 400px)
   - Extract dimensions
6. Photos added to `selectedPhotos[]`
7. Photo count updates

**Edge Cases**:
- Exceeds `maxPhotos`: show error, reject excess
- Invalid file type: show error, skip file
- Duplicate file (same name + size): warn, allow or skip based on user choice
- Network error during upload: show retry option

---

#### Flow 2: Delete Photo
1. User hovers over photo in grid
2. Delete icon appears (top-left overlay)
3. User clicks delete icon
4. Confirmation modal appears (optional, can be disabled)
5. On confirm: photo removed from `selectedPhotos[]`
6. Photo count updates
7. Grid re-layouts remaining photos

**Edge Cases**:
- Last photo deleted: allow (can proceed with 0 photos or add new ones)
- Photo in use by photobook: N/A (only in selection mode)

---

#### Flow 3: Generate Photobook
1. User clicks "Generate photobook" button
2. System validates:
   - At least 1 photo selected
   - Config is valid
3. System generates photobook:
   - Create cover page (type: 'cover')
   - Distribute photos across content pages
   - Apply default layout to each page
   - Add back cover (type: 'back')
4. Component switches to Edit Mode
5. Show page thumbnails on right
6. Source photos remain on left

**Edge Cases**:
- No photos selected: disable button or show error
- Too many photos: paginate across multiple pages (define max photos per page)
- Odd number of photos (for spread layouts): add blank space or adjust layout

---

### 4.2 Edit Mode Flows

#### Flow 4: Select Page for Editing
1. User clicks page thumbnail
2. Edit icon appears on hover (top-left)
3. User clicks edit icon
4. Page zooms to fill right panel (DetailView)
5. Page thumbnails move to bottom strip
6. Edit toolbar appears at top
7. Page becomes editable

**Edge Cases**:
- Already in DetailView: allow switching to different page
- Unsaved changes: N/A (all changes auto-save to state)

---

#### Flow 5: Add Text to Page
1. User clicks "Add text" icon in EditToolbar
2. Default text element created:
   - Content: "Add your text"
   - Position: center of page
   - Default font, size, color
3. Text element appears selected (with bounding box)
4. TextFormatToolbar appears
5. Text is in edit mode (cursor blinking)
6. User types content
7. User customizes formatting via toolbar
8. Click outside to deselect

**Edge Cases**:
- Page is full: still allow (may overlap, user's responsibility)
- Text too long for element: auto-expand height or show scroll (decide based on UX)
- Empty text: allow (can delete later)

---

#### Flow 6: Add Photo to Page
1. User clicks "Add photo" icon in EditToolbar
2. PhotoPlaceholder appears in page center
3. User clicks placeholder
4. Photo picker modal opens showing available photos
5. User selects a photo
6. PhotoElement created with selected photo
7. Photo fills placeholder (maintains aspect ratio)
8. User can resize/move photo

**Alternative: Drag-and-Drop**
1. User drags photo from SourcePhotosPanel
2. Drag preview follows cursor
3. User drops on PageCanvas
4. PhotoElement created at drop position

**Edge Cases**:
- Photo already used on same page: allow (can reuse)
- Photo used on different page: allow (photos not exclusive)
- Placeholder remains after adding: remove placeholder after photo placed
- No photos available: disable button or show message

---

#### Flow 7: Change Page Layout
1. User clicks "Change layout" icon
2. Layout picker modal opens
3. Show available layouts (grid of previews)
4. User selects new layout
5. System attempts to map existing photos to new layout slots
6. If more photos than slots: preserve overflow as free elements
7. If fewer photos: leave slots empty
8. Page updates with new layout

**Edge Cases**:
- Photos don't fit new layout: preserve as free-floating elements
- Text/shapes in the way: keep them (overlap allowed)
- Custom elements: never touched by layout change

---

#### Flow 8: Delete Element
1. User selects element(s)
2. User presses Delete key OR clicks delete in format toolbar
3. Confirmation modal (optional, can disable for non-photo elements)
4. Element(s) removed from page
5. Selection cleared

**Edge Cases**:
- Delete photo from layout slot: slot becomes empty placeholder
- Delete last element on page: allow (blank pages are valid)
- Multi-delete: apply to all selected

---

#### Flow 9: Add Page
1. User clicks "Add page" button (bottom right)
2. New page created:
   - Type: 'content'
   - Page number: current max + 1
   - Default layout applied
   - No elements
3. Page inserted at end or after current page (decide based on UX)
4. Page count updates
5. New page thumbnail appears

**Edge Cases**:
- Max pages reached (e.g., 100): disable button or show warning
- Odd/even page rules (for spreads): validate page number logic

---

#### Flow 10: Remove Page
1. User selects a page (in DetailView or clicks thumbnail)
2. User clicks "Remove page" button
3. Confirmation modal appears
4. On confirm: page removed from `photoBook.pages[]`
5. Page numbers recalculated
6. If removed page was in DetailView: switch to previous/next page

**Edge Cases**:
- Last page: allow if > 1 page total
- Cover/back page: prevent deletion (or allow with warning)
- Photos on deleted page: return to source panel (or lose them - decide based on UX)

---

#### Flow 11: Reorder Pages
(Not in original requirements but implied for completeness)

1. User drags page thumbnail in bottom strip
2. Drop position indicator shows
3. On drop: page order updated
4. Page numbers recalculated

**Edge Cases**:
- Move cover page: prevent or allow (define rules)
- Move back page: prevent or allow

---

## 5. State Management Strategy

### 5.1 Internal State
The component manages its own state using React hooks (useState, useReducer) or a lightweight state management library (Zustand, Jotai).

**State Slices**:
- `mode`: 'selection' | 'edit'
- `selectedPhotos`: Photo[]
- `photoBook`: PhotoBook | null
- `currentPageId`: string | null
- `selectedElementIds`: string[]
- `history`: PhotoBookSnapshot[]
- `historyIndex`: number

### 5.2 State Transitions

```
Initial → Selection Mode (selectedPhotos = [])
  ↓ (add photos)
Selection Mode (selectedPhotos = [photo1, photo2, ...])
  ↓ (generate photobook)
Edit Mode (photoBook generated, currentPageId = null)
  ↓ (select page)
Edit Mode (currentPageId = 'page-1', DetailView active)
  ↓ (edit elements)
Edit Mode (elements updated, history recorded)
  ↓ (save photobook)
Parent receives photoBook via onSave()
```

### 5.3 History & Undo/Redo

**Recording Changes**:
- Every user action that modifies `photoBook` creates a snapshot
- Snapshot includes: full photoBook state, timestamp, action description
- Snapshots stored in `history[]` array
- `historyIndex` points to current state

**Undo**:
1. User presses Cmd/Ctrl+Z
2. `historyIndex` decrements
3. Restore `photoBook` from `history[historyIndex]`

**Redo**:
1. User presses Cmd/Ctrl+Shift+Z
2. `historyIndex` increments
3. Restore `photoBook` from `history[historyIndex]`

**Optimization**:
- Limit history size (e.g., 50 snapshots)
- Use structural sharing or diffs to reduce memory

---

## 6. Edge Cases & Error Handling

### 6.1 Photo Management
- **Corrupted image file**: Show error, skip file
- **Unsupported format**: Show error with list of supported formats
- **Photo load failure**: Show placeholder with retry option
- **Large file size**: Compress on client before processing
- **Duplicate photos**: Detect by hash, warn user, allow keeping both

### 6.2 Photobook Generation
- **No photos selected**: Disable "Generate" button
- **API failure** (if using server-side generation): Show error, retry option
- **Timeout**: Show progress indicator, allow cancellation

### 6.3 Page Editing
- **Element out of bounds**: Snap to page boundaries or allow overflow (decide)
- **Overlapping elements**: Allow (natural behavior, controlled by zIndex)
- **Too many elements**: Warn after threshold (e.g., 50 elements per page)
- **Text overflow**: Auto-resize element or truncate (decide)

### 6.4 Performance
- **Many photos** (>100): Virtualize photo grid
- **Many pages** (>50): Virtualize page strip
- **High-resolution images**: Use thumbnails for rendering, full-res for export only
- **Undo/redo lag**: Debounce or throttle history recording

### 6.5 Browser Compatibility
- **File API**: Fallback for older browsers
- **Drag-and-drop**: Graceful degradation (use click to add)
- **Canvas rendering**: Check WebGL support, fallback to 2D canvas

---

## 7. Validation Rules

### 7.1 Photo Constraints
- **File size**: Max 50MB per file
- **Dimensions**: Min 100x100px, warn if < 1000px on shortest side
- **File types**: JPEG, PNG, WebP, HEIC (convert HEIC on client if needed)
- **Total count**: Max defined by `maxPhotos` prop (default: 100)

### 7.2 Text Constraints
- **Content length**: Max 5000 characters per text element
- **Font size**: Min 8pt, Max 200pt
- **Element size**: Min 20x20px, Max page dimensions

### 7.3 Page Constraints
- **Pages count**: Min 1 (cover), Max 100
- **Elements per page**: Recommend max 50 (warn user)

### 7.4 PhotoBook Constraints
- **Required pages**: At least cover page
- **Page order**: Cover must be first, back must be last (if present)

---

## 8. Accessibility Requirements

### 8.1 Keyboard Navigation
- **Tab order**: Logical flow through all interactive elements
- **Focus indicators**: Visible outline on focused elements
- **Shortcuts**: All mouse actions should have keyboard equivalents
  - Arrow keys: Move selected element
  - Shift + Arrow: Resize
  - Delete: Remove element
  - Cmd/Ctrl + Z/Y: Undo/Redo
  - Cmd/Ctrl + C/V: Copy/Paste

### 8.2 Screen Reader Support
- **ARIA labels**: All buttons, inputs, and interactive elements
- **Alt text**: All images (use photo fileName as fallback)
- **Live regions**: Announce state changes (e.g., "Page added", "Photo deleted")

### 8.3 Visual Accessibility
- **Color contrast**: WCAG AA compliance (4.5:1 for text)
- **Focus indicators**: High contrast, visible in all modes
- **Icon labels**: Text labels or tooltips for all icon buttons

---

## 9. Performance Considerations

### 9.1 Rendering Optimization
- **Lazy loading**: Load page thumbnails on demand
- **Virtualization**: Use virtual scrolling for large photo grids
- **Memoization**: Prevent unnecessary re-renders of unchanged elements
- **Canvas offscreen rendering**: Pre-render page thumbnails in Web Workers

### 9.2 Image Optimization
- **Thumbnail generation**: Create multiple sizes (100px, 400px, full)
- **Progressive loading**: Show low-res placeholder → full image
- **Format conversion**: Convert to WebP for better compression
- **Caching**: Cache processed images in IndexedDB

### 9.3 State Updates
- **Batching**: Group multiple state updates
- **Debouncing**: Debounce history snapshots (e.g., 500ms after last change)
- **Immutable updates**: Use immer or similar for clean state updates

---

## 10. Testing Strategy

### 10.1 Unit Tests
- **State management**: Test reducers/actions in isolation
- **Utilities**: Photo processing, validation, layout algorithms
- **Data models**: Type guards, serialization/deserialization

### 10.2 Component Tests
- **PhotoCard**: Delete interaction, hover states
- **PageCanvas**: Element selection, drag, resize, keyboard shortcuts
- **EditToolbar**: Button clicks, tool activation
- **TextFormatToolbar**: Format updates, delete

### 10.3 Integration Tests
- **Selection flow**: Add photos → generate photobook
- **Edit flow**: Add text → format → save
- **Page management**: Add page → edit → remove page
- **Undo/redo**: Make changes → undo → redo

### 10.4 E2E Tests
- **Complete workflow**: Upload photos → generate → edit → save
- **Error scenarios**: Network failure, invalid files, browser refresh

---

## 11. Library Recommendations (Non-binding)

### 11.1 Canvas/Rendering
- **Options**: Fabric.js, Konva.js, React-Konva, Paper.js
- **Criteria**: Performance with many elements, easy element manipulation, good TypeScript support

### 11.2 Drag-and-Drop
- **Options**: react-dnd, @dnd-kit, react-beautiful-dnd
- **Criteria**: Touch support, accessibility, performance

### 11.3 State Management
- **Options**: Zustand, Jotai, Redux Toolkit (if already in use)
- **Criteria**: Simplicity, TypeScript support, middleware for history

### 11.4 Image Processing
- **Options**: Browser-image-compression, pica, sharp (server-side)
- **Criteria**: Client-side compression, thumbnail generation, format conversion

### 11.5 Text Editing
- **Options**: ContentEditable API (native), Draft.js, Slate.js
- **Criteria**: Lightweight, inline editing, format controls

---

## 12. Future Considerations

### 12.1 Advanced Features (Out of Scope for v1)
- Collaborative editing (real-time multiplayer)
- Template marketplace (pre-designed layouts)
- AI-powered auto-layout
- 3D page flip animations
- Export to PDF/print-ready files
- Integration with print services
- Photo filters and effects (beyond basic adjustments)
- Video elements support

### 12.2 Extensibility Points
- **Plugin system**: Allow third-party element types
- **Custom layouts**: User-defined layout templates
- **Theme system**: Customizable colors, fonts, styles
- **Export formats**: Pluggable exporters (PDF, PNG, JSON)

---

## 13. Open Questions (To be resolved before implementation)

1. **Layout algorithm**: How are photos distributed across pages automatically?
   - Equal distribution vs. smart grouping (by date, face detection, etc.)
   - Default layout per page type

2. **Photo reuse policy**: Can same photo appear on multiple pages?
   - Allow unrestricted reuse vs. warn user

3. **Page spreads**: Do pages come in pairs (spread layout) or individually?
   - Affects page numbering, add/remove logic

4. **Sticker/shape library**: Predefined set vs. user uploads?
   - Define initial library, upload mechanism

5. **Background editing**: Can user change page background?
   - Solid colors, gradients, patterns, photos

6. **Export format**: What is the final output?
   - JSON for backend processing, PDF for preview, image per page

7. **Persistence**: Is state saved automatically or on explicit save?
   - Auto-save to localStorage vs. save button only

8. **Collaboration**: Single-user vs. multi-user editing?
   - Affects state sync, conflict resolution

9. **Mobile support**: Is responsive design required?
   - Touch interactions, different layouts

10. **Print specifications**: Are print guidelines enforced?
    - Bleed areas, safe zones, color profiles (CMYK)

---

## 14. Success Criteria

The component is considered complete when:

1. **Functional**: All 13 requirements implemented and tested
2. **Stable**: No critical bugs, < 5% error rate in user testing
3. **Performant**:
   - Handles 100 photos without lag
   - Page rendering < 100ms
   - Undo/redo < 50ms
4. **Accessible**: WCAG AA compliant
5. **Tested**: > 80% code coverage, all critical paths covered
6. **Documented**: API docs, usage examples, architecture diagrams

---

## 15. Implementation Phases (Suggested)

### Phase 1: Foundation (Week 1-2)
- Data models and TypeScript types
- Component structure and routing
- Selection mode (add/delete photos)
- Basic state management

### Phase 2: Generation (Week 2-3)
- Photobook generation logic
- Default layout system
- Page thumbnail rendering
- Switch to Edit mode

### Phase 3: Core Editing (Week 3-5)
- Page selection and detail view
- Add/remove pages
- PageCanvas with element rendering
- Basic element selection and movement

### Phase 4: Element Tools (Week 5-7)
- Add text with formatting toolbar
- Add photo with placeholder
- Change layout functionality
- Add shapes (if enabled)
- Add stickers (if enabled)

### Phase 5: Polish (Week 7-8)
- Undo/redo system
- Keyboard shortcuts
- Drag-and-drop polish
- Performance optimization
- Accessibility pass

### Phase 6: Testing & Refinement (Week 8-9)
- Unit and integration tests
- E2E tests
- User acceptance testing
- Bug fixes and refinements

*(Timeline assumes 1 developer, adjust based on team size)*

---

## Document Control

- **Version**: 1.0
- **Created**: 2026-02-03
- **Last Updated**: 2026-02-03
- **Status**: Draft for Review
- **Next Review**: After technical feasibility validation

---

**End of Specification**
