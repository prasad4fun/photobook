/**
 * Selection Mode - Photo selection and management
 */

import React from 'react';
import { usePhotoBookStore } from '../../hooks/usePhotoBookStore';
import type { StudioPhoto, StudioPhotoBookConfig } from '../../types';
import PhotoGrid from './SelectionMode/PhotoGrid';
import AddPhotosButton from './SelectionMode/AddPhotosButton';
import { ArrowRight } from 'lucide-react';

interface SelectionModeProps {
  maxPhotos: number;
  bookConfig?: StudioPhotoBookConfig;
  onCancel: () => void;
}

export default function SelectionMode({
  maxPhotos,
  bookConfig,
  onCancel,
}: SelectionModeProps) {
  const selectedPhotos = usePhotoBookStore((state) => state.selectedPhotos);
  const generatePhotoBookFromPhotos = usePhotoBookStore(
    (state) => state.generatePhotoBookFromPhotos
  );

  const handleGeneratePhotoBook = () => {
    if (selectedPhotos.length === 0) {
      alert('Please add at least one photo to create a photobook');
      return;
    }
    generatePhotoBookFromPhotos();
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold">Create PhotoBook</h1>
          <p className="text-sm text-slate-400 mt-1">
            {selectedPhotos.length} of {maxPhotos} photos selected
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleGeneratePhotoBook}
            disabled={selectedPhotos.length === 0}
            className="px-6 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 disabled:bg-slate-700 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            Generate PhotoBook
            <ArrowRight size={18} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Photo Grid */}
        <div className="flex-1 overflow-auto p-6">
          <PhotoGrid photos={selectedPhotos} />
        </div>

        {/* Right Panel - Add Photos */}
        <div className="w-80 border-l border-slate-800 p-6 flex flex-col items-center justify-center">
          <AddPhotosButton
            maxPhotos={maxPhotos}
            currentCount={selectedPhotos.length}
          />
        </div>
      </div>
    </div>
  );
}
