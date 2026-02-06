import { useState, useEffect } from 'react';
import { Brain, Eye, Lightbulb, Palette, X } from 'lucide-react';
import { ImageUpload, ImageSummary, Theme } from '../types';

interface AnalysisScreenProps {
  images: ImageUpload[];
  jobId: string;
  onComplete: (summaries: ImageSummary[], themes: Theme[]) => void;
  onCancel: () => void;
}

export default function AnalysisScreen({ images, jobId, onComplete, onCancel }: AnalysisScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [streamingText, setStreamingText] = useState('');
  const [analyzedCount, setAnalyzedCount] = useState(0);
  const [themeCards, setThemeCards] = useState<Theme[]>([]);

  const steps = [
    { icon: Eye, text: 'Analyzing image composition...', color: 'text-cyan-400' },
    { icon: Brain, text: 'Understanding subjects and context...', color: 'text-violet-400' },
    { icon: Lightbulb, text: 'Detecting lighting and mood...', color: 'text-amber-400' },
    { icon: Palette, text: 'Generating theme suggestions...', color: 'text-fuchsia-400' },
  ];

  useEffect(() => {
    // Simulate streaming analysis
    const stepDuration = 3000;
    const totalSteps = steps.length;

    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < totalSteps - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, stepDuration);

    // Simulate image analysis progress
    const imageInterval = setInterval(() => {
      setAnalyzedCount(prev => {
        if (prev < images.length) {
          return prev + 1;
        }
        return prev;
      });
    }, 500);

    // Simulate streaming text
    const messages = [
      'Detecting warm natural lighting in family portraits...',
      'Identifying indoor settings with soft backgrounds...',
      'Recognizing joyful expressions and candid moments...',
      'Finding cultural elements and traditional attire...',
      'Analyzing color palettes and tonal consistency...',
    ];

    let messageIndex = 0;
    const textInterval = setInterval(() => {
      if (messageIndex < messages.length) {
        setStreamingText(messages[messageIndex]);
        messageIndex++;
      }
    }, 2500);

    // Generate mock themes after analysis
    setTimeout(() => {
      const mockThemes = [
        {
          theme_id: 'warm_family_portrait',
          name: 'Warm Family Portrait',
          mood: 'Joyful, intimate',
          lighting: 'Soft natural light',
          background: 'Neutral indoor',
          editing_style: 'Warm tones, gentle contrast'
        },
        {
          theme_id: 'cinematic_moments',
          name: 'Cinematic Moments',
          mood: 'Dramatic, timeless',
          lighting: 'Controlled studio lighting',
          background: 'Dark with highlights',
          editing_style: 'Film-like grading, deep shadows'
        },
        {
          theme_id: 'bright_cheerful',
          name: 'Bright & Cheerful',
          mood: 'Energetic, happy',
          lighting: 'Bright natural light',
          background: 'Light pastels',
          editing_style: 'Vibrant colors, high key'
        },
        {
          theme_id: 'elegant_classic',
          name: 'Elegant Classic',
          mood: 'Sophisticated, refined',
          lighting: 'Balanced studio light',
          background: 'Timeless neutrals',
          editing_style: 'Subtle enhancement, natural tones'
        }
      ];

      // Simulate streaming theme generation
      mockThemes.forEach((theme, idx) => {
        setTimeout(() => {
          setThemeCards(prev => [...prev, theme]);
        }, idx * 800);
      });

      // Complete after all themes loaded
      setTimeout(() => {
        const mockSummaries = images.map((img, idx) => ({
          image_id: img.id,
          description: `Professional photo ${idx + 1} with good composition`,
          lighting: 'Natural',
          mood: 'Positive'
        }));
        onComplete(mockSummaries, mockThemes);
      }, mockThemes.length * 800 + 1000);
    }, stepDuration * totalSteps);

    return () => {
      clearInterval(stepInterval);
      clearInterval(imageInterval);
      clearInterval(textInterval);
    };
  }, [images, onComplete]);

  const progress = ((analyzedCount / images.length) * 100).toFixed(0);

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-4xl w-full">
        {/* Cancel Button */}
        <button
          onClick={onCancel}
          className="absolute top-0 right-0 w-10 h-10 bg-slate-800/50 hover:bg-slate-800 backdrop-blur-sm rounded-full flex items-center justify-center text-slate-400 hover:text-slate-200 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Main Content */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-transparent bg-gradient-to-r from-violet-300 to-fuchsia-300 bg-clip-text mb-4">
            AI Analysis in Progress
          </h2>
          <p className="text-slate-400 text-lg">
            Job ID: <span className="text-slate-300 font-mono">{jobId}</span>
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-slate-400">Analyzing images</span>
            <span className="text-sm font-bold text-violet-400">{progress}%</span>
          </div>
          <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="text-center mt-2 text-sm text-slate-500">
            {analyzedCount} / {images.length} images processed
          </div>
        </div>

        {/* Analysis Steps */}
        <div className="space-y-4 mb-12">
          {steps.map((step, idx) => {
            const StepIcon = step.icon;
            const isActive = idx === currentStep;
            const isComplete = idx < currentStep;

            return (
              <div
                key={idx}
                className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-500 ${
                  isActive
                    ? 'bg-slate-800/50 backdrop-blur-sm border-2 border-violet-500/50 scale-105'
                    : isComplete
                    ? 'bg-slate-800/30 border-2 border-slate-700/50'
                    : 'bg-slate-800/20 border-2 border-slate-800/50 opacity-50'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isActive
                      ? 'bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20'
                      : 'bg-slate-800/50'
                  }`}
                >
                  <StepIcon className={`w-6 h-6 ${isActive ? step.color : 'text-slate-600'}`} />
                </div>
                <div className="flex-1">
                  <p className={`font-semibold ${isActive ? 'text-slate-200' : 'text-slate-500'}`}>
                    {step.text}
                  </p>
                </div>
                {isActive && (
                  <div className="w-6 h-6 border-3 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                )}
                {isComplete && (
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Streaming Text */}
        {streamingText && (
          <div className="p-6 bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl mb-8">
            <div className="flex items-start gap-3">
              <Brain className="w-5 h-5 text-violet-400 mt-1 flex-shrink-0 animate-pulse" />
              <p className="text-slate-300 leading-relaxed">{streamingText}</p>
            </div>
          </div>
        )}

        {/* Theme Card Skeletons */}
        {themeCards.length > 0 && (
          <div>
            <h3 className="text-xl font-bold text-slate-300 mb-4">Generating themes...</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {themeCards.map((theme, idx) => (
                <div
                  key={`${theme.theme_id}-${idx}`}
                  className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl animate-fade-in"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <h4 className="text-lg font-bold text-violet-300 mb-2">{theme.name}</h4>
                  <p className="text-sm text-slate-400">{theme.mood}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
