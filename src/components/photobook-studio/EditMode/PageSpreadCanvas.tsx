// @ts-nocheck
/**
 * Page Spread Canvas - Double-sided page view with center binding
 * Shows left and right pages like a physical photobook
 */

import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Group } from 'react-konva';
import Konva from 'konva';
import type { StudioPage, StudioTextElement } from '../../../types';
import { usePhotoBookStore } from '../../../hooks/usePhotoBookStore';
import { getPageDimensions } from '../../../services/photobook-studio/photobookGenerator';
import ElementRenderer from './canvas/ElementRenderer';
import ElementTransformer from './canvas/ElementTransformer';
import SelectionBox from './canvas/SelectionBox';
import TextEditor from './canvas/TextEditor';

interface PageSpreadCanvasProps {
  page: StudioPage;
}

export default function PageSpreadCanvas({ page }: PageSpreadCanvasProps) {
  const stageRef = useRef<Konva.Stage>(null);
  const [containerSize, setContainerSize] = useState({ width: 1600, height: 900 });
  const [isDragOver, setIsDragOver] = useState(false);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [activePageSide, setActivePageSide] = useState<'left' | 'right'>('right');

  const photoBook = usePhotoBookStore((state) => state.photoBook);
  const selectedPhotos = usePhotoBookStore((state) => state.selectedPhotos);
  const selectedElementIds = usePhotoBookStore((state) => state.selectedElementIds);
  const selectElements = usePhotoBookStore((state) => state.selectElements);
  const clearSelection = usePhotoBookStore((state) => state.clearSelection);
  const updateElement = usePhotoBookStore((state) => state.updateElement);
  const deleteElements = usePhotoBookStore((state) => state.deleteElements);
  const addElement = usePhotoBookStore((state) => state.addElement);

  // Get page dimensions (single page)
  const pageDimensions = photoBook
    ? getPageDimensions(photoBook.config)
    : { width: 2480, height: 3508 };

  // Spread dimensions (two pages + spine)
  const spineWidth = 100; // Center binding width
  const spreadWidth = pageDimensions.width * 2 + spineWidth;
  const spreadHeight = pageDimensions.height;

  // Get adjacent page for spread
  const getAdjacentPage = (): StudioPage | null => {
    if (!photoBook) return null;

    const currentIndex = photoBook.pages.findIndex((p) => p.id === page.id);
    if (currentIndex === -1) return null;

    // If even page number (left side), show next page on right
    // If odd page number (right side), show previous page on left
    const adjacentIndex = page.pageNumber % 2 === 0 ? currentIndex + 1 : currentIndex - 1;

    return photoBook.pages[adjacentIndex] || null;
  };

  const adjacentPage = getAdjacentPage();

  // Determine which page is left and which is right
  const leftPage = page.pageNumber % 2 === 0 ? page : adjacentPage;
  const rightPage = page.pageNumber % 2 === 0 ? adjacentPage : page;

  // Calculate scale to fit container
  const scale = Math.min(
    containerSize.width / spreadWidth,
    containerSize.height / spreadHeight
  ) * 0.85; // 85% to add padding

  const scaledSpreadWidth = spreadWidth * scale;
  const scaledSpreadHeight = spreadHeight * scale;
  const scaledPageWidth = pageDimensions.width * scale;
  const scaledSpineWidth = spineWidth * scale;

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
    if (e.target === e.target.getStage() || e.target.name() === 'page-bg') {
      clearSelection();
    }
  };

  // Handle element click
  const handleElementClick = (elementId: string, pageId: string, e: Konva.KonvaEventObject<MouseEvent>) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const cmdOrCtrl = isMac ? e.evt.metaKey : e.evt.ctrlKey;

    if (cmdOrCtrl) {
      const isSelected = selectedElementIds.includes(elementId);
      if (isSelected) {
        selectElements(selectedElementIds.filter((id) => id !== elementId));
      } else {
        selectElements([...selectedElementIds, elementId]);
      }
    } else {
      selectElements([elementId]);
    }
  };

  // Handle element transform
  const handleElementTransform = (elementId: string, pageId: string, attrs: any) => {
    updateElement(pageId, elementId, attrs);
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElementIds.length > 0) {
        e.preventDefault();
        const pageId = activePageSide === 'left' && leftPage ? leftPage.id : rightPage?.id;
        if (pageId) {
          deleteElements(pageId, selectedElementIds);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementIds, activePageSide, leftPage, rightPage]);

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

    const photoId = e.dataTransfer.getData('photoId');
    if (!photoId) return;

    const photo = selectedPhotos.find((p) => p.id === photoId);
    if (!photo) return;

    // Get drop position relative to canvas
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Determine which page was dropped on
    const isLeftSide = x < (scaledPageWidth + scaledSpineWidth / 2);
    const targetPage = isLeftSide ? leftPage : rightPage;
    if (!targetPage) return;

    // Calculate position relative to page (accounting for spread offset)
    const pageOffsetX = isLeftSide ? 0 : scaledPageWidth + scaledSpineWidth;
    const relativeX = x - pageOffsetX;
    const relativeY = y;

    // Convert to stage coordinates
    const stageX = relativeX / scale;
    const stageY = relativeY / scale;

    // Convert to percentage
    const xPercent = (stageX / pageDimensions.width) * 100;
    const yPercent = (stageY / pageDimensions.height) * 100;

    // Default size
    const defaultWidth = 20;
    const defaultHeight = (defaultWidth * photo.height) / photo.width;

    // Check for placeholders
    const placeholders = targetPage.elements.filter(
      (el) => el.type === 'photo' && !el.photoId
    );

    let targetPlaceholder = null;
    for (const placeholder of placeholders) {
      if (
        xPercent >= placeholder.x &&
        xPercent <= placeholder.x + placeholder.width &&
        yPercent >= placeholder.y &&
        yPercent <= placeholder.y + placeholder.height
      ) {
        targetPlaceholder = placeholder;
        break;
      }
    }

    if (targetPlaceholder) {
      updateElement(targetPage.id, targetPlaceholder.id, { photoId: photo.id });
    } else {
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

      addElement(targetPage.id, photoElement);
    }
  };

  // Render page in a Group at specified offset
  const renderPageInGroup = (currentPage: StudioPage | null, xOffset: number, side: 'left' | 'right') => {
    if (!currentPage) {
      return (
        <Group x={xOffset} y={0}>
          <Rect
            x={0}
            y={0}
            width={pageDimensions.width}
            height={pageDimensions.height}
            fill="#e5e7eb"
            name="page-bg"
          />
        </Group>
      );
    }

    const sortedElements = [...currentPage.elements].sort((a, b) => a.zIndex - b.zIndex);

    return (
      <Group x={xOffset} y={0}>
        {/* Page Background */}
        <Rect
          x={0}
          y={0}
          width={pageDimensions.width}
          height={pageDimensions.height}
          fill={currentPage.background?.color || '#ffffff'}
          name="page-bg"
          onClick={() => setActivePageSide(side)}
        />

        {/* Page Elements */}
        {sortedElements.map((element) => (
          <ElementRenderer
            key={element.id}
            element={element}
            pageId={currentPage.id}
            isSelected={activePageSide === side && selectedElementIds.includes(element.id)}
            onClick={(e) => {
              setActivePageSide(side);
              handleElementClick(element.id, currentPage.id, e);
            }}
            onTransform={(attrs) => handleElementTransform(element.id, currentPage.id, attrs)}
            onDoubleClick={() => {
              if (element.type === 'text') {
                setEditingTextId(element.id);
                setActivePageSide(side);
              }
            }}
          />
        ))}

        {/* Transformer */}
        {activePageSide === side && (
          <ElementTransformer
            selectedElementIds={selectedElementIds}
            elements={currentPage.elements}
            onTransform={(elementId, attrs) => handleElementTransform(elementId, currentPage.id, attrs)}
          />
        )}
      </Group>
    );
  };

  return (
    <div
      className="relative flex items-center justify-center"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Spread Container */}
      <div
        className={`shadow-2xl transition-all rounded-lg overflow-hidden ${
          isDragOver ? 'ring-4 ring-violet-500 ring-opacity-50' : ''
        }`}
        style={{
          width: scaledSpreadWidth,
          height: scaledSpreadHeight,
          background: 'linear-gradient(to right, #1e293b 0%, #0f172a 50%, #1e293b 100%)',
        }}
      >
        <Stage
          ref={stageRef}
          width={scaledSpreadWidth}
          height={scaledSpreadHeight}
          scaleX={scale}
          scaleY={scale}
          onClick={handleStageClick}
          onTap={handleStageClick}
        >
          {/* Background Layer */}
          <Layer>
            {/* Left Page */}
            {renderPageInGroup(leftPage, 0, 'left')}

            {/* Center Spine/Binding */}
            <Rect
              x={pageDimensions.width}
              y={0}
              width={spineWidth}
              height={pageDimensions.height}
              fillLinearGradientStartPoint={{ x: 0, y: 0 }}
              fillLinearGradientEndPoint={{ x: spineWidth, y: 0 }}
              fillLinearGradientColorStops={[
                0, 'rgba(0, 0, 0, 0.3)',
                0.5, 'rgba(0, 0, 0, 0.5)',
                1, 'rgba(0, 0, 0, 0.3)',
              ]}
            />

            {/* Right Page */}
            {renderPageInGroup(rightPage, pageDimensions.width + spineWidth, 'right')}
          </Layer>

          {/* UI Layer */}
          <Layer>
            <SelectionBox onSelect={(elementIds) => selectElements(elementIds, false)} />
          </Layer>
        </Stage>
      </div>

      {/* Zoom indicator */}
      <div className="absolute bottom-4 right-4 px-3 py-1 bg-slate-800/90 rounded-lg text-xs text-slate-300">
        {Math.round(scale * 100)}%
      </div>

      {/* Text Editor */}
      {editingTextId && (() => {
        const activePage = activePageSide === 'left' ? leftPage : rightPage;
        if (!activePage) return null;

        const textElement = activePage.elements.find(
          (el) => el.id === editingTextId && el.type === 'text'
        ) as StudioTextElement | undefined;

        if (!textElement || !stageRef.current) return null;

        const textNode = stageRef.current.findOne(`#${editingTextId}`);
        if (!textNode) return null;

        return (
          <TextEditor
            element={textElement}
            textNode={textNode}
            onTextChange={(newText) => {
              updateElement(activePage.id, editingTextId, { content: newText });
            }}
            onClose={() => setEditingTextId(null)}
          />
        );
      })()}
    </div>
  );
}
