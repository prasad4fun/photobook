import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Theme, ImageUpload, ImageLayerProps, EditorState, GeneratedImage, AISuggestion } from '../../types';
import EditorCanvas from './EditorCanvas';
import EditorToolbar from './EditorToolbar';
import AISuggestionsPanel from './AISuggestionsPanel';
import { generateSuggestions, applySuggestion, refreshSuggestions } from '../../services/aiSuggestionService';
import { generateMockThemedImages } from '../../services/mockThemeService';

interface EditorScreenProps {
  theme: Theme;
  images: ImageUpload[];
  onComplete: (generatedImages: GeneratedImage[], editorState: EditorState) => void;
  onBack: () => void;
}

export default function EditorScreen({ theme, images, onComplete, onBack }: EditorScreenProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isGeneratingTheme, setIsGeneratingTheme] = useState(true);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);

  // Editor state for current image
  const [adjustments, setAdjustments] = useState<ImageLayerProps>({
    src: '',
    originalSrc: '',
    x: 0,
    y: 0,
    width: 800,
    height: 600,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    brightness: 0,
    contrast: 0,
    saturation: 0,
    hue: 0,
    filters: [],
  });

  // History for undo/redo
  const [history, setHistory] = useState<ImageLayerProps[]>([adjustments]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // AI Suggestions
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  const currentImage = images[currentImageIndex];
  const canvasWidth = 800;
  const canvasHeight = 600;

  // Generate themed images on mount (mock for now)
  useEffect(() => {
    generateThemedImages();
  }, []);

  async function generateThemedImages() {
    setIsGeneratingTheme(true);

    try {
      // Use mock theme service to apply actual filters
      const generated = await generateMockThemedImages(images, theme);

      setGeneratedImages(generated);
      setAdjustments((prev) => ({
        ...prev,
        src: `data:image/jpeg;base64,${generated[0].themed_base64}`,
        originalSrc: `data:image/jpeg;base64,${generated[0].original_base64}`
      }));
    } catch (error) {
      console.error('Failed to generate themed images:', error);
      // Fallback: use original images
      const fallback: GeneratedImage[] = images.map((img) => ({
        image_id: img.id,
        original_base64: img.preview.split('base64,')[1] || img.preview,
        themed_base64: img.preview.split('base64,')[1] || img.preview,
        theme_id: theme.theme_id,
        generation_params: {
          model: 'mock',
          prompt: '',
          adjustments: {},
        },
        timestamp: new Date(),
      }));
      setGeneratedImages(fallback);
      setAdjustments((prev) => ({ ...prev, src: fallback[0].original_base64, originalSrc: fallback[0].original_base64 }));
    } finally {
      setIsGeneratingTheme(false);
    }
  }

  // Update adjustments with debounce
  const handleAdjustmentChange = useCallback((newAdjustments: Partial<ImageLayerProps>) => {
    setAdjustments((prev) => {
      const updated = { ...prev, ...newAdjustments };

      // Add to history
      setHistory((h) => [...h.slice(0, historyIndex + 1), updated]);
      setHistoryIndex((i) => i + 1);

      return updated;
    });
  }, [historyIndex]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex((i) => i - 1);
      setAdjustments(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((i) => i + 1);
      setAdjustments(history[historyIndex + 1]);
    }
  };

  const handleReset = () => {
    const reset: ImageLayerProps = {
      ...adjustments,
      brightness: 0,
      contrast: 0,
      saturation: 0,
      hue: 0,
      filters: [],
    };
    setAdjustments(reset);
    setHistory((h) => [...h, reset]);
    setHistoryIndex(history.length);
  };

  const handlePrevious = () => {
    if (currentImageIndex > 0) {
      // Save current adjustments to generated images
      updateGeneratedImage(currentImageIndex, adjustments);

      setCurrentImageIndex((i) => i - 1);
      loadImageAdjustments(currentImageIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentImageIndex < images.length - 1) {
      // Save current adjustments
      updateGeneratedImage(currentImageIndex, adjustments);

      setCurrentImageIndex((i) => i + 1);
      loadImageAdjustments(currentImageIndex + 1);
    }
  };

  const handleComplete = () => {
    // Save final adjustments
    updateGeneratedImage(currentImageIndex, adjustments);

    // Create final editor state
    const editorState: EditorState = {
      mode: 'edit',
      selectedImageId: currentImage.id,
      layerStack: [],
      history: [],
      historyIndex: 0,
      template: null,
    };

    onComplete(generatedImages, editorState);
  };

  function updateGeneratedImage(index: number, adj: ImageLayerProps) {
    setGeneratedImages((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = {
          ...updated[index],
          generation_params: {
            ...updated[index].generation_params,
            adjustments: {
              brightness: adj.brightness,
              contrast: adj.contrast,
              saturation: adj.saturation,
              hue: adj.hue,
            },
          },
        };
      }
      return updated;
    });
  }

  function loadImageAdjustments(index: number) {
    const genImg = generatedImages[index];
    if (genImg) {
      const newAdj: ImageLayerProps = {
        ...adjustments,
        src: `data:image/jpeg;base64,${genImg.themed_base64}`,
        originalSrc: `data:image/jpeg;base64,${genImg.original_base64}`,
        brightness: genImg.generation_params.adjustments.brightness || 0,
        contrast: genImg.generation_params.adjustments.contrast || 0,
        saturation: genImg.generation_params.adjustments.saturation || 0,
        hue: genImg.generation_params.adjustments.hue || 0,
      };
      setAdjustments(newAdj);
      setHistory([newAdj]);
      setHistoryIndex(0);
    }
  }

  // AI Suggestions handlers
  const handleGenerateSuggestions = useCallback(async () => {
    if (!adjustments.src) return;

    setIsLoadingSuggestions(true);
    try {
      // Extract base64 from data URL
      const base64 = adjustments.src.includes('base64,')
        ? adjustments.src.split('base64,')[1]
        : adjustments.src;

      const suggestions = await generateSuggestions(base64, theme, adjustments);
      setAiSuggestions(suggestions);
    } catch (error) {
      console.error('Failed to generate AI suggestions:', error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, [adjustments, theme]);

  const handleRefreshSuggestions = useCallback(async () => {
    if (!adjustments.src) return;

    setIsLoadingSuggestions(true);
    try {
      const base64 = adjustments.src.includes('base64,')
        ? adjustments.src.split('base64,')[1]
        : adjustments.src;

      const suggestions = await refreshSuggestions(base64, theme, adjustments);
      setAiSuggestions(suggestions);
    } catch (error) {
      console.error('Failed to refresh AI suggestions:', error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, [adjustments, theme]);

  const handleApplySuggestion = useCallback(
    (suggestion: AISuggestion) => {
      const updatedAdjustments = applySuggestion(suggestion, adjustments);
      handleAdjustmentChange(updatedAdjustments);
    },
    [adjustments, handleAdjustmentChange]
  );

  // Generate initial suggestions when image loads
  useEffect(() => {
    if (!isGeneratingTheme && adjustments.src) {
      handleGenerateSuggestions();
    }
  }, [isGeneratingTheme, currentImageIndex]);

  if (isGeneratingTheme) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full opacity-20 animate-ping" />
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full opacity-40 animate-pulse" />
            <div className="relative w-full h-full border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <h2 className="text-3xl font-black text-transparent bg-gradient-to-r from-violet-300 to-fuchsia-300 bg-clip-text mb-3">
            Applying {theme.name}
          </h2>
          <p className="text-slate-400 text-lg mb-2">
            AI is generating your themed photos...
          </p>
          <p className="text-slate-500 text-sm">
            This usually takes 10-15 seconds
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Themes
          </button>

          <div className="text-center">
            <h1 className="text-xl font-bold text-transparent bg-gradient-to-r from-violet-300 to-fuchsia-300 bg-clip-text">
              {theme.name}
            </h1>
            <p className="text-slate-400 text-sm">{theme.mood}</p>
          </div>

          <button
            onClick={handleComplete}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-lg font-bold transition-all shadow-lg shadow-violet-500/30"
          >
            <Check className="w-5 h-5" />
            Save & Continue
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full p-6">
        {/* Toolbar */}
        <EditorToolbar
          adjustments={adjustments}
          onAdjustmentChange={handleAdjustmentChange}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onReset={handleReset}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
        />

        {/* Canvas and Suggestions */}
        <div className="flex-1 py-6 flex gap-6">
          {/* Canvas */}
          <div className="flex-1">
            <EditorCanvas
              imageUrl={adjustments.src}
              adjustments={adjustments}
              width={canvasWidth}
              height={canvasHeight}
            />
          </div>

          {/* AI Suggestions Panel */}
          <div className="w-80 flex-shrink-0">
            <AISuggestionsPanel
              suggestions={aiSuggestions}
              onApplySuggestion={handleApplySuggestion}
              onRefresh={handleRefreshSuggestions}
              isLoading={isLoadingSuggestions}
            />
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="flex items-center justify-between py-4">
          <button
            onClick={handlePrevious}
            disabled={currentImageIndex === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              currentImageIndex === 0
                ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="text-center">
            <p className="text-slate-300 font-bold text-lg">
              Image {currentImageIndex + 1} of {images.length}
            </p>
            <p className="text-slate-500 text-sm">{currentImage.name}</p>
          </div>

          <button
            onClick={handleNext}
            disabled={currentImageIndex === images.length - 1}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              currentImageIndex === images.length - 1
                ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
