/**
 * Demo page for the PhotoBook Studio component
 * Enterprise-standard location: src/components/photobook-studio
 */

import { PhotobookStudioScreen } from './photobook-studio';
import type { StudioPhotoBook } from '@/types';

interface PhotobookStudioDemoProps {
  onBack: () => void;
}

export default function PhotobookStudioDemo({ onBack }: PhotobookStudioDemoProps) {
  const handleSave = (photoBook: StudioPhotoBook) => {
    console.log('📚 PhotoBook Saved:', photoBook);
    alert(`PhotoBook saved successfully!\n\n${photoBook.pages.length} pages\nCreated: ${photoBook.createdAt.toLocaleString()}`);
  };

  const handleCancel = () => {
    const confirmed = window.confirm('Are you sure you want to exit? Any unsaved changes will be lost.');
    if (confirmed) {
      onBack();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <PhotobookStudioScreen
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
