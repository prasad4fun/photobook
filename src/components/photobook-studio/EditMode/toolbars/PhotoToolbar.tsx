/**
 * Photo Toolbar Component (v2.0)
 * Contextual toolbar for photo element manipulation
 */

import React, { useState } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  RotateCw,
  FlipHorizontal,
  Frame as FrameIcon,
  Layers,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { StudioPhotoElement, StudioPhoto, StudioPhotoTransform, StudioFrameStyle, StudioPhotoEffect } from '../../../../types';
import { usePhotoBookStore } from '../../../../hooks/usePhotoBookStore';

interface PhotoToolbarProps {
  element: StudioPhotoElement;
  photo: StudioPhoto;
  pageId: string;
  onClose?: () => void;
}

export default function PhotoToolbar({ element, photo, pageId, onClose }: PhotoToolbarProps) {
  const updateElement = usePhotoBookStore((state) => state.updateElement);
  const deleteElements = usePhotoBookStore((state) => state.deleteElements);
  const reorderElement = usePhotoBookStore((state) => state.reorderElement);

  const [showFramePicker, setShowFramePicker] = useState(false);
  const [showEffectPicker, setShowEffectPicker] = useState(false);

  const transform = element.transform || {
    zoom: 1,
    fit: 'fill',
    rotation: 0,
    flipHorizontal: false,
    flipVertical: false,
  };

  const frame = element.frame || {
    enabled: false,
    color: '#000000',
    width: 5,
    style: 'solid' as const,
  };

  const effect = element.effect || {
    type: 'none' as const,
    intensity: 100,
  };

  // Zoom handlers
  const handleZoomIn = () => {
    const newZoom = Math.min(3.0, transform.zoom + 0.1);
    updateElement(pageId, element.id, {
      transform: { ...transform, zoom: newZoom },
    });
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(0.5, transform.zoom - 0.1);
    updateElement(pageId, element.id, {
      transform: { ...transform, zoom: newZoom },
    });
  };

  const handleFit = () => {
    updateElement(pageId, element.id, {
      transform: { ...transform, fit: 'fit', zoom: 1 },
    });
  };

  // Rotation handlers
  const handleRotateLeft = () => {
    const newRotation = (transform.rotation - 90 + 360) % 360;
    updateElement(pageId, element.id, {
      transform: { ...transform, rotation: newRotation },
    });
  };

  const handleRotateRight = () => {
    const newRotation = (transform.rotation + 90) % 360;
    updateElement(pageId, element.id, {
      transform: { ...transform, rotation: newRotation },
    });
  };

  // Flip handlers
  const handleFlipHorizontal = () => {
    updateElement(pageId, element.id, {
      transform: { ...transform, flipHorizontal: !transform.flipHorizontal },
    });
  };

  const handleFlipVertical = () => {
    updateElement(pageId, element.id, {
      transform: { ...transform, flipVertical: !transform.flipVertical },
    });
  };

  // Frame handler
  const handleToggleFrame = () => {
    setShowFramePicker(!showFramePicker);
  };

  const handleFrameChange = (updates: Partial<StudioFrameStyle>) => {
    updateElement(pageId, element.id, {
      frame: { ...frame, ...updates },
    });
  };

  // Effect handler
  const handleEffectChange = (effectType: StudioPhotoEffect['type']) => {
    updateElement(pageId, element.id, {
      effect: { type: effectType, intensity: 100 },
    });
    setShowEffectPicker(false);
  };

  // Layer order handlers
  const handleBringForward = () => {
    reorderElement(pageId, element.id, 'forward');
  };

  const handleSendBackward = () => {
    reorderElement(pageId, element.id, 'backward');
  };

  // Delete handler
  const handleDelete = () => {
    if (window.confirm('Delete this photo?')) {
      deleteElements(pageId, [element.id]);
      onClose?.();
    }
  };

  // Remove photo but keep slot
  const handleRemovePhoto = () => {
    if (window.confirm('Remove photo from design? The slot will remain empty.')) {
      // Keep the slot, just remove the photo reference
      updateElement(pageId, element.id, {
        photoId: '',
      });
    }
  };

  return (
    <div className="relative">
      {/* Main Toolbar */}
      <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-xl p-2 flex items-center gap-1">
        {/* Close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
            title="Close toolbar"
          >
            <X size={16} />
          </button>
        )}

        {/* Separator */}
        {onClose && <div className="w-px h-6 bg-slate-700" />}

        {/* Zoom controls */}
        <button
          onClick={handleZoomOut}
          className="p-2 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
          title="Zoom out"
        >
          <ZoomOut size={16} />
        </button>
        <button
          onClick={handleZoomIn}
          className="p-2 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
          title="Zoom in"
        >
          <ZoomIn size={16} />
        </button>
        <button
          onClick={handleFit}
          className="p-2 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
          title="Fit to slot"
        >
          <Maximize2 size={16} />
        </button>

        <div className="w-px h-6 bg-slate-700" />

        {/* Rotation controls */}
        <button
          onClick={handleRotateLeft}
          className="p-2 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
          title="Rotate left"
        >
          <RotateCcw size={16} />
        </button>
        <button
          onClick={handleRotateRight}
          className="p-2 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
          title="Rotate right"
        >
          <RotateCw size={16} />
        </button>

        <div className="w-px h-6 bg-slate-700" />

        {/* Flip controls */}
        <button
          onClick={handleFlipHorizontal}
          className={`p-2 hover:bg-slate-800 rounded ${
            transform.flipHorizontal ? 'text-violet-400' : 'text-slate-400'
          } hover:text-white`}
          title="Flip horizontal"
        >
          <FlipHorizontal size={16} />
        </button>
        <button
          onClick={handleFlipVertical}
          className={`p-2 hover:bg-slate-800 rounded ${
            transform.flipVertical ? 'text-violet-400' : 'text-slate-400'
          } hover:text-white transform rotate-90`}
          title="Flip vertical"
        >
          <FlipHorizontal size={16} />
        </button>

        <div className="w-px h-6 bg-slate-700" />

        {/* Frame toggle */}
        <button
          onClick={handleToggleFrame}
          className={`p-2 hover:bg-slate-800 rounded ${
            frame.enabled ? 'text-violet-400' : 'text-slate-400'
          } hover:text-white`}
          title="Add frame"
        >
          <FrameIcon size={16} />
        </button>

        {/* Effect picker */}
        <div className="relative">
          <button
            onClick={() => setShowEffectPicker(!showEffectPicker)}
            className={`p-2 hover:bg-slate-800 rounded ${
              effect.type !== 'none' ? 'text-violet-400' : 'text-slate-400'
            } hover:text-white`}
            title="Add photo effect"
          >
            <Sparkles size={16} />
          </button>

          {/* Effect dropdown */}
          {showEffectPicker && (
            <div className="absolute top-full left-0 mt-2 bg-slate-900 border border-slate-700 rounded-lg shadow-xl p-2 min-w-[150px] z-50">
              {(['none', 'sepia', 'grayscale', 'vintage', 'warm', 'cool', 'vignette'] as const).map((effectType) => (
                <button
                  key={effectType}
                  onClick={() => handleEffectChange(effectType)}
                  className={`w-full text-left px-3 py-2 rounded hover:bg-slate-800 text-sm ${
                    effect.type === effectType ? 'text-violet-400' : 'text-slate-300'
                  }`}
                >
                  {effectType.charAt(0).toUpperCase() + effectType.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-slate-700" />

        {/* Layer order */}
        <button
          onClick={handleBringForward}
          className="p-2 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
          title="Bring forward"
        >
          <Layers size={16} />
        </button>
        <button
          onClick={handleSendBackward}
          className="p-2 hover:bg-slate-800 rounded text-slate-400 hover:text-white opacity-60"
          title="Send backward"
        >
          <Layers size={16} className="transform rotate-180" />
        </button>

        <div className="w-px h-6 bg-slate-700" />

        {/* Delete */}
        <button
          onClick={handleDelete}
          className="p-2 hover:bg-red-600 rounded text-slate-400 hover:text-white"
          title="Delete photo slot"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Frame Picker Modal */}
      {showFramePicker && (
        <div className="absolute top-full left-0 mt-2 bg-slate-900 border border-slate-700 rounded-lg shadow-xl p-4 z-50 min-w-[280px]">
          <div className="mb-3">
            <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={frame.enabled}
                onChange={(e) => handleFrameChange({ enabled: e.target.checked })}
                className="rounded"
              />
              Enable Frame
            </label>
          </div>

          {frame.enabled && (
            <>
              <div className="mb-3">
                <label className="block text-xs text-slate-400 mb-1">Frame Color</label>
                <input
                  type="color"
                  value={frame.color}
                  onChange={(e) => handleFrameChange({ color: e.target.value })}
                  className="w-full h-8 rounded border border-slate-700"
                />
              </div>

              <div className="mb-3">
                <label className="block text-xs text-slate-400 mb-1">
                  Width: {frame.width}px
                </label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={frame.width}
                  onChange={(e) => handleFrameChange({ width: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Style</label>
                <select
                  value={frame.style}
                  onChange={(e) => handleFrameChange({ style: e.target.value as StudioFrameStyle['style'] })}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white"
                >
                  <option value="solid">Solid</option>
                  <option value="dashed">Dashed</option>
                  <option value="dotted">Dotted</option>
                  <option value="double">Double</option>
                </select>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
