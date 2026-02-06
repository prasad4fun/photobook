/**
 * PhotoBook Studio Screen - Root Component
 * Manages mode switching between Selection and Edit modes
 */

import React, { useEffect } from 'react';
import { usePhotoBookStore } from '../../hooks/usePhotoBookStore';
import type { PhotoBookStudioScreenProps } from '../../types';
import SelectionMode from './SelectionMode';
import EditMode from './EditMode';

export default function PhotobookStudioScreen({
  initialPhotos = [],
  onSave,
  onCancel,
  maxPhotos = 100,
  bookConfig,
  features = {
    enableShapes: true,
    enableStickers: true,
    enableTextFormatting: true,
    enableCustomLayouts: true,
  },
}: PhotoBookStudioScreenProps) {
  const mode = usePhotoBookStore((state) => state.mode);
  const photoBook = usePhotoBookStore((state) => state.photoBook);
  const addPhotos = usePhotoBookStore((state) => state.addPhotos);

  // Initialize with photos if provided
  useEffect(() => {
    if (initialPhotos.length > 0) {
      addPhotos(initialPhotos);
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // Undo: Cmd/Ctrl + Z
      if (cmdOrCtrl && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        usePhotoBookStore.getState().undo();
      }

      // Redo: Cmd/Ctrl + Shift + Z
      if (cmdOrCtrl && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        usePhotoBookStore.getState().redo();
      }

      // Save: Cmd/Ctrl + S
      if (cmdOrCtrl && e.key === 's') {
        e.preventDefault();
        if (photoBook) {
          onSave(photoBook);
        }
      }

      // Escape: Cancel
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [photoBook, onSave, onCancel]);

  const handleSave = () => {
    if (photoBook) {
      onSave(photoBook);
    }
  };

  return (
    <div className="w-full h-screen bg-slate-950 text-white overflow-hidden">
      {mode === 'selection' ? (
        <SelectionMode
          maxPhotos={maxPhotos}
          bookConfig={bookConfig}
          onCancel={onCancel}
        />
      ) : (
        <EditMode
          features={features}
          onSave={handleSave}
          onCancel={onCancel}
        />
      )}
    </div>
  );
}
