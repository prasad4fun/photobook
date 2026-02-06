/**
 * Photo Card - Individual photo display with delete functionality
 * v2.0 - Added quality warning badge
 */

import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import type { StudioPhoto } from '../../../types';
import { usePhotoBookStore } from '../../../hooks/usePhotoBookStore';
import { formatFileSize } from '../../../utils/photobook-studio/helpers';
import QualityWarningBadge from './QualityWarningBadge';

interface PhotoCardProps {
  photo: StudioPhoto;
}

export default function PhotoCard({ photo }: PhotoCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const deletePhoto = usePhotoBookStore((state) => state.deletePhoto);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Delete ${photo.fileName}?`)) {
      deletePhoto(photo.id);
    }
  };

  return (
    <div
      className="relative group aspect-square rounded-lg overflow-hidden bg-slate-900 border border-slate-800 cursor-pointer hover:border-violet-500 transition-all"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Photo */}
      <img
        src={photo.thumbnailUrl || photo.url}
        alt={photo.fileName}
        className="w-full h-full object-cover"
      />

      {/* Quality Warning Badge */}
      <QualityWarningBadge photo={photo} position="top-right" />

      {/* Hover Overlay */}
      {isHovered && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity">
          {/* Delete Button - Top Left */}
          <button
            onClick={handleDelete}
            className="absolute top-2 left-2 p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-lg"
            title="Delete photo"
          >
            <Trash2 size={18} />
          </button>

          {/* Photo Info - Bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black to-transparent">
            <p className="text-white text-sm font-medium truncate">
              {photo.fileName}
            </p>
            <p className="text-slate-300 text-xs">
              {photo.width} × {photo.height} • {formatFileSize(photo.fileSize)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
