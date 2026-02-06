/**
 * Text Format Toolbar - Formatting controls for text elements
 */

import React, { useState } from 'react';
import { Bold, Italic, AlignLeft, AlignCenter, AlignRight, AlignJustify, Trash2 } from 'lucide-react';
import { StudioTextElement } from '../../../../types';

interface TextFormatToolbarProps {
  element: StudioTextElement;
  onUpdate: (updates: Partial<StudioTextElement>) => void;
  onDelete: () => void;
  position: { x: number; y: number };
}

const FONT_FAMILIES = [
  'Londrina Solid',
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Georgia',
  'Courier New',
  'Verdana',
  'Comic Sans MS',
  'Impact',
  'Trebuchet MS',
  'Palatino',
];

// Font sizes in pixels at 300 DPI canvas resolution
// For reference: 72pt = 300px, 60pt = 250px, 48pt = 200px, 36pt = 150px, 24pt = 100px at 300 DPI
const FONT_SIZES = [50, 75, 100, 125, 150, 175, 200, 225, 252.5, 275, 300, 350, 400, 450, 500];

export default function TextFormatToolbar({
  element,
  onUpdate,
  onDelete,
  position,
}: TextFormatToolbarProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);

  const isBold = element.fontWeight === 'bold' || parseInt(element.fontWeight as string) >= 700;
  const isItalic = element.fontStyle === 'italic';

  const handleFontFamilyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdate({ fontFamily: e.target.value });
  };

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdate({ fontSize: parseFloat(e.target.value) });
  };

  const toggleBold = () => {
    onUpdate({ fontWeight: isBold ? 'normal' : 'bold' });
  };

  const toggleItalic = () => {
    onUpdate({ fontStyle: isItalic ? 'normal' : 'italic' });
  };

  const handleAlignChange = (align: StudioTextElement['textAlign']) => {
    onUpdate({ textAlign: align });
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ color: e.target.value });
  };

  return (
    <div
      className="absolute z-50 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl p-2 flex items-center gap-2"
      style={{
        left: position.x,
        top: position.y - 60, // Above the element
        minWidth: '600px',
      }}
      onClick={(e) => e.stopPropagation()} // Prevent canvas deselection
    >
      {/* Font Family */}
      <select
        value={element.fontFamily}
        onChange={handleFontFamilyChange}
        className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-sm text-white focus:outline-none focus:border-violet-500"
        style={{ width: '140px' }}
      >
        {FONT_FAMILIES.map((font) => (
          <option key={font} value={font}>
            {font}
          </option>
        ))}
      </select>

      {/* Font Size */}
      <select
        value={element.fontSize}
        onChange={handleFontSizeChange}
        className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-sm text-white focus:outline-none focus:border-violet-500"
        style={{ width: '95px' }}
      >
        {FONT_SIZES.map((size) => {
          // Convert pixels to points at 300 DPI for display: px * 72 / 300
          const points = Math.round((size * 72) / 300);
          return (
            <option key={size} value={size}>
              {points}pt ({size % 1 === 0 ? size : size.toFixed(1)}px)
            </option>
          );
        })}
      </select>

      <div className="w-px h-6 bg-slate-700" />

      {/* Bold */}
      <button
        onClick={toggleBold}
        className={`p-2 rounded transition-colors ${
          isBold
            ? 'bg-violet-600 text-white'
            : 'hover:bg-slate-800 text-slate-300'
        }`}
        title="Bold"
      >
        <Bold size={16} />
      </button>

      {/* Italic */}
      <button
        onClick={toggleItalic}
        className={`p-2 rounded transition-colors ${
          isItalic
            ? 'bg-violet-600 text-white'
            : 'hover:bg-slate-800 text-slate-300'
        }`}
        title="Italic"
      >
        <Italic size={16} />
      </button>

      <div className="w-px h-6 bg-slate-700" />

      {/* Text Align */}
      <button
        onClick={() => handleAlignChange('left')}
        className={`p-2 rounded transition-colors ${
          element.textAlign === 'left'
            ? 'bg-violet-600 text-white'
            : 'hover:bg-slate-800 text-slate-300'
        }`}
        title="Align Left"
      >
        <AlignLeft size={16} />
      </button>

      <button
        onClick={() => handleAlignChange('center')}
        className={`p-2 rounded transition-colors ${
          element.textAlign === 'center'
            ? 'bg-violet-600 text-white'
            : 'hover:bg-slate-800 text-slate-300'
        }`}
        title="Align Center"
      >
        <AlignCenter size={16} />
      </button>

      <button
        onClick={() => handleAlignChange('right')}
        className={`p-2 rounded transition-colors ${
          element.textAlign === 'right'
            ? 'bg-violet-600 text-white'
            : 'hover:bg-slate-800 text-slate-300'
        }`}
        title="Align Right"
      >
        <AlignRight size={16} />
      </button>

      <button
        onClick={() => handleAlignChange('justify')}
        className={`p-2 rounded transition-colors ${
          element.textAlign === 'justify'
            ? 'bg-violet-600 text-white'
            : 'hover:bg-slate-800 text-slate-300'
        }`}
        title="Justify"
      >
        <AlignJustify size={16} />
      </button>

      <div className="w-px h-6 bg-slate-700" />

      {/* Color Picker */}
      <div className="relative">
        <button
          onClick={() => setShowColorPicker(!showColorPicker)}
          className="p-2 rounded hover:bg-slate-800 transition-colors flex items-center gap-2"
          title="Text Color"
        >
          <div
            className="w-5 h-5 rounded border border-slate-600"
            style={{ backgroundColor: element.color }}
          />
          <span className="text-xs text-slate-300">Color</span>
        </button>

        {showColorPicker && (
          <div className="absolute top-full mt-2 left-0 p-2 bg-slate-900 border border-slate-700 rounded-lg shadow-xl">
            <input
              type="color"
              value={element.color}
              onChange={handleColorChange}
              className="w-32 h-32 cursor-pointer"
            />
            <input
              type="text"
              value={element.color}
              onChange={(e) => onUpdate({ color: e.target.value })}
              className="mt-2 w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded text-sm text-white"
            />
          </div>
        )}
      </div>

      <div className="w-px h-6 bg-slate-700" />

      {/* Delete */}
      <button
        onClick={onDelete}
        className="p-2 rounded hover:bg-red-600 text-slate-300 hover:text-white transition-colors"
        title="Delete Text"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
