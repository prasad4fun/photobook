/**
 * Shape Toolbar Component (v2.0)
 */

import React, { useState } from 'react';
import { Trash2, Layers, Palette } from 'lucide-react';
import { StudioShapeElement } from '../../../../types';
import { usePhotoBookStore } from '../../../../hooks/usePhotoBookStore';

interface ShapeToolbarProps {
  element: StudioShapeElement;
  pageId: string;
  onClose?: () => void;
}

export default function ShapeToolbar({ element, pageId, onClose }: ShapeToolbarProps) {
  const updateElement = usePhotoBookStore((state) => state.updateElement);
  const deleteElements = usePhotoBookStore((state) => state.deleteElements);
  const reorderElement = usePhotoBookStore((state) => state.reorderElement);

  const [showBorderSettings, setShowBorderSettings] = useState(false);

  const border = element.border || {
    enabled: false,
    color: '#000000',
    width: 2,
    style: 'solid' as const,
  };

  const handleFillColorChange = (color: string) => {
    updateElement(pageId, element.id, { fillColor: color });
  };

  const handleBorderChange = (updates: Partial<typeof border>) => {
    updateElement(pageId, element.id, {
      border: { ...border, ...updates },
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
      {/* Fill Color */}
      <div className="flex items-center gap-2">
        <Palette size={16} className="text-slate-400" />
        <input
          type="color"
          value={element.fillColor || '#3b82f6'}
          onChange={(e) => handleFillColorChange(e.target.value)}
          className="w-8 h-8 rounded border border-slate-700"
        />
      </div>

      <div className="w-px h-6 bg-slate-700" />

      {/* Border Toggle */}
      <button
        onClick={() => setShowBorderSettings(!showBorderSettings)}
        className={`px-3 py-1 rounded text-sm ${
          border.enabled ? 'bg-violet-600' : 'bg-slate-800'
        }`}
      >
        Border
      </button>

      {showBorderSettings && (
        <div className="absolute top-full left-0 mt-2 bg-slate-900 border border-slate-700 rounded-lg p-4 z-50 min-w-[250px]">
          <label className="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              checked={border.enabled}
              onChange={(e) => handleBorderChange({ enabled: e.target.checked })}
            />
            <span className="text-sm">Enable Border</span>
          </label>
          {border.enabled && (
            <>
              <div className="mb-2">
                <label className="text-xs text-slate-400">Color</label>
                <input
                  type="color"
                  value={border.color}
                  onChange={(e) => handleBorderChange({ color: e.target.value })}
                  className="w-full h-8 rounded"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Width: {border.width}px</label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={border.width}
                  onChange={(e) => handleBorderChange({ width: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
            </>
          )}
        </div>
      )}

      <div className="w-px h-6 bg-slate-700" />

      {/* Layer Order */}
      <button
        onClick={() => handleLayerChange('forward')}
        className="p-2 hover:bg-slate-800 rounded"
        title="Bring forward"
      >
        <Layers size={16} />
      </button>
      <button
        onClick={() => handleLayerChange('backward')}
        className="p-2 hover:bg-slate-800 rounded opacity-60"
        title="Send backward"
      >
        <Layers size={16} className="rotate-180" />
      </button>

      <div className="w-px h-6 bg-slate-700" />

      {/* Delete */}
      <button
        onClick={handleDelete}
        className="p-2 hover:bg-red-600 rounded"
        title="Delete shape"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
