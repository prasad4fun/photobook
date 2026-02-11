/**
 * Top Toolbar - Save, undo/redo, and actions
 */

import React, { useState, useEffect } from 'react';
import { Save, X, Undo, Redo, Book, Download } from 'lucide-react';
import { usePhotoBookStore } from '../../../hooks/usePhotoBookStore';
import { downloadJSON } from '../../../services/photobook-studio/exportService';

interface TopToolbarProps {
  onSave: () => void;
  onCancel: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

export default function TopToolbar({
  onSave,
  onCancel,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}: TopToolbarProps) {
  const photoBook = usePhotoBookStore((state) => state.photoBook);
  const currentPageId = usePhotoBookStore((state) => state.currentPageId);
  const selectPage = usePhotoBookStore((state) => state.selectPage);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Calculate current page index and total pages (for keyboard shortcuts)
  const currentPageIndex = photoBook?.pages.findIndex((p) => p.id === currentPageId) ?? -1;
  const totalPages = photoBook?.pages.length ?? 0;

  // Navigation handlers for keyboard shortcuts
  const handlePreviousPage = () => {
    if (photoBook && currentPageIndex > 0) {
      const previousPage = photoBook.pages[currentPageIndex - 1];
      selectPage(previousPage.id);
    }
  };

  const handleNextPage = () => {
    if (photoBook && currentPageIndex < totalPages - 1) {
      const nextPage = photoBook.pages[currentPageIndex + 1];
      selectPage(nextPage.id);
    }
  };

  const handleExportJSON = () => {
    if (photoBook) {
      downloadJSON(photoBook, `photobook-${Date.now()}.json`);
      setShowExportMenu(false);
    }
  };

  // Keyboard shortcuts for page navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if not in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Alt/Option + Arrow keys for page navigation (to avoid conflict with element nudging)
      if (e.altKey) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          handlePreviousPage();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          handleNextPage();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPageIndex, totalPages, photoBook]);

  return (
    <header className="flex items-center justify-between px-3 sm:px-4 lg:px-6 py-2 sm:py-3 border-b border-slate-800 bg-slate-900/50 flex-shrink-0">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <Book size={20} className="text-violet-500 flex-shrink-0" />
        <div className="min-w-0">
          <h1 className="text-sm sm:text-lg lg:text-xl font-bold truncate">PhotoBook Editor</h1>
          <p className="text-xs text-slate-400 hidden sm:block">Edit your photobook pages</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 flex-shrink-0">
        {/* Undo/Redo */}
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="p-1.5 sm:p-2 rounded-lg hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Undo (Cmd/Ctrl+Z)"
        >
          <Undo size={18} />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="p-1.5 sm:p-2 rounded-lg hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Redo (Cmd/Ctrl+Shift+Z)"
        >
          <Redo size={18} />
        </button>

        <div className="w-px h-5 bg-slate-700 mx-1 sm:mx-2" />

        {/* Export */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-slate-800 transition-colors"
            title="Export"
          >
            <Download size={18} />
          </button>

          {showExportMenu && (
            <div className="absolute top-full right-0 mt-2 bg-slate-900 border border-slate-700 rounded-lg shadow-xl overflow-hidden z-50">
              <button
                onClick={handleExportJSON}
                className="w-full px-4 py-2 text-left hover:bg-slate-800 transition-colors text-sm whitespace-nowrap"
              >
                Export as JSON
              </button>
              <button
                onClick={() => {
                  alert('Export as images will be implemented per-page');
                  setShowExportMenu(false);
                }}
                className="w-full px-4 py-2 text-left hover:bg-slate-800 transition-colors text-sm whitespace-nowrap"
              >
                Export Pages (Info)
              </button>
            </div>
          )}
        </div>

        <div className="w-px h-5 bg-slate-700 mx-1 sm:mx-2" />

        {/* Actions */}
        <button
          onClick={onCancel}
          className="px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-sm"
        >
          <X size={16} />
          <span className="hidden sm:inline">Cancel</span>
        </button>
        <button
          onClick={onSave}
          className="px-3 sm:px-4 lg:px-6 py-1.5 sm:py-2 rounded-lg bg-violet-600 hover:bg-violet-700 transition-colors flex items-center gap-1.5 font-medium text-sm"
        >
          <Save size={16} />
          <span className="hidden sm:inline">Save PhotoBook</span>
          <span className="sm:hidden">Save</span>
        </button>
      </div>
    </header>
  );
}
