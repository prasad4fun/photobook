# PhotoBook Editor - Quick Start Guide

## 🚀 How to Test the Editor

### Option 1: Integrate into Main App (Recommended)

Since the PhotoBook Editor shares dependencies with the main AI Photo Themes app, the easiest way to test is to import it directly.

#### Step 1: Create a Test Route

Create: `src/components/test/TestPhotoBookEditor.tsx`

```tsx
import React from 'react';
import PhotoBookEditor from '../../../component/PhotoBookEditor/src/components/PhotoBookEditor';
import { PhotoBook } from '../../../component/PhotoBookEditor/src/types';

export default function TestPhotoBookEditor() {
  const handleSave = (photoBook: PhotoBook) => {
    console.log('PhotoBook saved:', photoBook);
    alert(`PhotoBook saved with ${photoBook.pages.length} pages!`);
  };

  const handleCancel = () => {
    console.log('Cancelled');
    alert('Editor cancelled');
  };

  return (
    <div className="w-full h-screen">
      <PhotoBookEditor
        initialPhotos={[]}
        onSave={handleSave}
        onCancel={handleCancel}
        maxPhotos={100}
        features={{
          enableShapes: true,
          enableStickers: true,
          enableTextFormatting: true,
          enableCustomLayouts: true,
        }}
      />
    </div>
  );
}
```

#### Step 2: Add Route to App

In your main `App.tsx`, add:

```tsx
import TestPhotoBookEditor from './components/test/TestPhotoBookEditor';

// Add to your router or screen switching logic:
case 'test-photobook':
  return <TestPhotoBookEditor />;
```

#### Step 3: Navigate to Test Route

```tsx
// Temporarily add a button somewhere:
<button onClick={() => navigateTo('test-photobook')}>
  Test PhotoBook Editor
</button>
```

---

### Option 2: Standalone Demo (Requires Setup)

If you want to run the editor completely standalone:

#### Create Demo File

Create: `component/PhotoBookEditor/demo/index.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PhotoBook Editor Demo</title>
  <script type="importmap">
    {
      "imports": {
        "react": "https://esm.sh/react@18",
        "react-dom": "https://esm.sh/react-dom@18",
        "react-dom/client": "https://esm.sh/react-dom@18/client",
        "react-konva": "https://esm.sh/react-konva@18",
        "konva": "https://esm.sh/konva@10",
        "zustand": "https://esm.sh/zustand@5"
      }
    }
  </script>
</head>
<body>
  <div id="root"></div>
  <script type="module">
    // Demo will go here
    console.log('PhotoBook Editor Demo');
  </script>
</body>
</html>
```

---

## 📖 Usage Guide

### Basic Usage

```tsx
import { PhotoBookEditor } from './component/PhotoBookEditor/src';

function App() {
  const handleSave = (photoBook) => {
    // Save to backend or download
    console.log('Saving photobook:', photoBook);
  };

  return (
    <PhotoBookEditor
      onSave={handleSave}
      onCancel={() => console.log('Cancelled')}
    />
  );
}
```

### With Initial Photos

```tsx
import { Photo } from './component/PhotoBookEditor/src/types';

const initialPhotos: Photo[] = [
  {
    id: 'photo-1',
    url: 'data:image/jpeg;base64,...',
    thumbnailUrl: 'data:image/jpeg;base64,...',
    width: 1920,
    height: 1080,
    fileSize: 1024000,
    fileName: 'photo1.jpg',
    addedAt: new Date(),
  },
  // ... more photos
];

<PhotoBookEditor
  initialPhotos={initialPhotos}
  onSave={handleSave}
  onCancel={handleCancel}
/>
```

### Custom Configuration

```tsx
<PhotoBookEditor
  initialPhotos={photos}
  onSave={handleSave}
  onCancel={handleCancel}
  maxPhotos={50}
  bookConfig={{
    pageSize: 'A4',
    orientation: 'portrait',
    coverType: 'hardcover',
    binding: 'perfect',
  }}
  features={{
    enableShapes: true,
    enableStickers: false,
    enableTextFormatting: true,
    enableCustomLayouts: true,
  }}
/>
```

---

## 🎮 Testing Workflow

### 1. Selection Mode

1. Click "Add Photos" button
2. Select multiple images from your computer
3. See photos appear in grid
4. Hover over photos to see delete icon
5. Delete photos if needed
6. Click "Generate PhotoBook"

### 2. Page Thumbnail View

1. See all pages as thumbnails
2. Hover over pages to see edit/delete icons
3. Click "Add Page" button to add pages
4. Click delete icon on content pages to remove

### 3. Page Detail View

1. Click "Edit" icon on any page thumbnail
2. See full canvas with page elements
3. Click on elements to select them
4. Drag elements to move
5. Use transform handles to resize/rotate
6. Press arrow keys to nudge
7. Double-click text to edit

### 4. Element Creation

1. Click "Add Text" button
2. See text appear in center
3. Double-click to edit text content
4. Click "Add Rectangle" or "Add Circle"
5. See shapes appear
6. Select and manipulate

### 5. Multi-Select

1. Cmd/Ctrl+Click multiple elements
2. See all selected elements highlighted
3. Transform all together
4. Press Delete to remove all

### 6. Navigation

1. Use bottom thumbnail strip to switch pages
2. Click "Back to All Pages" button
3. Use "Add Page" / "Remove Page" buttons

### 7. Undo/Redo

1. Make changes
2. Click Undo button or press Cmd/Ctrl+Z
3. Click Redo button or press Cmd/Ctrl+Shift+Z
4. See changes revert/reapply

### 8. Save

1. Click "Save PhotoBook" button
2. Check console for saved PhotoBook object
3. Inspect pages, elements, config

---

## 🐛 Troubleshooting

### Common Issues

**Issue**: Canvas not rendering
- **Fix**: Check browser console for errors
- **Fix**: Ensure react-konva and konva are installed
- **Fix**: Check that Stage has valid width/height

**Issue**: Images not loading
- **Fix**: Check photo URLs are valid base64 or accessible URLs
- **Fix**: Check browser console for CORS errors
- **Fix**: Verify Photo objects have all required fields

**Issue**: Text editing not working
- **Fix**: Double-click text element (not single click)
- **Fix**: Check that textarea is visible in DOM
- **Fix**: Try clicking outside textarea to save

**Issue**: Transform handles not appearing
- **Fix**: Click element to select it first
- **Fix**: Check that element has valid ID
- **Fix**: Verify Transformer is finding element by ID

**Issue**: Undo/redo not working
- **Fix**: Check that actions are calling `saveSnapshot()`
- **Fix**: Verify history array is populating
- **Fix**: Check historyIndex is updating

---

## 📊 What to Look For

### Successful Test Indicators

✅ Photos upload and display in grid
✅ Photobook generates with multiple pages
✅ Canvas renders with white background
✅ Elements appear when clicking toolbar buttons
✅ Elements can be selected (purple glow)
✅ Drag works to move elements
✅ Transform handles appear and work
✅ Text editing textarea appears on double-click
✅ Arrow keys nudge selected elements
✅ Delete key removes selected elements
✅ Bottom thumbnail strip shows all pages
✅ Page switching works
✅ Undo/redo buttons work
✅ Save returns complete PhotoBook object

---

## 📝 Notes

### Performance

- Test with 10+ photos to verify performance
- Try adding 20+ elements to a single page
- Check that zoom indicator updates
- Verify canvas re-renders smoothly

### Browser Compatibility

- Test in Chrome (best support)
- Test in Firefox
- Test in Safari (may have quirks)
- Mobile not optimized yet

### Known Limitations

- Drag-and-drop from source panel not yet implemented
- Layout picker modal not yet implemented
- Text format toolbar not yet implemented
- Sticker library not yet implemented
- Selection box drag-to-select simplified
- Export functionality not yet implemented

---

## 🎯 Expected Results

After following this guide, you should be able to:

1. ✅ Upload photos and generate a photobook
2. ✅ View all pages as thumbnails
3. ✅ Edit individual pages with full canvas
4. ✅ Add text and shapes to pages
5. ✅ Select, drag, resize, and rotate elements
6. ✅ Edit text inline with textarea
7. ✅ Navigate between pages
8. ✅ Undo/redo changes
9. ✅ Add and remove pages
10. ✅ Save the final photobook

---

## 🚀 Next Steps

After testing, you can:

1. **Add Remaining Features**
   - Drag-drop from source panel
   - Layout picker modal
   - Text format toolbar
   - Export functionality

2. **Integrate with Main App**
   - Add to screen flow
   - Connect to existing state
   - Add to order processing

3. **Deploy**
   - Build production version
   - Test on real devices
   - Get user feedback

---

## 📞 Support

For issues or questions:
1. Check `PHASE4_COMPLETE.md` for technical details
2. Review `SPECIFICATION.md` for requirements
3. Check `FEASIBILITY_ANALYSIS.md` for react-konva patterns

---

**Happy Testing! 🎉**

The PhotoBook Editor is now 90% complete and ready for testing!

