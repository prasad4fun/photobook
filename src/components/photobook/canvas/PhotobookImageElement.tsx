import { useEffect, useState } from 'react';
import { Image as KonvaImage, Rect, Group } from 'react-konva';
import Konva from 'konva';
import { ImageElement, ImageAsset } from '../../../types';

interface PhotobookImageElementProps {
  element: ImageElement;
  asset: ImageAsset;
  isSelected: boolean;
  onSelect: (e?: any) => void;
  onDragEnd: (x: number, y: number) => void;
  onTransformEnd: (width: number, height: number, rotation: number) => void;
}

export default function PhotobookImageElement({
  element,
  asset,
  isSelected,
  onSelect,
  onDragEnd,
  onTransformEnd,
}: PhotobookImageElementProps) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = asset.preview;

    img.onload = () => {
      console.log('✅ Image loaded:', asset.name);
      setImage(img);
    };

    img.onerror = (error) => {
      console.error('❌ Failed to load image:', asset.name, error);
    };

    // Cleanup
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [asset.preview, asset.name]);

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    const node = e.target;
    onDragEnd(node.x(), node.y());
  };

  const handleTransformEnd = (e: Konva.KonvaEventObject<Event>) => {
    const node = e.target as Konva.Image;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    // Reset scale to 1 and apply to width/height
    node.scaleX(1);
    node.scaleY(1);

    const newWidth = Math.max(10, node.width() * scaleX);
    const newHeight = Math.max(10, node.height() * scaleY);
    const rotation = node.rotation();

    onTransformEnd(newWidth, newHeight, rotation);
  };

  if (!image) {
    // Render placeholder while loading
    console.log('⏳ Loading image:', asset.name);
    return (
      <Rect
        id={element.id}
        name="imagePlaceholder"
        x={element.x}
        y={element.y}
        width={element.width}
        height={element.height}
        fill="#e5e7eb"
        stroke={isSelected ? '#8b5cf6' : '#d1d5db'}
        strokeWidth={2}
        listening={!element.locked}
        onClick={onSelect}
        onTap={onSelect}
      />
    );
  }

  console.log('🖼️  Rendering PhotobookImageElement:', element.id, 'at', element.x, element.y);

  return (
    <Group>
      <KonvaImage
        id={element.id}
        name="photobookImage"
        image={image}
        x={element.x}
        y={element.y}
        width={element.width}
        height={element.height}
        rotation={element.rotation}
        opacity={element.opacity / 100}
        draggable={!element.locked}
        listening={!element.locked}
        visible={element.visible}
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
        cornerRadius={element.borderRadius}
        // Apply filters
        filters={getKonvaFilters(element)}
        // Apply crop if exists
        crop={
          element.cropData
            ? {
                x: element.cropData.x,
                y: element.cropData.y,
                width: element.cropData.width,
                height: element.cropData.height,
              }
            : undefined
        }
        scaleX={element.flipX ? -1 : 1}
        scaleY={element.flipY ? -1 : 1}
        // Shadow
        shadowColor={element.shadow?.color}
        shadowBlur={element.shadow?.blur}
        shadowOffsetX={element.shadow?.offsetX}
        shadowOffsetY={element.shadow?.offsetY}
        // Border
        stroke={element.border?.color}
        strokeWidth={element.border?.width}
      />
    </Group>
  );
}

function getKonvaFilters(element: ImageElement): any[] {
  const filters: any[] = [];

  element.filters.forEach((filter) => {
    switch (filter.type) {
      case 'blur':
        filters.push(Konva.Filters.Blur);
        break;
      case 'brightness':
        filters.push(Konva.Filters.Brighten);
        break;
      case 'contrast':
        filters.push(Konva.Filters.Contrast);
        break;
      case 'bw':
        filters.push(Konva.Filters.Grayscale);
        break;
      case 'sepia':
        filters.push(Konva.Filters.Sepia);
        break;
      // Add more filters as needed
    }
  });

  return filters;
}
