/**
 * Page Thumbnail View - Displays all pages as thumbnails
 */

import React, { useState } from 'react';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { usePhotoBookStore } from '../../../hooks/usePhotoBookStore';

export default function PageThumbnailView() {
  const photoBook = usePhotoBookStore((state) => state.photoBook);
  const selectPage = usePhotoBookStore((state) => state.selectPage);
  const removePage = usePhotoBookStore((state) => state.removePage);
  const addPage = usePhotoBookStore((state) => state.addPage);
  const [hoveredPageId, setHoveredPageId] = useState<string | null>(null);

  if (!photoBook) return null;

  const handleEditPage = (pageId: string) => {
    selectPage(pageId);
  };

  const handleRemovePage = (pageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Remove this page?')) {
      removePage(pageId);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">All Pages</h2>
          <p className="text-sm text-slate-400 mt-1">
            {photoBook.pages.length} page{photoBook.pages.length !== 1 ? 's' : ''}
          </p>
        </div>

        <button
          onClick={() => addPage()}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={18} />
          Add Page
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photoBook.pages.map((page) => (
            <div
              key={page.id}
              className="relative group"
              onMouseEnter={() => setHoveredPageId(page.id)}
              onMouseLeave={() => setHoveredPageId(null)}
            >
              {/* Page Thumbnail */}
              <div className="aspect-[1/1.4] bg-white rounded-lg shadow-lg overflow-hidden border-2 border-slate-700 hover:border-violet-500 cursor-pointer transition-all">
                {/* Page Background */}
                <div
                  className="w-full h-full relative"
                  style={{
                    backgroundColor: page.background?.color || '#ffffff',
                  }}
                >
                  {/* Simplified Element Preview */}
                  {page.elements.length > 0 && (
                    <div className="absolute inset-2 grid grid-cols-2 gap-1">
                      {page.elements.slice(0, 4).map((element, idx) => (
                        <div
                          key={element.id}
                          className="bg-slate-300 rounded"
                        />
                      ))}
                    </div>
                  )}

                  {page.elements.length === 0 && (
                    <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                      Empty Page
                    </div>
                  )}
                </div>

                {/* Hover Overlay */}
                {hoveredPageId === page.id && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleEditPage(page.id)}
                      className="p-3 bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors"
                      title="Edit page"
                    >
                      <Edit size={20} />
                    </button>
                    {page.type === 'content' && (
                      <button
                        onClick={(e) => handleRemovePage(page.id, e)}
                        className="p-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                        title="Remove page"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Page Info */}
              <div className="mt-2 text-center">
                <p className="text-sm font-medium">
                  Page {page.pageNumber}
                </p>
                <p className="text-xs text-slate-500 capitalize">{page.type}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
