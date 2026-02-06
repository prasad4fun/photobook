# Manual Photo Effects Test for PhotoBook Studio

## Prerequisites
- Development server running on http://localhost:3000
- PhotoBook with at least one photo element on canvas
- Browser with good graphics performance (Chrome/Safari recommended)

## Test Steps

### 1. Access Effects Panel
1. Navigate to PhotoBook Studio and create a photobook with photos
2. Click on a photo element to select it
3. **PhotoToolbar** should appear above the canvas
4. Click the **"Add Effect"** or effects icon (sparkle/wand icon) in the toolbar
5. **Effects picker panel** should appear

### 2. Test Grayscale Effect
1. Select **"Grayscale"** from effect type dropdown
2. Set intensity to **50%** using slider
3. **Expected Result**:
   - Photo should appear partially desaturated (50% gray)
   - Color should fade to black and white
4. Increase intensity to **100%**
5. **Expected Result**:
   - Photo should be completely black and white
   - No color visible

### 3. Test Sepia Effect
1. Select **"Sepia"** from effect dropdown
2. Set intensity to **50%**
3. **Expected Result**:
   - Photo should have warm brown/vintage tones
   - Looks like an old photograph
4. Increase intensity to **100%**
5. **Expected Result**:
   - Strong sepia/brown tone
   - Classic vintage look

### 4. Test Vintage Effect
1. Select **"Vintage"** from effect dropdown
2. Set intensity to **70%**
3. **Expected Result**:
   - Combination of sepia tones + slight desaturation
   - Faded, aged photograph appearance
   - Slightly less saturated than sepia alone

### 5. Test Warm Effect
1. Select **"Warm"** from effect dropdown
2. Set intensity to **60%**
3. **Expected Result**:
   - Photo has warm, reddish-orange tones
   - Colors shift toward red/yellow spectrum
   - Appears "sunny" or "golden hour"
4. Try different intensities: 25%, 50%, 75%, 100%
5. **Expected**: Warmer tones increase with intensity

### 6. Test Cool Effect
1. Select **"Cool"** from effect dropdown
2. Set intensity to **60%**
3. **Expected Result**:
   - Photo has cool, bluish tones
   - Colors shift toward blue spectrum
   - Appears "cold" or "moonlight"
4. Try different intensities
5. **Expected**: Cooler tones increase with intensity

### 7. Test Blur Effect (If Available)
1. Select **"Blur"** from effect dropdown
2. Set intensity to **30%**
3. **Expected Result**:
   - Photo appears slightly out of focus
   - Soft, dream-like quality
4. Increase to **70%**
5. **Expected Result**:
   - Strong blur effect
   - Details become very soft

**Note**: Blur may impact performance on large images

### 8. Test Vignette Effect
1. Select **"Vignette"** from effect dropdown
2. Set intensity to **50%**
3. **Expected Result**:
   - Edges/corners of photo appear darker
   - Center remains bright
   - Classic portrait photography effect
4. Increase to **80%**
5. **Expected Result**:
   - Strong darkening at edges
   - Center spotlight effect

### 9. Test Effect Intensity Slider
1. Choose any effect (e.g., "Warm")
2. Slowly drag intensity slider from **0% → 100%**
3. **Expected Result**:
   - Effect should smoothly increase
   - At 0%: No visible effect
   - At 50%: Moderate effect
   - At 100%: Maximum effect strength
   - Changes should be instant/real-time

### 10. Test Effect with Other Transforms

**A. Effect + Zoom**
1. Apply "Sepia" effect at 70%
2. Use zoom in/out buttons
3. **Expected**: Effect stays applied during zoom

**B. Effect + Rotation**
1. Apply "Cool" effect at 60%
2. Rotate photo using handles
3. **Expected**: Effect rotates with photo

**C. Effect + Frame**
1. Apply "Vintage" effect at 50%
2. Enable frame with color
3. **Expected**: Both effect and frame are visible

**D. Effect + Flip**
1. Apply "Warm" effect at 40%
2. Flip photo horizontally
3. **Expected**: Effect flips with photo

### 11. Test Switching Between Effects
1. Apply "Grayscale" at 100%
2. Switch to "Sepia" (keep intensity at 100%)
3. **Expected**: Effect changes from grayscale to sepia
4. Switch to "Warm"
5. **Expected**: Effect changes to warm tones
6. Each effect should completely replace previous one

### 12. Test Effect Persistence
1. Apply "Cool" effect at 70% to Photo A
2. Click on Photo B (different photo)
3. Apply "Warm" effect at 50% to Photo B
4. Click back on Photo A
5. **Expected**:
   - Photo A still has Cool effect at 70%
   - Photo B still has Warm effect at 50%
   - Effects are per-element, not global

### 13. Test Removing Effect
1. Apply any effect at high intensity
2. Change effect type to **"None"**
3. **Expected**: Photo returns to original appearance
4. OR set intensity to **0%**
5. **Expected**: Effect disappears

### 14. Test Effect with Undo/Redo
1. Select photo with no effect
2. Apply "Vintage" at 80%
3. Click **Undo** (Cmd/Ctrl+Z)
4. **Expected**: Effect disappears
5. Click **Redo** (Cmd/Ctrl+Shift+Z)
6. **Expected**: Vintage effect reappears at 80%

### 15. Test Performance with Multiple Effects
1. Apply different effects to 5-10 photos on same page
2. Zoom in/out on canvas
3. Pan around the page
4. **Expected**:
   - All effects render correctly
   - No significant lag or stuttering
   - Canvas remains responsive

## Success Criteria

✅ All 7 effect types work (none, sepia, grayscale, vintage, warm, cool, vignette)
✅ Intensity slider controls effect strength (0-100%)
✅ Effects apply instantly when changed
✅ Effects work with zoom, rotation, flip, and frame
✅ Effects can be switched without residual from previous effect
✅ Effects persist per photo element
✅ Effect can be removed (set to "none" or 0% intensity)
✅ Effects work with undo/redo
✅ No performance issues with multiple effects on page

## Visual Reference

### Grayscale (100%)
- All colors removed
- Pure black and white
- High contrast

### Sepia (100%)
- Warm brown tones
- Vintage photograph look
- Classic old-timey feel

### Vintage (70%)
- Faded colors
- Slight sepia + desaturation
- Aged photo appearance

### Warm (80%)
- Reddish-orange tones
- Golden/sunny appearance
- Cozy, warm feeling

### Cool (80%)
- Bluish tones
- Cold/moonlight appearance
- Winter, icy feeling

### Vignette (70%)
- Dark edges/corners
- Bright center
- Portrait photography style

## Known Limitations

- Effects are applied to entire photo (no selective masking)
- Cannot combine multiple effects (only one at a time)
- Blur effect may impact performance on large images
- Some effects are approximations (not pixel-perfect filters)
- Effect rendering uses Konva filters (browser-dependent performance)

## Debugging Tips

If effects don't appear:

1. **Check Console**: Look for Konva filter errors
2. **Verify Element State**: Check `element.effect` object in React DevTools
3. **Check Filters**: Verify `filters` prop on Image component
4. **Check Caching**: Effects require image to be cached (cache() called)
5. **Try Refresh**: Some effects may need canvas redraw

**Console Check**:
```javascript
// In browser console, check if filters are being applied:
document.querySelector('canvas')
```

**React DevTools Check**:
- Find PhotoElementRenderer component
- Check props: `effect.type` and `effect.intensity`
- Verify `effectFilters` and `effectProperties` are computed

## Effect Implementation Details

**Konva Filters Used**:
- Grayscale → `Konva.Filters.Grayscale`
- Sepia → `Konva.Filters.Sepia`
- Vintage → `Konva.Filters.Sepia` + `Konva.Filters.HSL`
- Warm → `Konva.Filters.RGB` (red+, blue-)
- Cool → `Konva.Filters.RGB` (blue+, red-)
- Blur → `Konva.Filters.Blur` (blurRadius property)
- Vignette → `Konva.Filters.Brighten` (simulated darkening)

**Performance Note**: Filters require image caching which is triggered on effect change via useEffect hook.
