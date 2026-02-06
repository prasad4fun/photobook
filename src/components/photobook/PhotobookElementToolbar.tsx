import { Type, Image as ImageIcon, LayoutGrid, Square, Circle } from 'lucide-react';
import { EditorTool } from '../../types';

interface PhotobookElementToolbarProps {
  selectedTool: EditorTool | null;
  onToolSelect: (tool: EditorTool) => void;
}

export default function PhotobookElementToolbar({
  selectedTool,
  onToolSelect,
}: PhotobookElementToolbarProps) {
  const tools: Array<{
    id: EditorTool;
    icon: JSX.Element;
    label: string;
    shortcut?: string;
  }> = [
    { id: 'text', icon: <Type className="w-5 h-5" />, label: 'Text', shortcut: 'T' },
    { id: 'photo', icon: <ImageIcon className="w-5 h-5" />, label: 'Photo', shortcut: 'P' },
    { id: 'layout', icon: <LayoutGrid className="w-5 h-5" />, label: 'Layout', shortcut: 'L' },
    { id: 'rectangle', icon: <Square className="w-5 h-5" />, label: 'Rectangle', shortcut: 'R' },
    { id: 'ellipse', icon: <Circle className="w-5 h-5" />, label: 'Ellipse', shortcut: 'E' },
  ];

  return (
    <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10">
      {/* Left Side Toolbar */}
      <div className="absolute left-[-400px] top-1/2 -translate-y-1/2 pointer-events-auto">
        <div className="flex flex-col gap-2 bg-slate-900/95 backdrop-blur-sm border border-slate-800 rounded-xl p-2 shadow-2xl">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => onToolSelect(tool.id)}
              className={`relative group p-3 rounded-lg transition-all ${
                selectedTool === tool.id
                  ? 'bg-violet-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
              title={`${tool.label} (${tool.shortcut})`}
            >
              {tool.icon}

              {/* Tooltip */}
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-200">{tool.label}</span>
                  {tool.shortcut && (
                    <kbd className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-400 font-mono">
                      {tool.shortcut}
                    </kbd>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Side Toolbar (Mirror) */}
      <div className="absolute right-[-400px] top-1/2 -translate-y-1/2 pointer-events-auto">
        <div className="flex flex-col gap-2 bg-slate-900/95 backdrop-blur-sm border border-slate-800 rounded-xl p-2 shadow-2xl">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => onToolSelect(tool.id)}
              className={`relative group p-3 rounded-lg transition-all ${
                selectedTool === tool.id
                  ? 'bg-violet-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
              title={`${tool.label} (${tool.shortcut})`}
            >
              {tool.icon}

              {/* Tooltip */}
              <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-200">{tool.label}</span>
                  {tool.shortcut && (
                    <kbd className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-400 font-mono">
                      {tool.shortcut}
                    </kbd>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
