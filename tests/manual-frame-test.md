# Manual Frame Test for PhotoBook Studio

## Prerequisites
- Development server running on http://localhost:3000
- PhotoBook with at least one photo element on canvas

## Test Steps

### 1. Enable Basic Frame
1. Navigate to PhotoBook Studio and create a photobook with photos
2. Click on a photo element to select it
3. **PhotoToolbar** should appear with frame icon (picture frame icon)
4. Click the **frame icon** in the toolbar
5. **Frame picker panel** should appear

6. Check **"Enable Frame"** checkbox
7. **Expected Result**:
   - Red/default colored frame should appear around the photo
   - Frame should be 5px wide (default)
   - Frame should be solid style (default)

### 2. Test Frame Color
1. With frame enabled, click on the **Frame Color** input
2. Select different colors (blue, green, yellow, etc.)
3. **Expected Result**:
   - Frame color should change instantly to the selected color
   - Frame should remain same width and style

### 3. Test Frame Width
1. Adjust the **Width slider** from 1px to 20px
2. Try values: 1px, 5px, 10px, 15px, 20px
3. **Expected Result**:
   - Frame thickness should change smoothly
   - Frame should remain same color and style
   - Width label should update (e.g., "Width: 10px")

### 4. Test Frame Styles

**A. Solid Style**
1. Select **"Solid"** from Style dropdown
2. **Expected**: Continuous solid line around photo

**B. Dashed Style**
1. Select **"Dashed"** from Style dropdown
2. **Expected**:
   - Long dashes with short gaps
   - Dash length should scale with width (wider = longer dashes)

**C. Dotted Style**
1. Select **"Dotted"** from Style dropdown
2. **Expected**:
   - Equal dots and gaps
   - Dot size should match width setting

**D. Double Style**
1. Select **"Double"** from Style dropdown
2. **Expected**:
   - Two parallel frames (inner and outer)
   - Both frames should have same color
   - Gap between frames should scale with width

### 5. Test Frame with Transforms

**A. Frame with Rotation**
1. Enable frame on a photo
2. Rotate the photo using rotation handles
3. **Expected**: Frame should rotate with the photo

**B. Frame with Resize**
1. Enable frame on a photo
2. Resize the photo using corner handles
3. **Expected**: Frame should scale proportionally with photo

**C. Frame with Zoom**
1. Enable frame on a photo
2. Use zoom in/out buttons
3. **Expected**:
   - Frame should remain same size (fixed border)
   - Photo zooms inside the frame
   - Frame does NOT zoom with photo content

### 6. Test Frame Disable/Enable Toggle
1. Enable frame with custom settings (color, width, style)
2. **Uncheck** "Enable Frame" checkbox
3. **Expected**: Frame disappears from photo
4. **Re-check** "Enable Frame" checkbox
5. **Expected**:
   - Frame reappears with same settings
   - Color, width, and style are preserved

### 7. Test Frame Persistence
1. Add frame to Photo A with specific settings
2. Click on Photo B (different photo)
3. Add different frame to Photo B
4. Click back on Photo A
5. **Expected**:
   - Photo A should still have its original frame settings
   - Frame settings are per-element, not global

### 8. Test Frame with Multiple Elements
1. Add frames to multiple photos on same page
2. Try different colors/widths/styles for each
3. **Expected**:
   - Each photo maintains its own frame independently
   - No interference between frames

### 9. Test Frame with Undo/Redo
1. Enable frame on a photo
2. Click **Undo** (Cmd/Ctrl+Z)
3. **Expected**: Frame should disappear
4. Click **Redo** (Cmd/Ctrl+Shift+Z)
5. **Expected**: Frame should reappear with same settings

### 10. Test Frame with Different Photo Sizes
1. Add frames to:
   - Small photos (10% page width)
   - Medium photos (30% page width)
   - Large photos (60% page width)
2. Use same frame width (e.g., 10px) for all
3. **Expected**:
   - Frame width should be same absolute size for all photos
   - Frame should look proportionally thinner on larger photos
   - No distortion or gaps

## Success Criteria

✅ Frame appears when "Enable Frame" is checked
✅ Frame color changes work instantly
✅ Frame width slider works (1-20px range)
✅ All 4 frame styles render correctly (solid, dashed, dotted, double)
✅ Frame rotates with photo
✅ Frame scales with photo resize
✅ Frame stays fixed size during photo zoom
✅ Frame settings persist per element
✅ Frame can be toggled on/off without losing settings
✅ Frame works with undo/redo
✅ Frame renders correctly on photos of all sizes

## Visual Verification

Expected frame appearances:

**Solid Frame (10px, red)**
```
┌──────────────────┐
│                  │
│      PHOTO       │
│                  │
└──────────────────┘
```

**Dashed Frame (10px, blue)**
```
┌─ ─ ─ ─ ─ ─ ─ ─ ─┐

│      PHOTO       │

└─ ─ ─ ─ ─ ─ ─ ─ ─┘
```

**Dotted Frame (10px, green)**
```
┌ · · · · · · · · ┐

·      PHOTO       ·

└ · · · · · · · · ┘
```

**Double Frame (10px, purple)**
```
┌══════════════════┐
║┌────────────────┐║
║│                ││║
║│      PHOTO     ││║
║│                ││║
║└────────────────┘║
└══════════════════┘
```

## Known Issues / Limitations

- Frame is rendered as overlay (on top of photo)
- Frame width is in pixels, not percentage
- Double frame spacing is fixed at 2x width
- Frame does not support gradients (solid color only)

## Debugging Tips

If frame doesn't appear:
1. Check browser console for errors
2. Verify `element.frame` object exists and has `enabled: true`
3. Check PhotoElementRenderer is receiving updated element props
4. Verify Rect components are being rendered (inspect React DevTools)
5. Check z-index/layer order (frame should be on top)
