/**
 * Selection Box - Drag to select multiple elements
 */

import React, { useState, useRef } from 'react';
import { Rect } from 'react-konva';
import Konva from 'konva';
import { usePhotoBookStore } from '../../../../hooks/usePhotoBookStore';
import { rectanglesIntersect } from '../../../../utils/photobook-studio/helpers';

interface SelectionBoxProps {
  onSelect: (elementIds: string[]) => void;
}

export default function SelectionBox({ onSelect }: SelectionBoxProps) {
  const [selectionRect, setSelectionRect] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const selectionStartRef = useRef<{ x: number; y: number } | null>(null);
  const photoBook = usePhotoBookStore((state) => state.photoBook);
  const currentPageId = usePhotoBookStore((state) => state.currentPageId);

  // Handle mouse down on stage (empty area)
  React.useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      const stage = (e.target as any).getStage?.();
      if (!stage || !currentPageId) return;

      // Only start selection if clicked on stage (empty area)
      const clickedOnEmpty = e.target === stage.container();
      if (!clickedOnEmpty) return;

      const pos = stage.getPointerPosition();
      if (!pos) return;

      selectionStartRef.current = pos;
      setSelectionRect({
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!selectionStartRef.current) return;

      const stage = (e.target as any).getStage?.();
      if (!stage) return;

      const pos = stage.getPointerPosition();
      if (!pos) return;

      const start = selectionStartRef.current;
      setSelectionRect({
        x: Math.min(start.x, pos.x),
        y: Math.min(start.y, pos.y),
        width: Math.abs(pos.x - start.x),
        height: Math.abs(pos.y - start.y),
      });
    };

    const handleMouseUp = () => {
      if (!selectionRect || !photoBook || !currentPageId) {
        selectionStartRef.current = null;
        setSelectionRect(null);
        return;
      }

      // Find elements that intersect with selection box
      const currentPage = photoBook.pages.find((p) => p.id === currentPageId);
      if (!currentPage) return;

      const selectedIds: string[] = [];

      currentPage.elements.forEach((element) => {
        // Convert element percentage to pixels (simplified)
        const elementRect = {
          x: element.x * 10, // Rough conversion
          y: element.y * 10,
          width: element.width * 10,
          height: element.height * 10,
        };

        if (rectanglesIntersect(selectionRect, elementRect)) {
          selectedIds.push(element.id);
        }
      });

      onSelect(selectedIds);

      // Reset
      selectionStartRef.current = null;
      setSelectionRect(null);
    };

    // Note: This is a simplified implementation
    // In production, attach to Konva stage events directly

    return () => {};
  }, [selectionRect, photoBook, currentPageId, onSelect]);

  if (!selectionRect) return null;

  return (
    <Rect
      x={selectionRect.x}
      y={selectionRect.y}
      width={selectionRect.width}
      height={selectionRect.height}
      fill="rgba(139, 92, 246, 0.1)"
      stroke="#8b5cf6"
      strokeWidth={2}
      dash={[10, 5]}
      listening={false}
    />
  );
}
