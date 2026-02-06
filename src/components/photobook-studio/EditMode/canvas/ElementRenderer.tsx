/**
 * Element Renderer - Routes to specific renderer based on element type
 */

import React from 'react';
import type { StudioPageElement } from '../../../../types';
import Konva from 'konva';
import PhotoElementRenderer from './PhotoElementRenderer';
import TextElementRenderer from './TextElementRenderer';
import ShapeElementRenderer from './ShapeElementRenderer';
import StickerElementRenderer from './StickerElementRenderer';

interface ElementRendererProps {
  element: StudioPageElement;
  pageId: string;
  isSelected: boolean;
  onClick: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onTransform: (attrs: Partial<StudioPageElement>) => void;
  onDoubleClick?: () => void;
}

export default function ElementRenderer({
  element,
  pageId,
  isSelected,
  onClick,
  onTransform,
  onDoubleClick,
}: ElementRendererProps) {
  switch (element.type) {
    case 'photo':
      return (
        <PhotoElementRenderer
          element={element}
          pageId={pageId}
          isSelected={isSelected}
          onClick={onClick}
          onTransform={onTransform}
        />
      );
    case 'text':
      return (
        <TextElementRenderer
          element={element}
          pageId={pageId}
          isSelected={isSelected}
          onClick={onClick}
          onTransform={onTransform}
          onDoubleClick={onDoubleClick}
        />
      );
    case 'shape':
      return (
        <ShapeElementRenderer
          element={element}
          pageId={pageId}
          isSelected={isSelected}
          onClick={onClick}
          onTransform={onTransform}
        />
      );
    case 'sticker':
      return (
        <StickerElementRenderer
          element={element}
          pageId={pageId}
          isSelected={isSelected}
          onClick={onClick}
          onTransform={onTransform}
        />
      );
    default:
      return null;
  }
}
