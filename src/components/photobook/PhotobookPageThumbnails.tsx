import { useState } from 'react';
import { Plus, Copy, Trash2, Lock, Unlock } from 'lucide-react';
import { PageSpread } from '../../types';

interface PhotobookPageThumbnailsProps {
  spreads: PageSpread[];
  currentSpreadIndex: number;
  onSpreadSelect: (index: number) => void;
  onAddSpread: (afterIndex: number) => void;
  onDuplicateSpread: (index: number) => void;
  onRemoveSpread: (index: number) => void;
  onToggleLock: (index: number) => void;
}

export default function PhotobookPageThumbnails({
  spreads,
  currentSpreadIndex,
  onSpreadSelect,
  onAddSpread,
  onDuplicateSpread,
  onRemoveSpread,
  onToggleLock,
}: PhotobookPageThumbnailsProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const getSpreadLabel = (spread: PageSpread) => {
    if (spread.spreadNumber === 1) return 'Cover';
    const leftPage = (spread.spreadNumber - 1) * 2;
    const rightPage = leftPage + 1;
    return `Page ${leftPage}-${rightPage}`;
  };

  return (
    <div className="h-48 bg-slate-900/95 backdrop-blur-sm border-t border-slate-800 flex flex-col">
      {/* Action Buttons */}
      <div className="flex items-center justify-between px-6 py-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onAddSpread(currentSpreadIndex)}
            className="flex items-center gap-2 px-3 py-1.5 bg-violet-600 hover:bg-violet-500 rounded-lg text-white text-sm font-medium transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Pages</span>
          </button>
          <button
            onClick={() => onDuplicateSpread(currentSpreadIndex)}
            disabled={spreads.length === 0}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              spreads.length > 0
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                : 'bg-slate-800/50 text-slate-600 cursor-not-allowed'
            }`}
          >
            <Copy className="w-4 h-4" />
            <span>Duplicate</span>
          </button>
          <button
            onClick={() => onRemoveSpread(currentSpreadIndex)}
            disabled={spreads.length <= 1}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              spreads.length > 1
                ? 'bg-slate-800 hover:bg-red-900/50 text-red-400'
                : 'bg-slate-800/50 text-slate-600 cursor-not-allowed'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>Remove</span>
          </button>
        </div>

        <div className="text-sm text-slate-400">
          {spreads.length} {spreads.length === 1 ? 'spread' : 'spreads'}
        </div>
      </div>

      {/* Thumbnail Scroll Container */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden px-6 py-3">
        <div className="flex items-center gap-3 h-full">
          {spreads.map((spread, index) => (
            <div
              key={spread.id}
              className="relative flex-shrink-0"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Thumbnail */}
              <button
                onClick={() => onSpreadSelect(index)}
                className={`relative w-32 h-24 rounded-lg overflow-hidden transition-all ${
                  index === currentSpreadIndex
                    ? 'ring-2 ring-violet-400 shadow-lg shadow-violet-500/30'
                    : 'ring-1 ring-slate-700 hover:ring-slate-600'
                }`}
              >
                {/* Placeholder spread preview */}
                <div className="w-full h-full bg-slate-800 flex">
                  {/* Left page */}
                  <div className="flex-1 bg-white/5 border-r border-slate-700"></div>
                  {/* Right page */}
                  <div className="flex-1 bg-white/5"></div>
                </div>

                {/* Spread label */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/90 to-transparent px-2 py-1">
                  <p className="text-xs text-white font-medium text-center">
                    {getSpreadLabel(spread)}
                  </p>
                </div>

                {/* Lock indicator */}
                {spread.isLocked && (
                  <div className="absolute top-1 right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                    <Lock className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>

              {/* Hover Actions */}
              {hoveredIndex === index && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-lg p-1 shadow-xl z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleLock(index);
                    }}
                    className="p-1.5 hover:bg-slate-800 rounded text-slate-300 transition-all"
                    title={spread.isLocked ? 'Unlock spread' : 'Lock spread'}
                  >
                    {spread.isLocked ? (
                      <Unlock className="w-3.5 h-3.5" />
                    ) : (
                      <Lock className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicateSpread(index);
                    }}
                    className="p-1.5 hover:bg-slate-800 rounded text-slate-300 transition-all"
                    title="Duplicate spread"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  {spreads.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveSpread(index);
                      }}
                      className="p-1.5 hover:bg-red-900/50 rounded text-red-400 transition-all"
                      title="Remove spread"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Add New Spread Button */}
          <button
            onClick={() => onAddSpread(spreads.length - 1)}
            className="flex-shrink-0 w-32 h-24 border-2 border-dashed border-slate-700 hover:border-violet-500 rounded-lg flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-violet-400 transition-all group"
          >
            <Plus className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium">Add Spread</span>
          </button>
        </div>
      </div>
    </div>
  );
}
