/**
 * Shape Picker Modal (v2.0)
 * Unified shape selection with category tabs
 */

import React, { useState } from 'react';
import { X, Square, Circle, Triangle, Star, MessageCircle } from 'lucide-react';
import { StudioShapeElement } from '../../../types';

interface ShapePickerProps {
  onShapeSelect: (shapeCategory: StudioShapeElement['shapeCategory'], shapeType: StudioShapeElement['shapeType']) => void;
  onClose: () => void;
}

type ShapeCategory = 'basic' | 'stars' | 'banners' | 'callouts';

interface ShapeOption {
  type: StudioShapeElement['shapeType'];
  label: string;
  icon?: React.ReactNode;
}

const shapesByCategory: Record<ShapeCategory, ShapeOption[]> = {
  basic: [
    { type: 'rectangle', label: 'Rectangle', icon: <Square size={32} /> },
    { type: 'circle', label: 'Circle', icon: <Circle size={32} /> },
    { type: 'oval', label: 'Oval' },
    { type: 'triangle', label: 'Triangle', icon: <Triangle size={32} /> },
    { type: 'polygon', label: 'Polygon' },
  ],
  stars: [
    { type: 'star-5', label: '5-Point Star', icon: <Star size={32} /> },
    { type: 'star-6', label: '6-Point Star' },
    { type: 'star-8', label: '8-Point Star' },
    { type: 'burst', label: 'Burst' },
  ],
  banners: [
    { type: 'ribbon', label: 'Ribbon' },
    { type: 'banner-wave', label: 'Wave Banner' },
    { type: 'banner-fold', label: 'Folded Banner' },
  ],
  callouts: [
    { type: 'speech-bubble', label: 'Speech Bubble', icon: <MessageCircle size={32} /> },
    { type: 'thought-bubble', label: 'Thought Bubble' },
    { type: 'callout-rounded', label: 'Rounded Callout' },
    { type: 'callout-cloud', label: 'Cloud Callout' },
  ],
};

export default function ShapePicker({ onShapeSelect, onClose }: ShapePickerProps) {
  const [activeCategory, setActiveCategory] = useState<ShapeCategory>('basic');

  const handleShapeSelect = (shapeType: StudioShapeElement['shapeType']) => {
    onShapeSelect(activeCategory, shapeType);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white">Add Shape</h2>
            <p className="text-sm text-slate-400 mt-1">
              Select a shape to add to your page
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex border-b border-slate-800 px-6">
          {(['basic', 'stars', 'banners', 'callouts'] as const).map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeCategory === category
                  ? 'border-violet-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        {/* Shape Grid */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-3 gap-4">
            {shapesByCategory[activeCategory].map((shape) => (
              <button
                key={shape.type}
                onClick={() => handleShapeSelect(shape.type)}
                className="flex flex-col items-center justify-center gap-3 p-6 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-violet-500 rounded-lg transition-all group"
              >
                {/* Shape Icon */}
                <div className="text-slate-400 group-hover:text-violet-400 transition-colors">
                  {shape.icon || (
                    <div className="w-8 h-8 flex items-center justify-center text-2xl font-bold">
                      {shape.label.charAt(0)}
                    </div>
                  )}
                </div>

                {/* Shape Label */}
                <span className="text-sm text-slate-300 group-hover:text-white transition-colors text-center">
                  {shape.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
