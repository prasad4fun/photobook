import { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Transformer } from 'react-konva';
import Konva from 'konva';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { PageSpread, PhotobookElement, ImageAsset, EditorTool } from '../../types';
import PhotobookImageElement from './canvas/PhotobookImageElement';
import PhotobookTextElement from './canvas/PhotobookTextElement';
import PhotobookShapeElement from './canvas/PhotobookShapeElement';

interface PhotobookCanvasProps {
  currentSpread: PageSpread;
  assets: ImageAsset[];
  zoom: number;
  viewMode: 'one-page' | 'all-pages';
  selectedElementIds: string[];
  selectedTool: EditorTool | null;
  onZoomChange: (zoom: number) => void;
  onViewModeToggle: () => void;
  onElementSelect: (elementIds: string[]) => void;
  onElementMove: (elementId: string, x: number, y: number) => void;
  onElementResize: (elementId: string, width: number, height: number) => void;
  onElementRotate: (elementId: string, rotation: number) => void;
  onCanvasClick: (x: number, y: number, pagePosition: 'left' | 'right') => void;
}

const SPREAD_WIDTH = 2480 * 2; // Two A4 pages at 300 DPI
const SPREAD_HEIGHT = 3508;
const BLEED_SIZE = 37; // 3mm bleed at 300 DPI
const SAFE_ZONE = 75; // 6mm safe zone at 300 DPI

export default function PhotobookCanvas({
  currentSpread,
  assets,
  zoom,
  viewMode,
  selectedElementIds,
  selectedTool,
  onZoomChange,
  onViewModeToggle,
  onElementSelect,
  onElementMove,
  onElementResize,
  onElementRotate,
  onCanvasClick,
}: PhotobookCanvasProps) {
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState({ width: 1000, height: 700 });

  // Calculate stage size based on container
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const container = containerRef.current;
        setStageSize({
          width: container.clientWidth,
          height: container.clientHeight,
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Calculate scale to fit spread
  const scale = Math.min(
    (stageSize.width * 0.9) / SPREAD_WIDTH,
    (stageSize.height * 0.9) / SPREAD_HEIGHT
  ) * (zoom / 100);

  const scaledWidth = SPREAD_WIDTH * scale;
  const scaledHeight = SPREAD_HEIGHT * scale;

  // Center spread on stage
  const offsetX = (stageSize.width - scaledWidth) / 2;
  const offsetY = (stageSize.height - scaledHeight) / 2;

  const handleZoomIn = () => {
    const newZoom = Math.min(zoom + 25, 200);
    onZoomChange(newZoom);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoom - 25, 25);
    onZoomChange(newZoom);
  };

  const handleFitToScreen = () => {
    onZoomChange(100);
  };

  const zoomLevels = [25, 50, 75, 100, 125, 150, 200];

  // Attach transformer to selected elements
  useEffect(() => {
    if (!transformerRef.current || !stageRef.current) return;

    const stage = stageRef.current;
    const transformer = transformerRef.current;

    const selectedNodes: Konva.Node[] = [];

    selectedElementIds.forEach((id) => {
      const node = stage.findOne(`#${id}`);
      if (node) {
        selectedNodes.push(node);
      }
    });

    transformer.nodes(selectedNodes);
    transformer.getLayer()?.batchDraw();
  }, [selectedElementIds]);

  const handleElementSelect = (elementId: string, event?: any) => {
    const metaKey = event?.evt?.metaKey || event?.evt?.ctrlKey;

    if (metaKey) {
      // Multi-select with Cmd/Ctrl
      const isAlreadySelected = selectedElementIds.includes(elementId);
      if (isAlreadySelected) {
        onElementSelect(selectedElementIds.filter((id) => id !== elementId));
      } else {
        onElementSelect([...selectedElementIds, elementId]);
      }
    } else {
      // Single select
      onElementSelect([elementId]);
    }
  };

  const renderPageElements = (
    elements: PhotobookElement[],
    pageOffsetX: number
  ) => {
    console.log('🎨 Rendering', elements.length, 'elements at offset', pageOffsetX);

    // Sort elements by zIndex
    const sortedElements = [...elements].sort((a, b) => a.zIndex - b.zIndex);

    return sortedElements.map((element) => {
      if (!element.visible) return null;

      const isSelected = selectedElementIds.includes(element.id);
      const elementX = offsetX + pageOffsetX + element.x * scale;
      const elementY = offsetY + element.y * scale;
      const elementWidth = element.width * scale;
      const elementHeight = element.height * scale;

      const commonProps = {
        id: element.id,
        isSelected,
        onSelect: (e: any) => handleElementSelect(element.id, e),
        onDragEnd: (x: number, y: number) => {
          // Convert back from stage coordinates to page coordinates
          const pageX = (x - offsetX - pageOffsetX) / scale;
          const pageY = (y - offsetY) / scale;
          onElementMove(element.id, pageX, pageY);
        },
        onTransformEnd: (width: number, height: number, rotation: number) => {
          onElementResize(element.id, width / scale, height / scale);
          onElementRotate(element.id, rotation);
        },
      };

      // Props for shape elements (no isSelected prop needed)
      const shapeProps = {
        id: element.id,
        onSelect: (e: any) => handleElementSelect(element.id, e),
        onDragEnd: (x: number, y: number) => {
          const pageX = (x - offsetX - pageOffsetX) / scale;
          const pageY = (y - offsetY) / scale;
          onElementMove(element.id, pageX, pageY);
        },
        onTransformEnd: (width: number, height: number, rotation: number) => {
          onElementResize(element.id, width / scale, height / scale);
          onElementRotate(element.id, rotation);
        },
      };

      if (element.type === 'image') {
        const asset = assets.find((a) => a.id === element.assetId);
        if (!asset) return null;

        return (
          <PhotobookImageElement
            key={element.id}
            {...commonProps}
            element={{ ...element, x: elementX, y: elementY, width: elementWidth, height: elementHeight }}
            asset={asset}
          />
        );
      }

      if (element.type === 'text') {
        return (
          <PhotobookTextElement
            key={element.id}
            {...commonProps}
            element={{ ...element, x: elementX, y: elementY, width: elementWidth, height: elementHeight }}
            onDoubleClick={() => {
              // TODO: Enter text editing mode
              console.log('Double-clicked text element:', element.id);
            }}
          />
        );
      }

      if (element.type === 'shape') {
        return (
          <PhotobookShapeElement
            key={element.id}
            {...shapeProps}
            element={{ ...element, x: elementX, y: elementY, width: elementWidth, height: elementHeight }}
          />
        );
      }

      // Background elements are rendered separately
      if (element.type === 'background') {
        return (
          <Rect
            key={element.id}
            x={offsetX + pageOffsetX}
            y={offsetY}
            width={scaledWidth / 2}
            height={scaledHeight}
            fill={element.color || '#ffffff'}
            listening={false}
          />
        );
      }

      return null;
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950">
      {/* Canvas Controls */}
      <div className="flex items-center justify-between px-6 py-3 bg-slate-900/50 backdrop-blur-sm border-b border-slate-800">
        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1">
          <button
            onClick={() => viewMode === 'all-pages' && onViewModeToggle()}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              viewMode === 'one-page'
                ? 'bg-violet-600 text-white'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            One page
          </button>
          <button
            onClick={() => viewMode === 'one-page' && onViewModeToggle()}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              viewMode === 'all-pages'
                ? 'bg-violet-600 text-white'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            All pages
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleZoomOut}
            disabled={zoom <= 25}
            className={`p-2 rounded-lg transition-all ${
              zoom <= 25
                ? 'text-slate-600 cursor-not-allowed'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <select
            value={zoom}
            onChange={(e) => onZoomChange(Number(e.target.value))}
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-sm cursor-pointer focus:outline-none focus:border-violet-500 transition-colors"
          >
            {zoomLevels.map((level) => (
              <option key={level} value={level}>
                {level}%
              </option>
            ))}
          </select>

          <button
            onClick={handleZoomIn}
            disabled={zoom >= 200}
            className={`p-2 rounded-lg transition-all ${
              zoom >= 200
                ? 'text-slate-600 cursor-not-allowed'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            onClick={handleFitToScreen}
            className="p-2 rounded-lg text-slate-300 hover:bg-slate-800 transition-all"
            title="Fit to screen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Spread Info */}
        <div className="text-sm text-slate-400">
          {currentSpread.spreadNumber === 1 ? (
            <span>Cover</span>
          ) : (
            <span>
              Pages {(currentSpread.spreadNumber - 1) * 2} -{' '}
              {(currentSpread.spreadNumber - 1) * 2 + 1}
            </span>
          )}
        </div>
      </div>

      {/* Canvas Container */}
      <div ref={containerRef} className="flex-1 overflow-hidden relative">
        {/* @ts-ignore - React 18 children type issue with react-konva */}
        <Stage
          ref={stageRef}
          width={stageSize.width}
          height={stageSize.height}
          onMouseDown={(e) => {
            const clickedOnEmpty = e.target === e.target.getStage();

            if (clickedOnEmpty) {
              // If a tool is selected, create element at click position
              if (selectedTool && ['text', 'rectangle', 'ellipse'].includes(selectedTool)) {
                const stage = e.target.getStage();
                if (!stage) return;

                const pointerPos = stage.getPointerPosition();
                if (!pointerPos) return;

                // Convert stage coordinates to page coordinates
                const pageX = (pointerPos.x - offsetX) / scale;
                const pageY = (pointerPos.y - offsetY) / scale;

                // Determine which page was clicked (left or right)
                const isLeftPage = pageX < SPREAD_WIDTH / 2;
                const pagePosition = isLeftPage ? 'left' : 'right';

                // Adjust X for page-relative coordinates
                const relativeX = isLeftPage ? pageX : pageX - SPREAD_WIDTH / 2;

                onCanvasClick(relativeX, pageY, pagePosition);
              } else {
                // Deselect when clicking on empty area
                onElementSelect([]);
              }
            }
          }}
        >
          {[
          <Layer key="main-layer">
            {/* Spread Background */}
            <Rect
              x={offsetX}
              y={offsetY}
              width={scaledWidth}
              height={scaledHeight}
              fill="#ffffff"
              shadowColor="rgba(0,0,0,0.3)"
              shadowBlur={20}
              shadowOffsetX={0}
              shadowOffsetY={10}
            />

            {/* Center Spine */}
            <Rect
              x={offsetX + scaledWidth / 2 - 1}
              y={offsetY}
              width={2}
              height={scaledHeight}
              fill="#94a3b8"
              opacity={0.3}
            />

            {/* Bleed Guides (Dashed lines) */}
            {zoom >= 75 && (
              <>
                {/* Left page bleed */}
                <Rect
                  x={offsetX + BLEED_SIZE * scale}
                  y={offsetY + BLEED_SIZE * scale}
                  width={scaledWidth / 2 - BLEED_SIZE * 2 * scale}
                  height={scaledHeight - BLEED_SIZE * 2 * scale}
                  stroke="#ef4444"
                  strokeWidth={1}
                  dash={[5, 5]}
                  listening={false}
                />
                {/* Right page bleed */}
                <Rect
                  x={offsetX + scaledWidth / 2 + BLEED_SIZE * scale}
                  y={offsetY + BLEED_SIZE * scale}
                  width={scaledWidth / 2 - BLEED_SIZE * 2 * scale}
                  height={scaledHeight - BLEED_SIZE * 2 * scale}
                  stroke="#ef4444"
                  strokeWidth={1}
                  dash={[5, 5]}
                  listening={false}
                />
              </>
            )}

            {/* Safe Zone Guides */}
            {zoom >= 100 && (
              <>
                {/* Left page safe zone */}
                <Rect
                  x={offsetX + SAFE_ZONE * scale}
                  y={offsetY + SAFE_ZONE * scale}
                  width={scaledWidth / 2 - SAFE_ZONE * 2 * scale}
                  height={scaledHeight - SAFE_ZONE * 2 * scale}
                  stroke="#3b82f6"
                  strokeWidth={1}
                  dash={[3, 3]}
                  listening={false}
                />
                {/* Right page safe zone */}
                <Rect
                  x={offsetX + scaledWidth / 2 + SAFE_ZONE * scale}
                  y={offsetY + SAFE_ZONE * scale}
                  width={scaledWidth / 2 - SAFE_ZONE * 2 * scale}
                  height={scaledHeight - SAFE_ZONE * 2 * scale}
                  stroke="#3b82f6"
                  strokeWidth={1}
                  dash={[3, 3]}
                  listening={false}
                />
              </>
            )}

            {/* Render Left Page Elements */}
            {currentSpread.leftPage && renderPageElements(
              currentSpread.leftPage.elements,
              0 // Left page offset
            )}

            {/* Render Right Page Elements */}
            {renderPageElements(
              currentSpread.rightPage.elements,
              scaledWidth / 2 // Right page offset
            )}

            {/* Transformer for selected elements */}
            <Transformer
              ref={transformerRef}
              boundBoxFunc={(oldBox: any, newBox: any) => {
                // Limit resize to minimum size
                if (newBox.width < 10 || newBox.height < 10) {
                  return oldBox;
                }
                return newBox;
              }}
            />
          </Layer>
          ]}
        </Stage>

        {/* Guide Legend */}
        {zoom >= 75 && (
          <div className="absolute bottom-6 left-6 bg-slate-900/90 backdrop-blur-sm border border-slate-800 rounded-xl p-3 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-red-500 border-dashed border border-red-500"></div>
              <span className="text-xs text-slate-400">Bleed (3mm)</span>
            </div>
            {zoom >= 100 && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-blue-500 border-dashed border border-blue-500"></div>
                <span className="text-xs text-slate-400">Safe Zone (6mm)</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
