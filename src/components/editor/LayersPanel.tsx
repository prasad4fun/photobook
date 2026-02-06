import { Layers, Eye, EyeOff, Lock, Unlock, Trash2, Image as ImageIcon } from 'lucide-react';
import { EditorLayer } from '../../types';
import { useState } from 'react';

interface LayersPanelProps {
  layers: EditorLayer[];
  selectedLayerId: string | null;
  onSelectLayer: (layerId: string) => void;
  onToggleVisibility: (layerId: string) => void;
  onToggleLock: (layerId: string) => void;
  onUpdateOpacity: (layerId: string, opacity: number) => void;
  onDeleteLayer: (layerId: string) => void;
  onReorderLayers: (layers: EditorLayer[]) => void;
}

export default function LayersPanel({
  layers,
  selectedLayerId,
  onSelectLayer,
  onToggleVisibility,
  onToggleLock,
  onUpdateOpacity,
  onDeleteLayer,
  onReorderLayers,
}: LayersPanelProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const reorderedLayers = [...layers];
    const [draggedLayer] = reorderedLayers.splice(draggedIndex, 1);
    reorderedLayers.splice(dropIndex, 0, draggedLayer);

    onReorderLayers(reorderedLayers);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  if (layers.length === 0) {
    return (
      <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-slate-200">Layers</h3>
        </div>

        <div className="text-center py-8">
          <p className="text-slate-400 text-sm">No layers yet</p>
          <p className="text-slate-500 text-xs mt-1">
            Add images or text to create layers
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-800 p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
          <Layers className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-slate-200">Layers</h3>
          <p className="text-xs text-slate-500">{layers.length} layer{layers.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Layers List */}
      <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
        {layers.map((layer, index) => (
          <LayerItem
            key={layer.id}
            layer={layer}
            index={index}
            isSelected={layer.id === selectedLayerId}
            isDragging={draggedIndex === index}
            isDragOver={dragOverIndex === index}
            onSelect={() => onSelectLayer(layer.id)}
            onToggleVisibility={() => onToggleVisibility(layer.id)}
            onToggleLock={() => onToggleLock(layer.id)}
            onUpdateOpacity={(opacity) => onUpdateOpacity(layer.id, opacity)}
            onDelete={() => onDeleteLayer(layer.id)}
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
          />
        ))}
      </div>

      {/* Info Footer */}
      <div className="mt-4 pt-4 border-t border-slate-800">
        <p className="text-xs text-slate-500">
          Drag to reorder • Click to select
        </p>
      </div>
    </div>
  );
}

interface LayerItemProps {
  layer: EditorLayer;
  index: number;
  isSelected: boolean;
  isDragging: boolean;
  isDragOver: boolean;
  onSelect: () => void;
  onToggleVisibility: () => void;
  onToggleLock: () => void;
  onUpdateOpacity: (opacity: number) => void;
  onDelete: () => void;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}

function LayerItem({
  layer,
  index,
  isSelected,
  isDragging,
  isDragOver,
  onSelect,
  onToggleVisibility,
  onToggleLock,
  onUpdateOpacity,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: LayerItemProps) {
  const [showOpacity, setShowOpacity] = useState(false);

  const getLayerIcon = () => {
    switch (layer.type) {
      case 'image':
        return <ImageIcon className="w-4 h-4" />;
      case 'text':
        return <span className="text-xs font-bold">T</span>;
      case 'shape':
        return <span className="text-xs">◆</span>;
      case 'filter':
        return <span className="text-xs">✦</span>;
      default:
        return <ImageIcon className="w-4 h-4" />;
    }
  };

  const getLayerName = () => {
    if (layer.name) return layer.name;

    switch (layer.type) {
      case 'image':
        return layer.imageProps?.src ? 'Image' : 'Empty Image';
      case 'text':
        return layer.textProps?.text || 'Text Layer';
      case 'shape':
        return 'Shape';
      case 'filter':
        return 'Filter Effect';
      default:
        return 'Layer';
    }
  };

  return (
    <div
      draggable={!layer.locked}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={`relative group rounded-lg border transition-all ${
        isSelected
          ? 'border-violet-500 bg-violet-500/10'
          : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
      } ${
        isDragging ? 'opacity-50 scale-95' : ''
      } ${
        isDragOver ? 'border-violet-400 border-dashed' : ''
      }`}
    >
      <div className="flex items-center gap-3 p-3">
        {/* Drag Handle & Icon */}
        <button
          onClick={onSelect}
          className="flex items-center gap-2 flex-1 min-w-0"
        >
          <div className="w-8 h-8 rounded bg-slate-700 flex items-center justify-center text-slate-400 flex-shrink-0">
            {getLayerIcon()}
          </div>

          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-medium text-slate-200 truncate">
              {getLayerName()}
            </p>
            <p className="text-xs text-slate-500">
              {layer.type.charAt(0).toUpperCase() + layer.type.slice(1)} • #{index + 1}
            </p>
          </div>
        </button>

        {/* Controls */}
        <div className="flex items-center gap-1">
          {/* Visibility Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleVisibility();
            }}
            className="p-1.5 hover:bg-slate-700 rounded transition-colors"
            title={layer.visible ? 'Hide layer' : 'Show layer'}
          >
            {layer.visible ? (
              <Eye className="w-4 h-4 text-slate-400" />
            ) : (
              <EyeOff className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* Lock Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleLock();
            }}
            className="p-1.5 hover:bg-slate-700 rounded transition-colors"
            title={layer.locked ? 'Unlock layer' : 'Lock layer'}
          >
            {layer.locked ? (
              <Lock className="w-4 h-4 text-slate-400" />
            ) : (
              <Unlock className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* Opacity Control */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowOpacity(!showOpacity);
            }}
            className="px-2 py-1 hover:bg-slate-700 rounded transition-colors"
            title="Adjust opacity"
          >
            <span className="text-xs text-slate-400 font-mono">
              {Math.round((layer.opacity || 1) * 100)}%
            </span>
          </button>

          {/* Delete Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1.5 hover:bg-red-500/20 rounded transition-colors opacity-0 group-hover:opacity-100"
            title="Delete layer"
          >
            <Trash2 className="w-4 h-4 text-red-400" />
          </button>
        </div>
      </div>

      {/* Opacity Slider */}
      {showOpacity && (
        <div className="px-3 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 w-12">Opacity</span>
            <input
              type="range"
              min="0"
              max="100"
              value={(layer.opacity || 1) * 100}
              onChange={(e) => onUpdateOpacity(Number(e.target.value) / 100)}
              className="flex-1 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
            />
            <span className="text-xs text-slate-400 font-mono w-10 text-right">
              {Math.round((layer.opacity || 1) * 100)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
