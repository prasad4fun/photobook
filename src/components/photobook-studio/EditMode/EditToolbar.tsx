/**
 * Edit Toolbar - Tools for adding and editing elements
 * v2.0 - Integrated ShapePicker, converted modals to left panel views
 */

import React from 'react';
import { Type, Image, Shapes, Layout, Sparkles } from 'lucide-react';
import { PhotoBookStudioFeatures, STUDIO_DEFAULT_TEXT_ELEMENT } from '../../../types';
import { usePhotoBookStore } from '../../../hooks/usePhotoBookStore';
import { generateId } from '../../../utils/photobook-studio/helpers';

interface EditToolbarProps {
  features: PhotoBookStudioFeatures;
  pageId: string;
}

export default function EditToolbar({ features, pageId }: EditToolbarProps) {
  const addElement = usePhotoBookStore((state) => state.addElement);
  const leftPanelView = usePhotoBookStore((state) => state.leftPanelView);
  const setLeftPanelView = usePhotoBookStore((state) => state.setLeftPanelView);

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

  // Toggle layout picker panel
  const handleChangeLayout = () => {
    setLeftPanelView(leftPanelView === 'layouts' ? 'photos' : 'layouts');
  };

  // Toggle shapes picker panel
  const handleShapesClick = () => {
    setLeftPanelView(leftPanelView === 'shapes' ? 'photos' : 'shapes');
  };

  // Toggle stickers picker panel
  const handleAddSticker = () => {
    if (!features.enableStickers) return;
    setLeftPanelView(leftPanelView === 'stickers' ? 'photos' : 'stickers');
  };

  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-2.5 border-b border-slate-800 bg-slate-900/30 overflow-x-auto flex-nowrap">
      {/* Add Text */}
      <button
        onClick={handleAddText}
        className="flex items-center gap-1.5 px-2.5 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors flex-shrink-0"
        title="Add Text (T)"
      >
        <Type size={16} />
        <span className="text-xs sm:text-sm">Add Text</span>
      </button>

      {/* Add Photo */}
      <button
        onClick={handleAddPhoto}
        className="flex items-center gap-1.5 px-2.5 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors flex-shrink-0"
        title="Add Photo (P)"
      >
        <Image size={16} />
        <span className="text-xs sm:text-sm">Add Photo</span>
      </button>

      {/* v2.0: Add Shapes - Toggle Panel */}
      {features.enableShapes && (
        <button
          onClick={handleShapesClick}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg transition-colors flex-shrink-0 ${
            leftPanelView === 'shapes'
              ? 'bg-violet-600 hover:bg-violet-700'
              : 'bg-slate-800 hover:bg-slate-700'
          }`}
          title="Add Shapes"
        >
          <Shapes size={16} />
          <span className="text-xs sm:text-sm hidden sm:inline">Add Shapes</span>
          <span className="text-xs sm:hidden">Shapes</span>
        </button>
      )}

      <div className="w-px h-5 bg-slate-700 mx-1 flex-shrink-0" />

      {/* Change Layout - Toggle Panel */}
      {features.enableCustomLayouts && (
        <button
          onClick={handleChangeLayout}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg transition-colors flex-shrink-0 ${
            leftPanelView === 'layouts'
              ? 'bg-violet-600 hover:bg-violet-700'
              : 'bg-slate-800 hover:bg-slate-700'
          }`}
          title="Change Layout"
        >
          <Layout size={16} />
          <span className="text-xs sm:text-sm hidden sm:inline">Change Layout</span>
          <span className="text-xs sm:hidden">Layout</span>
        </button>
      )}

      {/* Add Sticker - Toggle Panel */}
      {features.enableStickers && (
        <button
          onClick={handleAddSticker}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg transition-colors flex-shrink-0 ${
            leftPanelView === 'stickers'
              ? 'bg-violet-600 hover:bg-violet-700'
              : 'bg-slate-800 hover:bg-slate-700'
          }`}
          title="Add Sticker"
        >
          <Sparkles size={16} />
          <span className="text-xs sm:text-sm">Sticker</span>
        </button>
      )}
    </div>
  );
}
