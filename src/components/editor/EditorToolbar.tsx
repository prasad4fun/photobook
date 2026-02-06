import { useState } from 'react';
import {
  Undo2,
  Redo2,
  Sun,
  Contrast,
  Droplet,
  Palette,
  RotateCw,
  Sparkles,
  Image as ImageIcon,
} from 'lucide-react';
import { ImageLayerProps, ImageFilter } from '../../types';

interface EditorToolbarProps {
  adjustments: ImageLayerProps;
  onAdjustmentChange: (adjustments: Partial<ImageLayerProps>) => void;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export default function EditorToolbar({
  adjustments,
  onAdjustmentChange,
  onUndo,
  onRedo,
  onReset,
  canUndo,
  canRedo,
}: EditorToolbarProps) {
  const [activeTab, setActiveTab] = useState<'adjust' | 'filters'>('adjust');

  const FILTER_PRESETS: Array<{ name: string; label: string; icon: any }> = [
    { name: 'none', label: 'Original', icon: ImageIcon },
    { name: 'vintage', label: 'Vintage', icon: Sparkles },
    { name: 'bw', label: 'B&W', icon: Contrast },
    { name: 'sepia', label: 'Sepia', icon: Palette },
  ];

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-800">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left: Undo/Redo */}
        <div className="flex items-center gap-2">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-2 rounded-lg transition-all ${
              canUndo
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                : 'bg-slate-800/50 text-slate-600 cursor-not-allowed'
            }`}
            title="Undo (Cmd+Z)"
          >
            <Undo2 className="w-5 h-5" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-2 rounded-lg transition-all ${
              canRedo
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                : 'bg-slate-800/50 text-slate-600 cursor-not-allowed'
            }`}
            title="Redo (Cmd+Shift+Z)"
          >
            <Redo2 className="w-5 h-5" />
          </button>
        </div>

        {/* Center: Tab Selector */}
        <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('adjust')}
            className={`px-4 py-2 rounded-md font-medium transition-all ${
              activeTab === 'adjust'
                ? 'bg-violet-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Adjustments
          </button>
          <button
            onClick={() => setActiveTab('filters')}
            className={`px-4 py-2 rounded-md font-medium transition-all ${
              activeTab === 'filters'
                ? 'bg-violet-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Filters
          </button>
        </div>

        {/* Right: Reset */}
        <button
          onClick={onReset}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-all"
        >
          <RotateCw className="w-4 h-4 inline mr-2" />
          Reset
        </button>
      </div>

      {/* Adjustments Panel */}
      {activeTab === 'adjust' && (
        <div className="px-4 pb-4 space-y-3">
          <AdjustmentSlider
            label="Brightness"
            value={adjustments.brightness}
            min={-100}
            max={100}
            onChange={(value) => onAdjustmentChange({ brightness: value })}
            icon={<Sun className="w-4 h-4" />}
          />
          <AdjustmentSlider
            label="Contrast"
            value={adjustments.contrast}
            min={-100}
            max={100}
            onChange={(value) => onAdjustmentChange({ contrast: value })}
            icon={<Contrast className="w-4 h-4" />}
          />
          <AdjustmentSlider
            label="Saturation"
            value={adjustments.saturation}
            min={-100}
            max={100}
            onChange={(value) => onAdjustmentChange({ saturation: value })}
            icon={<Droplet className="w-4 h-4" />}
          />
          <AdjustmentSlider
            label="Hue"
            value={adjustments.hue}
            min={-180}
            max={180}
            onChange={(value) => onAdjustmentChange({ hue: value })}
            icon={<Palette className="w-4 h-4" />}
            unit="°"
          />
        </div>
      )}

      {/* Filters Panel */}
      {activeTab === 'filters' && (
        <div className="px-4 pb-4">
          <div className="grid grid-cols-4 gap-3">
            {FILTER_PRESETS.map((filter) => {
              const Icon = filter.icon;
              const isActive = adjustments.filters.some((f) => f.type === filter.name);

              return (
                <button
                  key={filter.name}
                  onClick={() => {
                    const newFilters: ImageFilter[] =
                      filter.name === 'none'
                        ? []
                        : [{ type: filter.name as any, intensity: 100 }];
                    onAdjustmentChange({ filters: newFilters });
                  }}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    isActive || (filter.name === 'none' && adjustments.filters.length === 0)
                      ? 'border-violet-500 bg-violet-500/10'
                      : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                  }`}
                >
                  <Icon
                    className={`w-6 h-6 mx-auto mb-2 ${
                      isActive || (filter.name === 'none' && adjustments.filters.length === 0)
                        ? 'text-violet-400'
                        : 'text-slate-400'
                    }`}
                  />
                  <p
                    className={`text-sm font-medium ${
                      isActive || (filter.name === 'none' && adjustments.filters.length === 0)
                        ? 'text-violet-300'
                        : 'text-slate-300'
                    }`}
                  >
                    {filter.label}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Adjustment Slider Component
interface AdjustmentSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  icon: React.ReactNode;
  unit?: string;
}

function AdjustmentSlider({
  label,
  value,
  min,
  max,
  onChange,
  icon,
  unit = '',
}: AdjustmentSliderProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 w-32">
        <div className="text-violet-400">{icon}</div>
        <label className="text-slate-300 font-medium text-sm">{label}</label>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
        style={{
          background: `linear-gradient(to right,
            rgb(139 92 246) 0%,
            rgb(139 92 246) ${((value - min) / (max - min)) * 100}%,
            rgb(51 65 85) ${((value - min) / (max - min)) * 100}%,
            rgb(51 65 85) 100%)`,
        }}
      />
      <span className="text-slate-400 w-16 text-right font-mono text-sm">
        {value > 0 ? '+' : ''}
        {value}
        {unit}
      </span>
    </div>
  );
}
