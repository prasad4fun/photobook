# PhotoBook Editor - Incremental Enhancements (v2.0)

## Document Purpose
This specification defines incremental changes to the PhotoBook Editor component based on new requirements (Requirements2.md). All changes build upon the foundation established in SPECIFICATION.md v1.0 and focus on enhanced user experience, advanced editing capabilities, and production-ready features.

---

## 1. Changes Overview

### 1.1 Scope of Changes
This specification addresses 11 new requirements that enhance:
1. **Image Quality Management** - Visual feedback for low-resolution images
2. **Default Formatting** - Consistent text styling defaults
3. **Photo Editing Tools** - Advanced photo manipulation within slots
4. **Layout Flexibility** - Dynamic slot management (add/remove/shuffle)
5. **Shape System Redesign** - Consolidated shape picker with categories
6. **Sticker Enhancements** - Additional manipulation options
7. **Spread View** - Two-page editing interface
8. **Navigation Controls** - Improved page navigation UX
9. **Global Actions** - Top toolbar with save/preview/order
10. **Content Restrictions** - Page limits and edit constraints
11. **Visual Polish** - Icons, tooltips, and interactive feedback

### 1.2 Backward Compatibility
All changes are **additive or refinements** to existing functionality:
- Existing data models remain compatible
- Current components are enhanced, not replaced
- State management structure is extended, not rewritten

---

## 2. Data Model Changes

### 2.1 Enhanced Photo Model

**Change Type**: Extension

```typescript
interface Photo {
  // Existing fields...
  id: string;
  url: string;
  thumbnailUrl?: string;
  width: number;
  height: number;
  fileSize: number;
  fileName: string;
  addedAt: Date;

  // NEW FIELDS
  qualityScore?: number;           // 0-100, calculated from resolution vs. print size
  qualityWarning?: boolean;        // True if resolution is insufficient
  qualityMessage?: string;         // User-facing message for tooltip
}
```

**Implementation Notes**:
- `qualityScore` calculated as: `Math.min(100, (width * height) / requiredPixels * 100)`
- `requiredPixels` based on print size (e.g., 1920x1280 for A4 at 150 DPI)
- `qualityWarning` = true when `qualityScore < 70`
- `qualityMessage` example: "Poor photo quality. We recommend changing the photo to one with higher resolution, otherwise the print might be blurred."

---

### 2.2 Enhanced PhotoElement Model

**Change Type**: Extension

```typescript
interface PhotoElement extends BaseElement {
  type: 'photo';
  photoId: string;
  cropArea?: CropArea;
  filters?: ImageFilters;
  slotId?: string;

  // NEW FIELDS
  transform?: PhotoTransform;      // Zoom, fit, rotation, flip
  frame?: FrameStyle;              // Frame decoration
  effect?: PhotoEffect;            // Visual effects
}

interface PhotoTransform {
  zoom: number;                    // 0.5 to 3.0 (50% to 300%)
  fit: 'fill' | 'fit' | 'stretch'; // Fit mode within slot
  rotation: number;                // Degrees (0, 90, 180, 270)
  flipHorizontal: boolean;
  flipVertical: boolean;
}

interface FrameStyle {
  enabled: boolean;
  color: string;                   // Hex color
  width: number;                   // Pixels (1-20)
  style: 'solid' | 'dashed' | 'dotted' | 'double';
}

interface PhotoEffect {
  type: 'none' | 'sepia' | 'grayscale' | 'vintage' | 'warm' | 'cool' | 'vignette';
  intensity: number;               // 0-100
}
```

---

### 2.3 Enhanced ShapeElement Model

**Change Type**: Extension

```typescript
interface ShapeElement extends BaseElement {
  type: 'shape';
  shapeCategory: 'basic' | 'stars' | 'banners' | 'callouts'; // NEW
  shapeType: string;               // CHANGED: now more specific per category
  fillColor?: string;
  strokeColor?: string;
  strokeWidth: number;
  cornerRadius?: number;
  points?: Point[];

  // NEW FIELDS
  border?: BorderStyle;            // Enhanced border control
}

interface BorderStyle {
  enabled: boolean;
  color: string;
  width: number;                   // 1-20 pixels
  style: 'solid' | 'dashed' | 'dotted';
}

// Shape type mappings by category
type BasicShapes = 'rectangle' | 'circle' | 'oval' | 'triangle' | 'polygon';
type StarShapes = 'star-5' | 'star-6' | 'star-8' | 'burst';
type BannerShapes = 'ribbon' | 'banner-wave' | 'banner-fold';
type CalloutShapes = 'speech-bubble' | 'thought-bubble' | 'callout-rounded' | 'callout-cloud';
```

---

### 2.4 Enhanced StickerElement Model

**Change Type**: Extension

```typescript
interface StickerElement extends BaseElement {
  type: 'sticker';
  stickerId: string;
  stickerUrl: string;

  // NEW FIELDS
  flipHorizontal: boolean;         // Allow horizontal flip
  flipVertical: boolean;           // Allow vertical flip
}
```

---

### 2.5 Enhanced TextElement Defaults

**Change Type**: Default Values Change

```typescript
// NEW: Default text configuration
const DEFAULT_TEXT_ELEMENT: Partial<TextElement> = {
  content: "Enter text",
  fontFamily: "Londrina Solid",    // CHANGED from generic default
  fontSize: 60.6,                   // CHANGED from unspecified
  fontWeight: '900',                // Black weight
  color: '#000000',                 // Black color
  textAlign: 'left',
  backgroundColor: 'transparent',
  lineHeight: 1.2,
};
```

---

### 2.6 Enhanced PageLayout Model

**Change Type**: Extension

```typescript
interface PageLayout {
  id: string;
  name: string;
  template: LayoutTemplate;

  // NEW FIELDS
  minSlots: number;                // Minimum photo slots (cannot reduce below)
  maxSlots: number;                // Maximum photo slots (cannot add beyond)
  isFlexible: boolean;             // True if slots can be added/removed dynamically
}
```

---

### 2.7 Enhanced PhotoBookConfig Model

**Change Type**: Extension

```typescript
interface PhotoBookConfig {
  pageSize: 'A4' | 'Square';       // CHANGED: Removed A5, Custom
  orientation: 'portrait' | 'landscape';
  coverType: 'hardcover' | 'softcover';
  binding: 'spiral' | 'perfect' | 'saddle-stitch';

  // NEW FIELDS
  maxPages: number;                // Default: 20 (enforced limit)
  editablePageTypes: PageType[];   // Pages that can be edited (excludes back-of-cover)
  viewMode: 'single' | 'spread';   // Default: 'spread' for two-page view
}

const DEFAULT_PHOTOBOOK_CONFIG: PhotoBookConfig = {
  pageSize: 'A4',
  orientation: 'portrait',
  coverType: 'hardcover',
  binding: 'perfect',
  maxPages: 20,                    // NEW
  editablePageTypes: ['cover', 'content'], // NEW: excludes 'back-of-cover'
  viewMode: 'spread',              // NEW
};
```

---

### 2.8 New Page Types

**Change Type**: Extension

```typescript
interface Page {
  id: string;
  pageNumber: number;
  type: PageType;                  // CHANGED: use enum
  elements: PageElement[];
  layout: PageLayout;
  background?: Background;

  // NEW FIELDS
  isEditable: boolean;             // False for back-of-cover pages
  spreadPair?: string;             // Page ID of spread partner (for spread view)
}

type PageType =
  | 'cover'                        // Front cover
  | 'back-cover'                   // Back cover
  | 'back-of-cover'                // NEW: Non-editable page behind cover
  | 'content';                     // Regular content page
```

**Spread Pairing Logic**:
- Back Cover + Front Cover (spread 0)
- Back-of-Front-Cover + Back-of-Back-Cover (spread 0.5, non-editable)
- Page 1 + Page 2 (spread 1)
- Page 3 + Page 4 (spread 2)
- etc.

---

## 3. Component Architecture Changes

### 3.1 New Component Hierarchy

```diff
PhotoBookEditor (root)
├── SelectionMode
│   ├── PhotoGrid (left panel)
│   │   └── PhotoCard (per photo)
│   │       ├── DeleteButton (hover overlay)
+│   │       └── QualityWarningBadge (NEW - conditional)
│   └── AddPhotosButton (right panel)
│
└── EditMode
+   ├── TopToolbar (NEW - global actions)
+   │   ├── UndoButton
+   │   ├── RedoButton
+   │   ├── HistoryButton
+   │   ├── ProjectButton
+   │   ├── AutoSaveIndicator
+   │   ├── PreviewButton
+   │   └── OrderButton
│   │
│   ├── SourcePhotosPanel (left panel)
│   │   └── PhotoThumbnail (per photo)
│   │
│   ├── PageViewerPanel (right panel)
│   │   ├── AllPagesView (default state)
│   │   │   └── PageThumbnail (per page)
│   │   │
+   │   └── SpreadView (NEW - when page selected)
+   │       ├── BackButton (NEW - return to all pages)
+   │       ├── SpreadCanvas (NEW - two-page editing area)
+   │       │   ├── PageCanvas (left page)
+   │       │   └── PageCanvas (right page)
│   │       │
+   │       ├── PageNavigationControls (NEW - bottom)
+   │       │   ├── PreviousButton
+   │       │   ├── PageIndicator ("Page 4-5")
+   │       │   └── NextButton
│   │       │
│   │       └── EditToolbar (context-sensitive)
│   │           ├── AddTextButton
+   │           ├── AddPhotoButton (enhanced)
+   │           ├── LayoutButton (enhanced with +/- controls)
+   │           ├── AddShapesButton (NEW - replaces separate shape buttons)
│   │           └── AddStickerButton (enhanced)
│   │
+   └── ContextualToolbars (NEW - appear on element selection)
+       ├── PhotoToolbar (NEW)
+       ├── ShapeToolbar (enhanced)
+       ├── StickerToolbar (enhanced)
+       └── TextFormatToolbar (existing)
```

---

### 3.2 New Sub-Components

#### 3.2.1 QualityWarningBadge (NEW)

**Purpose**: Visual indicator for low-quality images

**Props**:
```typescript
interface QualityWarningBadgeProps {
  photo: Photo;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}
```

**Behavior**:
- Render only if `photo.qualityWarning === true`
- Display yellow warning icon (⚠️ or similar)
- On hover: show tooltip with `photo.qualityMessage`
- Position absolute within parent PhotoCard
- Icon size: 24x24px
- Tooltip: dark background, white text, max-width 250px

**Visual Reference**: See Attachments2/1.png

---

#### 3.2.2 TopToolbar (NEW)

**Purpose**: Global actions accessible from any page

**Props**:
```typescript
interface TopToolbarProps {
  onUndo: () => void;
  onRedo: () => void;
  onHistory: () => void;
  onProject: () => void;
  onPreview: () => void;
  onOrder: () => void;
  canUndo: boolean;
  canRedo: boolean;
  autoSaveStatus: 'idle' | 'saving' | 'saved' | 'error';
  lastSavedAt?: Date;
}
```

**Behavior**:
- Fixed position at top of Edit Mode
- Buttons:
  - **Undo**: Disabled when `!canUndo`
  - **Redo**: Disabled when `!canRedo`
  - **History**: Opens history panel (optional feature)
  - **Project**: Opens project settings/info
  - **Auto-save indicator**: Shows "Saving..." or "Saved" with timestamp
  - **Preview**: Opens preview modal (full-screen photobook view)
  - **Order**: Opens order/checkout flow
- Keyboard shortcuts displayed in tooltips
- Responsive: collapses to icon-only on smaller screens

**Visual Reference**: See Attachments2/10.png

---

#### 3.2.3 SpreadView (NEW)

**Purpose**: Display and edit two pages simultaneously

**Props**:
```typescript
interface SpreadViewProps {
  leftPage: Page;
  rightPage: Page;
  photos: Photo[];
  onBack: () => void;
  onPageChange: (direction: 'prev' | 'next') => void;
  currentSpread: number;
  totalSpreads: number;
  selectedElementIds: string[];
  // ... element manipulation callbacks
}
```

**Behavior**:
- Render two PageCanvas components side-by-side
- Left page: back cover, odd pages, back-of-cover (non-editable)
- Right page: front cover, even pages, back-of-cover (non-editable)
- Maintain 1:1 aspect ratio for each page (no distortion)
- Add visual separator (1px line) between pages
- Non-editable pages: Show lock icon overlay, disable interactions
- **Back button**: Top-left, returns to AllPagesView
- **Page indicator**: Shows "Page 4-5", "Cover", "Back Cover", etc.

**Visual Reference**: See Attachments2/7.png

---

#### 3.2.4 PhotoToolbar (NEW)

**Purpose**: Contextual toolbar for photo element manipulation

**Props**:
```typescript
interface PhotoToolbarProps {
  element: PhotoElement;
  photo: Photo;
  onUpdate: (updates: Partial<PhotoElement>) => void;
  onDelete: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
}
```

**Behavior**:
- Display when PhotoElement is selected
- Position: Floating toolbar above selected element or docked at top
- Controls (icon buttons with tooltips):
  1. **Remove photo from design**: Clear photo but keep slot
  2. **Zoom in** (+10%): `transform.zoom += 0.1`
  3. **Zoom out** (-10%): `transform.zoom -= 0.1`
  4. **Fit**: Auto-fit photo to slot (`transform.fit = 'fit'`)
  5. **Rotate left** (-90°): `transform.rotation -= 90`
  6. **Rotate right** (+90°): `transform.rotation += 90`
  7. **Flip image** (horizontal): Toggle `transform.flipHorizontal`
  8. **Add frame**: Opens frame picker (color + width sliders)
  9. **Layer order**: Dropdown (Bring to Front, Bring Forward, Send Backward, Send to Back)
  10. **Add photo effect**: Dropdown (None, Sepia, Grayscale, Vintage, etc.)
  11. **Remove**: Delete entire photo element

**Visual Reference**: See Attachments2/3.png

---

#### 3.2.5 LayoutPicker (ENHANCED)

**Purpose**: Select and modify page layouts dynamically

**Props**:
```typescript
interface LayoutPickerProps {
  currentLayout: PageLayout;
  availableLayouts: PageLayout[];
  onLayoutChange: (layoutId: string) => void;
  onAddSlot: () => void;          // NEW
  onRemoveSlot: () => void;       // NEW
  onShuffleSlots: () => void;     // NEW
  canAddSlot: boolean;            // NEW
  canRemoveSlot: boolean;         // NEW
}
```

**Behavior**:
- Display as modal or side panel
- **Layout Grid**: Show available layouts as thumbnails
- **Dynamic Controls** (NEW):
  1. **Less "-" Icon**:
     - Remove one photo slot from current layout
     - Redistribute remaining slots to fill page
     - Disabled if `currentLayout.photoSlots.length <= minSlots`
  2. **More "+" Icon**:
     - Add one photo slot to current layout
     - Adjust existing slots to make room
     - Disabled if `currentLayout.photoSlots.length >= maxSlots`
  3. **Shuffle Icon**:
     - Randomly rearrange photo slot positions
     - Maintain slot count, change positions only
- **Algorithm for Add/Remove**:
  - Use grid-based layout algorithm
  - Maintain aspect ratios
  - Ensure minimum gap between slots (e.g., 2% of page width)

**Visual Reference**: See Attachments2/4.png

---

#### 3.2.6 ShapePicker (REDESIGNED)

**Purpose**: Unified shape selection interface

**Props**:
```typescript
interface ShapePickerProps {
  onShapeSelect: (category: string, shapeType: string) => void;
  onCancel: () => void;
}
```

**Behavior**:
- Display as modal or side panel
- **Category Tabs**:
  1. **Basic Shapes**: Rectangle, Circle, Oval, Triangle, Polygon
  2. **Stars & Banners**: Star-5, Star-6, Star-8, Burst, Ribbon, etc.
  3. **Callouts**: Speech Bubble, Thought Bubble, Cloud, etc.
- Each shape shown as icon preview
- On click: insert shape at page center with default styling
- After insertion: show ShapeToolbar for customization

**Visual Reference**: See Attachments2/5.png

---

#### 3.2.7 ShapeToolbar (ENHANCED)

**Props**:
```typescript
interface ShapeToolbarProps {
  element: ShapeElement;
  onUpdate: (updates: Partial<ShapeElement>) => void;
  onDelete: () => void;
  onLayerChange: (direction: 'forward' | 'backward' | 'front' | 'back') => void;
}
```

**Behavior**:
- Display when ShapeElement is selected
- Controls:
  1. **Resize**: Drag handles on bounding box (existing)
  2. **Fill Color**: Color picker
  3. **Border**: Toggle + color picker + width slider (1-20px)
  4. **Layer Order**: Dropdown menu
  5. **Remove**: Delete button

**Visual Reference**: See Attachments2/5.png

---

#### 3.2.8 StickerToolbar (ENHANCED)

**Props**:
```typescript
interface StickerToolbarProps {
  element: StickerElement;
  onUpdate: (updates: Partial<StickerElement>) => void;
  onDelete: () => void;
  onLayerChange: (direction: 'forward' | 'backward' | 'front' | 'back') => void;
}
```

**Behavior**:
- Display when StickerElement is selected
- Controls:
  1. **Resize**: Drag handles (maintain aspect ratio)
  2. **Flip Horizontal**: Toggle button
  3. **Flip Vertical**: Toggle button
  4. **Layer Order**: Dropdown menu
  5. **Remove**: Delete button

**Visual Reference**: See Attachments2/6.png

---

#### 3.2.9 StickerPanel (ENHANCED)

**Purpose**: Drag-and-drop sticker library

**Props**:
```typescript
interface StickerPanelProps {
  stickers: Sticker[];
  onStickerDrop: (stickerId: string, position: { x: number; y: number }) => void;
}

interface Sticker {
  id: string;
  name: string;
  url: string;
  category?: string;              // e.g., "emoji", "decorations", "frames"
  thumbnailUrl?: string;
}
```

**Behavior**:
- Display in left panel when "Add Sticker" is active
- Grid of sticker thumbnails
- **Drag behavior**:
  - User drags sticker from panel
  - Drag preview follows cursor
  - Drop on PageCanvas creates StickerElement
- **Click behavior** (alternative):
  - Click sticker → cursor changes to "placing" mode
  - Click on canvas → place sticker
  - ESC to cancel

**Visual Reference**: See Attachments2/6.png

---

#### 3.2.10 PageNavigationControls (NEW)

**Purpose**: Navigate between page spreads

**Props**:
```typescript
interface PageNavigationControlsProps {
  currentSpread: number;          // 0-indexed
  totalSpreads: number;
  spreadLabel: string;            // e.g., "Page 4-5", "Cover"
  onPrevious: () => void;
  onNext: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
}
```

**Behavior**:
- Display at bottom of SpreadView
- **Previous button**: Arrow left, disabled if `currentSpread === 0`
- **Page indicator**: Text display (e.g., "Page 4-5")
- **Next button**: Arrow right, disabled if `currentSpread === totalSpreads - 1`
- Keyboard shortcuts: Arrow keys (← / →)

**Visual Reference**: See Attachments2/8.png

---

#### 3.2.11 BackButton (NEW)

**Purpose**: Return to AllPagesView from SpreadView

**Props**:
```typescript
interface BackButtonProps {
  onBack: () => void;
  label?: string;                 // Default: "All Pages"
}
```

**Behavior**:
- Position: Top-left of SpreadView
- Icon: Left arrow
- Text: "All Pages" or custom label
- On click: trigger `onBack()` callback
- Save current state before navigating back

**Visual Reference**: See Attachments2/9.png

---

## 4. Updated User Flows

### 4.1 NEW FLOW: Photo Quality Warning

**Trigger**: User adds photos in Selection Mode

1. User uploads photos via AddPhotosButton
2. System calculates `qualityScore` for each photo:
   ```typescript
   const requiredPixels = 1920 * 1280; // A4 at 150 DPI
   const actualPixels = photo.width * photo.height;
   const qualityScore = Math.min(100, (actualPixels / requiredPixels) * 100);
   ```
3. If `qualityScore < 70`:
   - Set `qualityWarning = true`
   - Set `qualityMessage = "Poor photo quality. We recommend changing the photo to one with higher resolution, otherwise the print might be blurred."`
4. Render QualityWarningBadge on PhotoCard
5. User hovers over badge → tooltip appears
6. User can proceed with warning or replace photo

**Edge Cases**:
- Multiple low-quality photos: show warning on all
- User ignores warning: allow (warn again at checkout)
- Quality improves after cropping: recalculate score

---

### 4.2 ENHANCED FLOW: Add Text with Defaults

**Trigger**: User clicks "Add text" in EditToolbar

**CHANGED BEHAVIOR**:
1. User clicks "Add text" icon
2. System creates TextElement with **new defaults**:
   ```typescript
   {
     content: "Enter text",
     fontFamily: "Londrina Solid",
     fontSize: 60.6,
     fontWeight: '900',  // Black weight
     color: '#000000',
     position: { x: 50, y: 50 }, // Center of page
     // ...other defaults
   }
   ```
3. Text appears selected with TextFormatToolbar
4. Text is in edit mode (user can immediately type)
5. Formatting already applied (no need to change font)

**Visual Reference**: See Attachments2/2.png

---

### 4.3 NEW FLOW: Photo Manipulation

**Trigger**: User clicks on PhotoElement

1. User clicks photo on canvas
2. Photo becomes selected (bounding box appears)
3. PhotoToolbar appears above/near photo
4. User can perform actions:

**Action: Zoom In/Out**
- Click zoom in (+): `element.transform.zoom += 0.1` (max 3.0)
- Click zoom out (-): `element.transform.zoom -= 0.1` (min 0.5)
- Photo scales within slot, crop area adjusts

**Action: Fit Photo**
- Click fit icon
- System calculates best fit mode:
  - If photo aspect ratio > slot aspect ratio: `fit = 'fit'` (letterbox)
  - Else: `fit = 'fill'` (cover, may crop)
- Apply `transform.fit` and recalculate position

**Action: Rotate**
- Click rotate left: `rotation -= 90` (cycles: 0 → 270 → 180 → 90 → 0)
- Click rotate right: `rotation += 90` (cycles: 0 → 90 → 180 → 270 → 0)
- Photo rotates around center point

**Action: Flip**
- Click flip icon: Toggle `transform.flipHorizontal`
- Photo mirrors horizontally
- Does not affect rotation

**Action: Add Frame**
- Click frame icon → frame picker opens
- User selects:
  - Color: Color picker (default: black)
  - Width: Slider 1-20px (default: 5px)
  - Style: Dropdown (solid, dashed, dotted, double)
- Apply `frame` to element
- Frame renders as border around photo

**Action: Change Layer Order**
- Click layer icon → dropdown appears
- Options:
  - **Bring to Front**: `zIndex = max(allZIndices) + 1`
  - **Bring Forward**: `zIndex += 1`
  - **Send Backward**: `zIndex -= 1`
  - **Send to Back**: `zIndex = min(allZIndices) - 1`
- Recalculate render order

**Action: Add Photo Effect**
- Click effect icon → dropdown appears
- Options: None, Sepia, Grayscale, Vintage, Warm, Cool, Vignette
- User selects effect
- Apply `effect.type` and `effect.intensity = 100` (default)
- Render photo with CSS filter or canvas manipulation

**Action: Remove Photo from Design**
- Click remove photo icon
- Photo removed from slot, but slot remains empty
- Photo returns to SourcePhotosPanel (available for reuse)

**Action: Remove Slot**
- Click remove slot icon
- Entire PhotoElement deleted
- If part of layout slot: slot removed from page

**Edge Cases**:
- Zoom too much: show warning if quality degrades
- Rotate + flip: apply flip after rotation
- Frame + effect: both can be active simultaneously
- Remove from last slot: layout may become empty (allow)

**Visual Reference**: See Attachments2/3.png

---

### 4.4 ENHANCED FLOW: Layout Management

**Trigger**: User clicks "Layout" button

**CHANGED BEHAVIOR**:

1. User clicks Layout icon
2. LayoutPicker opens showing:
   - Current layout (highlighted)
   - Available layouts (grid)
   - **NEW: Dynamic controls** (top of picker)
     - **Less "-" Icon** (if `canRemoveSlot`)
     - **More "+" Icon** (if `canAddSlot`)
     - **Shuffle Icon**

**Action: Remove Photo Slot (-)**
1. User clicks "-" icon
2. System identifies removable slot:
   - Prefer empty slots first
   - If all slots filled, remove last slot (by zIndex or position)
3. Remove slot from `layout.template.photoSlots[]`
4. Redistribute remaining slots:
   ```typescript
   // Example redistribution algorithm
   const remainingSlots = slots.length - 1;
   const columns = Math.ceil(Math.sqrt(remainingSlots));
   const rows = Math.ceil(remainingSlots / columns);
   // Recalculate x, y, width, height for each slot
   ```
5. If removed slot had photo: move photo to SourcePhotosPanel
6. Update page with new layout
7. Disable "-" button if `slots.length === minSlots`

**Action: Add Photo Slot (+)**
1. User clicks "+" icon
2. System adds new empty slot:
   - Calculate position based on existing slots
   - Use grid layout algorithm to fit new slot
3. Adjust existing slots to make room:
   ```typescript
   const newSlotCount = slots.length + 1;
   const columns = Math.ceil(Math.sqrt(newSlotCount));
   const rows = Math.ceil(newSlotCount / columns);
   // Recalculate positions
   ```
4. Add slot to `layout.template.photoSlots[]`
5. Render new slot as PhotoPlaceholder
6. Disable "+" button if `slots.length === maxSlots`

**Action: Shuffle Slots**
1. User clicks shuffle icon
2. System randomizes slot positions:
   ```typescript
   const shuffled = [...photoSlots].sort(() => Math.random() - 0.5);
   // Reassign x, y coordinates while keeping width, height
   ```
3. Photos remain in their slots (slots move, not photos)
4. Update page layout immediately

**Edge Cases**:
- Add slot when page is full: decrease slot sizes to fit
- Remove slot with photo: confirm action or auto-move photo
- Shuffle with custom (non-layout) elements: keep custom elements unchanged

**Visual Reference**: See Attachments2/4.png

---

### 4.5 NEW FLOW: Spread View Navigation

**Trigger**: User selects a page in AllPagesView

**CHANGED BEHAVIOR**:

1. User clicks PageThumbnail in AllPagesView
2. System calculates spread pair:
   ```typescript
   const spreadIndex = Math.floor(pageNumber / 2);
   const leftPageNumber = spreadIndex * 2;
   const rightPageNumber = leftPageNumber + 1;
   ```
3. Component switches to SpreadView:
   - Load left page (e.g., Page 4)
   - Load right page (e.g., Page 5)
   - Render BackButton (top-left)
   - Render PageNavigationControls (bottom)
   - Update page indicator: "Page 4-5"
4. User edits pages (drag elements, add text, etc.)
5. User navigates to next/previous spread:
   - Click "Next page" → load next spread (Page 6-7)
   - Click "Previous page" → load previous spread (Page 2-3)
6. User clicks BackButton:
   - Save current state
   - Return to AllPagesView
   - Scroll to previously selected page

**Special Cases**:
- **Cover Spread**: "Back Cover" (left) + "Front Cover" (right)
- **Back-of-Cover Spread**: Non-editable, show lock icon
- **Odd page count**: Last spread has blank right page

**Edge Cases**:
- First spread: disable "Previous" button
- Last spread: disable "Next" button
- Non-editable page in spread: show lock overlay, disable tools
- Edit one page, navigate away: auto-save before transition

**Visual Reference**: See Attachments2/7.png, 8.png, 9.png

---

### 4.6 NEW FLOW: Shape Selection and Editing

**Trigger**: User clicks "Add Shapes" button

**CHANGED BEHAVIOR**:

1. User clicks "Add Shapes" icon (single button, not separate shape buttons)
2. ShapePicker modal opens with tabs:
   - **Basic Shapes** (Rectangle, Circle, Oval, Triangle)
   - **Stars & Banners** (Star, Burst, Ribbon, Banner)
   - **Callouts** (Speech Bubble, Thought Bubble, Cloud)
3. User selects shape (e.g., Star-5 from Stars tab)
4. System creates ShapeElement:
   ```typescript
   {
     shapeCategory: 'stars',
     shapeType: 'star-5',
     x: 50, y: 50, // Center of page
     width: 10, height: 10, // Default size (10% of page)
     fillColor: '#FFD700', // Default gold
     strokeColor: '#000000',
     strokeWidth: 2,
     zIndex: maxZIndex + 1,
   }
   ```
5. Shape appears on canvas, selected
6. ShapeToolbar appears with controls
7. User customizes:
   - **Fill color**: Opens color picker
   - **Border**: Toggle on, select color, adjust width (1-20px)
   - **Layer order**: Dropdown menu
8. User clicks outside or ESC → deselect shape

**Edge Cases**:
- Shape picker closed without selection: no shape added
- Shape overlaps existing element: allow (controlled by zIndex)
- Complex shape (polygon): show point editing mode (advanced feature)

**Visual Reference**: See Attachments2/5.png

---

### 4.7 NEW FLOW: Sticker Drag and Drop

**Trigger**: User clicks "Add Sticker" button

**CHANGED BEHAVIOR**:

1. User clicks "Add Sticker" icon
2. StickerPanel opens in left panel
3. User sees grid of stickers (categorized: Emoji, Decorations, Frames, etc.)
4. User drags sticker from panel:
   - Mouse down on sticker → drag starts
   - Drag preview (sticker image) follows cursor
   - Drop zone highlights on PageCanvas
5. User drops sticker on canvas:
   - Calculate drop position:
     ```typescript
     const rect = canvas.getBoundingClientRect();
     const x = ((e.clientX - rect.left) / rect.width) * 100;
     const y = ((e.clientY - rect.top) / rect.height) * 100;
     ```
   - Create StickerElement at drop position
6. Sticker appears on canvas, selected
7. StickerToolbar appears with controls:
   - **Resize**: Drag corner handles (maintain aspect ratio)
   - **Flip Horizontal**: Mirror left/right
   - **Flip Vertical**: Mirror top/bottom
   - **Layer Order**: Bring forward/send backward
   - **Remove**: Delete sticker
8. User customizes sticker, then deselects

**Alternative: Click-to-Place Mode**:
1. User clicks sticker in panel (instead of drag)
2. Cursor changes to "placing" mode (sticker follows cursor)
3. User clicks on canvas → sticker placed
4. ESC to cancel placement

**Edge Cases**:
- Drag outside canvas: no sticker added
- Sticker too large: auto-resize to fit page (max 50% of page)
- Multiple stickers: can overlap (use zIndex)

**Visual Reference**: See Attachments2/6.png

---

### 4.8 NEW FLOW: Global Actions (Top Toolbar)

**Trigger**: User interacts with TopToolbar

**Action: Undo**
1. User clicks Undo button or presses Cmd/Ctrl+Z
2. System checks `canUndo` (historyIndex > 0)
3. If true:
   - `historyIndex--`
   - Restore `photoBook` from `history[historyIndex]`
   - Update UI to reflect previous state
4. If false: button disabled, no action

**Action: Redo**
1. User clicks Redo button or presses Cmd/Ctrl+Shift+Z
2. System checks `canRedo` (historyIndex < history.length - 1)
3. If true:
   - `historyIndex++`
   - Restore `photoBook` from `history[historyIndex]`
   - Update UI to reflect next state
4. If false: button disabled, no action

**Action: Auto-Save**
- System auto-saves every 30 seconds or after significant action
- Auto-save indicator shows:
  - "Saving..." (spinner icon)
  - "Saved at 2:34 PM" (checkmark icon)
  - "Error saving" (error icon, retry button)
- Saves to localStorage or backend (depending on implementation)

**Action: Preview**
1. User clicks Preview button
2. System generates full-page previews for all pages
3. Preview modal opens with:
   - Page-flip animation (optional)
   - Zoom controls
   - Print-resolution view
   - Close button to return to editing
4. No editing allowed in preview mode

**Action: Order**
1. User clicks Order button
2. System validates photobook:
   - All pages complete (no empty required elements)
   - No quality warnings unresolved (warn user)
3. If valid: proceed to checkout/order flow
4. If invalid: show error list, prevent order

**Visual Reference**: See Attachments2/10.png

---

## 5. Business Rules & Constraints

### 5.1 Page Limits (NEW)

**Rule**: Maximum 20 pages per photobook

**Implementation**:
- `PhotoBookConfig.maxPages = 20`
- "Add Page" button disabled when `pages.length >= 20`
- Show warning tooltip: "Maximum 20 pages reached"
- Allow deletion if over limit (migration scenario)

**Edge Cases**:
- User tries to import photobook with > 20 pages: reject or truncate with warning
- Backend creates photobook with > 20 pages: allow read-only view, prevent further edits

---

### 5.2 Non-Editable Pages (NEW)

**Rule**: Pages behind front and back cover cannot be edited

**Implementation**:
- Mark pages as `type: 'back-of-cover'`, `isEditable: false`
- Render lock icon overlay on non-editable pages
- Disable all editing tools when non-editable page is selected
- Show tooltip: "This page cannot be edited"
- In SpreadView: gray out non-editable page

**Affected Pages**:
- Back of Front Cover
- Back of Back Cover
- Any other inside cover pages (if applicable)

**Edge Cases**:
- User tries to drag element to non-editable page: reject drop
- Template includes non-editable pages: preserve their content, lock editing

---

### 5.3 Photo Quality Validation (NEW)

**Rule**: Warn user about low-resolution photos

**Thresholds**:
- **Good**: qualityScore >= 80 (green badge or no badge)
- **Acceptable**: 70 <= qualityScore < 80 (yellow badge, soft warning)
- **Poor**: qualityScore < 70 (yellow badge, strong warning)

**Calculation**:
```typescript
const calculateQualityScore = (photo: Photo, printSize: { width: number; height: number }): number => {
  const requiredPixels = printSize.width * printSize.height;
  const actualPixels = photo.width * photo.height;
  const score = Math.min(100, (actualPixels / requiredPixels) * 100);
  return Math.round(score);
};

// For A4 at 150 DPI (standard print)
const A4_PRINT_SIZE = { width: 1920, height: 1280 };
```

**User Actions**:
- Upload stage: show warning badge immediately
- Editing stage: highlight low-quality photos in SourcePhotosPanel
- Checkout stage: confirm user is aware of quality issues before proceeding

---

### 5.4 Layout Slot Constraints (NEW)

**Rule**: Dynamic layouts must respect min/max slot limits

**Default Constraints**:
- `minSlots = 1` (at least one photo slot)
- `maxSlots = 9` (max 9 photos per page for usability)

**Implementation**:
- On "Add Slot": check `currentSlots.length < maxSlots`
- On "Remove Slot": check `currentSlots.length > minSlots`
- Shuffle: never changes slot count
- Custom layouts: define min/max per layout template

**Edge Cases**:
- User manually adds more than maxSlots photos as free elements: allow (custom layout)
- Template with fixed slots: disable add/remove, only allow shuffle

---

## 6. UI/UX Guidelines

### 6.1 Icon Design

**Consistency**:
- Use icon library: Heroicons, Lucide, or custom SVG
- Size: 20x20px for toolbar icons, 24x24px for larger buttons
- Color: Neutral gray (#64748b) for inactive, primary color (#6366f1) for active
- Hover: 10% opacity increase
- Active/selected: Solid background or colored outline

**New Icons Needed**:
- Quality warning: ⚠️ (yellow triangle with exclamation)
- Zoom in/out: 🔍 +/-
- Fit: ⬜ with arrows
- Rotate: ↻ ↺
- Flip: ⇄ ⇅
- Frame: 🖼️ (picture frame)
- Layer order: ⬆️ ⬇️ with stacked squares
- Shuffle: 🔀 (crossed arrows)
- Add/Remove slot: ➕ ➖
- Back button: ← with "All Pages" text

---

### 6.2 Tooltip Guidelines

**Behavior**:
- Appear on hover after 500ms delay
- Disappear on mouse leave immediately
- Position: Above element if space available, below otherwise
- Include keyboard shortcut if applicable (e.g., "Undo (Cmd+Z)")

**Content**:
- Concise (max 10 words)
- Action-oriented ("Rotate image left" not "Rotate")
- Include context for destructive actions ("Delete photo - cannot be undone")

**Styling**:
- Dark background (#1e293b), white text
- Padding: 8px 12px
- Border radius: 6px
- Font size: 12px
- Max width: 250px (wrap long text)

---

### 6.3 Modal & Panel Design

**Modals** (ShapePicker, LayoutPicker):
- Centered overlay
- Dimmed background (rgba(0,0,0,0.5))
- White background, rounded corners (12px)
- Close button (top-right X icon)
- ESC to close
- Click outside to close (optional, can be disabled for critical actions)

**Panels** (StickerPanel, SourcePhotosPanel):
- Fixed width (280px for left panel)
- Scrollable content
- Sticky header
- Collapse/expand button (optional)
- Resizable handle (advanced feature)

---

### 6.4 Animation Guidelines

**Transitions**:
- Page transitions: 300ms ease-in-out
- Element selection: 150ms ease-out (border animation)
- Toolbar appearance: 200ms slide-up or fade-in
- Drag preview: No transition (instant follow)

**Hover Effects**:
- Button hover: 100ms ease (scale 1.05 or background change)
- Thumbnail hover: 150ms ease (border highlight)

**Loading States**:
- Spinner: 1s linear infinite rotation
- Skeleton: 1.5s linear infinite pulse (gray to light gray)

---

## 7. Technical Implementation Notes

### 7.1 Photo Quality Calculation

**Algorithm**:
```typescript
interface QualityMetrics {
  score: number;
  warning: boolean;
  message: string;
}

const calculatePhotoQuality = (
  photo: Photo,
  bookConfig: PhotoBookConfig
): QualityMetrics => {
  // Determine required resolution based on page size
  const printDPI = 150; // Standard for photobooks
  const pageDimensions = {
    A4: { width: 8.27, height: 11.69 }, // inches
    Square: { width: 10, height: 10 },
  };

  const pageDim = pageDimensions[bookConfig.pageSize];
  const requiredWidth = pageDim.width * printDPI;
  const requiredHeight = pageDim.height * printDPI;
  const requiredPixels = requiredWidth * requiredHeight;

  // Calculate actual pixels
  const actualPixels = photo.width * photo.height;

  // Calculate score (0-100)
  const score = Math.min(100, (actualPixels / requiredPixels) * 100);

  // Determine warning
  const warning = score < 70;
  const message = warning
    ? "Poor photo quality. We recommend changing the photo to one with higher resolution, otherwise the print might be blurred."
    : "";

  return { score: Math.round(score), warning, message };
};
```

---

### 7.2 Spread Pairing Logic

**Algorithm**:
```typescript
interface Spread {
  id: string;
  leftPage: Page;
  rightPage: Page;
  spreadNumber: number;
  label: string;
}

const createSpreads = (pages: Page[]): Spread[] => {
  const spreads: Spread[] = [];

  // Find cover and back cover
  const backCover = pages.find(p => p.type === 'back-cover');
  const frontCover = pages.find(p => p.type === 'cover');

  // Spread 0: Back Cover + Front Cover
  if (backCover && frontCover) {
    spreads.push({
      id: 'spread-0',
      leftPage: backCover,
      rightPage: frontCover,
      spreadNumber: 0,
      label: 'Cover',
    });
  }

  // Content pages (pair by page number)
  const contentPages = pages
    .filter(p => p.type === 'content' || p.type === 'back-of-cover')
    .sort((a, b) => a.pageNumber - b.pageNumber);

  for (let i = 0; i < contentPages.length; i += 2) {
    const leftPage = contentPages[i];
    const rightPage = contentPages[i + 1] || null; // Handle odd page count

    spreads.push({
      id: `spread-${spreads.length}`,
      leftPage,
      rightPage: rightPage || createBlankPage(), // Blank page for odd count
      spreadNumber: spreads.length,
      label: rightPage
        ? `Page ${leftPage.pageNumber}-${rightPage.pageNumber}`
        : `Page ${leftPage.pageNumber}`,
    });
  }

  return spreads;
};
```

---

### 7.3 Dynamic Layout Algorithm

**Add Slot Algorithm**:
```typescript
const addPhotoSlot = (layout: PageLayout): PageLayout => {
  const currentSlots = layout.template.photoSlots;
  const newSlotCount = currentSlots.length + 1;

  // Calculate grid dimensions
  const columns = Math.ceil(Math.sqrt(newSlotCount));
  const rows = Math.ceil(newSlotCount / columns);

  // Calculate slot dimensions (with gaps)
  const gap = 2; // 2% gap between slots
  const slotWidth = (100 - (columns + 1) * gap) / columns;
  const slotHeight = (100 - (rows + 1) * gap) / rows;

  // Create new slot array
  const newSlots: PhotoSlot[] = [];
  for (let i = 0; i < newSlotCount; i++) {
    const col = i % columns;
    const row = Math.floor(i / columns);

    newSlots.push({
      id: `slot-${i}`,
      x: gap + col * (slotWidth + gap),
      y: gap + row * (slotHeight + gap),
      width: slotWidth,
      height: slotHeight,
      zIndex: i,
    });
  }

  return {
    ...layout,
    template: {
      ...layout.template,
      photoSlots: newSlots,
    },
  };
};
```

**Remove Slot Algorithm**:
```typescript
const removePhotoSlot = (layout: PageLayout, slotIdToRemove?: string): PageLayout => {
  let slots = layout.template.photoSlots;

  // Determine which slot to remove
  if (slotIdToRemove) {
    slots = slots.filter(s => s.id !== slotIdToRemove);
  } else {
    // Remove last slot by default
    slots = slots.slice(0, -1);
  }

  // Redistribute using same algorithm as addPhotoSlot
  const newSlotCount = slots.length;
  const columns = Math.ceil(Math.sqrt(newSlotCount));
  const rows = Math.ceil(newSlotCount / columns);

  // ... (same calculation as addPhotoSlot)

  return {
    ...layout,
    template: {
      ...layout.template,
      photoSlots: newSlots,
    },
  };
};
```

**Shuffle Slots Algorithm**:
```typescript
const shufflePhotoSlots = (layout: PageLayout): PageLayout => {
  const slots = layout.template.photoSlots;

  // Extract positions
  const positions = slots.map(s => ({ x: s.x, y: s.y }));

  // Shuffle positions using Fisher-Yates
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }

  // Reassign positions to slots
  const shuffledSlots = slots.map((slot, i) => ({
    ...slot,
    x: positions[i].x,
    y: positions[i].y,
  }));

  return {
    ...layout,
    template: {
      ...layout.template,
      photoSlots: shuffledSlots,
    },
  };
};
```

---

### 7.4 Layer Order Management

**Z-Index Recalculation**:
```typescript
const reorderElement = (
  elements: PageElement[],
  elementId: string,
  direction: 'forward' | 'backward' | 'front' | 'back'
): PageElement[] => {
  const sortedElements = [...elements].sort((a, b) => a.zIndex - b.zIndex);
  const elementIndex = sortedElements.findIndex(e => e.id === elementId);
  const element = sortedElements[elementIndex];

  switch (direction) {
    case 'front':
      element.zIndex = Math.max(...sortedElements.map(e => e.zIndex)) + 1;
      break;
    case 'back':
      element.zIndex = Math.min(...sortedElements.map(e => e.zIndex)) - 1;
      break;
    case 'forward':
      if (elementIndex < sortedElements.length - 1) {
        const nextElement = sortedElements[elementIndex + 1];
        [element.zIndex, nextElement.zIndex] = [nextElement.zIndex, element.zIndex];
      }
      break;
    case 'backward':
      if (elementIndex > 0) {
        const prevElement = sortedElements[elementIndex - 1];
        [element.zIndex, prevElement.zIndex] = [prevElement.zIndex, element.zIndex];
      }
      break;
  }

  // Normalize zIndex (ensure sequential starting from 0)
  return sortedElements
    .sort((a, b) => a.zIndex - b.zIndex)
    .map((e, i) => ({ ...e, zIndex: i }));
};
```

---

## 8. Testing Considerations

### 8.1 New Test Cases

**Photo Quality Warning**:
- [ ] Upload high-res photo (>= 1920x1280) → no warning
- [ ] Upload low-res photo (< 1920x1280) → warning badge appears
- [ ] Hover over warning badge → tooltip displays correct message
- [ ] Quality score calculation matches expected value

**Text Defaults**:
- [ ] Add text → defaults to "Londrina Solid", 60.6px, black, weight 900
- [ ] Text is immediately editable after creation
- [ ] Custom formatting overrides defaults correctly

**Photo Toolbar**:
- [ ] Select photo → PhotoToolbar appears
- [ ] Zoom in/out → photo scales correctly (min 0.5, max 3.0)
- [ ] Fit → photo fits within slot boundaries
- [ ] Rotate left/right → photo rotates 90° increments
- [ ] Flip → photo mirrors horizontally
- [ ] Add frame → frame appears with selected color/width
- [ ] Change layer order → zIndex updates, render order changes
- [ ] Add effect → CSS filter or canvas effect applies
- [ ] Remove photo → photo removed, slot becomes empty

**Layout Management**:
- [ ] Click "-" → one slot removed, remaining slots redistributed
- [ ] Click "+" → one slot added, all slots resized to fit
- [ ] Click shuffle → slots reposition randomly, photo count unchanged
- [ ] Disable "-" when minSlots reached
- [ ] Disable "+" when maxSlots reached
- [ ] Photos in removed slot move to SourcePhotosPanel

**Spread View**:
- [ ] Select page → spread view opens with correct page pair
- [ ] Navigate next/prev → correct spreads load
- [ ] Back button → returns to AllPagesView
- [ ] Page indicator displays correct label ("Page 4-5", "Cover")
- [ ] Non-editable pages show lock icon, editing disabled
- [ ] Edit one page, navigate away → changes auto-saved

**Shape Picker**:
- [ ] Click "Add Shapes" → picker opens with tabs
- [ ] Select shape from each category → shape inserted at center
- [ ] ShapeToolbar appears with correct controls
- [ ] Border, fill color, layer order work as expected

**Sticker Drag-Drop**:
- [ ] Drag sticker from panel → preview follows cursor
- [ ] Drop on canvas → sticker placed at correct position
- [ ] StickerToolbar appears with flip, resize, layer controls
- [ ] Click-to-place mode works as alternative

**Top Toolbar**:
- [ ] Undo/Redo buttons disabled when unavailable
- [ ] Undo → reverts last change
- [ ] Redo → reapplies change
- [ ] Auto-save indicator shows correct status
- [ ] Preview opens full-screen view
- [ ] Order validates photobook before proceeding

**Page Limits**:
- [ ] Add Page disabled when 20 pages reached
- [ ] Tooltip explains limit
- [ ] Cannot exceed 20 pages through any action

**Non-Editable Pages**:
- [ ] Back-of-cover pages show lock icon
- [ ] Editing tools disabled on non-editable pages
- [ ] Drag-drop to non-editable page rejected

---

## 9. Migration Path

### 9.1 Backward Compatibility

**Existing Photobooks** (v1.0 format):
- Add default values for new fields when loading:
  ```typescript
  const migratePhotoBookV1toV2 = (photoBook: PhotoBookV1): PhotoBookV2 => {
    return {
      ...photoBook,
      config: {
        ...photoBook.config,
        maxPages: 20,
        editablePageTypes: ['cover', 'content'],
        viewMode: 'spread',
      },
      pages: photoBook.pages.map(page => ({
        ...page,
        isEditable: page.type !== 'back-of-cover',
        spreadPair: calculateSpreadPair(page),
        elements: page.elements.map(element => {
          if (element.type === 'photo') {
            return {
              ...element,
              transform: element.transform || { zoom: 1, fit: 'fill', rotation: 0, flipHorizontal: false, flipVertical: false },
              frame: element.frame || { enabled: false, color: '#000000', width: 5, style: 'solid' },
              effect: element.effect || { type: 'none', intensity: 0 },
            };
          }
          if (element.type === 'shape') {
            return {
              ...element,
              shapeCategory: 'basic', // Default to basic
              border: element.border || { enabled: false, color: '#000000', width: 2, style: 'solid' },
            };
          }
          if (element.type === 'sticker') {
            return {
              ...element,
              flipHorizontal: element.flipHorizontal || false,
              flipVertical: element.flipVertical || false,
            };
          }
          return element;
        }),
      })),
    };
  };
  ```

**Photos**:
- Calculate `qualityScore` on first load
- Add `qualityWarning` and `qualityMessage` if applicable

---

## 10. Open Questions

1. **Auto-Layout Redistribution**: When adding/removing slots, should we:
   - Always use grid layout? OR
   - Try to preserve existing slot aspect ratios?

2. **Photo Quality Threshold**: Should we:
   - Block order if too many low-quality photos? OR
   - Just warn and allow user to proceed?

3. **Sticker Library**: Where do stickers come from?
   - Predefined asset library (bundled with app)?
   - API fetch from server?
   - User upload capability?

4. **Spread View Persistence**: Should the editor:
   - Remember last viewed spread when reopening photobook? OR
   - Always start with AllPagesView?

5. **Non-Editable Pages Content**: Should back-of-cover pages:
   - Be completely blank (no customization)? OR
   - Allow background color/pattern (but no elements)?

6. **Frame Style Limits**: Should we:
   - Support only solid borders for v2? OR
   - Implement all border styles (dashed, dotted, double)?

7. **Photo Effects Implementation**: Should effects be:
   - Pure CSS filters (fast, limited options)? OR
   - Canvas-based (slower, more control)?

8. **Undo/Redo Granularity**: Should we record:
   - Every individual change (high memory)? OR
   - Debounced snapshots (e.g., after 1 second of inactivity)?

---

## 11. Success Criteria (v2.0)

The v2.0 enhancements are considered complete when:

1. **All 11 requirements implemented** and tested
2. **Backward compatibility** maintained with v1.0 photobooks
3. **Photo quality warnings** appear correctly and don't block usage
4. **Spread view** works seamlessly with navigation
5. **Dynamic layouts** (add/remove/shuffle) redistribute slots correctly
6. **Photo editing tools** (zoom, rotate, flip, frame, effects) work reliably
7. **Shape picker** consolidates all shape types with category navigation
8. **Sticker drag-drop** supports both drag and click-to-place modes
9. **Top toolbar** provides undo/redo/save/preview/order actions
10. **Page limits** (20 max) and **non-editable pages** enforced
11. **Performance**: No degradation with 20 pages, 100+ photos
12. **Test coverage**: > 85% for new code
13. **Visual polish**: All UI components match design specifications
14. **Accessibility**: WCAG AA maintained for all new components

---

## 12. Implementation Phases (v2.0)

### Phase 1: Data Models & Quality Detection (Week 1)
- Extend data models (Photo, PhotoElement, ShapeElement, etc.)
- Implement photo quality scoring algorithm
- Add QualityWarningBadge component
- Update text defaults to new specifications

### Phase 2: Spread View & Navigation (Week 2-3)
- Create SpreadView component
- Implement spread pairing logic
- Add PageNavigationControls
- Add BackButton and AllPagesView integration
- Implement page edit restrictions (non-editable pages)

### Phase 3: Photo Editing Tools (Week 3-4)
- Create PhotoToolbar component
- Implement zoom, fit, rotate, flip actions
- Add frame picker and styling
- Implement photo effects (CSS or canvas-based)
- Add layer order controls

### Phase 4: Layout Enhancements (Week 4-5)
- Extend LayoutPicker with add/remove/shuffle controls
- Implement dynamic slot redistribution algorithm
- Add visual feedback for layout changes
- Test with various slot counts (1-9)

### Phase 5: Shape & Sticker Enhancements (Week 5-6)
- Redesign shape system with categories
- Create ShapePicker with tabbed interface
- Enhance StickerPanel with drag-drop
- Add flip controls to StickerToolbar
- Implement layer order for shapes and stickers

### Phase 6: Top Toolbar & Global Actions (Week 6-7)
- Create TopToolbar component
- Integrate undo/redo with existing history system
- Implement auto-save indicator and logic
- Create Preview modal (full-screen photobook view)
- Add Order button with validation

### Phase 7: Polish & Constraints (Week 7-8)
- Enforce 20-page limit
- Add visual polish (icons, tooltips, animations)
- Implement all edge case handling
- Optimize performance (virtualization, memoization)
- Accessibility audit and fixes

### Phase 8: Testing & Documentation (Week 8-9)
- Write unit tests for new components and utilities
- Integration tests for flows (spread navigation, layout changes)
- E2E tests for complete v2.0 workflows
- Update API documentation
- Create migration guide for v1.0 → v2.0

---

## Document Control

- **Version**: 2.0
- **Created**: 2026-02-03
- **Last Updated**: 2026-02-03
- **Status**: Draft for Review
- **Depends On**: SPECIFICATION.md v1.0
- **Next Review**: After technical feasibility validation

---

**End of Specification v2.0**
