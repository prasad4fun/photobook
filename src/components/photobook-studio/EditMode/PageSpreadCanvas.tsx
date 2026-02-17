// @ts-nocheck
/**
 * Page Spread Canvas - Double-sided page view with center binding
 * Shows left and right pages like a physical photobook
 * Pixory-style: light workspace, book-like appearance, editable cover spine
 */

import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Group, Text as KonvaText } from 'react-konva';
import Konva from 'konva';
import type { StudioPage, StudioPageType, StudioTextElement } from '../../../types';
import { usePhotoBookStore } from '../../../hooks/usePhotoBookStore';
import { getPageDimensions } from '../../../services/photobook-studio/photobookGenerator';
import ElementRenderer from './canvas/ElementRenderer';
import ElementTransformer from './canvas/ElementTransformer';
import SelectionBox from './canvas/SelectionBox';
import TextEditor from './canvas/TextEditor';

// Page types that cannot be edited, dragged onto, or have elements selected
const NON_EDITABLE_PAGE_TYPES: StudioPageType[] = ['back-of-cover', 'back-cover'];

interface PageSpreadCanvasProps {
  page: StudioPage;
}

export default function PageSpreadCanvas({ page }: PageSpreadCanvasProps) {
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 500 });
  const [isDragOver, setIsDragOver] = useState(false);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [activePageSide, setActivePageSide] = useState<'left' | 'right'>('right');
  const [editingSpineTitle, setEditingSpineTitle] = useState(false);

  const photoBook = usePhotoBookStore((state) => state.photoBook);
  const selectedPhotos = usePhotoBookStore((state) => state.selectedPhotos);
  const selectedElementIds = usePhotoBookStore((state) => state.selectedElementIds);
  const selectElements = usePhotoBookStore((state) => state.selectElements);
  const clearSelection = usePhotoBookStore((state) => state.clearSelection);
  const updateElement = usePhotoBookStore((state) => state.updateElement);
  const deleteElements = usePhotoBookStore((state) => state.deleteElements);
  const addElement = usePhotoBookStore((state) => state.addElement);
  const spineTitle = usePhotoBookStore((state) => state.photoBook?.spineTitle);
  const updateSpineTitle = usePhotoBookStore((state) => state.updateSpineTitle);
  const setZoomLevel = usePhotoBookStore((state) => state.setZoomLevel);

  // Get page dimensions (single page)
  const pageDimensions = photoBook
    ? getPageDimensions(photoBook.config)
    : { width: 2480, height: 3508 };

  // Get current page from store (ensures we have latest data)
  const currentPage = photoBook?.pages.find((p) => p.id === page.id) || page;

  // Get adjacent page for spread
  const getAdjacentPage = (): StudioPage | null => {
    if (!photoBook) return null;

    // Special case: cover spread pairs front cover with back cover
    if (currentPage.type === 'cover') {
      return photoBook.pages.find((p) => p.type === 'back-cover') || null;
    }
    if (currentPage.type === 'back-cover') {
      return photoBook.pages.find((p) => p.type === 'cover') || null;
    }

    const currentIndex = photoBook.pages.findIndex((p) => p.id === currentPage.id);
    if (currentIndex === -1) return null;

    const adjacentIndex = currentPage.pageNumber % 2 === 0 ? currentIndex + 1 : currentIndex - 1;

    return photoBook.pages[adjacentIndex] || null;
  };

  const adjacentPage = getAdjacentPage();

  // Determine which page is left and which is right
  const leftPage = currentPage.type === 'cover' ? adjacentPage
    : currentPage.type === 'back-cover' ? currentPage
    : currentPage.pageNumber % 2 === 0 ? currentPage : adjacentPage;
  const rightPage = currentPage.type === 'cover' ? currentPage
    : currentPage.type === 'back-cover' ? adjacentPage
    : currentPage.pageNumber % 2 === 0 ? adjacentPage : currentPage;

  // Determine if this is a cover spread
  const isCoverSpread =
    (leftPage?.type === 'back-cover' && rightPage?.type === 'cover') ||
    (leftPage?.type === 'back-cover' && !rightPage) ||
    (!leftPage && rightPage?.type === 'cover');

  // Dynamic spine width: wider for cover spread (shows editable spine strip)
  const currentSpineWidth = isCoverSpread ? 150 : 100;

  // Spread dimensions (two pages + spine)
  const spreadWidth = pageDimensions.width * 2 + currentSpineWidth;
  const spreadHeight = pageDimensions.height;

  // Calculate scale to fit container with padding
  const scale = Math.min(
    (containerSize.width - 32) / spreadWidth,
    (containerSize.height - 32) / spreadHeight
  ) * 0.92;

  const scaledSpreadWidth = spreadWidth * scale;
  const scaledSpreadHeight = spreadHeight * scale;
  const scaledPageWidth = pageDimensions.width * scale;
  const scaledSpineWidth = currentSpineWidth * scale;

  // Sync zoom level to store
  useEffect(() => {
    setZoomLevel(Math.round(scale * 100));
  }, [scale, setZoomLevel]);

  // Handle container resize with ResizeObserver
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateSize = () => {
      setContainerSize({
        width: container.clientWidth,
        height: container.clientHeight,
      });
    };

    updateSize();

    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
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

  // Handle element transform - clamp position to keep elements within page bounds
  const handleElementTransform = (elementId: string, pageId: string, attrs: any) => {
    const clampedAttrs = { ...attrs };
    if (clampedAttrs.x !== undefined) {
      clampedAttrs.x = Math.max(0, clampedAttrs.x);
    }
    if (clampedAttrs.y !== undefined) {
      clampedAttrs.y = Math.max(0, clampedAttrs.y);
    }
    updateElement(pageId, elementId, clampedAttrs);
  };

  // Handle spine title edit
  const handleSpineTitleEdit = () => {
    setEditingSpineTitle(true);
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
    if (photoId) {
      handlePhotoDrop(e, photoId);
      return;
    }

    const stickerId = e.dataTransfer.getData('stickerId');
    if (stickerId) {
      handleStickerDrop(e, stickerId);
      return;
    }
  };

  const handlePhotoDrop = (e: React.DragEvent, photoId: string) => {
    const photo = selectedPhotos.find((p) => p.id === photoId);
    if (!photo) return;

    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const isLeftSide = x < (scaledPageWidth + scaledSpineWidth / 2);
    const targetPage = isLeftSide ? leftPage : rightPage;
    if (!targetPage) return;

    // Block drops on non-editable pages
    if (NON_EDITABLE_PAGE_TYPES.includes(targetPage.type)) return;

    const pageOffsetX = isLeftSide ? 0 : scaledPageWidth + scaledSpineWidth;
    const relativeX = x - pageOffsetX;
    const relativeY = y;

    const stageX = relativeX / scale;
    const stageY = relativeY / scale;

    const xPercent = (stageX / pageDimensions.width) * 100;
    const yPercent = (stageY / pageDimensions.height) * 100;

    const defaultWidth = 20;
    const defaultHeight = (defaultWidth * photo.height) / photo.width;

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

    const defaultTransform = { zoom: 1, fit: 'cover' as const, rotation: 0, flipHorizontal: false, flipVertical: false, panX: 0, panY: 0 };

    if (targetPlaceholder) {
      updateElement(targetPage.id, targetPlaceholder.id, { photoId: photo.id, transform: defaultTransform });
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
        transform: defaultTransform,
      };

      addElement(targetPage.id, photoElement);
    }
  };

  const handleStickerDrop = (e: React.DragEvent, stickerId: string) => {
    const stickerDataString = e.dataTransfer.getData('application/sticker');
    if (!stickerDataString) return;

    try {
      const stickerData = JSON.parse(stickerDataString);

      const container = e.currentTarget;
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const isLeftSide = x < (scaledPageWidth + scaledSpineWidth / 2);
      const targetPage = isLeftSide ? leftPage : rightPage;
      if (!targetPage) return;

      // Block drops on non-editable pages
      if (NON_EDITABLE_PAGE_TYPES.includes(targetPage.type)) return;

      const pageOffsetX = isLeftSide ? 0 : scaledPageWidth + scaledSpineWidth;
      const relativeX = x - pageOffsetX;
      const relativeY = y;

      const stageX = relativeX / scale;
      const stageY = relativeY / scale;

      const xPercent = (stageX / pageDimensions.width) * 100;
      const yPercent = (stageY / pageDimensions.height) * 100;

      const defaultWidth = 15;
      const defaultHeight = 15;

      const centeredX = Math.max(0, Math.min(xPercent - defaultWidth / 2, 100 - defaultWidth));
      const centeredY = Math.max(0, Math.min(yPercent - defaultHeight / 2, 100 - defaultHeight));

      const stickerElement = {
        id: `sticker-${Date.now()}-${Math.random()}`,
        type: 'sticker' as const,
        stickerId: stickerData.id,
        stickerUrl: stickerData.url,
        x: centeredX,
        y: centeredY,
        width: defaultWidth,
        height: defaultHeight,
        rotation: 0,
        zIndex: Date.now(),
        flipHorizontal: false,
        flipVertical: false,
      };

      addElement(targetPage.id, stickerElement);
    } catch (error) {
      console.error('Error parsing sticker data:', error);
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
            fill="#f0f0f0"
            name="page-bg"
          />
        </Group>
      );
    }

    const sortedElements = [...currentPage.elements].sort((a, b) => a.zIndex - b.zIndex);
    const isNonEditable = NON_EDITABLE_PAGE_TYPES.includes(currentPage.type);

    return (
      <Group
        x={xOffset}
        y={0}
        clipX={0}
        clipY={0}
        clipWidth={pageDimensions.width}
        clipHeight={pageDimensions.height}
      >
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

        {/* Subtle edge highlights for 3D effect */}
        {side === 'left' && (
          <Rect
            x={pageDimensions.width - 3}
            y={0}
            width={3}
            height={pageDimensions.height}
            fillLinearGradientStartPoint={{ x: 0, y: 0 }}
            fillLinearGradientEndPoint={{ x: 3, y: 0 }}
            fillLinearGradientColorStops={[
              0, 'rgba(0, 0, 0, 0)',
              1, 'rgba(0, 0, 0, 0.06)',
            ]}
            listening={false}
          />
        )}
        {side === 'right' && (
          <Rect
            x={0}
            y={0}
            width={3}
            height={pageDimensions.height}
            fillLinearGradientStartPoint={{ x: 0, y: 0 }}
            fillLinearGradientEndPoint={{ x: 3, y: 0 }}
            fillLinearGradientColorStops={[
              0, 'rgba(0, 0, 0, 0.06)',
              1, 'rgba(0, 0, 0, 0)',
            ]}
            listening={false}
          />
        )}

        {/* Page Elements - render as view-only on non-editable pages */}
        <Group listening={!isNonEditable}>
          {sortedElements.map((element) => (
            <ElementRenderer
              key={element.id}
              element={element}
              pageId={currentPage.id}
              isSelected={!isNonEditable && activePageSide === side && selectedElementIds.includes(element.id)}
              onClick={isNonEditable ? undefined : (e) => {
                setActivePageSide(side);
                handleElementClick(element.id, currentPage.id, e);
              }}
              onTransform={isNonEditable ? undefined : (attrs) => handleElementTransform(element.id, currentPage.id, attrs)}
              onDoubleClick={isNonEditable ? undefined : () => {
                if (element.type === 'text') {
                  setEditingTextId(element.id);
                  setActivePageSide(side);
                }
              }}
            />
          ))}
        </Group>

        {/* Transformer - only on editable pages */}
        {!isNonEditable && activePageSide === side && (
          <ElementTransformer
            selectedElementIds={selectedElementIds}
            elements={currentPage.elements}
            onTransform={(elementId, attrs) => handleElementTransform(elementId, currentPage.id, attrs)}
          />
        )}
      </Group>
    );
  };

  // Render spine/binding between pages
  const renderSpine = () => {
    if (isCoverSpread) {
      // Cover spine: distinct strip with editable vertical title
      const spineBgColor = rightPage?.background?.color || leftPage?.background?.color || '#e5e7eb';
      // Darken spine color slightly for depth
      return (
        <Group x={pageDimensions.width} y={0}>
          {/* Spine background */}
          <Rect
            x={0}
            y={0}
            width={currentSpineWidth}
            height={pageDimensions.height}
            fill={spineBgColor}
          />
          {/* Left edge inset shadow */}
          <Rect
            x={0}
            y={0}
            width={6}
            height={pageDimensions.height}
            fillLinearGradientStartPoint={{ x: 0, y: 0 }}
            fillLinearGradientEndPoint={{ x: 6, y: 0 }}
            fillLinearGradientColorStops={[
              0, 'rgba(0, 0, 0, 0.18)',
              1, 'rgba(0, 0, 0, 0)',
            ]}
            listening={false}
          />
          {/* Right edge inset shadow */}
          <Rect
            x={currentSpineWidth - 6}
            y={0}
            width={6}
            height={pageDimensions.height}
            fillLinearGradientStartPoint={{ x: 0, y: 0 }}
            fillLinearGradientEndPoint={{ x: 6, y: 0 }}
            fillLinearGradientColorStops={[
              0, 'rgba(0, 0, 0, 0)',
              1, 'rgba(0, 0, 0, 0.18)',
            ]}
            listening={false}
          />
          {/* Center groove line */}
          <Rect
            x={currentSpineWidth / 2 - 1}
            y={0}
            width={2}
            height={pageDimensions.height}
            fill="rgba(0, 0, 0, 0.08)"
            listening={false}
          />
          {/* Vertical title text - rotated 90° clockwise, centered in spine */}
          <KonvaText
            text={spineTitle || 'My PhotoBook'}
            x={currentSpineWidth / 2}
            y={pageDimensions.height / 2}
            fontSize={Math.min(currentSpineWidth * 0.55, 80)}
            fontFamily="Arial, sans-serif"
            fontStyle="bold"
            fill="rgba(0, 0, 0, 0.5)"
            align="center"
            verticalAlign="middle"
            rotation={90}
            offsetX={pageDimensions.height * 0.6 / 2}
            offsetY={currentSpineWidth / 2}
            width={pageDimensions.height * 0.6}
            height={currentSpineWidth}
            name="spine-title"
            onDblClick={handleSpineTitleEdit}
            onDblTap={handleSpineTitleEdit}
          />
        </Group>
      );
    }

    // Content spine: subtle book fold gradient
    return (
      <Group>
        {/* Center fold gradient */}
        <Rect
          x={pageDimensions.width}
          y={0}
          width={currentSpineWidth}
          height={pageDimensions.height}
          fillLinearGradientStartPoint={{ x: 0, y: 0 }}
          fillLinearGradientEndPoint={{ x: currentSpineWidth, y: 0 }}
          fillLinearGradientColorStops={[
            0, 'rgba(0, 0, 0, 0.06)',
            0.15, 'rgba(0, 0, 0, 0.14)',
            0.5, 'rgba(0, 0, 0, 0.18)',
            0.85, 'rgba(0, 0, 0, 0.14)',
            1, 'rgba(0, 0, 0, 0.06)',
          ]}
          listening={false}
        />
        {/* Inner shadow: left page edge */}
        <Rect
          x={pageDimensions.width - 15}
          y={0}
          width={15}
          height={pageDimensions.height}
          fillLinearGradientStartPoint={{ x: 0, y: 0 }}
          fillLinearGradientEndPoint={{ x: 15, y: 0 }}
          fillLinearGradientColorStops={[
            0, 'rgba(0, 0, 0, 0)',
            1, 'rgba(0, 0, 0, 0.08)',
          ]}
          listening={false}
        />
        {/* Inner shadow: right page edge */}
        <Rect
          x={pageDimensions.width + currentSpineWidth}
          y={0}
          width={15}
          height={pageDimensions.height}
          fillLinearGradientStartPoint={{ x: 0, y: 0 }}
          fillLinearGradientEndPoint={{ x: 15, y: 0 }}
          fillLinearGradientColorStops={[
            0, 'rgba(0, 0, 0, 0.08)',
            1, 'rgba(0, 0, 0, 0)',
          ]}
          listening={false}
        />
      </Group>
    );
  };

  // Get page label text
  const getPageLabel = (pg: StudioPage | null, side: 'left' | 'right') => {
    if (!pg) return '';
    if (pg.type === 'back-cover') return 'Back cover';
    if (pg.type === 'cover') return 'Front cover';
    return `Page ${pg.pageNumber}`;
  };

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center w-full h-full"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        background: '#ededed',
      }}
    >
      {/* Photobook Spread Container */}
      <div
        className={`relative transition-all ${
          isDragOver ? 'scale-[1.02]' : ''
        }`}
        style={{
          width: scaledSpreadWidth,
          height: scaledSpreadHeight,
          filter: 'drop-shadow(0 4px 20px rgba(0, 0, 0, 0.15)) drop-shadow(0 2px 8px rgba(0, 0, 0, 0.1))',
        }}
      >
        {/* Main spread container */}
        <div
          className="relative overflow-hidden rounded-sm"
          style={{
            width: '100%',
            height: '100%',
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
            {renderSpine()}

            {/* Right Page */}
            {renderPageInGroup(rightPage, pageDimensions.width + currentSpineWidth, 'right')}
          </Layer>

          {/* UI Layer */}
          <Layer>
            <SelectionBox onSelect={(elementIds) => selectElements(elementIds, false)} />
          </Layer>
        </Stage>
        </div>
      </div>

      {/* Page Labels - Centered below each page */}
      <div
        className="absolute flex pointer-events-none"
        style={{
          width: scaledSpreadWidth,
          left: '50%',
          transform: 'translateX(-50%)',
          bottom: 8,
        }}
      >
        <div style={{ width: scaledPageWidth }} className="text-center">
          <span className="text-xs text-gray-500 font-medium">
            {getPageLabel(leftPage, 'left')}
          </span>
        </div>
        <div style={{ width: scaledSpineWidth }} />
        <div style={{ width: scaledPageWidth }} className="text-center">
          <span className="text-xs text-gray-500 font-medium">
            {getPageLabel(rightPage, 'right')}
          </span>
        </div>
      </div>

      {/* Spine Title Editor - DOM overlay (must be outside Stage) */}
      {editingSpineTitle && isCoverSpread && (() => {
        const spreadLeft = (containerSize.width - scaledSpreadWidth) / 2;
        const spreadTop = (containerSize.height - scaledSpreadHeight) / 2;
        const spineScreenX = spreadLeft + scaledPageWidth;
        const spineScreenY = spreadTop;

        return (
          <div
            className="absolute z-50 flex items-center justify-center"
            style={{
              left: spineScreenX,
              top: spineScreenY,
              width: scaledSpineWidth,
              height: scaledSpreadHeight,
            }}
          >
            <input
              type="text"
              autoFocus
              defaultValue={spineTitle || 'My PhotoBook'}
              className="bg-white/95 border-2 border-violet-500 rounded text-center font-bold text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 text-gray-800"
              style={{
                transform: 'rotate(90deg)',
                transformOrigin: 'center center',
                width: Math.min(scaledSpreadHeight * 0.6, 300),
                height: Math.max(scaledSpineWidth - 4, 20),
                color: '#1f2937',
              }}
              onBlur={(e) => {
                updateSpineTitle(e.target.value);
                setEditingSpineTitle(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  updateSpineTitle((e.target as HTMLInputElement).value);
                  setEditingSpineTitle(false);
                }
                if (e.key === 'Escape') {
                  setEditingSpineTitle(false);
                }
              }}
            />
          </div>
        );
      })()}

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
