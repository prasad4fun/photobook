# Manual Zoom Test for PhotoBook Studio

## Prerequisites
- Development server running on http://localhost:3000
- At least one test image available for upload

## Test Steps

### 1. Navigate to PhotoBook Studio
1. Open http://localhost:3000 in your browser
2. Click "PhotoBook Demo" button on the landing page
3. Verify: PhotoBook Studio screen loads with "Add Photos" button

### 2. Upload Photos
1. Click "Add Photos" button
2. Select and upload 2-3 test images (any JPG/PNG images)
3. Verify: Photo thumbnails appear in the grid
4. Verify: Quality indicators show (if images are low resolution)

### 3. Generate PhotoBook
1. Click "Generate PhotoBook" button
2. Verify: Switches to Edit Mode
3. Verify: Canvas displays with page thumbnails at bottom
4. Verify: First page shows generated layout with photos

### 4. Select a Photo Element
1. Click on any photo element on the canvas
2. Verify: Photo element gets selected (purple border/handles appear)
3. Verify: **PhotoToolbar appears** above the canvas with zoom/transform buttons

### 5. Test Zoom In
1. Locate the **zoom in button** (magnifying glass with + icon) in the PhotoToolbar
2. Click the zoom in button 3-5 times
3. **Expected Result**:
   - Photo should zoom in (show enlarged portion of image)
   - Image remains centered in the frame
   - Transform is smooth without flickering

### 6. Test Zoom Out
1. Locate the **zoom out button** (magnifying glass with - icon) in the PhotoToolbar
2. Click the zoom out button 3-5 times
3. **Expected Result**:
   - Photo should zoom out (show more of the image)
   - Image remains centered in the frame
   - Transform is smooth without flickering

### 7. Test Zoom Limits
1. **Zoom In Limit**: Keep clicking zoom in button
   - **Expected**: Should stop at 300% (3.0x zoom)
2. **Zoom Out Limit**: Keep clicking zoom out button
   - **Expected**: Should stop at 50% (0.5x zoom)

### 8. Test Zoom with Flip Transforms
1. With photo selected, click "Flip Horizontal" button
2. Then try zoom in/out
3. **Expected**: Zoom should work correctly with flipped image
4. Click "Flip Vertical" button
5. Try zoom again
6. **Expected**: Zoom should work with both flips applied

### 9. Test Zoom Persistence
1. Zoom a photo in
2. Click on another photo element
3. Click back on the first photo
4. **Expected**: First photo should maintain its zoom level

### 10. Test Zoom with Drag/Resize
1. Zoom a photo element to 150%
2. Drag the photo to a new position
3. **Expected**: Zoom level is maintained during drag
4. Resize the photo using corner handles
5. **Expected**: Zoom level is maintained during resize

## Success Criteria

✅ PhotoToolbar appears when photo element is selected
✅ Zoom in button increases zoom level (1.0 → 1.1 → 1.2 ... → 3.0)
✅ Zoom out button decreases zoom level (3.0 → 2.9 → 2.8 ... → 0.5)
✅ Zoom respects min (0.5) and max (3.0) limits
✅ Zoom works correctly with flip transforms
✅ Zoom level persists when selecting/deselecting elements
✅ Zoom level persists during drag and resize operations
✅ No visual glitches or flickering during zoom

## Known Issues / Notes

- If PhotoToolbar doesn't appear, verify that:
  1. Photo element is actually selected (check console for selectedElementIds)
  2. PhotoToolbar component is rendered in PageDetailView
  3. Element type is 'photo' (not 'shape' or 'text')

- Zoom is implemented using Konva's `crop` property:
  - Zoom > 1.0: Shows cropped (zoomed in) portion of image
  - Zoom < 1.0: Shows scaled down (zoomed out) image
  - Center of image is maintained during zoom

## Debugging

If zoom doesn't work:

1. Open browser DevTools (F12)
2. Check Console for any errors
3. In React DevTools, inspect PhotoElementRenderer component
4. Verify `element.transform.zoom` value is changing
5. Verify `crop`, `scaleX`, `scaleY` props are being passed to Konva Image
6. Check if PhotoToolbar's `handleZoomIn`/`handleZoomOut` are being called
