/**
 * Shape Picker Panel (v2.0) - Left Panel View
 * Unified shape selection with category tabs
 * Converted from modal to left panel view
 */

import React, { useState } from 'react';
import { ArrowLeft, Square, Circle, Triangle, Star, MessageCircle } from 'lucide-react';
import { StudioShapeElement, STUDIO_DEFAULT_SHAPE_ELEMENT } from '../../../types';
import { usePhotoBookStore } from '../../../hooks/usePhotoBookStore';
import { generateId } from '../../../utils/photobook-studio/helpers';

interface ShapePickerPanelProps {
  pageId: string;
}

type ShapeCategory = 'basic' | 'stars' | 'banners' | 'callouts';

interface ShapeOption {
  type: StudioShapeElement['shapeType'];
  label: string;
  icon?: React.ReactNode;
}

const shapesByCategory: Record<ShapeCategory, ShapeOption[]> = {
  basic: [
    { type: 'rectangle', label: 'Rectangle', icon: <Square size={28} /> },
    { type: 'circle', label: 'Circle', icon: <Circle size={28} /> },
    { type: 'oval', label: 'Oval' },
    { type: 'triangle', label: 'Triangle', icon: <Triangle size={28} /> },
    { type: 'polygon', label: 'Polygon' },
  ],
  stars: [
    { type: 'star-5', label: '5-Point Star', icon: <Star size={28} /> },
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
    { type: 'speech-bubble', label: 'Speech Bubble', icon: <MessageCircle size={28} /> },
    { type: 'thought-bubble', label: 'Thought Bubble' },
    { type: 'callout-rounded', label: 'Rounded Callout' },
    { type: 'callout-cloud', label: 'Cloud Callout' },
  ],
};

export default function ShapePickerPanel({ pageId }: ShapePickerPanelProps) {
  const [activeCategory, setActiveCategory] = useState<ShapeCategory>('basic');

  const addElement = usePhotoBookStore((state) => state.addElement);
  const setLeftPanelView = usePhotoBookStore((state) => state.setLeftPanelView);

  const handleShapeSelect = (shapeType: StudioShapeElement['shapeType']) => {
    // Create shape element
    const shapeElement = {
      ...STUDIO_DEFAULT_SHAPE_ELEMENT,
      id: generateId('shape'),
      shapeCategory: activeCategory,
      shapeType,
      x: 40, // Center-ish
      y: 40,
    };
    addElement(pageId, shapeElement);

    // Close panel after selection
    setLeftPanelView('photos');
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
          <h2 className="text-lg font-bold text-white">Add Shape</h2>
          <p className="text-xs text-slate-400 mt-1">
            Select a shape to add
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex border-b border-slate-800 px-4">
        {(['basic', 'stars', 'banners', 'callouts'] as const).map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-3 py-2.5 text-xs font-medium border-b-2 transition-colors ${
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
      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-2 gap-3">
          {shapesByCategory[activeCategory].map((shape) => (
            <button
              key={shape.type}
              onClick={() => handleShapeSelect(shape.type)}
              className="flex flex-col items-center justify-center gap-2 p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-violet-500 rounded-lg transition-all group"
            >
              {/* Shape Icon */}
              <div className="text-slate-400 group-hover:text-violet-400 transition-colors">
                {shape.icon || (
                  <div className="w-7 h-7 flex items-center justify-center text-xl font-bold">
                    {shape.label.charAt(0)}
                  </div>
                )}
              </div>

              {/* Shape Label */}
              <span className="text-xs text-slate-300 group-hover:text-white transition-colors text-center">
                {shape.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
