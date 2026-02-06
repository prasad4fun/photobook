/**
 * Source Photos Panel - Shows available photos for adding to pages
 */

import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { usePhotoBookStore } from '../../../hooks/usePhotoBookStore';

export default function SourcePhotosPanel() {
  const selectedPhotos = usePhotoBookStore((state) => state.selectedPhotos);

  const handleDragStart = (photoId: string, e: React.DragEvent) => {
    e.dataTransfer.setData('photoId', photoId);
    e.dataTransfer.effectAllowed = 'copy';

    // Add visual feedback
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = '0.5';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    // Reset visual feedback
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = '1';
  };

  return (
    <div className="w-64 border-r border-slate-800 p-4 overflow-auto bg-slate-900/30">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
          <ImageIcon size={16} />
          Source Photos
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          {selectedPhotos.length} photo{selectedPhotos.length !== 1 ? 's' : ''}
        </p>
        <p className="text-xs text-violet-400 mt-2">
          Drag photos to canvas →
        </p>
      </div>

      <div className="space-y-2">
        {selectedPhotos.map((photo) => (
          <div
            key={photo.id}
            className="relative aspect-square rounded-lg overflow-hidden bg-slate-800 border border-slate-700 cursor-grab active:cursor-grabbing hover:border-violet-500 transition-all"
            draggable
            onDragStart={(e) => handleDragStart(photo.id, e)}
            onDragEnd={handleDragEnd}
          >
            <img
              src={photo.thumbnailUrl || photo.url}
              alt={photo.fileName}
              className="w-full h-full object-cover pointer-events-none"
            />

            {/* Filename overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent">
              <p className="text-white text-xs truncate">{photo.fileName}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
