/**
 * Page Thumbnail Strip - Bottom strip of page thumbnails for navigation
 */

import React from 'react';
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

  return (
    <div className="flex items-center gap-3 px-6 py-4 overflow-x-auto">
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
  );
}
