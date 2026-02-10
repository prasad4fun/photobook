/**
 * Edit Toolbar - Tools for adding and editing elements
 * v2.0 - Integrated ShapePicker
 */

import React, { useState } from 'react';
import { Type, Image, Shapes, Layout, Sparkles } from 'lucide-react';
import { PhotoBookStudioFeatures, STUDIO_DEFAULT_TEXT_ELEMENT, STUDIO_DEFAULT_SHAPE_ELEMENT, StudioShapeElement } from '../../../types';
import { usePhotoBookStore } from '../../../hooks/usePhotoBookStore';
import { generateId } from '../../../utils/photobook-studio/helpers';
import LayoutPickerModal from './LayoutPickerModal';
import ShapePicker from './ShapePicker';
import StickerPicker from './StickerPicker';
import type { StickerItem } from '../../../data/stickerLibrary';

interface EditToolbarProps {
  features: PhotoBookStudioFeatures;
  pageId: string;
}

export default function EditToolbar({ features, pageId }: EditToolbarProps) {
  const addElement = usePhotoBookStore((state) => state.addElement);
  const [showLayoutPicker, setShowLayoutPicker] = useState(false);
  const [showShapePicker, setShowShapePicker] = useState(false); // v2.0
  const [showStickerPicker, setShowStickerPicker] = useState(false);

  const handleAddText = () => {
    const textElement = {
      ...STUDIO_DEFAULT_TEXT_ELEMENT,
      id: generateId('text'),
      x: 40, // Center-ish
      y: 40,
    };
    addElement(pageId, textElement);
  };

  const handleAddPhoto = () => {
    // Create empty placeholder photo element
    const placeholderElement = {
      id: generateId('photo-placeholder'),
      type: 'photo' as const,
      photoId: undefined, // Empty placeholder
      x: 35, // Center-ish
      y: 35,
      width: 30, // 30% of page width
      height: 30, // Will adjust based on dropped image
      rotation: 0,
      zIndex: 50,
    };
    addElement(pageId, placeholderElement);
  };

  // v2.0: Updated to use ShapePicker
  const handleShapeSelect = (shapeCategory: StudioShapeElement['shapeCategory'], shapeType: StudioShapeElement['shapeType']) => {
    const shapeElement = {
      ...STUDIO_DEFAULT_SHAPE_ELEMENT,
      id: generateId('shape'),
      shapeCategory,
      shapeType,
      x: 40,
      y: 40,
    };
    addElement(pageId, shapeElement);
  };

  const handleChangeLayout = () => {
    setShowLayoutPicker(true);
  };

  const handleAddSticker = () => {
    if (!features.enableStickers) return;
    setShowStickerPicker(true);
  };

  const handleStickerSelect = (sticker: StickerItem) => {
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
    setShowStickerPicker(false);
  };

  return (
    <div className="flex items-center justify-center gap-2 px-4 py-3 border-b border-slate-800 bg-slate-900/30">
      {/* Add Text */}
      <button
        onClick={handleAddText}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
        title="Add Text (T)"
      >
        <Type size={18} />
        <span className="text-sm">Add Text</span>
      </button>

      {/* Add Photo */}
      <button
        onClick={handleAddPhoto}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
        title="Add Photo (P)"
      >
        <Image size={18} />
        <span className="text-sm">Add Photo</span>
      </button>

      {/* v2.0: Add Shapes - Unified Button */}
      {features.enableShapes && (
        <button
          onClick={() => setShowShapePicker(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
          title="Add Shapes"
        >
          <Shapes size={18} />
          <span className="text-sm">Add Shapes</span>
        </button>
      )}

      <div className="w-px h-6 bg-slate-700 mx-2" />

      {/* Change Layout */}
      {features.enableCustomLayouts && (
        <button
          onClick={handleChangeLayout}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
          title="Change Layout (L)"
        >
          <Layout size={18} />
          <span className="text-sm">Change Layout</span>
        </button>
      )}

      {/* Add Sticker */}
      {features.enableStickers && (
        <button
          onClick={handleAddSticker}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
          title="Add Sticker"
        >
          <Sparkles size={18} />
          <span className="text-sm">Sticker</span>
        </button>
      )}

      {/* Layout Picker Modal */}
      {showLayoutPicker && (
        <LayoutPickerModal
          pageId={pageId}
          onClose={() => setShowLayoutPicker(false)}
        />
      )}

      {/* v2.0: Shape Picker Modal */}
      {showShapePicker && (
        <ShapePicker
          onShapeSelect={handleShapeSelect}
          onClose={() => setShowShapePicker(false)}
        />
      )}

      {/* Sticker Picker Modal */}
      {showStickerPicker && (
        <StickerPicker
          onStickerSelect={handleStickerSelect}
          onClose={() => setShowStickerPicker(false)}
        />
      )}
    </div>
  );
}
