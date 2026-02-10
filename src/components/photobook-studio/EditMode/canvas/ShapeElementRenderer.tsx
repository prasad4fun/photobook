/**
 * Shape Element Renderer - Renders shape elements (rect, circle, etc.)
 */

import React from 'react';
import { Rect, Circle, Ellipse, Line, Group } from 'react-konva';
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

/**
 * Helper functions to generate points for various shapes
 */

// Generate points for star shapes
const generateStarPoints = (
  centerX: number,
  centerY: number,
  points: number,
  outerRadius: number,
  innerRadius: number
): number[] => {
  const step = (Math.PI * 2) / points;
  const halfStep = step / 2;
  const result: number[] = [];

  for (let i = 0; i < points; i++) {
    const angle = i * step - Math.PI / 2;
    // Outer point
    result.push(centerX + outerRadius * Math.cos(angle));
    result.push(centerY + outerRadius * Math.sin(angle));
    // Inner point
    result.push(centerX + innerRadius * Math.cos(angle + halfStep));
    result.push(centerY + innerRadius * Math.sin(angle + halfStep));
  }

  return result;
};

// Generate points for burst shape (many pointed star)
const generateBurstPoints = (
  centerX: number,
  centerY: number,
  points: number,
  outerRadius: number,
  innerRadius: number
): number[] => {
  const step = (Math.PI * 2) / points;
  const result: number[] = [];

  for (let i = 0; i < points * 2; i++) {
    const angle = (i * step) / 2 - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    result.push(centerX + radius * Math.cos(angle));
    result.push(centerY + radius * Math.sin(angle));
  }

  return result;
};

// Generate points for ribbon/banner
const generateRibbonPoints = (x: number, y: number, w: number, h: number): number[] => {
  return [
    x, y,                    // Top left
    x + w, y,                // Top right
    x + w, y + h * 0.7,      // Right before notch
    x + w * 0.5, y + h,      // Bottom center (point)
    x, y + h * 0.7,          // Left before notch
    x, y,                    // Back to start
  ];
};

// Generate points for wave banner
const generateWaveBannerPoints = (x: number, y: number, w: number, h: number): number[] => {
  const waveDepth = h * 0.2;
  const points: number[] = [];

  // Top edge
  points.push(x, y);
  points.push(x + w, y);

  // Right edge with wave
  const steps = 10;
  for (let i = 0; i <= steps; i++) {
    const progress = i / steps;
    const waveX = x + w + Math.sin(progress * Math.PI * 2) * waveDepth;
    const waveY = y + h * progress;
    points.push(waveX, waveY);
  }

  // Bottom edge
  points.push(x, y + h);

  return points;
};

// Generate points for folded banner
const generateFoldedBannerPoints = (x: number, y: number, w: number, h: number): number[] => {
  const foldSize = w * 0.1;
  return [
    x, y,                           // Top left
    x + w - foldSize, y,            // Top right before fold
    x + w, y + h * 0.5,             // Fold point
    x + w - foldSize, y + h,        // Bottom right after fold
    x, y + h,                       // Bottom left
    x, y,                           // Back to start
  ];
};

// Generate points for speech bubble
const generateSpeechBubblePoints = (x: number, y: number, w: number, h: number): number[] => {
  const tailWidth = w * 0.15;
  const bubbleHeight = h * 0.75;

  return [
    x, y,                           // Top left
    x + w, y,                       // Top right
    x + w, y + bubbleHeight,        // Right before tail
    x + w * 0.3 + tailWidth, y + bubbleHeight,  // Tail right
    x + w * 0.2, y + h,             // Tail point
    x + w * 0.3, y + bubbleHeight,  // Tail left
    x, y + bubbleHeight,            // Bottom left
    x, y,                           // Back to start
  ];
};

// Generate points for rounded callout
const generateRoundedCalloutPoints = (x: number, y: number, w: number, h: number): number[] => {
  const tailWidth = w * 0.15;

  return [
    x, y,                           // Top left
    x + w, y,                       // Top right
    x + w, y + h * 0.6,             // Right side
    x + w * 0.7 + tailWidth, y + h * 0.6,  // Tail right
    x + w * 0.7, y + h,             // Tail point
    x + w * 0.7, y + h * 0.6,       // Tail left
    x, y + h * 0.6,                 // Left side
    x, y,                           // Back to start
  ];
};

// Generate points for cloud callout
const generateCloudCalloutPoints = (x: number, y: number, w: number, h: number): number[] => {
  // Create a cloud-like bumpy shape
  const bumps = 6;
  const bumpHeight = h * 0.1;
  const points: number[] = [];

  // Top edge with bumps
  for (let i = 0; i <= bumps; i++) {
    const progress = i / bumps;
    const bumpX = x + w * progress;
    const bumpY = y + (i % 2 === 0 ? 0 : -bumpHeight);
    points.push(bumpX, bumpY);
  }

  // Right edge
  points.push(x + w, y + h * 0.5);

  // Bottom edge with bumps and tail
  for (let i = bumps; i >= 0; i--) {
    const progress = i / bumps;
    const bumpX = x + w * progress;
    const bumpY = y + h * 0.6 + (i % 2 === 0 ? 0 : bumpHeight);
    points.push(bumpX, bumpY);
  }

  // Add tail
  points.push(x + w * 0.3, y + h * 0.6);
  points.push(x + w * 0.2, y + h);
  points.push(x + w * 0.25, y + h * 0.6);

  // Left edge
  points.push(x, y + h * 0.5);

  return points;
};

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
      width: ((width * scaleX) / pageDimensions.width) * 100,
      height: ((height * scaleY) / pageDimensions.height) * 100,
      rotation: node.rotation(),
    });
  };

  // Get border/stroke properties - prioritize border if it exists
  const getBorderProps = () => {
    if (element.border?.enabled) {
      return {
        stroke: element.border.color,
        strokeWidth: element.border.width,
        dash: element.border.style === 'dashed' ? [10, 5] : element.border.style === 'dotted' ? [2, 2] : undefined,
      };
    }
    return {
      stroke: element.strokeColor,
      strokeWidth: element.strokeWidth,
      dash: undefined,
    };
  };

  const borderProps = getBorderProps();

  switch (element.shapeType) {
    case 'rectangle':
      return (
        <Group
          id={element.id}
          name="element"
          x={x}
          y={y}
          rotation={element.rotation}
          draggable={!element.locked}
          onClick={onClick}
          onTap={onClick}
          onDragEnd={handleDragEnd}
          onTransformEnd={handleTransformEnd}
        >
          <Rect
            x={0}
            y={0}
            width={width}
            height={height}
            fill={element.fillColor}
            stroke={borderProps.stroke}
            strokeWidth={borderProps.strokeWidth}
            dash={borderProps.dash}
            cornerRadius={element.cornerRadius || 0}
            shadowColor={isSelected ? '#8b5cf6' : undefined}
            shadowBlur={isSelected ? 10 : 0}
            shadowOpacity={isSelected ? 0.8 : 0}
            perfectDrawEnabled={false}
          />
        </Group>
      );

    case 'circle':
      return (
        <Group
          id={element.id}
          name="element"
          x={x}
          y={y}
          rotation={element.rotation}
          draggable={!element.locked}
          onClick={onClick}
          onTap={onClick}
          onDragEnd={handleDragEnd}
          onTransformEnd={handleTransformEnd}
        >
          <Circle
            x={width / 2}
            y={height / 2}
            radius={Math.min(width, height) / 2}
            fill={element.fillColor}
            stroke={borderProps.stroke}
            strokeWidth={borderProps.strokeWidth}
            dash={borderProps.dash}
            shadowColor={isSelected ? '#8b5cf6' : undefined}
            shadowBlur={isSelected ? 10 : 0}
            shadowOpacity={isSelected ? 0.8 : 0}
            perfectDrawEnabled={false}
          />
        </Group>
      );

    case 'oval':
      return (
        <Group
          id={element.id}
          name="element"
          x={x}
          y={y}
          rotation={element.rotation}
          draggable={!element.locked}
          onClick={onClick}
          onTap={onClick}
          onDragEnd={handleDragEnd}
          onTransformEnd={handleTransformEnd}
        >
          <Ellipse
            x={width / 2}
            y={height / 2}
            radiusX={width / 2}
            radiusY={height / 2}
            fill={element.fillColor}
            stroke={borderProps.stroke}
            strokeWidth={borderProps.strokeWidth}
            dash={borderProps.dash}
            shadowColor={isSelected ? '#8b5cf6' : undefined}
            shadowBlur={isSelected ? 10 : 0}
            shadowOpacity={isSelected ? 0.8 : 0}
            perfectDrawEnabled={false}
          />
        </Group>
      );

    case 'triangle':
      return (
        <Group
          id={element.id}
          name="element"
          x={x}
          y={y}
          rotation={element.rotation}
          draggable={!element.locked}
          onClick={onClick}
          onTap={onClick}
          onDragEnd={handleDragEnd}
          onTransformEnd={handleTransformEnd}
        >
          <Line
            points={[
              width / 2, 0,        // Top point
              0, height,           // Bottom left
              width, height,       // Bottom right
              width / 2, 0,        // Back to top
            ]}
            closed
            fill={element.fillColor}
            stroke={borderProps.stroke}
            strokeWidth={borderProps.strokeWidth}
            dash={borderProps.dash}
            shadowColor={isSelected ? '#8b5cf6' : undefined}
            shadowBlur={isSelected ? 10 : 0}
            shadowOpacity={isSelected ? 0.8 : 0}
            perfectDrawEnabled={false}
          />
        </Group>
      );

    case 'polygon':
      // Default hexagon if no points provided
      if (!element.points || element.points.length < 3) {
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 2;
        const sides = 6;
        const angleStep = (Math.PI * 2) / sides;
        const points: number[] = [];

        for (let i = 0; i < sides; i++) {
          const angle = i * angleStep - Math.PI / 2;
          points.push(centerX + radius * Math.cos(angle));
          points.push(centerY + radius * Math.sin(angle));
        }

        return (
          <Group
            id={element.id}
            name="element"
            x={x}
            y={y}
            rotation={element.rotation}
            draggable={!element.locked}
            onClick={onClick}
            onTap={onClick}
            onDragEnd={handleDragEnd}
            onTransformEnd={handleTransformEnd}
          >
            <Line
              points={points}
              closed
              fill={element.fillColor}
              stroke={element.strokeColor}
              strokeWidth={element.strokeWidth}
              shadowColor={isSelected ? '#8b5cf6' : undefined}
              shadowBlur={isSelected ? 10 : 0}
              shadowOpacity={isSelected ? 0.8 : 0}
              perfectDrawEnabled={false}
            />
          </Group>
        );
      }
      return (
        <Group
          id={element.id}
          name="element"
          x={x}
          y={y}
          rotation={element.rotation}
          draggable={!element.locked}
          onClick={onClick}
          onTap={onClick}
          onDragEnd={handleDragEnd}
          onTransformEnd={handleTransformEnd}
        >
          <Line
            points={element.points.flatMap((p) => [
              (p.x / 100) * width,
              (p.y / 100) * height,
            ])}
            closed
            fill={element.fillColor}
            stroke={borderProps.stroke}
            strokeWidth={borderProps.strokeWidth}
            dash={borderProps.dash}
            shadowColor={isSelected ? '#8b5cf6' : undefined}
            shadowBlur={isSelected ? 10 : 0}
            shadowOpacity={isSelected ? 0.8 : 0}
            perfectDrawEnabled={false}
          />
        </Group>
      );

    // Star shapes
    case 'star-5':
      return (
        <Group
          id={element.id}
          name="element"
          x={x}
          y={y}
          rotation={element.rotation}
          draggable={!element.locked}
          onClick={onClick}
          onTap={onClick}
          onDragEnd={handleDragEnd}
          onTransformEnd={handleTransformEnd}
        >
          <Line
            points={generateStarPoints(
              width / 2,
              height / 2,
              5,
              Math.min(width, height) / 2,
              Math.min(width, height) / 4
            )}
            closed
            fill={element.fillColor}
            stroke={borderProps.stroke}
            strokeWidth={borderProps.strokeWidth}
            dash={borderProps.dash}
            shadowColor={isSelected ? '#8b5cf6' : undefined}
            shadowBlur={isSelected ? 10 : 0}
            shadowOpacity={isSelected ? 0.8 : 0}
            perfectDrawEnabled={false}
          />
        </Group>
      );

    case 'star-6':
      return (
        <Group
          id={element.id}
          name="element"
          x={x}
          y={y}
          rotation={element.rotation}
          draggable={!element.locked}
          onClick={onClick}
          onTap={onClick}
          onDragEnd={handleDragEnd}
          onTransformEnd={handleTransformEnd}
        >
          <Line
            points={generateStarPoints(
              width / 2,
              height / 2,
              6,
              Math.min(width, height) / 2,
              Math.min(width, height) / 4
            )}
            closed
            fill={element.fillColor}
            stroke={borderProps.stroke}
            strokeWidth={borderProps.strokeWidth}
            dash={borderProps.dash}
            shadowColor={isSelected ? '#8b5cf6' : undefined}
            shadowBlur={isSelected ? 10 : 0}
            shadowOpacity={isSelected ? 0.8 : 0}
            perfectDrawEnabled={false}
          />
        </Group>
      );

    case 'star-8':
      return (
        <Group
          id={element.id}
          name="element"
          x={x}
          y={y}
          rotation={element.rotation}
          draggable={!element.locked}
          onClick={onClick}
          onTap={onClick}
          onDragEnd={handleDragEnd}
          onTransformEnd={handleTransformEnd}
        >
          <Line
            points={generateStarPoints(
              width / 2,
              height / 2,
              8,
              Math.min(width, height) / 2,
              Math.min(width, height) / 3.5
            )}
            closed
            fill={element.fillColor}
            stroke={borderProps.stroke}
            strokeWidth={borderProps.strokeWidth}
            dash={borderProps.dash}
            shadowColor={isSelected ? '#8b5cf6' : undefined}
            shadowBlur={isSelected ? 10 : 0}
            shadowOpacity={isSelected ? 0.8 : 0}
            perfectDrawEnabled={false}
          />
        </Group>
      );

    case 'burst':
      return (
        <Group
          id={element.id}
          name="element"
          x={x}
          y={y}
          rotation={element.rotation}
          draggable={!element.locked}
          onClick={onClick}
          onTap={onClick}
          onDragEnd={handleDragEnd}
          onTransformEnd={handleTransformEnd}
        >
          <Line
            points={generateBurstPoints(
              width / 2,
              height / 2,
              16,
              Math.min(width, height) / 2,
              Math.min(width, height) / 3
            )}
            closed
            fill={element.fillColor}
            stroke={borderProps.stroke}
            strokeWidth={borderProps.strokeWidth}
            dash={borderProps.dash}
            shadowColor={isSelected ? '#8b5cf6' : undefined}
            shadowBlur={isSelected ? 10 : 0}
            shadowOpacity={isSelected ? 0.8 : 0}
            perfectDrawEnabled={false}
          />
        </Group>
      );

    // Banner shapes
    case 'ribbon':
      return (
        <Group
          id={element.id}
          name="element"
          x={x}
          y={y}
          rotation={element.rotation}
          draggable={!element.locked}
          onClick={onClick}
          onTap={onClick}
          onDragEnd={handleDragEnd}
          onTransformEnd={handleTransformEnd}
        >
          <Line
            points={generateRibbonPoints(0, 0, width, height)}
            closed
            fill={element.fillColor}
            stroke={borderProps.stroke}
            strokeWidth={borderProps.strokeWidth}
            dash={borderProps.dash}
            shadowColor={isSelected ? '#8b5cf6' : undefined}
            shadowBlur={isSelected ? 10 : 0}
            shadowOpacity={isSelected ? 0.8 : 0}
            perfectDrawEnabled={false}
          />
        </Group>
      );

    case 'banner-wave':
      return (
        <Group
          id={element.id}
          name="element"
          x={x}
          y={y}
          rotation={element.rotation}
          draggable={!element.locked}
          onClick={onClick}
          onTap={onClick}
          onDragEnd={handleDragEnd}
          onTransformEnd={handleTransformEnd}
        >
          <Line
            points={generateWaveBannerPoints(0, 0, width, height)}
            closed
            fill={element.fillColor}
            stroke={borderProps.stroke}
            strokeWidth={borderProps.strokeWidth}
            dash={borderProps.dash}
            shadowColor={isSelected ? '#8b5cf6' : undefined}
            shadowBlur={isSelected ? 10 : 0}
            shadowOpacity={isSelected ? 0.8 : 0}
            perfectDrawEnabled={false}
          />
        </Group>
      );

    case 'banner-fold':
      return (
        <Group
          id={element.id}
          name="element"
          x={x}
          y={y}
          rotation={element.rotation}
          draggable={!element.locked}
          onClick={onClick}
          onTap={onClick}
          onDragEnd={handleDragEnd}
          onTransformEnd={handleTransformEnd}
        >
          <Line
            points={generateFoldedBannerPoints(0, 0, width, height)}
            closed
            fill={element.fillColor}
            stroke={borderProps.stroke}
            strokeWidth={borderProps.strokeWidth}
            dash={borderProps.dash}
            shadowColor={isSelected ? '#8b5cf6' : undefined}
            shadowBlur={isSelected ? 10 : 0}
            shadowOpacity={isSelected ? 0.8 : 0}
            perfectDrawEnabled={false}
          />
        </Group>
      );

    // Callout shapes
    case 'speech-bubble':
      return (
        <Group
          id={element.id}
          name="element"
          x={x}
          y={y}
          rotation={element.rotation}
          draggable={!element.locked}
          onClick={onClick}
          onTap={onClick}
          onDragEnd={handleDragEnd}
          onTransformEnd={handleTransformEnd}
        >
          <Line
            points={generateSpeechBubblePoints(0, 0, width, height)}
            closed
            cornerRadius={10}
            fill={element.fillColor}
            stroke={borderProps.stroke}
            strokeWidth={borderProps.strokeWidth}
            dash={borderProps.dash}
            shadowColor={isSelected ? '#8b5cf6' : undefined}
            shadowBlur={isSelected ? 10 : 0}
            shadowOpacity={isSelected ? 0.8 : 0}
            perfectDrawEnabled={false}
          />
        </Group>
      );

    case 'thought-bubble':
      // Thought bubble is composed of multiple circles
      const mainRadius = Math.min(width, height) * 0.35;
      const smallRadius1 = mainRadius * 0.3;
      const smallRadius2 = mainRadius * 0.2;

      return (
        <Group
          id={element.id}
          name="element"
          x={x}
          y={y}
          rotation={element.rotation}
          draggable={!element.locked}
          onClick={onClick}
          onTap={onClick}
          onDragEnd={handleDragEnd}
          onTransformEnd={handleTransformEnd}
        >
          {/* Main bubble */}
          <Circle
            x={width / 2}
            y={height * 0.3}
            radius={mainRadius}
            fill={element.fillColor}
            stroke={borderProps.stroke}
            strokeWidth={borderProps.strokeWidth}
            dash={borderProps.dash}
            shadowColor={isSelected ? '#8b5cf6' : undefined}
            shadowBlur={isSelected ? 10 : 0}
            shadowOpacity={isSelected ? 0.8 : 0}
            perfectDrawEnabled={false}
          />
          {/* Small bubble 1 */}
          <Circle
            x={width * 0.3}
            y={height * 0.7}
            radius={smallRadius1}
            fill={element.fillColor}
            stroke={borderProps.stroke}
            strokeWidth={borderProps.strokeWidth}
            dash={borderProps.dash}
            shadowColor={isSelected ? '#8b5cf6' : undefined}
            shadowBlur={isSelected ? 10 : 0}
            shadowOpacity={isSelected ? 0.8 : 0}
            perfectDrawEnabled={false}
          />
          {/* Small bubble 2 */}
          <Circle
            x={width * 0.2}
            y={height * 0.9}
            radius={smallRadius2}
            fill={element.fillColor}
            stroke={borderProps.stroke}
            strokeWidth={borderProps.strokeWidth}
            dash={borderProps.dash}
            shadowColor={isSelected ? '#8b5cf6' : undefined}
            shadowBlur={isSelected ? 10 : 0}
            shadowOpacity={isSelected ? 0.8 : 0}
            perfectDrawEnabled={false}
          />
        </Group>
      );

    case 'callout-rounded':
      return (
        <Group
          id={element.id}
          name="element"
          x={x}
          y={y}
          rotation={element.rotation}
          draggable={!element.locked}
          onClick={onClick}
          onTap={onClick}
          onDragEnd={handleDragEnd}
          onTransformEnd={handleTransformEnd}
        >
          <Line
            points={generateRoundedCalloutPoints(0, 0, width, height)}
            closed
            cornerRadius={15}
            fill={element.fillColor}
            stroke={borderProps.stroke}
            strokeWidth={borderProps.strokeWidth}
            dash={borderProps.dash}
            shadowColor={isSelected ? '#8b5cf6' : undefined}
            shadowBlur={isSelected ? 10 : 0}
            shadowOpacity={isSelected ? 0.8 : 0}
            perfectDrawEnabled={false}
          />
        </Group>
      );

    case 'callout-cloud':
      return (
        <Group
          id={element.id}
          name="element"
          x={x}
          y={y}
          rotation={element.rotation}
          draggable={!element.locked}
          onClick={onClick}
          onTap={onClick}
          onDragEnd={handleDragEnd}
          onTransformEnd={handleTransformEnd}
        >
          <Line
            points={generateCloudCalloutPoints(0, 0, width, height)}
            closed
            tension={0.3}
            fill={element.fillColor}
            stroke={borderProps.stroke}
            strokeWidth={borderProps.strokeWidth}
            dash={borderProps.dash}
            shadowColor={isSelected ? '#8b5cf6' : undefined}
            shadowBlur={isSelected ? 10 : 0}
            shadowOpacity={isSelected ? 0.8 : 0}
            perfectDrawEnabled={false}
          />
        </Group>
      );

    default:
      return null;
  }
}
