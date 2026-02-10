/**
 * Page Thumbnail Strip - Bottom strip of page thumbnails for navigation
 */

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { usePhotoBookStore } from '../../../hooks/usePhotoBookStore';

interface PageThumbnailStripProps {
  currentPageId: string;
}

export default function PageThumbnailStrip({
  currentPageId,
}: PageThumbnailStripProps) {
  const photoBook = usePhotoBookStore((state) => state.photoBook);
  const selectPage = usePhotoBookStore((state) => state.selectPage);

  if (!photoBook) return null;

  // Calculate current page index and total pages
  const currentPageIndex = photoBook.pages.findIndex((p) => p.id === currentPageId);
  const totalPages = photoBook.pages.length;
  const currentPageNumber = currentPageIndex !== -1 ? currentPageIndex + 1 : 1;

  // Navigation handlers
  const handlePreviousPage = () => {
    if (currentPageIndex > 0) {
      const previousPage = photoBook.pages[currentPageIndex - 1];
      selectPage(previousPage.id);
    }
  };

  const handleNextPage = () => {
    if (currentPageIndex < totalPages - 1) {
      const nextPage = photoBook.pages[currentPageIndex + 1];
      selectPage(nextPage.id);
    }
  };

  return (
    <div className="flex items-center gap-4 px-6 py-4 border-t border-slate-800 bg-slate-900/30">
      {/* Previous Button */}
      <button
        onClick={handlePreviousPage}
        disabled={currentPageIndex <= 0}
        className="p-2 rounded-lg hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
        title="Previous Page (Alt+Left)"
      >
        <ChevronLeft size={20} />
      </button>

      {/* Page Indicator */}
      <div className="px-4 py-2 bg-slate-800/50 rounded-lg text-center flex-shrink-0">
        <span className="text-sm font-medium">
          Page {currentPageNumber} / {totalPages}
        </span>
      </div>

      {/* Page Thumbnails */}
      <div className="flex items-center gap-3 overflow-x-auto flex-1">
      {photoBook.pages.map((page) => (
        <button
          key={page.id}
          onClick={() => selectPage(page.id)}
          className={`flex-shrink-0 w-20 h-28 rounded-lg overflow-hidden border-2 transition-all ${
            page.id === currentPageId
              ? 'border-violet-500 shadow-lg shadow-violet-500/50'
              : 'border-slate-700 hover:border-slate-600'
          }`}
        >
          <div
            className="w-full h-full flex items-center justify-center text-xs text-slate-400"
            style={{
              backgroundColor: page.background?.color || '#ffffff',
            }}
          >
            {page.elements.length > 0 ? (
              <div className="grid grid-cols-2 gap-0.5 p-1">
                {page.elements.slice(0, 4).map((el) => (
                  <div key={el.id} className="w-full h-full bg-slate-300 rounded" />
                ))}
              </div>
            ) : (
              <span className="text-slate-500">Page {page.pageNumber}</span>
            )}
          </div>
        </button>
      ))}
      </div>

      {/* Next Button */}
      <button
        onClick={handleNextPage}
        disabled={currentPageIndex >= totalPages - 1}
        className="p-2 rounded-lg hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
        title="Next Page (Alt+Right)"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
