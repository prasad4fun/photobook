/**
 * Shape Element Renderer - Renders shape elements (rect, circle, etc.)
 */

import React from 'react';
import { Rect, Circle, Line, Group } from 'react-konva';
import Konva from 'konva';
import { StudioShapeElement } from '../../../../types';
import { usePhotoBookStore } from '../../../../hooks/usePhotoBookStore';
import { getPageDimensions } from '../../../../services/photobook-studio/photobookGenerator';

interface ShapeElementRendererProps {
  element: StudioShapeElement;
  pageId: string;
  isSelected: boolean;
  onClick: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onTransform: (attrs: Partial<StudioShapeElement>) => void;
}

export default function ShapeElementRenderer({
  element,
  pageId,
  isSelected,
  onClick,
  onTransform,
}: ShapeElementRendererProps) {
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
    const node = e.target as any;
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

  const commonProps = {
    id: element.id,
    name: 'element',
    draggable: !element.locked,
    onClick,
    onTap: onClick,
    onDragEnd: handleDragEnd,
    onTransformEnd: handleTransformEnd,
    fill: element.fillColor,
    stroke: element.strokeColor,
    strokeWidth: element.strokeWidth,
    rotation: element.rotation,
    shadowColor: isSelected ? '#8b5cf6' : undefined,
    shadowBlur: isSelected ? 10 : 0,
    shadowOpacity: isSelected ? 0.8 : 0,
    perfectDrawEnabled: false,
  };

  switch (element.shapeType) {
    case 'rectangle':
      return (
        <Rect
          {...commonProps}
          x={x}
          y={y}
          width={width}
          height={height}
          cornerRadius={element.cornerRadius || 0}
        />
      );

    case 'circle':
      return (
        <Circle
          {...commonProps}
          x={x + width / 2}
          y={y + height / 2}
          radius={Math.min(width, height) / 2}
        />
      );

    case 'triangle':
      return (
        <Line
          {...commonProps}
          points={[
            x + width / 2,
            y, // Top point
            x,
            y + height, // Bottom left
            x + width,
            y + height, // Bottom right
            x + width / 2,
            y, // Back to top
          ]}
          closed
        />
      );

    case 'polygon':
      if (!element.points || element.points.length < 3) return null;
      return (
        <Line
          {...commonProps}
          points={element.points.flatMap((p) => [
            x + (p.x / 100) * width,
            y + (p.y / 100) * height,
          ])}
          closed
        />
      );

    default:
      return null;
  }
}
