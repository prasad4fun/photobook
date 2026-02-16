/**
 * PhotoBook Studio - Zustand Store
 * Manages all state for the PhotoBook Studio editor
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  PhotoBookEditorState,
  StudioPhoto,
  StudioPhotoBook,
  StudioPage,
  StudioPageElement,
  StudioPhotoBookSnapshot,
  StudioPhotoElement,
  StudioPageLayout,
  LeftPanelView,
} from '../../types';
import {
  STUDIO_DEFAULT_PAGE_CONFIG,
  STUDIO_MAX_HISTORY_SIZE,
} from '../../types';
import { generatePhotoBook } from './photobookGenerator';

interface PhotoBookStore extends PhotoBookEditorState {
  // Actions - Selection Mode
  addPhotos: (photos: StudioPhoto[]) => void;
  deletePhoto: (photoId: string) => void;
  setHoveredPhoto: (photoId: string | null) => void;

  // Actions - Mode Switching
  generatePhotoBookFromPhotos: () => void;
  switchToEditMode: () => void;
  switchToSelectionMode: () => void;

  // Actions - Edit Mode
  selectPage: (pageId: string) => void;
  setHoveredPage: (pageId: string | null) => void;
  selectElements: (elementIds: string[], append?: boolean) => void;
  clearSelection: () => void;
  setLeftPanelView: (view: LeftPanelView) => void;

  // Actions - Element Management
  addElement: (pageId: string, element: StudioPageElement) => void;
  updateElement: (pageId: string, elementId: string, updates: Partial<StudioPageElement>) => void;
  deleteElements: (pageId: string, elementIds: string[]) => void;
  duplicateElement: (pageId: string, elementId: string) => void;
  reorderElement: (pageId: string, elementId: string, direction: 'forward' | 'backward' | 'front' | 'back') => void;

  // Actions - Page Management
  addPage: (afterPageId?: string) => void;
  removePage: (pageId: string) => void;
  updatePageLayout: (pageId: string, layout: StudioPageLayout) => void;
  updatePageBackground: (pageId: string, background: StudioPage['background']) => void;

  // Actions - Clipboard
  copyElement: (element: StudioPageElement) => void;
  pasteElement: (pageId: string, position?: { x: number; y: number }) => void;

  // Actions - History
  saveSnapshot: (action: string) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Actions - Spine & Navigation
  updateSpineTitle: (title: string) => void;
  setCurrentSpreadIndex: (index: number) => void;
  setZoomLevel: (level: number) => void;

  // Actions - Reset
  reset: () => void;
}

const initialState: PhotoBookEditorState = {
  mode: 'selection',
  selectedPhotos: [],
  photoBook: null,
  currentPageId: null,
  selectedElementIds: [],
  hoveredPhotoId: null,
  hoveredPageId: null,
  clipboard: null,
  history: [],
  historyIndex: -1,
  leftPanelView: 'photos',
  currentSpreadIndex: 0,
  zoomLevel: 100,
};

export const usePhotoBookStore = create<PhotoBookStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Selection Mode Actions
      addPhotos: (photos) => {
        set((state) => ({
          selectedPhotos: [...state.selectedPhotos, ...photos],
        }));
      },

      deletePhoto: (photoId) => {
        set((state) => ({
          selectedPhotos: state.selectedPhotos.filter((p) => p.id !== photoId),
        }));
      },

      setHoveredPhoto: (photoId) => {
        set({ hoveredPhotoId: photoId });
      },

      // Mode Switching
      generatePhotoBookFromPhotos: () => {
        const state = get();
        if (state.selectedPhotos.length === 0) {
          console.warn('No photos selected to generate photobook');
          return;
        }

        const photoBook = generatePhotoBook(state.selectedPhotos, STUDIO_DEFAULT_PAGE_CONFIG);
        photoBook.spineTitle = 'My PhotoBook';
        set({
          photoBook,
          mode: 'edit',
          currentPageId: photoBook.pages[0]?.id || null,
          history: [{
            photoBook: JSON.parse(JSON.stringify(photoBook)) as StudioPhotoBook,
            timestamp: new Date(),
            action: 'Generated photobook',
          }],
          historyIndex: 0,
        });
      },

      switchToEditMode: () => {
        set({ mode: 'edit' });
      },

      switchToSelectionMode: () => {
        set({ mode: 'selection', currentPageId: null, selectedElementIds: [] });
      },

      // Edit Mode Actions
      selectPage: (pageId) => {
        set({ currentPageId: pageId, selectedElementIds: [] });
      },

      setHoveredPage: (pageId) => {
        set({ hoveredPageId: pageId });
      },

      selectElements: (elementIds, append = false) => {
        set((state) => ({
          selectedElementIds: append
            ? [...new Set([...state.selectedElementIds, ...elementIds])]
            : elementIds,
        }));
      },

      clearSelection: () => {
        set({ selectedElementIds: [] });
      },

      setLeftPanelView: (view) => {
        set({ leftPanelView: view });
      },

      // Element Management
      addElement: (pageId, element) => {
        set((state) => {
          if (!state.photoBook) return state;

          const photoBook = { ...state.photoBook };
          const page = photoBook.pages.find((p) => p.id === pageId);
          if (!page) return state;

          // Calculate unique zIndex - always place new element on top
          const maxZIndex = page.elements.length > 0
            ? Math.max(...page.elements.map((e) => e.zIndex))
            : 0;

          // Create element with unique zIndex
          const elementWithZIndex = {
            ...element,
            zIndex: maxZIndex + 1,
          };

          page.elements = [...page.elements, elementWithZIndex];
          photoBook.updatedAt = new Date();

          return { photoBook };
        });
        get().saveSnapshot(`Added ${element.type} element`);
      },

      updateElement: (pageId, elementId, updates) => {
        set((state) => {
          if (!state.photoBook) return state;

          const photoBook = { ...state.photoBook };
          const page = photoBook.pages.find((p) => p.id === pageId);
          if (!page) return state;

          const elementIndex = page.elements.findIndex((e) => e.id === elementId);
          if (elementIndex === -1) return state;

          page.elements[elementIndex] = {
            ...page.elements[elementIndex],
            ...updates,
          } as StudioPageElement;
          photoBook.updatedAt = new Date();

          return { photoBook };
        });
      },

      deleteElements: (pageId, elementIds) => {
        set((state) => {
          if (!state.photoBook) return state;

          const photoBook = { ...state.photoBook };
          const page = photoBook.pages.find((p) => p.id === pageId);
          if (!page) return state;

          page.elements = page.elements.filter((e) => !elementIds.includes(e.id));
          photoBook.updatedAt = new Date();

          return {
            photoBook,
            selectedElementIds: state.selectedElementIds.filter(
              (id) => !elementIds.includes(id)
            ),
          };
        });
        get().saveSnapshot(`Deleted ${elementIds.length} element(s)`);
      },

      duplicateElement: (pageId, elementId) => {
        set((state) => {
          if (!state.photoBook) return state;

          const photoBook = { ...state.photoBook };
          const page = photoBook.pages.find((p) => p.id === pageId);
          if (!page) return state;

          const element = page.elements.find((e) => e.id === elementId);
          if (!element) return state;

          const duplicated = {
            ...element,
            id: `element-${Date.now()}-${Math.random()}`,
            x: element.x + 5,
            y: element.y + 5,
          };

          page.elements = [...page.elements, duplicated];
          photoBook.updatedAt = new Date();

          return { photoBook, selectedElementIds: [duplicated.id] };
        });
        get().saveSnapshot('Duplicated element');
      },

      reorderElement: (pageId, elementId, direction) => {
        set((state) => {
          if (!state.photoBook) return state;

          const photoBook = { ...state.photoBook };
          const pageIndex = photoBook.pages.findIndex((p) => p.id === pageId);
          if (pageIndex === -1) return state;

          // Deep clone the page to ensure immutability
          const page = { ...photoBook.pages[pageIndex] };
          page.elements = [...page.elements];
          photoBook.pages = [...photoBook.pages];
          photoBook.pages[pageIndex] = page;

          const elementIndex = page.elements.findIndex((e) => e.id === elementId);
          if (elementIndex === -1) return state;

          // Sort elements by zIndex to find proper neighbors
          const sortedElements = [...page.elements].sort((a, b) => a.zIndex - b.zIndex);
          const currentIndex = sortedElements.findIndex((e) => e.id === elementId);

          if (currentIndex === -1) return state;

          switch (direction) {
            case 'front':
              // Move to top - get highest zIndex + 1
              const maxZIndex = Math.max(...page.elements.map((e) => e.zIndex), 0);
              page.elements[elementIndex] = {
                ...page.elements[elementIndex],
                zIndex: maxZIndex + 1,
              };
              break;

            case 'forward':
              // Swap with element above (higher zIndex)
              if (currentIndex < sortedElements.length - 1) {
                const elementAbove = sortedElements[currentIndex + 1];
                const aboveIndex = page.elements.findIndex((e) => e.id === elementAbove.id);

                const currentZIndex = page.elements[elementIndex].zIndex;
                const aboveZIndex = elementAbove.zIndex;

                page.elements[elementIndex] = {
                  ...page.elements[elementIndex],
                  zIndex: aboveZIndex,
                };
                page.elements[aboveIndex] = {
                  ...page.elements[aboveIndex],
                  zIndex: currentZIndex,
                };
              }
              break;

            case 'backward':
              // Swap with element below (lower zIndex)
              if (currentIndex > 0) {
                const elementBelow = sortedElements[currentIndex - 1];
                const belowIndex = page.elements.findIndex((e) => e.id === elementBelow.id);

                const currentZIndex = page.elements[elementIndex].zIndex;
                const belowZIndex = elementBelow.zIndex;

                page.elements[elementIndex] = {
                  ...page.elements[elementIndex],
                  zIndex: belowZIndex,
                };
                page.elements[belowIndex] = {
                  ...page.elements[belowIndex],
                  zIndex: currentZIndex,
                };
              }
              break;

            case 'back':
              // Move to bottom - get lowest zIndex - 1
              const minZIndex = Math.min(...page.elements.map((e) => e.zIndex), 0);
              page.elements[elementIndex] = {
                ...page.elements[elementIndex],
                zIndex: minZIndex - 1,
              };
              break;
          }

          photoBook.updatedAt = new Date();
          return { photoBook };
        });
        get().saveSnapshot('Reordered element');
      },

      // Page Management
      addPage: (afterPageId) => {
        set((state) => {
          if (!state.photoBook) return state;

          const photoBook = { ...state.photoBook };
          const insertIndex = afterPageId
            ? photoBook.pages.findIndex((p) => p.id === afterPageId) + 1
            : photoBook.pages.length;

          const newPage: StudioPage = {
            id: `page-${Date.now()}`,
            pageNumber: insertIndex + 1,
            type: 'content',
            elements: [],
            layout: {
              id: 'empty',
              name: 'Empty',
              template: { photoSlots: [] },
            },
          };

          photoBook.pages.splice(insertIndex, 0, newPage);

          // Recalculate page numbers
          photoBook.pages.forEach((page, index) => {
            page.pageNumber = index + 1;
          });

          photoBook.updatedAt = new Date();

          return { photoBook, currentPageId: newPage.id };
        });
        get().saveSnapshot('Added new page');
      },

      removePage: (pageId) => {
        set((state) => {
          if (!state.photoBook) return state;
          if (state.photoBook.pages.length <= 1) {
            console.warn('Cannot remove last page');
            return state;
          }

          const photoBook = { ...state.photoBook };
          const pageIndex = photoBook.pages.findIndex((p) => p.id === pageId);
          if (pageIndex === -1) return state;

          photoBook.pages.splice(pageIndex, 1);

          // Recalculate page numbers
          photoBook.pages.forEach((page, index) => {
            page.pageNumber = index + 1;
          });

          photoBook.updatedAt = new Date();

          // Select previous or next page
          const newCurrentPageId =
            photoBook.pages[Math.max(0, pageIndex - 1)]?.id || null;

          return { photoBook, currentPageId: newCurrentPageId };
        });
        get().saveSnapshot('Removed page');
      },

      updatePageLayout: (pageId, layout) => {
        set((state) => {
          if (!state.photoBook) return state;

          const photoBook = { ...state.photoBook };
          const page = photoBook.pages.find((p) => p.id === pageId);
          if (!page) return state;

          // Update page layout
          page.layout = layout;

          // Get existing photo elements on the page
          const photoElements = page.elements.filter((el) => el.type === 'photo') as StudioPhotoElement[];

          // Redistribute photo elements to match new slot positions
          const newSlots = layout.template.photoSlots;

          // Update existing photo elements to match new slots
          photoElements.forEach((element, index) => {
            if (index < newSlots.length) {
              // Update element to match slot position/size
              const slot = newSlots[index];
              element.x = slot.x;
              element.y = slot.y;
              element.width = slot.width;
              element.height = slot.height;
              element.slotId = slot.id;
            } else {
              // Remove excess photo elements if slots decreased
              const elementIndex = page.elements.findIndex((e) => e.id === element.id);
              if (elementIndex !== -1) {
                page.elements.splice(elementIndex, 1);
              }
            }
          });

          // If more slots than photos, create empty placeholders
          if (newSlots.length > photoElements.length) {
            for (let i = photoElements.length; i < newSlots.length; i++) {
              const slot = newSlots[i];
              const placeholderElement: StudioPhotoElement = {
                id: `photo-${Date.now()}-${Math.random()}`,
                type: 'photo',
                photoId: undefined, // Empty placeholder
                x: slot.x,
                y: slot.y,
                width: slot.width,
                height: slot.height,
                rotation: 0,
                zIndex: 50 + i,
                slotId: slot.id,
              };
              page.elements.push(placeholderElement);
            }
          }

          photoBook.updatedAt = new Date();
          return { photoBook };
        });
        get().saveSnapshot('Changed page layout');
      },

      updatePageBackground: (pageId, background) => {
        set((state) => {
          if (!state.photoBook) return state;

          const photoBook = { ...state.photoBook };
          const page = photoBook.pages.find((p) => p.id === pageId);
          if (!page) return state;

          page.background = background;
          photoBook.updatedAt = new Date();

          return { photoBook };
        });
        get().saveSnapshot('Changed page background');
      },

      // Clipboard Actions
      copyElement: (element) => {
        set({ clipboard: JSON.parse(JSON.stringify(element)) });
      },

      pasteElement: (pageId, position) => {
        const state = get();
        if (!state.clipboard) return;

        const newElement = {
          ...state.clipboard,
          id: `element-${Date.now()}-${Math.random()}`,
          x: position?.x ?? state.clipboard.x + 5,
          y: position?.y ?? state.clipboard.y + 5,
        };

        get().addElement(pageId, newElement);
      },

      // History Actions
      saveSnapshot: (action) => {
        set((state) => {
          if (!state.photoBook) return state;

          const snapshot: StudioPhotoBookSnapshot = {
            photoBook: JSON.parse(JSON.stringify(state.photoBook)) as StudioPhotoBook,
            timestamp: new Date(),
            action,
          };

          // Remove any redo history
          const newHistory = state.history.slice(0, state.historyIndex + 1);
          newHistory.push(snapshot);

          // Limit history size
          if (newHistory.length > STUDIO_MAX_HISTORY_SIZE) {
            newHistory.shift();
          }

          return {
            history: newHistory,
            historyIndex: newHistory.length - 1,
          };
        });
      },

      undo: () => {
        set((state) => {
          if (!get().canUndo()) return state;

          const newIndex = state.historyIndex - 1;
          const snapshot = state.history[newIndex];

          return {
            photoBook: JSON.parse(JSON.stringify(snapshot.photoBook)) as StudioPhotoBook,
            historyIndex: newIndex,
          };
        });
      },

      redo: () => {
        set((state) => {
          if (!get().canRedo()) return state;

          const newIndex = state.historyIndex + 1;
          const snapshot = state.history[newIndex];

          return {
            photoBook: JSON.parse(JSON.stringify(snapshot.photoBook)) as StudioPhotoBook,
            historyIndex: newIndex,
          };
        });
      },

      canUndo: () => {
        const state = get();
        return state.historyIndex > 0;
      },

      canRedo: () => {
        const state = get();
        return state.historyIndex < state.history.length - 1;
      },

      // Reset
      // Spine & Navigation Actions
      updateSpineTitle: (title) => {
        set((state) => {
          if (!state.photoBook) return state;
          return {
            photoBook: { ...state.photoBook, spineTitle: title, updatedAt: new Date() },
          };
        });
        get().saveSnapshot('Updated spine title');
      },

      setCurrentSpreadIndex: (index) => {
        set({ currentSpreadIndex: index });
      },

      setZoomLevel: (level) => {
        set({ zoomLevel: level });
      },

      reset: () => {
        set(initialState);
      },
    }),
    { name: 'PhotoBookStore' }
  )
);
