/**
 * Drag and Drop Hook - Manages photo drag from source panel to canvas
 */

import { useState, useCallback } from 'react';
import type { StudioPhoto, StudioPhotoElement } from '../types';
import { generateId } from '../utils/photobook-studio/helpers';

export function useDragAndDrop() {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedPhotoId, setDraggedPhotoId] = useState<string | null>(null);

  const handleDragStart = useCallback((photoId: string, e: React.DragEvent) => {
    setIsDragging(true);
    setDraggedPhotoId(photoId);
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('photoId', photoId);
  }, []);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    setDraggedPhotoId(null);
  }, []);

  const handleDrop = useCallback(
    (
      photo: StudioPhoto,
      position: { x: number; y: number },
      pageDimensions: { width: number; height: number }
    ): StudioPhotoElement => {
      // Convert pixel position to percentage
      const xPercent = (position.x / pageDimensions.width) * 100;
      const yPercent = (position.y / pageDimensions.height) * 100;

      // Calculate reasonable size (20% of page width)
      const width = 20;
      const height = (width * photo.height) / photo.width; // Maintain aspect ratio

      const photoElement: StudioPhotoElement = {
        id: generateId('photo'),
        type: 'photo',
        photoId: photo.id,
        x: Math.max(0, Math.min(xPercent, 100 - width)),
        y: Math.max(0, Math.min(yPercent, 100 - height)),
        width,
        height,
        rotation: 0,
        zIndex: Date.now(), // High zIndex to appear on top
      };

      return photoElement;
    },
    []
  );

  return {
    isDragging,
    draggedPhotoId,
    handleDragStart,
    handleDragEnd,
    handleDrop,
  };
}
