# Photobook Editor - Testing Guide

## 🚀 Quick Start

### 1. Launch the Application

```bash
npm start
```

### 2. Navigate to Photobook Editor

**Path:** Landing → Upload → Analysis → Theme Preview → **Photobook Editor (📖 button)**

1. Click "Start Photo Experience"
2. Upload 2-30 images (JPEG or PNG)
3. Wait for AI analysis (mock: instant)
4. On Theme Preview screen, click the **📖 book icon** next to any theme
5. Photobook editor launches!

## 🧪 Feature Testing Checklist

### Z1: Top Toolbar

- [ ] **Undo Button** - Click or press Cmd+Z (should be disabled initially)
- [ ] **Redo Button** - Click or press Cmd+Shift+Z (should be disabled initially)
- [ ] **History Button** - Shows edit history modal
- [ ] **Project Dropdown** - Shows project menu (Rename, Duplicate, Export, Delete)
- [ ] **Video Tutorial** - Opens tutorial video
- [ ] **Save Button** - States:
  - [ ] "Save" (violet) when changes exist
  - [ ] "Saving..." (violet, loading spinner) during save
  - [ ] "Saved" (gray, checkmark) when clean
- [ ] **Preview Button** - Shows full-screen preview
- [ ] **Order Button** - Navigates to confirmation screen
- [ ] **Autosave Indicator** - Shows "Last saved: X minutes ago"

### Z2: Left Sidebar

#### Images Tab
- [ ] **Smart Creation Button** - Click to auto-generate layout
  - [ ] Confirmation dialog appears
  - [ ] Loading state (5-10s with real AI)
  - [ ] Success alert shows spread count + reasoning
  - [ ] Spreads populated with images
- [ ] **Autofill Button** - Click to auto-populate empty slots
  - [ ] Confirmation dialog appears
  - [ ] Success alert shows stats (X images placed, Y spreads updated)
- [ ] **Image Counter** - Shows "X used photos / Y all"
- [ ] **Search Bar** - Type to filter images
- [ ] **Sort Dropdown** - Change to "Latest added" or "Name (A-Z)"
- [ ] **Hide Used Toggle** - Click to hide used images
- [ ] **Image Grid** - Click image to add to canvas
  - [ ] Checkmark on used images
  - [ ] Usage count badge (2×, 3×, etc.)
  - [ ] Hover shows image name

#### Layouts Tab
- [ ] Layout presets display
- [ ] Click to apply layout to current spread

#### Backgrounds Tab
- [ ] Background colors display
- [ ] Click to change page background

#### Stickers Tab
- [ ] Sticker grid displays
- [ ] Click to add sticker to canvas

### Z3: Element Toolbar

- [ ] **Text Tool (T)** - Click tool, then click canvas to add text
  - [ ] Text appears at click position
  - [ ] Tool deselects after use
  - [ ] Keyboard shortcut: Press "T"
- [ ] **Photo Tool (P)** - Select tool, click image from sidebar
- [ ] **Layout Tool (L)** - Select to apply layout preset
- [ ] **Rectangle Tool (R)** - Click tool, then click canvas
  - [ ] Rectangle appears at click position
  - [ ] Keyboard shortcut: Press "R"
- [ ] **Ellipse Tool (E)** - Click tool, then click canvas
  - [ ] Ellipse appears at click position
  - [ ] Keyboard shortcut: Press "E"
- [ ] **Tooltips** - Hover to see tool name + shortcut

### Z4: Canvas Area

#### View Controls
- [ ] **One Page Toggle** - Shows single page view
- [ ] **All Pages Toggle** - Shows all spreads in grid
- [ ] **Zoom Out** - Decreases zoom (min 25%)
- [ ] **Zoom Dropdown** - Select 25%, 50%, 75%, 100%, 125%, 150%, 200%
- [ ] **Zoom In** - Increases zoom (max 200%)
- [ ] **Fit to Screen** - Resets to 100%

#### Spread Display
- [ ] **White spread background** - Two pages side-by-side
- [ ] **Center spine** - Gray line dividing pages
- [ ] **Bleed guides** (zoom ≥ 75%) - Red dashed lines (3mm from edges)
- [ ] **Safe zone guides** (zoom ≥ 100%) - Blue dashed lines (6mm from edges)
- [ ] **Guide legend** - Shows explanation of guides
- [ ] **Spread label** - Shows "Cover" or "Pages X-Y"

#### Element Interaction
- [ ] **Click element** - Selects element (violet outline)
- [ ] **Cmd+Click element** - Multi-select (adds to selection)
- [ ] **Drag element** - Moves element
- [ ] **Resize handles** - Drag corner handles to resize
- [ ] **Rotation handle** - Drag to rotate element
- [ ] **Click empty area** - Deselects all
- [ ] **Transformer** - Shows on selected elements

#### Element Types
- [ ] **Image Elements** - Display from assets
  - [ ] Loads from base64 preview
  - [ ] Shows placeholder while loading
  - [ ] Respects opacity, rotation, flip
- [ ] **Text Elements** - Display with correct font
  - [ ] Double-click to edit (console log for now)
  - [ ] Shows dashed outline when selected
- [ ] **Shape Elements** - Rectangles and ellipses
  - [ ] Fill and stroke colors
  - [ ] Border radius for rectangles

### Z5: Page Thumbnails

#### Thumbnail Display
- [ ] **Spread thumbnails** - Horizontal scrollable list
- [ ] **Current spread highlight** - Violet ring around active spread
- [ ] **Spread labels** - "Cover", "Page 2-3", "Page 4-5"
- [ ] **Lock indicators** - Amber lock icon on locked spreads
- [ ] **Spread count** - Shows "X spreads"

#### Actions
- [ ] **Click thumbnail** - Navigates to that spread
- [ ] **Add Pages Button** - Creates new blank spread
- [ ] **Duplicate Button** - Copies current spread
- [ ] **Remove Button** - Deletes spread (disabled for last spread)
- [ ] **Hover Actions Menu** - Appears on hover
  - [ ] Lock/Unlock toggle
  - [ ] Duplicate button
  - [ ] Remove button (red)
- [ ] **Add Spread Button** - At end of list, adds new spread

## 🎨 Smart Creation Testing

### Test Scenario 1: Basic Smart Creation

1. Upload 10 diverse images
2. Navigate to photobook editor
3. Click "Smart Creation" in sidebar
4. **Expected:**
   - Confirmation dialog
   - Loading state (mock: 1-2 seconds)
   - Alert: "Smart Creation complete! Generated X spreads..."
   - Spreads populated with images
   - Cover uses first/hero image
   - Content spreads use remaining images
   - Mix of single and collage layouts

### Test Scenario 2: Smart Creation with Theme

1. Select "Warm Family Portrait" theme
2. Open photobook editor
3. Click "Smart Creation"
4. **Expected:**
   - Background color matches theme (#f8f4f0)
   - Layouts optimized for family photos
   - Images distributed evenly

## 🎯 Autofill Testing

### Test Scenario 1: Basic Autofill

1. Create 3 blank spreads manually (Add Pages button)
2. Upload 5 images
3. Click "Autofill" in sidebar
4. **Expected:**
   - Confirmation dialog
   - Alert: "Autofill complete! 5 images placed, 3 spreads updated, 1 empty slot remaining"
   - Images appear in empty spreads
   - Usage counter updates ("5 used photos / 5 all")

### Test Scenario 2: Autofill with "Hide Used" Filter

1. Use Smart Creation to populate spreads
2. Upload 5 more images
3. Enable "Hide used" toggle
4. Click "Autofill"
5. **Expected:**
   - Only new images are used
   - Used images remain hidden in sidebar

## ⌨️ Keyboard Shortcut Testing

- [ ] **Cmd+Z** - Undo last action
- [ ] **Cmd+Shift+Z** - Redo last undone action
- [ ] **Cmd+S** - Save project
- [ ] **T** - Select Text tool
- [ ] **P** - Select Photo tool
- [ ] **L** - Select Layout tool
- [ ] **R** - Select Rectangle tool
- [ ] **E** - Select Ellipse tool

## 🐛 Known Limitations (TODO)

### Not Yet Implemented
1. **Text Editing** - Double-click to edit shows console log, no inline editing yet
2. **Image Cropping** - No crop UI yet
3. **Image Filters** - Brightness/contrast sliders not connected yet
4. **Layout Preset Library** - Only mock data, needs real presets
5. **Background Assets** - Only 2 mock backgrounds (white, cream)
6. **Sticker Assets** - Empty array, no stickers yet
7. **Project Persistence** - Save only mocks delay, doesn't persist to backend
8. **Real AI Analysis** - Smart Creation uses mock logic if REACT_APP_USE_MOCK_API=true
9. **PDF Export** - Not yet integrated with spread-based layout
10. **Element Properties Panel** - No right sidebar for element properties yet

### Edge Cases to Test
- [ ] Delete last spread (should be disabled)
- [ ] Undo beyond initial state (should be disabled)
- [ ] Add 100+ images (performance test)
- [ ] Zoom to 200% with complex spread (rendering performance)
- [ ] Multi-select 10+ elements (transformer performance)
- [ ] Save with 50+ spreads (serialization size)

## 📊 Performance Benchmarks

### Target Performance
- Canvas rendering: **60 FPS** at 100% zoom
- Smart Creation: **< 10 seconds** for 20 images
- Autofill: **< 2 seconds** for 20 spreads
- Project save: **< 1 second**
- Element manipulation: **< 16ms** per operation (60 FPS)

### How to Test Performance

1. Open Chrome DevTools → Performance tab
2. Record interaction (e.g., dragging element)
3. Check for frame drops (should be smooth 60 FPS)
4. Check console for React warnings

## 🔧 Developer Testing

### Inspect State in Console

```javascript
// In browser console (when on photobook editor screen)
window.__PHOTOBOOK_STATE__ = editorState; // Add this to PhotobookEditorScreen useEffect
console.log(window.__PHOTOBOOK_STATE__);
```

### Test with Mock API

```bash
# In .env.local
REACT_APP_USE_MOCK_API=true
```

### Test with Real AI

```bash
# In .env.local
REACT_APP_USE_MOCK_API=false
REACT_APP_AZURE_ENDPOINT=https://midas.ai.bosch.com
REACT_APP_AZURE_API_KEY=your_key_here
REACT_APP_GPT_DEPLOYMENT=GPT 4o
```

## ✅ Integration Verification

### Complete User Flow

1. **Landing** → Click "Start Photo Experience"
2. **Upload** → Upload 10 images
3. **Analysis** → Wait for AI analysis
4. **Theme Preview** → Click 📖 on "Warm Family Portrait"
5. **Photobook Editor** → Verify all 5 zones render correctly
6. **Smart Creation** → Click, verify spreads generated
7. **Add Elements** →
   - Click Text tool (T), click canvas → text appears
   - Click Rectangle tool (R), click canvas → shape appears
   - Click image in sidebar → image appears centered
8. **Manipulate Elements** →
   - Drag image → moves
   - Resize image → scales
   - Rotate image → rotates
   - Undo (Cmd+Z) → reverts
   - Redo (Cmd+Shift+Z) → reapplies
9. **Navigate Spreads** →
   - Click thumbnail → switches spread
   - Add spread → new blank spread appears
   - Duplicate spread → copy appears
10. **Order** → Click Order button → navigates to confirmation

### Expected Result

All features work smoothly, no console errors, state persists across navigation.

## 🎯 Next Phase Priorities

After verifying basic functionality:

1. **Inline Text Editing** - Double-click text to edit in place
2. **Element Properties Panel** - Right sidebar with position, size, opacity sliders
3. **Image Crop Tool** - Crop mode UI with handles
4. **Layout Preset Library** - 20+ professional templates
5. **Drag from Sidebar** - Drag image from sidebar onto canvas (instead of click)
6. **Smart Guidelines** - Show alignment guides when dragging
7. **Context Menu** - Right-click element for Delete, Duplicate, Bring Forward, etc.
8. **PDF Export for Spreads** - Extend pdfExportService to render spreads
9. **Backend Integration** - Save/load projects from Azure Blob or FastAPI
10. **Mobile Responsive** - Touch-friendly controls

---

**Status:** Core functionality complete! ✅
**Ready for:** User testing and feedback
**Estimated time to production:** 2-3 weeks for polish + remaining features
