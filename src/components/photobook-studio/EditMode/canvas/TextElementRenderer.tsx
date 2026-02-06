/**
 * Text Element Renderer - Renders text elements with Konva Text
 */

import React, { useRef } from 'react';
import { Text, Group, Rect } from 'react-konva';
import Konva from 'konva';
import { StudioTextElement } from '../../../../types';
import { usePhotoBookStore } from '../../../../hooks/usePhotoBookStore';
import { getPageDimensions } from '../../../../services/photobook-studio/photobookGenerator';

interface TextElementRendererProps {
  element: StudioTextElement;
  pageId: string;
  isSelected: boolean;
  onClick: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onTransform: (attrs: Partial<StudioTextElement>) => void;
  onDoubleClick?: () => void;
}

export default function TextElementRenderer({
  element,
  pageId,
  isSelected,
  onClick,
  onTransform,
  onDoubleClick,
}: TextElementRendererProps) {
  const textRef = useRef<Konva.Text>(null);

  const photoBook = usePhotoBookStore((state) => state.photoBook);

  // Get page dimensions for percentage conversion
  const pageDimensions = photoBook
    ? getPageDimensions(photoBook.config)
    : { width: 2480, height: 3508 };

  // Convert percentage to pixels
  const x = (element.x / 100) * pageDimensions.width;
  const y = (element.y / 100) * pageDimensions.height;
  const width = (element.width / 100) * pageDimensions.width;
  const height = (element.height / 100) * pageDimensions.height;

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    const node = e.target;
    onTransform({
      x: (node.x() / pageDimensions.width) * 100,
      y: (node.y() / pageDimensions.height) * 100,
    });
  };

  const handleTransformEnd = (e: Konva.KonvaEventObject<Event>) => {
    const node = e.target as Konva.Text;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    // Reset scale and update width/height instead
    node.scaleX(1);
    node.scaleY(1);

    onTransform({
      x: (node.x() / pageDimensions.width) * 100,
      y: (node.y() / pageDimensions.height) * 100,
      width: ((node.width() * scaleX) / pageDimensions.width) * 100,
      height: ((node.height() * scaleY) / pageDimensions.height) * 100,
      rotation: node.rotation(),
    });
  };

  return (
    <Group>
      {/* Background (if set) */}
      {element.backgroundColor && (
        <Rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={element.backgroundColor}
          rotation={element.rotation}
        />
      )}

      {/* Text */}
      <Text
        ref={textRef}
        id={element.id}
        name="element"
        text={element.content}
        x={x}
        y={y}
        width={width}
        height={height}
        fontSize={element.fontSize}
        fontFamily={element.fontFamily}
        fontWeight={element.fontWeight}
        fontStyle={element.fontStyle}
        fill={element.color}
        align={element.textAlign}
        verticalAlign="top"
        padding={element.padding || 0}
        lineHeight={element.lineHeight}
        letterSpacing={element.letterSpacing || 0}
        rotation={element.rotation}
        draggable={!element.locked}
        onClick={onClick}
        onTap={onClick}
        onDblClick={onDoubleClick}
        onDblTap={onDoubleClick}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
        // Selection styling
        shadowColor={isSelected ? '#8b5cf6' : undefined}
        shadowBlur={isSelected ? 10 : 0}
        shadowOpacity={isSelected ? 0.8 : 0}
        // Performance
        perfectDrawEnabled={false}
      />
    </Group>
  );
}
