import { useState, useEffect } from 'react';
import PhotobookTopToolbar from './PhotobookTopToolbar';
import PhotobookLeftSidebar from './PhotobookLeftSidebar';
import PhotobookElementToolbar from './PhotobookElementToolbar';
import PhotobookCanvas from './PhotobookCanvas';
import PhotobookPageThumbnails from './PhotobookPageThumbnails';
import {
  PhotobookEditorState,
  PhotobookHistoryState,
  PageSpread,
  PhotobookPage,
  PhotobookElement,
  BackgroundElement,
  ImageAsset,
  ImageUpload,
  LayoutPreset,
  BackgroundAsset,
  StickerAsset,
  EditorTool,
  AutofillOptions,
} from '../../types';
import {
  createImageElement,
  createTextElement,
  createShapeElement,
} from '../../services/photobook/canvasElementService';
import { generateSmartLayout } from '../../services/photobook/smartCreationService';
import { autofillImages, calculateAutofillStats } from '../../services/photobook/autofillService';

interface PhotobookEditorScreenProps {
  initialImages: ImageUpload[];
  projectId?: string;
  projectName?: string;
  onExit: () => void;
  onOrder: (state: PhotobookEditorState) => void;
}

const SPREAD_WIDTH = 2480; // A4 at 300 DPI
const SPREAD_HEIGHT = 3508;

export default function PhotobookEditorScreen({
  initialImages,
  projectId,
  projectName,
  onExit: _onExit,
  onOrder,
}: PhotobookEditorScreenProps) {
  // Initialize editor state
  const [editorState, setEditorState] = useState<PhotobookEditorState>(() =>
    initializeEditorState(initialImages, projectId, projectName)
  );

  const [currentSpreadIndex, setCurrentSpreadIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const currentSpread = editorState.spreads[currentSpreadIndex];

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // Undo: Cmd/Ctrl + Z
      if (cmdOrCtrl && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }

      // Redo: Cmd/Ctrl + Shift + Z
      if (cmdOrCtrl && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        handleRedo();
      }

      // Save: Cmd/Ctrl + S
      if (cmdOrCtrl && e.key === 's') {
        e.preventDefault();
        handleSave();
      }

      // Tool shortcuts (when no input is focused)
      if (!['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        if (e.key === 't') handleToolSelect('text');
        if (e.key === 'p') handleToolSelect('photo');
        if (e.key === 'l') handleToolSelect('layout');
        if (e.key === 'r') handleToolSelect('rectangle');
        if (e.key === 'e') handleToolSelect('ellipse');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editorState]);

  // Auto-save every 30 seconds if dirty
  useEffect(() => {
    const interval = setInterval(() => {
      if (editorState.isDirty) {
        handleSave();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [editorState.isDirty]);

  const handleUndo = () => {
    if (editorState.historyIndex > 0) {
      const newIndex = editorState.historyIndex - 1;
      const historyState = editorState.history[newIndex];

      setEditorState((prev) => ({
        ...prev,
        spreads: historyState.spreads,
        assets: historyState.assets,
        historyIndex: newIndex,
        isDirty: true,
      }));
    }
  };

  const handleRedo = () => {
    if (editorState.historyIndex < editorState.history.length - 1) {
      const newIndex = editorState.historyIndex + 1;
      const historyState = editorState.history[newIndex];

      setEditorState((prev) => ({
        ...prev,
        spreads: historyState.spreads,
        assets: historyState.assets,
        historyIndex: newIndex,
        isDirty: true,
      }));
    }
  };

  const addToHistory = (description: string) => {
    const historyState: PhotobookHistoryState = {
      timestamp: new Date(),
      description,
      spreads: JSON.parse(JSON.stringify(editorState.spreads)),
      assets: JSON.parse(JSON.stringify(editorState.assets)),
    };

    setEditorState((prev) => ({
      ...prev,
      history: [...prev.history.slice(0, prev.historyIndex + 1), historyState],
      historyIndex: prev.historyIndex + 1,
      isDirty: true,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      // TODO: Save to Azure Blob Storage or FastAPI backend
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Mock save

      setEditorState((prev) => ({
        ...prev,
        isDirty: false,
        lastSaved: new Date(),
      }));
    } catch (error) {
      console.error('Failed to save project:', error);
      alert('Failed to save project. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    // TODO: Show full-screen preview of photobook
    console.log('Preview:', editorState);
  };

  const handleOrder = () => {
    onOrder(editorState);
  };

  const handleVideoTutorial = () => {
    // TODO: Open video tutorial modal or external link
    window.open('https://www.youtube.com/watch?v=tutorial', '_blank');
  };

  const handleToolSelect = (tool: EditorTool) => {
    setEditorState((prev) => ({
      ...prev,
      selectedTool: prev.selectedTool === tool ? null : tool,
    }));
  };

  const handleCanvasClick = (x: number, y: number, pagePosition: 'left' | 'right') => {
    const tool = editorState.selectedTool;
    if (!tool) return;

    let newElement: PhotobookElement | null = null;

    switch (tool) {
      case 'text':
        newElement = createTextElement(x, y);
        break;
      case 'rectangle':
        newElement = createShapeElement('rectangle', x, y, 300, 200);
        break;
      case 'ellipse':
        newElement = createShapeElement('ellipse', x, y, 300, 300);
        break;
      default:
        return;
    }

    if (!newElement) return;

    // Add element to the clicked page
    const updatedSpreads = [...editorState.spreads];
    const spread = updatedSpreads[currentSpreadIndex];

    if (pagePosition === 'left' && spread.leftPage) {
      spread.leftPage = {
        ...spread.leftPage,
        elements: [...spread.leftPage.elements, newElement],
      };
    } else if (pagePosition === 'right') {
      spread.rightPage = {
        ...spread.rightPage,
        elements: [...spread.rightPage.elements, newElement],
      };
    }

    updatedSpreads[currentSpreadIndex] = spread;

    setEditorState((prev) => ({
      ...prev,
      spreads: updatedSpreads,
      selectedTool: null, // Deselect tool after use
      selectedElementIds: [newElement!.id], // Select newly created element
    }));

    addToHistory(`Added ${tool}`);
  };

  const handleImageClick = (asset: ImageAsset) => {
    console.log('📸 Image clicked:', asset.name, 'Tool:', editorState.selectedTool);

    if (editorState.selectedTool === 'photo' || !editorState.selectedTool) {
      // Add image to center of current spread's right page
      const centerX = SPREAD_WIDTH / 4 - 400; // Center of page
      const centerY = SPREAD_HEIGHT / 2 - 300;

      const imageElement = createImageElement(asset, centerX, centerY, 800, 600);
      console.log('🖼️  Created image element:', imageElement.id, 'at', centerX, centerY);

      // Add to right page of current spread
      const updatedSpreads = [...editorState.spreads];
      const beforeCount = currentSpread.rightPage.elements.length;

      updatedSpreads[currentSpreadIndex] = {
        ...currentSpread,
        rightPage: {
          ...currentSpread.rightPage,
          elements: [...currentSpread.rightPage.elements, imageElement],
        },
      };

      const afterCount = updatedSpreads[currentSpreadIndex].rightPage.elements.length;
      console.log(`📊 Elements on page: ${beforeCount} → ${afterCount}`);

      setEditorState((prev) => ({
        ...prev,
        spreads: updatedSpreads,
      }));

      // Update asset usage
      updateAssetUsage(asset.id, currentSpread.rightPage.pageNumber, true);
      addToHistory(`Added image: ${asset.name}`);

      console.log('✅ Image added to state successfully');
    } else {
      console.log('⚠️  Image click ignored - wrong tool selected');
    }
  };

  const handleLayoutClick = (preset: LayoutPreset) => {
    // TODO: Apply layout preset to current spread
    console.log('Apply layout:', preset);
    addToHistory(`Applied layout: ${preset.name}`);
  };

  const handleBackgroundClick = (background: BackgroundAsset) => {
    // TODO: Apply background to current spread
    console.log('Apply background:', background);
    addToHistory(`Changed background: ${background.name}`);
  };

  const handleStickerClick = (sticker: StickerAsset) => {
    // TODO: Add sticker to canvas
    console.log('Add sticker:', sticker);
    addToHistory(`Added sticker: ${sticker.name}`);
  };

  const handleSmartCreation = async () => {
    const confirmed = window.confirm(
      'Smart Creation will analyze your images and auto-generate a photobook layout. This will replace your current spreads. Continue?'
    );

    if (!confirmed) return;

    try {
      // Show loading state
      setEditorState((prev) => ({ ...prev, selectedTool: null }));

      // Generate smart layout (this may take 5-10 seconds with real AI)
      const result = await generateSmartLayout(
        editorState.assets,
        20, // Target 20 pages
        editorState.spreads[0]?.rightPage?.background ? undefined : undefined // Pass theme if available
      );

      // Update spreads with generated layout
      setEditorState((prev) => ({
        ...prev,
        spreads: result.spreads,
        isDirty: true,
      }));

      // Update asset usage
      result.spreads.forEach((spread) => {
        const updateAssetUsageFromPage = (page: PhotobookPage | null) => {
          if (!page) return;
          page.elements.forEach((el) => {
            if (el.type === 'image') {
              updateAssetUsage(el.assetId, page.pageNumber, true);
            }
          });
        };

        updateAssetUsageFromPage(spread.leftPage);
        updateAssetUsageFromPage(spread.rightPage);
      });

      addToHistory('Generated smart layout');

      alert(
        `Smart Creation complete!\n\nGenerated ${result.spreads.length} spreads\nStyle: ${result.style}\n\n${result.reasoning}`
      );
    } catch (error) {
      console.error('Smart Creation failed:', error);
      alert('Smart Creation failed. Please try again or create layouts manually.');
    }
  };

  const handleAutofill = async () => {
    const confirmed = window.confirm(
      'Autofill will automatically place images into empty spaces. Continue?'
    );

    if (!confirmed) return;

    try {
      const options: AutofillOptions = {
        strategy: 'best-fit',
        skipUsedImages: true,
        applyFilters: false,
        targetSpreadIds: undefined, // Autofill all spreads
      };

      const originalSpreads = editorState.spreads;
      const filledSpreads = await autofillImages(
        editorState.spreads,
        editorState.assets,
        options
      );

      // Calculate stats
      const stats = calculateAutofillStats(originalSpreads, filledSpreads);

      if (stats.totalSlotsFilled === 0) {
        alert('No empty slots found to fill!');
        return;
      }

      // Update state
      setEditorState((prev) => ({
        ...prev,
        spreads: filledSpreads,
        isDirty: true,
      }));

      // Update asset usage
      filledSpreads.forEach((spread) => {
        const updateAssetUsageFromPage = (page: PhotobookPage | null) => {
          if (!page) return;
          page.elements.forEach((el) => {
            if (el.type === 'image') {
              const asset = editorState.assets.find((a) => a.id === el.assetId);
              if (asset && !asset.isUsed) {
                updateAssetUsage(el.assetId, page.pageNumber, true);
              }
            }
          });
        };

        updateAssetUsageFromPage(spread.leftPage);
        updateAssetUsageFromPage(spread.rightPage);
      });

      addToHistory('Autofilled images');

      alert(
        `Autofill complete!\n\n${stats.totalSlotsFilled} images placed\n${stats.spreadsAffected} spreads updated\n${stats.emptySlots} empty slots remaining`
      );
    } catch (error) {
      console.error('Autofill failed:', error);
      alert(
        error instanceof Error
          ? error.message
          : 'Autofill failed. Please try again.'
      );
    }
  };

  const handleAddSpread = (afterIndex: number) => {
    const newSpread: PageSpread = {
      id: `spread_${Date.now()}`,
      spreadNumber: editorState.spreads.length + 1,
      leftPage: createBlankPage((editorState.spreads.length) * 2, 'left'),
      rightPage: createBlankPage((editorState.spreads.length) * 2 + 1, 'right'),
      layoutPresetId: null,
      isLocked: false,
    };

    setEditorState((prev) => ({
      ...prev,
      spreads: [
        ...prev.spreads.slice(0, afterIndex + 1),
        newSpread,
        ...prev.spreads.slice(afterIndex + 1),
      ],
    }));

    addToHistory('Added new spread');
  };

  const handleDuplicateSpread = (index: number) => {
    const spread = editorState.spreads[index];
    const duplicate: PageSpread = {
      ...JSON.parse(JSON.stringify(spread)),
      id: `spread_${Date.now()}`,
      spreadNumber: editorState.spreads.length + 1,
    };

    setEditorState((prev) => ({
      ...prev,
      spreads: [...prev.spreads, duplicate],
    }));

    addToHistory(`Duplicated spread ${index + 1}`);
  };

  const handleRemoveSpread = (index: number) => {
    if (editorState.spreads.length <= 1) return;

    setEditorState((prev) => ({
      ...prev,
      spreads: prev.spreads.filter((_, i) => i !== index),
    }));

    if (currentSpreadIndex >= editorState.spreads.length - 1) {
      setCurrentSpreadIndex(Math.max(0, currentSpreadIndex - 1));
    }

    addToHistory(`Removed spread ${index + 1}`);
  };

  const handleToggleLock = (index: number) => {
    setEditorState((prev) => ({
      ...prev,
      spreads: prev.spreads.map((spread, i) =>
        i === index ? { ...spread, isLocked: !spread.isLocked } : spread
      ),
    }));
  };

  const updateAssetUsage = (assetId: string, pageNumber: number, isAdding: boolean) => {
    setEditorState((prev) => ({
      ...prev,
      assets: prev.assets.map((asset) => {
        if (asset.id === assetId) {
          if (isAdding) {
            return {
              ...asset,
              isUsed: true,
              usageCount: asset.usageCount + 1,
              usedInPages: [...asset.usedInPages, pageNumber],
            };
          } else {
            const newUsedInPages = asset.usedInPages.filter((p) => p !== pageNumber);
            return {
              ...asset,
              usageCount: Math.max(0, asset.usageCount - 1),
              usedInPages: newUsedInPages,
              isUsed: newUsedInPages.length > 0,
            };
          }
        }
        return asset;
      }),
    }));
  };

  const handleElementMove = (elementId: string, newX: number, newY: number) => {
    const updatedSpreads = editorState.spreads.map((spread, index) => {
      if (index !== currentSpreadIndex) return spread;

      const updatePage = (page: PhotobookPage) => {
        return {
          ...page,
          elements: page.elements.map((el) =>
            el.id === elementId ? { ...el, x: newX, y: newY } : el
          ),
        };
      };

      return {
        ...spread,
        leftPage: spread.leftPage ? updatePage(spread.leftPage) : null,
        rightPage: updatePage(spread.rightPage),
      };
    });

    setEditorState((prev) => ({ ...prev, spreads: updatedSpreads }));
    addToHistory('Moved element');
  };

  const handleElementResize = (elementId: string, newWidth: number, newHeight: number) => {
    const updatedSpreads = editorState.spreads.map((spread, index) => {
      if (index !== currentSpreadIndex) return spread;

      const updatePage = (page: PhotobookPage) => {
        return {
          ...page,
          elements: page.elements.map((el) =>
            el.id === elementId ? { ...el, width: newWidth, height: newHeight } : el
          ),
        };
      };

      return {
        ...spread,
        leftPage: spread.leftPage ? updatePage(spread.leftPage) : null,
        rightPage: updatePage(spread.rightPage),
      };
    });

    setEditorState((prev) => ({ ...prev, spreads: updatedSpreads }));
    addToHistory('Resized element');
  };

  const handleElementRotate = (elementId: string, rotation: number) => {
    const updatedSpreads = editorState.spreads.map((spread, index) => {
      if (index !== currentSpreadIndex) return spread;

      const updatePage = (page: PhotobookPage) => {
        return {
          ...page,
          elements: page.elements.map((el) =>
            el.id === elementId ? { ...el, rotation } : el
          ),
        };
      };

      return {
        ...spread,
        leftPage: spread.leftPage ? updatePage(spread.leftPage) : null,
        rightPage: updatePage(spread.rightPage),
      };
    });

    setEditorState((prev) => ({ ...prev, spreads: updatedSpreads }));
    addToHistory('Rotated element');
  };

  const canUndo = editorState.historyIndex > 0;
  const canRedo = editorState.historyIndex < editorState.history.length - 1;

  return (
    <div className="h-screen flex flex-col bg-slate-950">
      {/* Z1: Top Toolbar */}
      <PhotobookTopToolbar
        editorState={editorState}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onShowHistory={() => setShowHistoryModal(true)}
        onSave={handleSave}
        onPreview={handlePreview}
        onOrder={handleOrder}
        onVideoTutorial={handleVideoTutorial}
        canUndo={canUndo}
        canRedo={canRedo}
        isSaving={isSaving}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Z2: Left Sidebar */}
        <PhotobookLeftSidebar
          assets={editorState.assets}
          layoutPresets={mockLayoutPresets} // TODO: Load from service
          backgroundAssets={mockBackgrounds} // TODO: Load from service
          stickerAssets={mockStickers} // TODO: Load from service
          onImageClick={handleImageClick}
          onLayoutClick={handleLayoutClick}
          onBackgroundClick={handleBackgroundClick}
          onStickerClick={handleStickerClick}
          onSmartCreation={handleSmartCreation}
          onAutofill={handleAutofill}
        />

        {/* Z3: Element Toolbar + Z4: Canvas */}
        <div className="flex-1 relative">
          <PhotobookElementToolbar
            selectedTool={editorState.selectedTool}
            onToolSelect={handleToolSelect}
          />
          <PhotobookCanvas
            currentSpread={currentSpread}
            assets={editorState.assets}
            zoom={editorState.zoom}
            viewMode={editorState.viewMode}
            selectedElementIds={editorState.selectedElementIds}
            selectedTool={editorState.selectedTool}
            onZoomChange={(zoom) => setEditorState((prev) => ({ ...prev, zoom }))}
            onViewModeToggle={() =>
              setEditorState((prev) => ({
                ...prev,
                viewMode: prev.viewMode === 'one-page' ? 'all-pages' : 'one-page',
              }))
            }
            onElementSelect={(ids) =>
              setEditorState((prev) => ({ ...prev, selectedElementIds: ids }))
            }
            onElementMove={handleElementMove}
            onElementResize={handleElementResize}
            onElementRotate={handleElementRotate}
            onCanvasClick={handleCanvasClick}
          />
        </div>
      </div>

      {/* Z5: Page Thumbnails */}
      <PhotobookPageThumbnails
        spreads={editorState.spreads}
        currentSpreadIndex={currentSpreadIndex}
        onSpreadSelect={setCurrentSpreadIndex}
        onAddSpread={handleAddSpread}
        onDuplicateSpread={handleDuplicateSpread}
        onRemoveSpread={handleRemoveSpread}
        onToggleLock={handleToggleLock}
      />
    </div>
  );
}

// Utility Functions

function initializeEditorState(
  images: ImageUpload[],
  projectId?: string,
  projectName?: string
): PhotobookEditorState {
  // Convert ImageUpload to ImageAsset
  const assets: ImageAsset[] = images.map((img) => ({
    ...img,
    isUsed: false,
    usageCount: 0,
    usedInPages: [],
    addedAt: new Date(),
    tags: [],
    originalDimensions: { width: 800, height: 600 }, // TODO: Extract from image
    thumbnail: img.preview,
  }));

  // Create initial spread (cover)
  const coverSpread: PageSpread = {
    id: 'spread_cover',
    spreadNumber: 1,
    leftPage: null, // Cover has no left page
    rightPage: createBlankPage(1, 'right'),
    layoutPresetId: null,
    isLocked: false,
  };

  // Create first content spread
  const firstSpread: PageSpread = {
    id: 'spread_1',
    spreadNumber: 2,
    leftPage: createBlankPage(2, 'left'),
    rightPage: createBlankPage(3, 'right'),
    layoutPresetId: null,
    isLocked: false,
  };

  const initialHistory: PhotobookHistoryState = {
    timestamp: new Date(),
    description: 'Initial state',
    spreads: [coverSpread, firstSpread],
    assets,
  };

  return {
    projectId: projectId || `project_${Date.now()}`,
    projectName: projectName || 'Untitled Project',
    spreads: [coverSpread, firstSpread],
    assets,
    selectedTool: null,
    selectedElementIds: [],
    zoom: 100,
    viewMode: 'one-page',
    clipboardElements: [],
    history: [initialHistory],
    historyIndex: 0,
    isDirty: false,
    lastSaved: null,
  };
}

function createBlankPage(pageNumber: number, position: 'left' | 'right'): PhotobookPage {
  const blankBackground: BackgroundElement = {
    id: `bg_${Date.now()}`,
    type: 'background',
    backgroundType: 'color',
    color: '#ffffff',
    x: 0,
    y: 0,
    width: SPREAD_WIDTH,
    height: SPREAD_HEIGHT,
    rotation: 0,
    zIndex: 0,
    opacity: 100,
    locked: true,
    visible: true,
  };

  return {
    id: `page_${pageNumber}`,
    pageNumber,
    position,
    elements: [],
    background: blankBackground,
    bleed: 37, // 3mm at 300 DPI
    safeZone: 75, // 6mm at 300 DPI
  };
}

// Mock Data (TODO: Move to services)

const mockLayoutPresets: LayoutPreset[] = [
  {
    id: 'layout_1',
    name: 'Single Large',
    category: 'portrait',
    thumbnailUrl: '/layouts/single-large.jpg',
    spreadTemplate: {
      leftPageTemplate: null,
      rightPageTemplate: { elements: [], background: {} as BackgroundElement },
    },
  },
];

const mockBackgrounds: BackgroundAsset[] = [
  {
    id: 'bg_white',
    name: 'White',
    type: 'color',
    thumbnailUrl: '',
    assetData: '#ffffff',
    category: 'solid',
  },
  {
    id: 'bg_cream',
    name: 'Cream',
    type: 'color',
    thumbnailUrl: '',
    assetData: '#f8f4f0',
    category: 'solid',
  },
];

const mockStickers: StickerAsset[] = [];
