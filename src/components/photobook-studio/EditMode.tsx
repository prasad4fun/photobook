/**
 * Edit Mode - Photobook page editing
 */

import React from 'react';
import { usePhotoBookStore } from '../../hooks/usePhotoBookStore';
import { PhotoBookStudioFeatures } from '../../types';
import LeftPanel from './EditMode/LeftPanel';
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
    <div className="w-full h-full flex flex-col overflow-hidden">
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
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Panel - Photos / Layouts / Stickers / Shapes */}
        <LeftPanel features={features} pageId={currentPageId || ''} />

        {/* Right Panel - Page View */}
        <div className={`flex-1 flex flex-col min-h-0 min-w-0 ${isDetailView ? 'bg-gray-100' : ''}`}>
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
