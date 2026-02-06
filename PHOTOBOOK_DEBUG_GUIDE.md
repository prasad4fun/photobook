# Photobook Editor - Debugging Guide

## Changes Made

### 1. Usage Count Badges ✅
**Fixed to match Pixory reference image**
- Changed badges to always show when image is used (previously only showed for count > 1)
- Moved badge to bottom-right corner (matching Pixory)
- Changed to square shape with border (matching Pixory)

**File**: `src/components/photobook/PhotobookLeftSidebar.tsx` (line 192-197)

### 2. Added Console Debugging 🔍
**To help identify runtime issues:**

#### Image Click Handler (`PhotobookEditorScreen.tsx`)
- Logs when image is clicked
- Shows selected tool state
- Tracks element count before/after adding
- Confirms state update success

#### Canvas Rendering (`PhotobookCanvas.tsx`)
- Logs number of elements being rendered
- Shows page offset position
- Helps identify if elements are reaching the canvas

## Testing Steps

### Open Browser Console
1. Open http://localhost:3001 in Chrome
2. Press `F12` or `Cmd+Option+I` to open DevTools
3. Go to Console tab

### Test Image Clicking
1. Navigate to photobook editor (upload images → theme preview → click 📖)
2. Click an image from the left sidebar
3. **Expected console output:**
   ```
   📸 Image clicked: [image-name] Tool: null
   🖼️  Created image element: [id] at [x] [y]
   📊 Elements on page: 0 → 1
   ✅ Image added to state successfully
   🎨 Rendering 1 elements at offset [number]
   ```

4. **If you see all these logs but NO image on canvas:**
   - Issue is in Konva rendering (likely image loading)
   - Check for errors in Red in console

5. **If you DON'T see the logs:**
   - Image click handler not firing
   - Check if button is clickable (not covered by overlay)

### Test Smart Creation
1. Click "Smart Creation" button
2. Click "Yes" in confirmation dialog
3. **Expected:** Alert showing "X spreads generated"
4. **Check console** for rendering logs showing multiple elements

### Test Element Tools
1. Click "Text" tool (T icon)
2. Click on canvas
3. **Expected console:** Logs showing element creation
4. **Check:** Does text element appear on canvas?

## Common Issues & Solutions

### Issue 1: Images Click But Don't Appear on Canvas
**Possible causes:**
1. **Image loading fails** - Check for CORS errors in console (red text)
2. **Coordinates out of bounds** - Elements rendered outside visible area
3. **Z-index issues** - Elements behind background
4. **Konva not re-rendering** - State updated but canvas not refreshing

**Solutions:**
- Check console for red errors
- Look for "🎨 Rendering X elements" - if X > 0 but nothing visible, it's a rendering issue
- Check Network tab - are images loading? (Status 200)

### Issue 2: "⚠️ Image click ignored - wrong tool selected"
**Cause:** A tool is selected that prevents image adding

**Solution:**
- Click an empty area of canvas to deselect tools
- OR click the "Photo" tool first
- OR set `selectedTool: null` as default

### Issue 3: Elements Added But Not Visible
**Debugging steps:**
1. Check console for "🎨 Rendering X elements" where X > 0
2. If rendering but not visible:
   - Zoom out to check if element is off-screen
   - Check element opacity (should be 100, not 0)
   - Check element visibility flag
   - Use React DevTools to inspect element state

### Issue 4: Transformer Not Showing
**Cause:** Transformer attachment issue

**Check:**
- Are elements selectable? (click them - do they respond?)
- Does console show selection events?
- Check if `selectedElementIds` array is populated

## Browser Console Commands

### Inspect Current State
```javascript
// In console, type:
window.__PHOTOBOOK_DEBUG__ = editorState;  // Add this to useEffect in PhotobookEditorScreen
```

### Force Re-render
```javascript
// Trigger a zoom change to force canvas re-render
// (Use zoom controls in UI)
```

### Check Konva Layers
```javascript
// In console:
document.querySelector('canvas')  // Should find the canvas
```

## Next Steps if Still Not Working

### Playwright Automated Test
Run the comprehensive test:
```bash
node test-photobook.js
```

This will:
- Navigate through the full flow
- Test all interactions
- Take screenshots at each step
- Report what's working/not working

### Manual Checklist
- [ ] Images appear in left sidebar with correct thumbnails
- [ ] Usage count badges show on used images
- [ ] Clicking image shows console logs
- [ ] Canvas renders (white/cream spread background visible)
- [ ] Clicking canvas tools shows console logs
- [ ] Smart Creation populates spreads
- [ ] Page thumbnails at bottom show spreads
- [ ] Zoom controls work
- [ ] Undo/Redo buttons become enabled after actions

## Files Modified

1. `src/components/photobook/PhotobookLeftSidebar.tsx`
   - Usage badge styling and visibility

2. `src/components/photobook/PhotobookEditorScreen.tsx`
   - Added console logging in `handleImageClick()`

3. `src/components/photobook/PhotobookCanvas.tsx`
   - Added console logging in `renderPageElements()`

## Expected Console Output (Clean Run)

```
🎨 Rendering 0 elements at offset 0
🎨 Rendering 0 elements at offset 1240
📸 Image clicked: image1.jpg Tool: null
🖼️  Created image element: img_12345 at 220 1454
📊 Elements on page: 0 → 1
✅ Image added to state successfully
🎨 Rendering 0 elements at offset 0
🎨 Rendering 1 elements at offset 1240
```

No red errors should appear. If you see errors, that's the root cause!
