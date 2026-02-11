/**
 * Page Thumbnail Strip - Bottom bar with spread-based thumbnails
 * Pixory-style: shows paired page spreads (Cover, Page 2-3, etc.)
 */

import React from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { usePhotoBookStore } from '../../../hooks/usePhotoBookStore';
import { createSpreads } from '../../../utils/photobook-studio/helpers';
import type { StudioSpread } from '../../../types';

interface PageThumbnailStripProps {
  currentPageId: string;
}

export default function PageThumbnailStrip({
  currentPageId,
}: PageThumbnailStripProps) {
  const photoBook = usePhotoBookStore((state) => state.photoBook);
  const selectPage = usePhotoBookStore((state) => state.selectPage);
  const setCurrentSpreadIndex = usePhotoBookStore((state) => state.setCurrentSpreadIndex);
  const zoomLevel = usePhotoBookStore((state) => state.zoomLevel);

  if (!photoBook) return null;

  const spreads = createSpreads(photoBook.pages);

  // Find current spread based on currentPageId
  const activeSpreadIndex = spreads.findIndex(
    (s) => s.leftPage?.id === currentPageId || s.rightPage?.id === currentPageId
  );

  const handleSpreadClick = (spread: StudioSpread, index: number) => {
    setCurrentSpreadIndex(index);
    // Navigate to the right page (or left if no right)
    const targetPageId = spread.rightPage?.id || spread.leftPage?.id;
    if (targetPageId) selectPage(targetPageId);
  };

  const handlePrev = () => {
    if (activeSpreadIndex > 0) {
      handleSpreadClick(spreads[activeSpreadIndex - 1], activeSpreadIndex - 1);
    }
  };

  const handleNext = () => {
    if (activeSpreadIndex < spreads.length - 1) {
      handleSpreadClick(spreads[activeSpreadIndex + 1], activeSpreadIndex + 1);
    }
  };

  // Render mini page preview inside a spread thumbnail
  const renderMiniPage = (page: StudioSpread['leftPage']) => {
    if (!page) {
      return (
        <div
          className="h-12 flex items-center justify-center bg-gray-100"
          style={{ width: 30 }}
        />
      );
    }

    const hasElements = page.elements.length > 0;
    const bgColor = page.background?.color || '#ffffff';

    return (
      <div
        className="h-12 flex items-center justify-center relative overflow-hidden"
        style={{ width: 30, backgroundColor: bgColor }}
      >
        {hasElements ? (
          <div className="grid grid-cols-2 gap-px p-0.5 w-full h-full">
            {page.elements.slice(0, 4).map((el) => (
              <div key={el.id} className="bg-gray-300/60 rounded-[1px]" />
            ))}
          </div>
        ) : (
          <span className="text-[7px] text-gray-400 font-medium">
            {page.pageNumber}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="flex items-center gap-2 px-3 py-2 border-t border-gray-200 bg-white/90 backdrop-blur-sm">
      {/* Previous Spread */}
      <button
        onClick={handlePrev}
        disabled={activeSpreadIndex <= 0}
        className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex-shrink-0 text-gray-600"
        title="Previous spread"
      >
        <ChevronLeft size={16} />
      </button>

      {/* Spread Thumbnails */}
      <div
        className="flex items-end gap-2 overflow-x-auto flex-1 min-w-0 py-0.5"
        style={{ scrollbarWidth: 'thin' }}
      >
        {spreads.map((spread, index) => (
          <button
            key={spread.id}
            onClick={() => handleSpreadClick(spread, index)}
            className="flex-shrink-0 flex flex-col items-center gap-0.5"
          >
            {/* Spread thumbnail: two mini pages side by side */}
            <div
              className={`flex rounded overflow-hidden border-2 transition-all hover:scale-105 ${
                index === activeSpreadIndex
                  ? 'border-violet-500 shadow-md shadow-violet-500/30 ring-1 ring-violet-400/30'
                  : 'border-gray-300 hover:border-violet-400'
              }`}
            >
              {/* Left page mini */}
              {renderMiniPage(spread.leftPage)}
              {/* Spine divider */}
              <div className="w-px bg-gray-400/50" />
              {/* Right page mini */}
              {renderMiniPage(spread.rightPage)}
            </div>
            {/* Spread label */}
            <span
              className={`text-[9px] font-medium whitespace-nowrap ${
                index === activeSpreadIndex ? 'text-violet-600' : 'text-gray-500'
              }`}
            >
              {spread.label}
            </span>
          </button>
        ))}
      </div>

      {/* Next Spread */}
      <button
        onClick={handleNext}
        disabled={activeSpreadIndex >= spreads.length - 1}
        className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex-shrink-0 text-gray-600"
        title="Next spread"
      >
        <ChevronRight size={16} />
      </button>

      {/* Separator */}
      <div className="w-px h-6 bg-gray-300 mx-1 flex-shrink-0" />

      {/* Zoom Display */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <ZoomOut size={14} className="text-gray-400" />
        <span className="text-xs text-gray-500 font-medium min-w-[36px] text-center">
          {zoomLevel}%
        </span>
        <ZoomIn size={14} className="text-gray-400" />
      </div>
    </div>
  );
}
