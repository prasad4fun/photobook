/**
 * Page Detail View - Full page editing with canvas
 * v2.0 - Added contextual toolbars
 */

import React from 'react';
import { usePhotoBookStore } from '../../../hooks/usePhotoBookStore';
import { PhotoBookStudioFeatures, StudioTextElement, StudioPhotoElement, StudioShapeElement, StudioStickerElement } from '../../../types';
import PageSpreadCanvas from './PageSpreadCanvas';
import EditToolbar from './EditToolbar';
import PageThumbnailStrip from './PageThumbnailStrip';
import PageControls from './PageControls';
import TextFormatToolbar from './canvas/TextFormatToolbar';
import { PhotoToolbar, ShapeToolbar, StickerToolbar } from './toolbars';
import { ArrowLeft } from 'lucide-react';

interface PageDetailViewProps {
  features: PhotoBookStudioFeatures;
}

export default function PageDetailView({ features }: PageDetailViewProps) {
  // All hooks must be called before any conditional returns
  const photoBook = usePhotoBookStore((state) => state.photoBook);
  const currentPageId = usePhotoBookStore((state) => state.currentPageId);
  const selectPage = usePhotoBookStore((state) => state.selectPage);
  const selectedElementIds = usePhotoBookStore((state) => state.selectedElementIds);
  const updateElement = usePhotoBookStore((state) => state.updateElement);
  const deleteElements = usePhotoBookStore((state) => state.deleteElements);
  const selectedPhotos = usePhotoBookStore((state) => state.selectedPhotos);

  if (!photoBook || !currentPageId) {
    return null;
  }

  const currentPage = photoBook.pages.find((p) => p.id === currentPageId);

  if (!currentPage) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-slate-400">Page not found</p>
      </div>
    );
  }

  const handleBackToThumbnails = () => {
    selectPage(null as any); // Clear selection to go back
  };

  // Find selected element (if only one selected) - v2.0: Extended for all types
  // Search across ALL pages since spread view shows multiple pages
  const selectedElement =
    selectedElementIds.length === 1
      ? photoBook.pages
          .flatMap((p) => p.elements.map((el) => ({ element: el, pageId: p.id })))
          .find((item) => item.element.id === selectedElementIds[0])
      : undefined;

  const selectedPageId = selectedElement?.pageId;

  // Determine element type
  const selectedStudioTextElement =
    selectedElement?.element.type === 'text' ? (selectedElement.element as StudioTextElement) : undefined;
  const selectedStudioPhotoElement =
    selectedElement?.element.type === 'photo' ? (selectedElement.element as StudioPhotoElement) : undefined;
  const selectedStudioShapeElement =
    selectedElement?.element.type === 'shape' ? (selectedElement.element as StudioShapeElement) : undefined;
  const selectedStudioStickerElement =
    selectedElement?.element.type === 'sticker' ? (selectedElement.element as StudioStickerElement) : undefined;

  // Get photo for PhotoToolbar
  const selectedPhoto = selectedStudioPhotoElement
    ? selectedPhotos.find((p) => p.id === selectedStudioPhotoElement.photoId)
    : undefined;

  return (
    <div className="flex-1 flex flex-col bg-slate-950 relative">
      {/* Top Bar - Back button and page info */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/50">
        <button
          onClick={handleBackToThumbnails}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft size={18} />
          Back to All Pages
        </button>

        <div className="text-center">
          <h3 className="text-sm font-semibold">
            Page {currentPage.pageNumber}
          </h3>
          <p className="text-xs text-slate-400 capitalize">{currentPage.type}</p>
        </div>

        <div className="w-32" /> {/* Spacer for centering */}
      </div>

      {/* Edit Toolbar */}
      <EditToolbar features={features} pageId={currentPageId} />

      {/* Main Canvas Area - Spread View */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-hidden bg-slate-900/30">
        <PageSpreadCanvas page={currentPage} />
      </div>

      {/* Bottom Strip - Page Thumbnails */}
      <div className="border-t border-slate-800 bg-slate-900/50">
        <PageThumbnailStrip currentPageId={currentPageId} />
      </div>

      {/* Page Controls - Bottom Right */}
      <PageControls currentPageId={currentPageId} />

      {/* v2.0: Contextual Toolbars - Appear based on selected element type */}
      {selectedStudioPhotoElement && selectedPhoto && selectedPageId && (
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-20">
          <PhotoToolbar
            element={selectedStudioPhotoElement}
            photo={selectedPhoto}
            pageId={selectedPageId}
          />
        </div>
      )}

      {selectedStudioShapeElement && features.enableShapes && selectedPageId && (
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-20">
          <ShapeToolbar
            element={selectedStudioShapeElement}
            pageId={selectedPageId}
          />
        </div>
      )}

      {selectedStudioStickerElement && features.enableStickers && selectedPageId && (
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-20">
          <StickerToolbar
            element={selectedStudioStickerElement}
            pageId={selectedPageId}
          />
        </div>
      )}

      {/* Text Format Toolbar - Appears when text is selected */}
      {selectedStudioTextElement && features.enableTextFormatting && selectedPageId && (
        <TextFormatToolbar
          element={selectedStudioTextElement}
          onUpdate={(updates) => updateElement(selectedPageId, selectedStudioTextElement.id, updates)}
          onDelete={() => deleteElements(selectedPageId, [selectedStudioTextElement.id])}
          position={{ x: 50, y: 150 }} // Fixed position for now
        />
      )}
    </div>
  );
}
