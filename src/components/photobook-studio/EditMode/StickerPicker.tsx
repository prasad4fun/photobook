/**
 * Sticker/Clipart Picker Modal
 * Allows users to browse and add stickers to their photobook
 */

import React, { useState, useMemo } from 'react';
import { X, Search } from 'lucide-react';
import {
  STICKER_LIBRARY,
  STICKER_CATEGORIES,
  searchStickers,
  getStickersByCategory,
  type StickerCategory,
  type StickerItem,
} from '../../../data/stickerLibrary';

interface StickerPickerProps {
  onStickerSelect: (sticker: StickerItem) => void;
  onClose: () => void;
}

export default function StickerPicker({ onStickerSelect, onClose }: StickerPickerProps) {
  const [activeCategory, setActiveCategory] = useState<StickerCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [draggedSticker, setDraggedSticker] = useState<StickerItem | null>(null);

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
    onStickerSelect(sticker);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white">Add Sticker</h2>
            <p className="text-sm text-slate-400 mt-1">
              Click to add to center, or drag & drop to position
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-6 py-4 border-b border-slate-800">
          <div className="relative">
            <Search
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search stickers... (heart, flower, birthday)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 px-6 py-3 border-b border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeCategory === 'all'
                ? 'bg-violet-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            All Stickers
          </button>
          {STICKER_CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
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
        <div className="flex-1 overflow-auto p-6">
          {filteredStickers.length > 0 ? (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
              {filteredStickers.map((sticker) => (
                <button
                  key={sticker.id}
                  onClick={() => handleStickerClick(sticker)}
                  draggable
                  onDragStart={(e) => handleDragStart(e, sticker)}
                  onDragEnd={handleDragEnd}
                  className={`relative aspect-square flex flex-col items-center justify-center p-3 bg-slate-800 hover:bg-slate-700 border-2 rounded-lg transition-all group cursor-move ${
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
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <Search size={48} className="mb-4 opacity-50" />
              <p className="text-lg font-medium">No stickers found</p>
              <p className="text-sm mt-2">Try a different search term or category</p>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/50">
          <p className="text-xs text-slate-500 text-center">
            💡 Tip: Drag stickers directly onto your page for precise placement, or click to add to the center
          </p>
        </div>
      </div>
    </div>
  );
}
