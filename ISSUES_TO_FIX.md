# Photobook Editor Issues Based on Pixory Reference

## Critical Issues to Fix

### 1. **Image Usage Count Badges Missing**
**What Pixory has:** Small "1" badges on each image thumbnail showing usage count
**What we need:** Update `PhotobookLeftSidebar.tsx` to display usage count badges on thumbnails

### 2. **Element Toolbar Position**
**What Pixory has:** Element toolbar (Text, Photo, Layout, Rectangle, Ellipse) on the LEFT side of the canvas
**What we have:** Element toolbar might be in the wrong position or not visible

### 3. **Canvas Image Rendering**
**What Pixory has:** Images actually rendered and visible on the canvas pages
**Potential issue:** Images may not be loading/displaying due to:
- Base64 data handling issues
- Konva Image component not receiving proper data
- CrossOrigin issues with image loading

### 4. **Transformer Not Attaching**
**Potential issue:** Selected elements may not show resize/rotate handles
**Fix needed:** Ensure transformer attaches to selected nodes properly

### 5. **View Mode Toggle**
**What Pixory has:** "One page" and "All pages" toggle buttons at bottom
**Check:** Verify this is implemented and working

### 6. **Page Thumbnails**
**What Pixory has:** Clear thumbnails showing actual spread content with labels (Cover, Page 1, Page 2-3, etc.)
**Check:** Verify thumbnails are rendering actual spread content, not just placeholders

### 7. **Hide Page Thumbnails Toggle**
**What Pixory has:** "Hide page thumbnails" toggle button
**Check:** Verify this is implemented

### 8. **Add Pages Functionality**
**What Pixory has:** "Add Pages" button that opens and can duplicate/remove
**Check:** Verify all page management functions work

### 9. **Smart Creation Results**
**Potential issue:** Smart Creation may not be populating images correctly
**Fix needed:** Verify images are actually placed on pages after Smart Creation

### 10. **Image Click to Add**
**What Pixory has:** Clicking an image in sidebar adds it to the current page
**Potential issue:** Images may not be appearing after click due to:
- State update issues
- Coordinate calculation problems
- Canvas not re-rendering

## Testing Checklist

- [ ] Click "Smart Creation" - does it populate spreads with images?
- [ ] Click an image from sidebar - does it appear on canvas?
- [ ] Click an image on canvas - does transformer show with handles?
- [ ] Drag an image on canvas - does it move?
- [ ] Resize an image - does it resize properly?
- [ ] Click Text tool, then click canvas - does text element appear?
- [ ] Click Rectangle tool, then click canvas - does rectangle appear?
- [ ] View usage count on thumbnails - are badges showing?
- [ ] Navigate between spreads - does it work?
- [ ] Zoom in/out - does canvas scale properly?

## Priority Fixes (Implement in Order)

### P0 - Blocking Issues
1. Images not appearing on canvas after click
2. Smart Creation not populating images
3. Elements not selectable/manipulatable

### P1 - Major UX Issues
4. Usage count badges missing
5. Transformer not showing on selection
6. Tools not working (Text, Rectangle, Ellipse)

### P2 - Polish
7. View mode toggle
8. Page thumbnail rendering
9. Zoom controls refinement
