/**
 * Sticker Toolbar Component (v2.0)
 */

import React from 'react';
import { Trash2, Layers, FlipHorizontal } from 'lucide-react';
import { StudioStickerElement } from '../../../../types';
import { usePhotoBookStore } from '../../../../hooks/usePhotoBookStore';

interface StickerToolbarProps {
  element: StudioStickerElement;
  pageId: string;
  onClose?: () => void;
}

export default function StickerToolbar({ element, pageId, onClose }: StickerToolbarProps) {
  const updateElement = usePhotoBookStore((state) => state.updateElement);
  const deleteElements = usePhotoBookStore((state) => state.deleteElements);
  const reorderElement = usePhotoBookStore((state) => state.reorderElement);

  const handleFlipHorizontal = () => {
    updateElement(pageId, element.id, {
      flipHorizontal: !element.flipHorizontal,
    });
  };

  const handleFlipVertical = () => {
    updateElement(pageId, element.id, {
      flipVertical: !element.flipVertical,
    });
  };

  const handleLayerChange = (direction: 'forward' | 'backward') => {
    reorderElement(pageId, element.id, direction);
  };

  const handleDelete = () => {
    deleteElements(pageId, [element.id]);
    onClose?.();
  };

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-xl p-2 flex items-center gap-1">
      {/* Flip Horizontal */}
      <button
        onClick={handleFlipHorizontal}
        className={`p-2 hover:bg-slate-800 rounded ${
          element.flipHorizontal ? 'text-violet-400' : 'text-slate-400'
        }`}
        title="Flip horizontal"
      >
        <FlipHorizontal size={16} />
      </button>

      {/* Flip Vertical */}
      <button
        onClick={handleFlipVertical}
        className={`p-2 hover:bg-slate-800 rounded ${
          element.flipVertical ? 'text-violet-400' : 'text-slate-400'
        } transform rotate-90`}
        title="Flip vertical"
      >
        <FlipHorizontal size={16} />
      </button>

      <div className="w-px h-6 bg-slate-700" />

      {/* Layer Order */}
      <button
        onClick={() => handleLayerChange('forward')}
        className="p-2 hover:bg-slate-800 rounded text-slate-400"
        title="Bring forward"
      >
        <Layers size={16} />
      </button>
      <button
        onClick={() => handleLayerChange('backward')}
        className="p-2 hover:bg-slate-800 rounded text-slate-400 opacity-60"
        title="Send backward"
      >
        <Layers size={16} className="rotate-180" />
      </button>

      <div className="w-px h-6 bg-slate-700" />

      {/* Delete */}
      <button
        onClick={handleDelete}
        className="p-2 hover:bg-red-600 rounded text-slate-400 hover:text-white"
        title="Delete sticker"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
