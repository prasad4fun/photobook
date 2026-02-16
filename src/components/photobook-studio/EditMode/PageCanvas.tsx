// @ts-nocheck
/**
 * Page Canvas - Main Konva canvas for page editing
 */

import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Rect } from 'react-konva';
import Konva from 'konva';
import type { StudioPage, StudioPageElement, StudioPageType, StudioTextElement } from '../../../types';
import { usePhotoBookStore } from '../../../hooks/usePhotoBookStore';
import { getPageDimensions } from '../../../services/photobook-studio/photobookGenerator';
import ElementRenderer from './canvas/ElementRenderer';
import ElementTransformer from './canvas/ElementTransformer';
import SelectionBox from './canvas/SelectionBox';
import TextEditor from './canvas/TextEditor';

// Page types that cannot be edited, dragged onto, or have elements selected
const NON_EDITABLE_PAGE_TYPES: StudioPageType[] = ['back-of-cover', 'back-cover'];

interface PageCanvasProps {
  page: StudioPage;
}

export default function PageCanvas({ page }: PageCanvasProps) {
  const stageRef = useRef<Konva.Stage>(null);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });
  const [isDragOver, setIsDragOver] = useState(false);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  const photoBook = usePhotoBookStore((state) => state.photoBook);
  const selectedPhotos = usePhotoBookStore((state) => state.selectedPhotos);
  const selectedElementIds = usePhotoBookStore((state) => state.selectedElementIds);
  const selectElements = usePhotoBookStore((state) => state.selectElements);
  const clearSelection = usePhotoBookStore((state) => state.clearSelection);
  const updateElement = usePhotoBookStore((state) => state.updateElement);
  const deleteElements = usePhotoBookStore((state) => state.deleteElements);
  const addElement = usePhotoBookStore((state) => state.addElement);

  // Get page dimensions
  const pageDimensions = photoBook
    ? getPageDimensions(photoBook.config)
    : { width: 2480, height: 3508 };

  // Calculate scale to fit container
  const scale = Math.min(
    containerSize.width / pageDimensions.width,
    containerSize.height / pageDimensions.height
  ) * 0.9; // 90% to add some padding

  const scaledWidth = pageDimensions.width * scale;
  const scaledHeight = pageDimensions.height * scale;

  // Handle window resize
  useEffect(() => {
    const updateSize = () => {
      const container = stageRef.current?.container().parentElement;
      if (container) {
        setContainerSize({
          width: container.clientWidth,
          height: container.clientHeight,
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Handle canvas click (deselect)
  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // If clicked on stage (empty area), clear selection
    if (e.target === e.target.getStage()) {
      clearSelection();
    }
  };

  // Handle element click
  const handleElementClick = (elementId: string, e: Konva.KonvaEventObject<MouseEvent>) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const cmdOrCtrl = isMac ? e.evt.metaKey : e.evt.ctrlKey;

    if (cmdOrCtrl) {
      // Multi-select with Cmd/Ctrl
      const isSelected = selectedElementIds.includes(elementId);
      if (isSelected) {
        selectElements(selectedElementIds.filter((id) => id !== elementId));
      } else {
        selectElements([...selectedElementIds, elementId]);
      }
    } else {
      // Single select
      selectElements([elementId]);
    }
  };

  // Handle element transform
  const handleElementTransform = (elementId: string, attrs: Partial<PageElement>) => {
    updateElement(page.id, elementId, attrs);
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete selected elements
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElementIds.length > 0) {
        e.preventDefault();
        deleteElements(page.id, selectedElementIds);
      }

      // Nudge selected elements with arrow keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        if (selectedElementIds.length === 0) return;
        e.preventDefault();

        const nudgeAmount = e.shiftKey ? 10 : 1;
        const nudge = {
          ArrowUp: { x: 0, y: -nudgeAmount / pageDimensions.height * 100 },
          ArrowDown: { x: 0, y: nudgeAmount / pageDimensions.height * 100 },
          ArrowLeft: { x: -nudgeAmount / pageDimensions.width * 100, y: 0 },
          ArrowRight: { x: nudgeAmount / pageDimensions.width * 100, y: 0 },
        }[e.key];

        if (nudge) {
          selectedElementIds.forEach((elementId) => {
            const element = page.elements.find((el) => el.id === elementId);
            if (element) {
              updateElement(page.id, elementId, {
                x: element.x + nudge.x,
                y: element.y + nudge.y,
              });
            }
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementIds, page.id, page.elements]);

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    // Block drops on non-editable pages
    if (NON_EDITABLE_PAGE_TYPES.includes(page.type)) return;

    const photoId = e.dataTransfer.getData('photoId');
    if (!photoId) return;

    const photo = selectedPhotos.find((p) => p.id === photoId);
    if (!photo) return;

    // Get drop position relative to canvas
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert to stage coordinates (accounting for scale)
    const stageX = x / scale;
    const stageY = y / scale;

    // Convert to percentage
    const xPercent = (stageX / pageDimensions.width) * 100;
    const yPercent = (stageY / pageDimensions.height) * 100;

    // Calculate default size (20% of page width, maintaining aspect ratio)
    const defaultWidth = 20;
    const defaultHeight = (defaultWidth * photo.height) / photo.width;

    // Check if drop is inside any placeholder
    const placeholders = page.elements.filter(
      (el) => el.type === 'photo' && !el.photoId
    );

    let targetPlaceholder = null;

    // Find the first placeholder that contains the drop point
    for (const placeholder of placeholders) {
      const phLeft = placeholder.x;
      const phTop = placeholder.y;
      const phRight = placeholder.x + placeholder.width;
      const phBottom = placeholder.y + placeholder.height;

      console.log(`Checking placeholder ${placeholder.id}:`);
      console.log(`  Placeholder bounds: x=${phLeft.toFixed(1)}% to ${phRight.toFixed(1)}%, y=${phTop.toFixed(1)}% to ${phBottom.toFixed(1)}%`);
      console.log(`  Drop point: x=${xPercent.toFixed(1)}%, y=${yPercent.toFixed(1)}%`);

      // Check if drop point is inside placeholder bounds
      if (xPercent >= phLeft && xPercent <= phRight &&
          yPercent >= phTop && yPercent <= phBottom) {
        console.log(`  ✓ Drop is INSIDE placeholder ${placeholder.id}`);
        targetPlaceholder = placeholder;
        break; // Use first matching placeholder
      } else {
        console.log(`  ✗ Drop is OUTSIDE placeholder`);
      }
    }

    // If dropped inside a placeholder, snap to it
    if (targetPlaceholder) {
      console.log(`Snapping to placeholder ${targetPlaceholder.id}`);
      // Update placeholder with photoId - keep placeholder dimensions
      updateElement(page.id, targetPlaceholder.id, {
        photoId: photo.id,
      });
    } else {
      console.log('No placeholder found at drop point - creating new photo element');
      // Create new photo element at absolute drop position
      const centeredX = Math.max(0, Math.min(xPercent - defaultWidth / 2, 100 - defaultWidth));
      const centeredY = Math.max(0, Math.min(yPercent - defaultHeight / 2, 100 - defaultHeight));

      const photoElement = {
        id: `photo-${Date.now()}-${Math.random()}`,
        type: 'photo' as const,
        photoId: photo.id,
        x: centeredX,
        y: centeredY,
        width: defaultWidth,
        height: defaultHeight,
        rotation: 0,
        zIndex: Date.now(),
      };

      addElement(page.id, photoElement);
    }
  };

  // Sort elements by zIndex
  const sortedElements = [...page.elements].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div
      className="relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Canvas Container */}
      <div
        className={`shadow-2xl transition-all ${
          isDragOver ? 'ring-4 ring-violet-500 ring-opacity-50' : ''
        }`}
        style={{
          width: scaledWidth,
          height: scaledHeight,
        }}
      >
        <Stage
          ref={stageRef}
          width={scaledWidth}
          height={scaledHeight}
          scaleX={scale}
          scaleY={scale}
          onClick={handleStageClick}
          onTap={handleStageClick}
        >
          {/* Background Layer */}
          <Layer listening={false}>
            {/* Page Background */}
            <Rect
              x={0}
              y={0}
              width={pageDimensions.width}
              height={pageDimensions.height}
              fill={page.background?.color || '#ffffff'}
            />
          </Layer>

          {/* Content Layer */}
          <Layer>
            {sortedElements.map((element) => (
              <ElementRenderer
                key={element.id}
                element={element}
                pageId={page.id}
                isSelected={selectedElementIds.includes(element.id)}
                onClick={(e) => handleElementClick(element.id, e)}
                onTransform={(attrs) => handleElementTransform(element.id, attrs)}
                onDoubleClick={() => {
                  if (element.type === 'text') {
                    setEditingTextId(element.id);
                  }
                }}
              />
            ))}

            {/* Transformer for selected elements */}
            <ElementTransformer
              selectedElementIds={selectedElementIds}
              elements={page.elements}
              onTransform={handleElementTransform}
            />
          </Layer>

          {/* UI Layer - Selection box, etc. */}
          <Layer>
            <SelectionBox onSelect={(elementIds) => selectElements(elementIds, false)} />
          </Layer>
        </Stage>
      </div>

      {/* Zoom indicator */}
      <div className="absolute bottom-4 right-4 px-3 py-1 bg-slate-800/90 rounded-lg text-xs text-slate-300">
        {Math.round(scale * 100)}%
      </div>

      {/* Text Editor (rendered outside Konva Stage) */}
      {editingTextId && (() => {
        const textElement = page.elements.find(el => el.id === editingTextId && el.type === 'text') as StudioTextElement | undefined;
        if (!textElement || !stageRef.current) return null;

        const textNode = stageRef.current.findOne(`#${editingTextId}`);
        if (!textNode) return null;

        return (
          <TextEditor
            element={textElement}
            textNode={textNode}
            onTextChange={(newText) => {
              updateElement(page.id, editingTextId, { content: newText });
            }}
            onClose={() => setEditingTextId(null)}
          />
        );
      })()}
    </div>
  );
}
