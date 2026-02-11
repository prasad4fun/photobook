/**
 * Page Detail View - Full page editing with canvas
 * Pixory-style: vertical side toolbars, no horizontal toolbar, light background
 */

import React from 'react';
import { usePhotoBookStore } from '../../../hooks/usePhotoBookStore';
import { PhotoBookStudioFeatures, StudioTextElement, StudioPhotoElement, StudioShapeElement, StudioStickerElement } from '../../../types';
import PageSpreadCanvas from './PageSpreadCanvas';
import CanvasSideToolbar from './CanvasSideToolbar';
import PageThumbnailStrip from './PageThumbnailStrip';
import PageControls from './PageControls';
import TextFormatToolbar from './canvas/TextFormatToolbar';
import { PhotoToolbar, ShapeToolbar, StickerToolbar } from './toolbars';

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
        <p className="text-gray-400">Page not found</p>
      </div>
    );
  }

  // Find selected element (if only one selected)
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
    <div className="flex-1 flex flex-col bg-gray-100 relative min-h-0 overflow-hidden">
      {/* Main Canvas Area with Side Toolbars */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left Side Toolbar */}
        <div className="flex-shrink-0 flex items-center">
          <CanvasSideToolbar features={features} pageId={currentPageId} side="left" />
        </div>

        {/* Canvas */}
        <div className="flex-1 min-h-0 min-w-0 overflow-hidden">
          <PageSpreadCanvas page={currentPage} />
        </div>

        {/* Right Side Toolbar - hidden on small screens */}
        <div className="flex-shrink-0 hidden md:flex items-center">
          <CanvasSideToolbar features={features} pageId={currentPageId} side="right" />
        </div>
      </div>

      {/* Bottom Strip - Spread Thumbnails */}
      <div className="flex-shrink-0">
        <PageThumbnailStrip currentPageId={currentPageId} />
      </div>

      {/* Page Controls - Bottom Right */}
      <PageControls currentPageId={currentPageId} />

      {/* Contextual Toolbars - Appear based on selected element type */}
      {selectedStudioPhotoElement && selectedPhoto && selectedPageId && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
          <PhotoToolbar
            element={selectedStudioPhotoElement}
            photo={selectedPhoto}
            pageId={selectedPageId}
          />
        </div>
      )}

      {selectedStudioShapeElement && features.enableShapes && selectedPageId && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
          <ShapeToolbar
            element={selectedStudioShapeElement}
            pageId={selectedPageId}
          />
        </div>
      )}

      {selectedStudioStickerElement && features.enableStickers && selectedPageId && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
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
          position={{ x: 50, y: 150 }}
        />
      )}
    </div>
  );
}
