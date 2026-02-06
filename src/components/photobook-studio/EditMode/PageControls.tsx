/**
 * Page Controls - Add/Remove page buttons (bottom right)
 */

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { usePhotoBookStore } from '../../../hooks/usePhotoBookStore';

interface PageControlsProps {
  currentPageId: string;
}

export default function PageControls({ currentPageId }: PageControlsProps) {
  const photoBook = usePhotoBookStore((state) => state.photoBook);
  const addPage = usePhotoBookStore((state) => state.addPage);
  const removePage = usePhotoBookStore((state) => state.removePage);

  if (!photoBook) return null;

  const currentPage = photoBook.pages.find((p) => p.id === currentPageId);
  const canRemove =
    currentPage &&
    currentPage.type === 'content' &&
    photoBook.pages.length > 1;

  const handleAddPage = () => {
    addPage(currentPageId);
  };

  const handleRemovePage = () => {
    if (!canRemove) return;
    if (window.confirm('Remove this page?')) {
      removePage(currentPageId);
    }
  };

  return (
    <div className="absolute bottom-24 right-6 flex flex-col gap-2">
      {/* Add Page */}
      <button
        onClick={handleAddPage}
        className="p-3 rounded-lg bg-violet-600 hover:bg-violet-700 shadow-lg transition-colors"
        title="Add Page"
      >
        <Plus size={24} />
      </button>

      {/* Remove Page */}
      <button
        onClick={handleRemovePage}
        disabled={!canRemove}
        className="p-3 rounded-lg bg-red-600 hover:bg-red-700 disabled:bg-slate-700 disabled:cursor-not-allowed shadow-lg transition-colors"
        title={canRemove ? 'Remove Page' : 'Cannot remove this page'}
      >
        <Trash2 size={24} />
      </button>
    </div>
  );
}
