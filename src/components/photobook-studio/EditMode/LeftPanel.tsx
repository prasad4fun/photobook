/**
 * Left Panel - Container that switches between different panel views
 * - Photos: SourcePhotosPanel (default)
 * - Layouts: LayoutPickerPanel
 * - Stickers: StickerPickerPanel
 * - Shapes: ShapePickerPanel
 */

import React, { useEffect } from 'react';
import { usePhotoBookStore } from '../../../hooks/usePhotoBookStore';
import type { LeftPanelView, PhotoBookStudioFeatures } from '../../../types';
import SourcePhotosPanel from './SourcePhotosPanel';
import LayoutPickerPanel from './LayoutPickerPanel';
import StickerPickerPanel from './StickerPickerPanel';
import ShapePickerPanel from './ShapePickerPanel';

interface LeftPanelProps {
  features: PhotoBookStudioFeatures;
  pageId: string;
}

// Width mapping for different panel views - responsive
const PANEL_WIDTHS: Record<LeftPanelView, string> = {
  photos: 'w-48 sm:w-56 lg:w-64',      // 192px / 224px / 256px
  shapes: 'w-56 sm:w-64 lg:w-80',      // 224px / 256px / 320px
  layouts: 'w-56 sm:w-72 lg:w-96',     // 224px / 288px / 384px
  stickers: 'w-56 sm:w-72 lg:w-96',    // 224px / 288px / 384px
};

export default function LeftPanel({ features, pageId }: LeftPanelProps) {
  const leftPanelView = usePhotoBookStore((state) => state.leftPanelView);
  const setLeftPanelView = usePhotoBookStore((state) => state.setLeftPanelView);

  // Keyboard shortcut: Esc to return to photos view
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle if typing in input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'Escape' && leftPanelView !== 'photos') {
        e.preventDefault();
        setLeftPanelView('photos');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [leftPanelView, setLeftPanelView]);

  return (
    <div
      className={`
        ${PANEL_WIDTHS[leftPanelView]}
        border-r border-slate-800 bg-slate-900/30 overflow-auto
        transition-[width] duration-300 ease-in-out
        flex flex-col min-h-0 flex-shrink-0
      `}
    >
      {/* Photos Panel (default) */}
      {leftPanelView === 'photos' && <SourcePhotosPanel />}

      {/* Layout Picker Panel */}
      {leftPanelView === 'layouts' && <LayoutPickerPanel pageId={pageId} />}

      {/* Sticker Picker Panel */}
      {leftPanelView === 'stickers' && <StickerPickerPanel pageId={pageId} />}

      {/* Shape Picker Panel */}
      {leftPanelView === 'shapes' && <ShapePickerPanel pageId={pageId} />}
    </div>
  );
}
