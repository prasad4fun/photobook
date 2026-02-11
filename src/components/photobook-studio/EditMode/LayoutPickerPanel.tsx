/**
 * Layout Picker Panel - Allows users to change page layout (Left Panel View)
 * v2.0 - Added dynamic slot controls (add/remove/shuffle)
 * Converted from modal to left panel view
 */

import React from 'react';
import { ArrowLeft, Check, Plus, Minus, Shuffle } from 'lucide-react';
import { getAvailableLayouts } from '../../../services/photobook-studio/photobookGenerator';
import { usePhotoBookStore } from '../../../hooks/usePhotoBookStore';
import { applyLayoutToPage } from '../../../services/photobook-studio/photobookGenerator';
import { addPhotoSlot, removePhotoSlot, shufflePhotoSlots } from '../../../utils/photobook-studio/helpers';

interface LayoutPickerPanelProps {
  pageId: string;
}

export default function LayoutPickerPanel({ pageId }: LayoutPickerPanelProps) {
  const photoBook = usePhotoBookStore((state) => state.photoBook);
  const selectedPhotos = usePhotoBookStore((state) => state.selectedPhotos);
  const updateElement = usePhotoBookStore((state) => state.updateElement);
  const updatePageLayout = usePhotoBookStore((state) => state.updatePageLayout);
  const setLeftPanelView = usePhotoBookStore((state) => state.setLeftPanelView);

  if (!photoBook) return null;

  const currentPage = photoBook.pages.find((p) => p.id === pageId);
  if (!currentPage) return null;

  const layouts = getAvailableLayouts();
  const currentLayoutId = currentPage.layout.id;
  const currentSlots = currentPage.layout.template.photoSlots;

  // Dynamic slot controls - v2.0
  const minSlots = 1;
  const maxSlots = 9;
  const canAdd = currentSlots.length < maxSlots;
  const canRemove = currentSlots.length > minSlots;

  const handleLayoutSelect = (layoutId: string) => {
    const updatedPage = applyLayoutToPage(currentPage, layoutId, selectedPhotos);

    // Update all elements
    updatedPage.elements.forEach((element) => {
      const existingElement = currentPage.elements.find((e) => e.id === element.id);
      if (existingElement) {
        // Update existing element position/size
        updateElement(pageId, element.id, {
          x: element.x,
          y: element.y,
          width: element.width,
          height: element.height,
          slotId: element.type === 'photo' ? (element as any).slotId : undefined,
        });
      }
    });

    // Close panel after selection
    setLeftPanelView('photos');
  };

  // v2.0: Dynamic slot management
  const handleAddSlot = () => {
    const newSlots = addPhotoSlot(currentSlots);
    const updatedLayout = {
      ...currentPage.layout,
      template: {
        ...currentPage.layout.template,
        photoSlots: newSlots,
      },
    };

    // Update the page layout in store
    updatePageLayout(pageId, updatedLayout);
  };

  const handleRemoveSlot = () => {
    const newSlots = removePhotoSlot(currentSlots);
    const updatedLayout = {
      ...currentPage.layout,
      template: {
        ...currentPage.layout.template,
        photoSlots: newSlots,
      },
    };

    updatePageLayout(pageId, updatedLayout);
  };

  const handleShuffle = () => {
    const shuffledSlots = shufflePhotoSlots(currentSlots);
    const updatedLayout = {
      ...currentPage.layout,
      template: {
        ...currentPage.layout.template,
        photoSlots: shuffledSlots,
      },
    };

    updatePageLayout(pageId, updatedLayout);
  };

  // Render layout preview
  const renderLayoutPreview = (layout: any) => {
    const slots = layout.photoSlots || layout.template?.photoSlots || [];

    return (
      <div className="relative w-full h-full bg-white rounded overflow-hidden">
        {slots.map((slot: any) => (
          <div
            key={slot.id}
            className="absolute bg-slate-300 border-2 border-slate-400"
            style={{
              left: `${slot.x}%`,
              top: `${slot.y}%`,
              width: `${slot.width}%`,
              height: `${slot.height}%`,
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with back button */}
      <div className="px-4 py-3 border-b border-slate-800">
        {/* Back Button */}
        <button
          onClick={() => setLeftPanelView('photos')}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors mb-3"
        >
          <ArrowLeft size={18} />
          <span className="text-sm">Back to Photos</span>
        </button>

        {/* Title */}
        <div>
          <h2 className="text-lg font-bold text-white">Change Layout</h2>
          <p className="text-xs text-slate-400 mt-1">
            Select a layout for this page
          </p>
        </div>

        {/* v2.0: Dynamic slot controls */}
        <div className="mt-3 space-y-2">
          <span className="text-xs text-slate-400">
            Current slots: <span className="text-white font-medium">{currentSlots.length}</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRemoveSlot}
              disabled={!canRemove}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
              title={canRemove ? 'Remove one photo slot' : `Minimum ${minSlots} slot(s) required`}
            >
              <Minus size={16} />
            </button>
            <button
              onClick={handleAddSlot}
              disabled={!canAdd}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
              title={canAdd ? 'Add one photo slot' : `Maximum ${maxSlots} slots reached`}
            >
              <Plus size={16} />
            </button>
            <button
              onClick={handleShuffle}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors"
              title="Shuffle photo slot positions"
            >
              <Shuffle size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Layout Grid */}
      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-2 gap-3">
          {layouts.map((layout) => (
            <button
              key={layout.id}
              onClick={() => handleLayoutSelect(layout.id)}
              className={`relative group rounded-lg border-2 transition-all ${
                layout.id === currentLayoutId
                  ? 'border-violet-500 bg-violet-500/10'
                  : 'border-slate-700 hover:border-violet-400 bg-slate-800'
              }`}
            >
              {/* Preview */}
              <div className="aspect-[1/1.4] p-3">
                {renderLayoutPreview(layout)}
              </div>

              {/* Label */}
              <div className="px-3 pb-2">
                <p className="text-xs font-medium text-white flex items-center justify-between">
                  <span className="truncate">{layout.name}</span>
                  {layout.id === currentLayoutId && (
                    <Check size={14} className="text-violet-500 flex-shrink-0 ml-1" />
                  )}
                </p>
                <p className="text-xs text-slate-400 capitalize truncate">
                  {layout.category}
                </p>
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-violet-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
