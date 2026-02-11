/**
 * Sticker/Clipart Picker Panel (Left Panel View)
 * Allows users to browse and add stickers to their photobook
 * Converted from modal to left panel view
 */

import React, { useState, useMemo } from 'react';
import { ArrowLeft, X, Search } from 'lucide-react';
import {
  STICKER_LIBRARY,
  STICKER_CATEGORIES,
  searchStickers,
  getStickersByCategory,
  type StickerCategory,
  type StickerItem,
} from '../../../data/stickerLibrary';
import { usePhotoBookStore } from '../../../hooks/usePhotoBookStore';
import { generateId } from '../../../utils/photobook-studio/helpers';

interface StickerPickerPanelProps {
  pageId: string;
}

export default function StickerPickerPanel({ pageId }: StickerPickerPanelProps) {
  const [activeCategory, setActiveCategory] = useState<StickerCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [draggedSticker, setDraggedSticker] = useState<StickerItem | null>(null);

  const addElement = usePhotoBookStore((state) => state.addElement);
  const setLeftPanelView = usePhotoBookStore((state) => state.setLeftPanelView);

  // Filter stickers based on category and search
  const filteredStickers = useMemo(() => {
    let stickers = STICKER_LIBRARY;

    // Apply category filter
    if (activeCategory !== 'all') {
      stickers = getStickersByCategory(activeCategory);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      stickers = searchStickers(searchQuery).filter((s) =>
        activeCategory === 'all' || s.category === activeCategory
      );
    }

    return stickers;
  }, [activeCategory, searchQuery]);

  const handleStickerClick = (sticker: StickerItem) => {
    // Create sticker element at center of page
    const stickerElement = {
      id: generateId('sticker'),
      type: 'sticker' as const,
      stickerId: sticker.id,
      stickerUrl: sticker.url,
      x: 35, // Center-ish
      y: 35,
      width: 15, // 15% of page width
      height: 15,
      rotation: 0,
      zIndex: 100, // Place on top
      flipHorizontal: false,
      flipVertical: false,
    };
    addElement(pageId, stickerElement);

    // Close panel after click-to-add
    setLeftPanelView('photos');
  };

  const handleDragStart = (e: React.DragEvent, sticker: StickerItem) => {
    setDraggedSticker(sticker);
    // Set drag data
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('application/sticker', JSON.stringify(sticker));
    e.dataTransfer.setData('stickerId', sticker.id);
  };

  const handleDragEnd = () => {
    setDraggedSticker(null);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with back button */}
      <div className="px-4 py-3 border-b border-slate-800">
        {/* Back Button */}
        <button
          onClick={() => setLeftPanelView('photos')}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors mb-3"
        >
          <ArrowLeft size={18} />
          <span className="text-sm">Back to Photos</span>
        </button>

        {/* Title */}
        <div>
          <h2 className="text-lg font-bold text-white">Add Sticker</h2>
          <p className="text-xs text-slate-400 mt-1">
            Click to add, or drag & drop
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-3 border-b border-slate-800">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search stickers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 px-4 py-3 border-b border-slate-800 overflow-x-auto">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
            activeCategory === 'all'
              ? 'bg-violet-600 text-white'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          All
        </button>
        {STICKER_CATEGORIES.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeCategory === category.id
                ? 'bg-violet-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Sticker Grid */}
      <div className="flex-1 overflow-auto p-4">
        {filteredStickers.length > 0 ? (
          <div className="grid grid-cols-3 gap-3">
            {filteredStickers.map((sticker) => (
              <button
                key={sticker.id}
                onClick={() => handleStickerClick(sticker)}
                draggable
                onDragStart={(e) => handleDragStart(e, sticker)}
                onDragEnd={handleDragEnd}
                className={`relative aspect-square flex flex-col items-center justify-center p-2 bg-slate-800 hover:bg-slate-700 border-2 rounded-lg transition-all group cursor-move ${
                  draggedSticker?.id === sticker.id
                    ? 'border-violet-500 opacity-50'
                    : 'border-slate-700 hover:border-violet-500'
                }`}
                title={sticker.name}
              >
                {/* Sticker Preview */}
                <img
                  src={sticker.url}
                  alt={sticker.name}
                  className="w-full h-full object-contain pointer-events-none select-none"
                  draggable={false}
                />

                {/* Hover overlay with name */}
                <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center p-2">
                  <span className="text-xs text-white text-center line-clamp-2">
                    {sticker.name}
                  </span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <Search size={40} className="mb-3 opacity-50" />
            <p className="text-sm font-medium">No stickers found</p>
            <p className="text-xs mt-1">Try a different search</p>
          </div>
        )}
      </div>

      {/* Footer Tip */}
      <div className="px-4 py-3 border-t border-slate-800 bg-slate-900/50">
        <p className="text-xs text-slate-500 text-center">
          💡 Drag for precise placement
        </p>
      </div>
    </div>
  );
}
