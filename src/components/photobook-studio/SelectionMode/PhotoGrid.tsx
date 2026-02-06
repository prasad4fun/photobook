/**
 * Photo Grid - Displays selected photos in a grid layout
 */

import React from 'react';
import type { StudioPhoto } from '../../../types';
import PhotoCard from './PhotoCard';

interface PhotoGridProps {
  photos: StudioPhoto[];
}

export default function PhotoGrid({ photos }: PhotoGridProps) {
  if (photos.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-slate-400">
          <p className="text-lg mb-2">No photos added yet</p>
          <p className="text-sm">Click "Add Photos" to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {photos.map((photo) => (
        <PhotoCard key={photo.id} photo={photo} />
      ))}
    </div>
  );
}
