import { Sparkles, RefreshCw, Zap } from 'lucide-react';
import { AISuggestion } from '../../types';

interface AISuggestionsPanelProps {
  suggestions: AISuggestion[];
  onApplySuggestion: (suggestion: AISuggestion) => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

export default function AISuggestionsPanel({
  suggestions,
  onApplySuggestion,
  onRefresh,
  isLoading = false,
}: AISuggestionsPanelProps) {
  if (isLoading) {
    return (
      <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-slate-200">AI Suggestions</h3>
        </div>

        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-slate-800/50 rounded-lg p-4 animate-pulse"
            >
              <div className="h-4 bg-slate-700 rounded w-3/4 mb-2" />
              <div className="h-3 bg-slate-700 rounded w-full mb-3" />
              <div className="h-8 bg-slate-700 rounded w-24" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-slate-200">AI Suggestions</h3>
        </div>

        <div className="text-center py-8">
          <p className="text-slate-400 mb-4">No suggestions available</p>
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Generate Suggestions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-800 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-slate-200">AI Suggestions</h3>
        </div>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          title="Refresh suggestions"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Suggestions Grid */}
      <div className="space-y-3">
        {suggestions.map((suggestion) => (
          <SuggestionCard
            key={suggestion.suggestion_id}
            suggestion={suggestion}
            onApply={() => onApplySuggestion(suggestion)}
          />
        ))}
      </div>

      {/* Info Footer */}
      <div className="mt-4 pt-4 border-t border-slate-800">
        <p className="text-xs text-slate-500 flex items-center gap-2">
          <Zap className="w-3 h-3" />
          Powered by GPT-4o Vision
        </p>
      </div>
    </div>
  );
}

interface SuggestionCardProps {
  suggestion: AISuggestion;
  onApply: () => void;
}

function SuggestionCard({ suggestion, onApply }: SuggestionCardProps) {
  const confidenceColor = getConfidenceColor(suggestion.confidence);
  const confidenceLabel = getConfidenceLabel(suggestion.confidence);

  return (
    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50 hover:border-violet-500/50 transition-all group">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h4 className="text-sm font-bold text-slate-200 mb-1">
            {suggestion.title}
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            {suggestion.description}
          </p>
        </div>

        {/* Confidence Badge */}
        <div
          className={`ml-3 px-2 py-1 rounded text-xs font-bold whitespace-nowrap ${confidenceColor}`}
        >
          {confidenceLabel}
        </div>
      </div>

      {/* Adjustment Preview */}
      <div className="flex flex-wrap gap-2 mb-3">
        {suggestion.adjustments.brightness !== undefined &&
          suggestion.adjustments.brightness !== 0 && (
            <AdjustmentBadge
              label="Brightness"
              value={suggestion.adjustments.brightness}
            />
          )}
        {suggestion.adjustments.contrast !== undefined &&
          suggestion.adjustments.contrast !== 0 && (
            <AdjustmentBadge
              label="Contrast"
              value={suggestion.adjustments.contrast}
            />
          )}
        {suggestion.adjustments.saturation !== undefined &&
          suggestion.adjustments.saturation !== 0 && (
            <AdjustmentBadge
              label="Saturation"
              value={suggestion.adjustments.saturation}
            />
          )}
        {suggestion.adjustments.hue !== undefined &&
          suggestion.adjustments.hue !== 0 && (
            <AdjustmentBadge label="Hue" value={suggestion.adjustments.hue} />
          )}
      </div>

      {/* Apply Button */}
      <button
        onClick={onApply}
        className="w-full px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-sm font-bold rounded-lg transition-all shadow-lg shadow-violet-500/20 group-hover:shadow-violet-500/40"
      >
        Apply Suggestion
      </button>
    </div>
  );
}

interface AdjustmentBadgeProps {
  label: string;
  value: number;
}

function AdjustmentBadge({ label, value }: AdjustmentBadgeProps) {
  const sign = value > 0 ? '+' : '';
  const color = value > 0 ? 'text-green-400' : 'text-orange-400';

  return (
    <div className="px-2 py-1 bg-slate-900/50 rounded text-xs">
      <span className="text-slate-500">{label}</span>
      <span className={`ml-1 font-bold ${color}`}>
        {sign}
        {value}
      </span>
    </div>
  );
}

// Helper functions
function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.9) return 'bg-green-500/20 text-green-400';
  if (confidence >= 0.8) return 'bg-blue-500/20 text-blue-400';
  if (confidence >= 0.7) return 'bg-yellow-500/20 text-yellow-400';
  return 'bg-slate-500/20 text-slate-400';
}

function getConfidenceLabel(confidence: number): string {
  if (confidence >= 0.9) return 'Excellent';
  if (confidence >= 0.8) return 'Great';
  if (confidence >= 0.7) return 'Good';
  return 'Fair';
}
