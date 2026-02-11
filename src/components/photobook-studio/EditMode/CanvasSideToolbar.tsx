/**
 * Canvas Side Toolbar - Vertical icon strip for canvas tools
 * Pixory-style: compact vertical icons flanking the canvas
 */

import React from 'react';
import { Type, Image, Layout, Square, Sparkles } from 'lucide-react';
import { PhotoBookStudioFeatures, STUDIO_DEFAULT_TEXT_ELEMENT } from '../../../types';
import { usePhotoBookStore } from '../../../hooks/usePhotoBookStore';
import { generateId } from '../../../utils/photobook-studio/helpers';

interface CanvasSideToolbarProps {
  features: PhotoBookStudioFeatures;
  pageId: string;
  side: 'left' | 'right';
}

interface ToolButton {
  id: string;
  icon: React.ReactNode;
  label: string;
  action: () => void;
  isActive?: boolean;
  featureFlag?: boolean;
}

export default function CanvasSideToolbar({ features, pageId, side }: CanvasSideToolbarProps) {
  const addElement = usePhotoBookStore((state) => state.addElement);
  const leftPanelView = usePhotoBookStore((state) => state.leftPanelView);
  const setLeftPanelView = usePhotoBookStore((state) => state.setLeftPanelView);

  const handleAddText = () => {
    const textElement = {
      ...STUDIO_DEFAULT_TEXT_ELEMENT,
      id: generateId('text'),
      x: 40,
      y: 40,
    };
    addElement(pageId, textElement);
  };

  const handleAddPhoto = () => {
    const placeholderElement = {
      id: generateId('photo-placeholder'),
      type: 'photo' as const,
      photoId: undefined,
      x: 35,
      y: 35,
      width: 30,
      height: 30,
      rotation: 0,
      zIndex: 50,
    };
    addElement(pageId, placeholderElement);
  };

  const tools: ToolButton[] = [
    {
      id: 'text',
      icon: <Type size={18} />,
      label: 'Text',
      action: handleAddText,
    },
    {
      id: 'photo',
      icon: <Image size={18} />,
      label: 'Photo',
      action: handleAddPhoto,
    },
    {
      id: 'layout',
      icon: <Layout size={18} />,
      label: 'Layout',
      action: () => setLeftPanelView(leftPanelView === 'layouts' ? 'photos' : 'layouts'),
      isActive: leftPanelView === 'layouts',
      featureFlag: features.enableCustomLayouts,
    },
    {
      id: 'shapes',
      icon: <Square size={18} />,
      label: 'Rectangle',
      action: () => setLeftPanelView(leftPanelView === 'shapes' ? 'photos' : 'shapes'),
      isActive: leftPanelView === 'shapes',
      featureFlag: features.enableShapes,
    },
    {
      id: 'stickers',
      icon: <Sparkles size={18} />,
      label: 'Sticker',
      action: () => setLeftPanelView(leftPanelView === 'stickers' ? 'photos' : 'stickers'),
      isActive: leftPanelView === 'stickers',
      featureFlag: features.enableStickers,
    },
  ];

  const visibleTools = tools.filter((t) => t.featureFlag === undefined || t.featureFlag);

  return (
    <div
      className={`flex flex-col items-center gap-1 py-3 px-1 bg-white/80 backdrop-blur-sm z-10 ${
        side === 'left' ? 'border-r border-gray-200' : 'border-l border-gray-200'
      }`}
      style={{ width: 52 }}
    >
      {visibleTools.map((tool) => (
        <button
          key={tool.id}
          onClick={tool.action}
          className={`flex flex-col items-center gap-0.5 p-1.5 rounded-lg transition-colors w-full ${
            tool.isActive
              ? 'bg-violet-100 text-violet-700'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
          title={tool.label}
        >
          {tool.icon}
          <span className="text-[9px] font-medium leading-tight">{tool.label}</span>
        </button>
      ))}
    </div>
  );
}
