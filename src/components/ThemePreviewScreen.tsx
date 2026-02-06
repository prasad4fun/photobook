import { useState } from 'react';
import { ArrowLeft, Sparkles, Sun, Palette, Camera, Check } from 'lucide-react';
import { Theme } from '../types';
import { LucideIcon } from 'lucide-react';

interface ThemePreviewScreenProps {
  themes: Theme[];
  onSelectTheme: (theme: Theme) => void;
  onCreatePhotobook?: (theme: Theme) => void;
  onBack: () => void;
}

export default function ThemePreviewScreen({ themes, onSelectTheme, onCreatePhotobook, onBack }: ThemePreviewScreenProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const getThemeIcon = (themeName: string): LucideIcon => {
    if (themeName.toLowerCase().includes('warm')) return Sun;
    if (themeName.toLowerCase().includes('cinematic')) return Camera;
    if (themeName.toLowerCase().includes('bright')) return Sparkles;
    return Palette;
  };

  const getThemeGradient = (index: number): string => {
    const gradients = [
      'from-amber-500/20 to-orange-500/20',
      'from-violet-500/20 to-purple-500/20',
      'from-cyan-500/20 to-blue-500/20',
      'from-rose-500/20 to-pink-500/20',
      'from-emerald-500/20 to-teal-500/20',
    ];
    return gradients[index % gradients.length];
  };

  const getThemeBorder = (index: number): string => {
    const borders = [
      'border-amber-500/30',
      'border-violet-500/30',
      'border-cyan-500/30',
      'border-rose-500/30',
      'border-emerald-500/30',
    ];
    return borders[index % borders.length];
  };

  const getThemeAccent = (index: number): string => {
    const accents = [
      'text-amber-400',
      'text-violet-400',
      'text-cyan-400',
      'text-rose-400',
      'text-emerald-400',
    ];
    return accents[index % accents.length];
  };

  const handleSelect = (theme: Theme) => {
    setSelectedId(theme.theme_id);
    setTimeout(() => {
      onSelectTheme(theme);
    }, 300);
  };

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Upload</span>
          </button>

          <h2 className="text-5xl font-black text-transparent bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300 bg-clip-text mb-4">
            Choose Your Theme
          </h2>
          <p className="text-slate-400 text-xl">
            Our AI has analyzed your photos and suggests these {themes.length} themes
          </p>
        </div>

        {/* Theme Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {themes.map((theme, index) => {
            const ThemeIcon = getThemeIcon(theme.name);
            const isSelected = selectedId === theme.theme_id;

            return (
              <div
                key={theme.theme_id}
                onClick={() => handleSelect(theme)}
                className={`group relative cursor-pointer transition-all duration-300 ${
                  isSelected ? 'scale-105' : 'hover:scale-102'
                }`}
              >
                <div
                  className={`relative p-8 rounded-3xl border-2 backdrop-blur-sm transition-all duration-300 ${
                    isSelected
                      ? `bg-gradient-to-br ${getThemeGradient(index)} ${getThemeBorder(index)} shadow-2xl`
                      : `bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/60 hover:${getThemeBorder(index)}`
                  }`}
                >
                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className="absolute -top-3 -right-3 w-12 h-12 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center shadow-lg animate-scale-in">
                      <Check className="w-7 h-7 text-white" strokeWidth={3} />
                    </div>
                  )}

                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getThemeGradient(index)} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <ThemeIcon className={`w-8 h-8 ${getThemeAccent(index)}`} />
                  </div>

                  {/* Theme Name */}
                  <h3 className="text-2xl font-black text-slate-100 mb-3">
                    {theme.name}
                  </h3>

                  {/* Mood */}
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className={`w-4 h-4 ${getThemeAccent(index)}`} />
                    <span className={`text-sm font-semibold ${getThemeAccent(index)}`}>
                      {theme.mood}
                    </span>
                  </div>

                  {/* Details Grid */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-slate-600 mt-2 flex-shrink-0"></div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Lighting</p>
                        <p className="text-slate-300 font-medium">{theme.lighting}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-slate-600 mt-2 flex-shrink-0"></div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Background</p>
                        <p className="text-slate-300 font-medium">{theme.background}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-slate-600 mt-2 flex-shrink-0"></div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Editing Style</p>
                        <p className="text-slate-300 font-medium">{theme.editing_style}</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTheme(theme);
                      }}
                      className={`flex-1 py-4 rounded-xl font-bold transition-all ${
                        isSelected
                          ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg'
                          : 'bg-slate-700/50 text-slate-300 group-hover:bg-slate-700'
                      }`}
                    >
                      {isSelected ? 'Selected' : 'Quick Edit'}
                    </button>
                    {onCreatePhotobook && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onCreatePhotobook(theme);
                        }}
                        className="px-6 py-4 rounded-xl font-bold bg-slate-800/50 hover:bg-gradient-to-r hover:from-emerald-600 hover:to-teal-600 text-slate-300 hover:text-white border-2 border-slate-700 hover:border-emerald-500 transition-all"
                        title="Create custom photobook"
                      >
                        📖
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Banner */}
        <div className="p-6 bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h4 className="text-slate-200 font-bold mb-2">AI-Powered Theme Selection</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Each theme is carefully crafted based on your photo's lighting, composition, and mood. 
                After selection, our studio team will review and finalize your edited photos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
