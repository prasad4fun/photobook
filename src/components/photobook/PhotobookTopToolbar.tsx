import { useState } from 'react';
import {
  Undo,
  Redo,
  History,
  ChevronDown,
  PlayCircle,
  Save,
  Eye,
  ShoppingCart,
  Check,
  Loader2,
} from 'lucide-react';
import { PhotobookEditorState } from '../../types';

interface PhotobookTopToolbarProps {
  editorState: PhotobookEditorState;
  onUndo: () => void;
  onRedo: () => void;
  onShowHistory: () => void;
  onSave: () => void;
  onPreview: () => void;
  onOrder: () => void;
  onVideoTutorial: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isSaving: boolean;
}

export default function PhotobookTopToolbar({
  editorState,
  onUndo,
  onRedo,
  onShowHistory,
  onSave,
  onPreview,
  onOrder,
  onVideoTutorial,
  canUndo,
  canRedo,
  isSaving,
}: PhotobookTopToolbarProps) {
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);

  const getSaveButtonText = () => {
    if (isSaving) return 'Saving...';
    if (!editorState.isDirty) return 'Saved';
    return 'Save';
  };

  const getSaveButtonIcon = () => {
    if (isSaving) return <Loader2 className="w-4 h-4 animate-spin" />;
    if (!editorState.isDirty) return <Check className="w-4 h-4" />;
    return <Save className="w-4 h-4" />;
  };

  return (
    <div className="h-16 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 flex items-center justify-between px-6">
      {/* Left Section: Undo/Redo + History + Project */}
      <div className="flex items-center gap-3">
        {/* Undo/Redo */}
        <div className="flex items-center gap-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-2 rounded-lg transition-all ${
              canUndo
                ? 'hover:bg-slate-800 text-slate-300'
                : 'text-slate-600 cursor-not-allowed'
            }`}
            title="Undo (Cmd+Z)"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-2 rounded-lg transition-all ${
              canRedo
                ? 'hover:bg-slate-800 text-slate-300'
                : 'text-slate-600 cursor-not-allowed'
            }`}
            title="Redo (Cmd+Shift+Z)"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-slate-700"></div>

        {/* History */}
        <button
          onClick={onShowHistory}
          className="flex items-center gap-2 px-3 py-2 hover:bg-slate-800 rounded-lg text-slate-300 transition-all"
          title="View edit history"
        >
          <History className="w-4 h-4" />
          <span className="text-sm font-medium">History</span>
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-slate-700"></div>

        {/* Project Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProjectDropdown(!showProjectDropdown)}
            className="flex items-center gap-2 px-3 py-2 hover:bg-slate-800 rounded-lg text-slate-300 transition-all"
          >
            <span className="text-sm font-medium">
              {editorState.projectName || 'Untitled Project'}
            </span>
            <ChevronDown className="w-4 h-4" />
          </button>

          {showProjectDropdown && (
            <div className="absolute top-full mt-2 left-0 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="p-2">
                <button className="w-full text-left px-3 py-2 hover:bg-slate-700 rounded-lg text-slate-300 text-sm transition-all">
                  Rename Project
                </button>
                <button className="w-full text-left px-3 py-2 hover:bg-slate-700 rounded-lg text-slate-300 text-sm transition-all">
                  Duplicate Project
                </button>
                <button className="w-full text-left px-3 py-2 hover:bg-slate-700 rounded-lg text-slate-300 text-sm transition-all">
                  Export as PDF
                </button>
                <div className="my-1 h-px bg-slate-700"></div>
                <button className="w-full text-left px-3 py-2 hover:bg-slate-700 rounded-lg text-red-400 text-sm transition-all">
                  Delete Project
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Video Tutorial */}
        <button
          onClick={onVideoTutorial}
          className="flex items-center gap-2 px-3 py-2 hover:bg-slate-800 rounded-lg text-slate-300 transition-all"
          title="Watch video tutorial"
        >
          <PlayCircle className="w-4 h-4" />
          <span className="text-sm font-medium">Video Tutorial</span>
        </button>
      </div>

      {/* Right Section: Save + Preview + Order */}
      <div className="flex items-center gap-3">
        {/* Save Button */}
        <button
          onClick={onSave}
          disabled={!editorState.isDirty || isSaving}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
            editorState.isDirty && !isSaving
              ? 'bg-violet-600 hover:bg-violet-500 text-white'
              : editorState.isDirty && isSaving
              ? 'bg-violet-600/50 text-white cursor-wait'
              : 'bg-slate-700 text-slate-400 cursor-not-allowed'
          }`}
        >
          {getSaveButtonIcon()}
          <span>{getSaveButtonText()}</span>
        </button>

        {/* Preview Button */}
        <button
          onClick={onPreview}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 font-medium text-sm transition-all"
        >
          <Eye className="w-4 h-4" />
          <span>Preview</span>
        </button>

        {/* Order Button */}
        <button
          onClick={onOrder}
          className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 rounded-lg text-white font-bold text-sm transition-all shadow-lg shadow-violet-500/30"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Order</span>
        </button>
      </div>

      {/* Autosave Indicator */}
      {editorState.lastSaved && !editorState.isDirty && (
        <div className="absolute bottom-2 right-6 text-xs text-slate-500">
          Last saved: {formatLastSaved(editorState.lastSaved)}
        </div>
      )}
    </div>
  );
}

function formatLastSaved(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'just now';
  if (diffMins === 1) return '1 minute ago';
  if (diffMins < 60) return `${diffMins} minutes ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours === 1) return '1 hour ago';
  if (diffHours < 24) return `${diffHours} hours ago`;

  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
