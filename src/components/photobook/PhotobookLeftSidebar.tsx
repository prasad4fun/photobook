import { useState } from 'react';
import {
  Image as ImageIcon,
  Layout as LayoutIcon,
  Palette,
  Sticker as StickerIcon,
  Sparkles,
  Wand2,
  Search,
  ChevronDown,
  Check,
} from 'lucide-react';
import { ImageAsset, LayoutPreset, BackgroundAsset, StickerAsset } from '../../types';

interface PhotobookLeftSidebarProps {
  assets: ImageAsset[];
  layoutPresets: LayoutPreset[];
  backgroundAssets: BackgroundAsset[];
  stickerAssets: StickerAsset[];
  onImageClick: (asset: ImageAsset) => void;
  onLayoutClick: (preset: LayoutPreset) => void;
  onBackgroundClick: (background: BackgroundAsset) => void;
  onStickerClick: (sticker: StickerAsset) => void;
  onSmartCreation: () => void;
  onAutofill: () => void;
}

type SidebarTab = 'images' | 'templates' | 'layouts' | 'backgrounds' | 'stickers';

export default function PhotobookLeftSidebar({
  assets,
  layoutPresets,
  backgroundAssets,
  stickerAssets,
  onImageClick,
  onLayoutClick,
  onBackgroundClick,
  onStickerClick,
  onSmartCreation,
  onAutofill,
}: PhotobookLeftSidebarProps) {
  const [activeTab, setActiveTab] = useState<SidebarTab>('images');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'earliest' | 'latest' | 'name'>('earliest');
  const [hideUsed, setHideUsed] = useState(false);

  // Filter and sort images
  const filteredAssets = assets
    .filter((asset) => {
      if (hideUsed && asset.isUsed) return false;
      if (searchQuery) {
        return (
          asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          asset.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'earliest') {
        const dateA = new Date(a.addedAt).getTime();
        const dateB = new Date(b.addedAt).getTime();
        return dateA - dateB;
      }
      if (sortBy === 'latest') {
        const dateA = new Date(a.addedAt).getTime();
        const dateB = new Date(b.addedAt).getTime();
        return dateB - dateA;
      }
      return a.name.localeCompare(b.name);
    });

  const usedCount = assets.filter((a) => a.isUsed).length;
  const totalCount = assets.length;

  const tabs: Array<{ id: SidebarTab; icon: JSX.Element; label: string }> = [
    { id: 'images', icon: <ImageIcon className="w-4 h-4" />, label: 'Images' },
    { id: 'templates', icon: <LayoutIcon className="w-4 h-4" />, label: 'Templates' },
    { id: 'layouts', icon: <LayoutIcon className="w-4 h-4" />, label: 'Layouts' },
    { id: 'backgrounds', icon: <Palette className="w-4 h-4" />, label: 'Backgrounds' },
    { id: 'stickers', icon: <StickerIcon className="w-4 h-4" />, label: 'Stickers' },
  ];

  return (
    <div className="w-80 h-full bg-slate-900/95 backdrop-blur-sm border-r border-slate-800 flex flex-col">
      {/* Tabs */}
      <div className="flex items-center border-b border-slate-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'text-violet-400 border-b-2 border-violet-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            {tab.icon}
            <span className="hidden xl:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'images' && (
          <div className="p-4">
            {/* Smart Creation & Autofill Buttons */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={onSmartCreation}
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 rounded-lg text-white font-medium text-sm transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Smart Creation</span>
              </button>
              <button
                onClick={onAutofill}
                disabled={filteredAssets.length === 0}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium text-sm transition-all ${
                  filteredAssets.length > 0
                    ? 'bg-violet-600/20 hover:bg-violet-600/30 text-violet-300'
                    : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                }`}
              >
                <Wand2 className="w-4 h-4" />
                <span>Autofill</span>
              </button>
            </div>

            {/* Image Counter */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm">
                <span className="font-bold text-violet-400">{usedCount} used photos</span>
                <span className="text-slate-500"> / {totalCount} all</span>
              </div>
            </div>

            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search images..."
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 placeholder-slate-500 text-sm focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>

            {/* Sort & Filter */}
            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex-1">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-sm appearance-none cursor-pointer focus:outline-none focus:border-violet-500 transition-colors"
                >
                  <option value="earliest">Earliest added</option>
                  <option value="latest">Latest added</option>
                  <option value="name">Name (A-Z)</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>

              <button
                onClick={() => setHideUsed(!hideUsed)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  hideUsed
                    ? 'bg-violet-600 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {hideUsed && <Check className="w-4 h-4" />}
                <span>Hide used</span>
              </button>
            </div>

            {/* Image Grid */}
            <div className="grid grid-cols-2 gap-3">
              {filteredAssets.map((asset) => (
                <button
                  key={asset.id}
                  onClick={() => onImageClick(asset)}
                  className="relative aspect-square rounded-lg overflow-hidden bg-slate-800 group cursor-pointer hover:ring-2 hover:ring-violet-400 transition-all"
                >
                  <img
                    src={asset.thumbnail || asset.preview}
                    alt={asset.name}
                    className="w-full h-full object-cover"
                  />
                  {/* Always show usage count badge if used, matching Pixory behavior */}
                  {asset.isUsed && asset.usageCount > 0 && (
                    <div className="absolute bottom-2 right-2 w-6 h-6 bg-slate-900 border border-slate-700 rounded-sm flex items-center justify-center">
                      <span className="text-xs text-white font-bold">{asset.usageCount}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                    <p className="text-xs text-white font-medium truncate w-full">
                      {asset.name}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {filteredAssets.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">
                  {searchQuery
                    ? 'No images match your search'
                    : hideUsed
                    ? 'All images are used'
                    : 'No images available'}
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'layouts' && (
          <div className="p-4">
            <div className="grid grid-cols-2 gap-3">
              {layoutPresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => onLayoutClick(preset)}
                  className="relative aspect-[3/4] rounded-lg overflow-hidden bg-slate-800 group cursor-pointer hover:ring-2 hover:ring-violet-400 transition-all"
                >
                  <img
                    src={preset.thumbnailUrl}
                    alt={preset.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <div>
                      <p className="text-sm text-white font-bold">{preset.name}</p>
                      <p className="text-xs text-slate-300 capitalize">{preset.category}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'backgrounds' && (
          <div className="p-4">
            <div className="grid grid-cols-2 gap-3">
              {backgroundAssets.map((bg) => (
                <button
                  key={bg.id}
                  onClick={() => onBackgroundClick(bg)}
                  className="relative aspect-square rounded-lg overflow-hidden bg-slate-800 group cursor-pointer hover:ring-2 hover:ring-violet-400 transition-all"
                  style={
                    bg.type === 'color'
                      ? { backgroundColor: bg.assetData }
                      : undefined
                  }
                >
                  {bg.type === 'image' && (
                    <img
                      src={bg.thumbnailUrl}
                      alt={bg.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                    <p className="text-xs text-white font-medium truncate w-full">
                      {bg.name}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'stickers' && (
          <div className="p-4">
            <div className="grid grid-cols-3 gap-3">
              {stickerAssets.map((sticker) => (
                <button
                  key={sticker.id}
                  onClick={() => onStickerClick(sticker)}
                  className="relative aspect-square rounded-lg overflow-hidden bg-slate-800 group cursor-pointer hover:ring-2 hover:ring-violet-400 transition-all p-2"
                >
                  <img
                    src={sticker.thumbnailUrl}
                    alt={sticker.name}
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="p-4">
            <div className="text-center py-12 text-slate-500">
              <LayoutIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Templates coming soon</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
