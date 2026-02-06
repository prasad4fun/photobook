/**
 * Edit Mode - Photobook page editing
 */

import React from 'react';
import { usePhotoBookStore } from '../../hooks/usePhotoBookStore';
import { PhotoBookStudioFeatures } from '../../types';
import SourcePhotosPanel from './EditMode/SourcePhotosPanel';
import PageThumbnailView from './EditMode/PageThumbnailView';
import PageDetailView from './EditMode/PageDetailView';
import TopToolbar from './EditMode/TopToolbar';

interface EditModeProps {
  features: PhotoBookStudioFeatures;
  onSave: () => void;
  onCancel: () => void;
}

export default function EditMode({ features, onSave, onCancel }: EditModeProps) {
  const currentPageId = usePhotoBookStore((state) => state.currentPageId);
  const photoBook = usePhotoBookStore((state) => state.photoBook);
  const canUndo = usePhotoBookStore((state) => state.canUndo());
  const canRedo = usePhotoBookStore((state) => state.canRedo());
  const undo = usePhotoBookStore((state) => state.undo);
  const redo = usePhotoBookStore((state) => state.redo);

  if (!photoBook) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-slate-400">No photobook loaded</p>
      </div>
    );
  }

  const isDetailView = currentPageId !== null;

  return (
    <div className="w-full h-full flex flex-col">
      {/* Top Toolbar */}
      <TopToolbar
        onSave={onSave}
        onCancel={onCancel}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Source Photos */}
        <SourcePhotosPanel />

        {/* Right Panel - Page View */}
        <div className="flex-1 flex flex-col">
          {isDetailView ? (
            <PageDetailView features={features} />
          ) : (
            <PageThumbnailView />
          )}
        </div>
      </div>
    </div>
  );
}
