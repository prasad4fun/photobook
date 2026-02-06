import { Sparkles, Camera, Zap, BookOpen } from 'lucide-react';

interface LandingScreenProps {
  onStart: () => void;
  onStudioLogin: () => void;
  onPhotoBookDemo?: () => void;
}

export default function LandingScreen({ onStart, onStudioLogin, onPhotoBookDemo }: LandingScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-4xl w-full">
        {/* Logo/Brand */}
        <div className="flex items-center justify-center mb-8">
          <div className="relative">
            <Camera className="w-16 h-16 text-violet-400" strokeWidth={1.5} />
            <Sparkles className="w-8 h-8 text-fuchsia-400 absolute -top-2 -right-2 animate-pulse" />
          </div>
        </div>

        {/* Hero Text */}
        <div className="text-center mb-12">
          <h1 className="text-6xl md:text-7xl font-black mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">
              AI Photo Themes
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 font-light tracking-wide mb-4">
            Transform your memories with intelligent theme suggestions
          </p>
          <p className="text-slate-400 text-lg">
            Upload photos → AI analyzes → Choose your perfect theme
          </p>
        </div>

        {/* Trust Strip */}
        <div className="flex flex-wrap items-center justify-center gap-8 mb-12 text-sm">
          <div className="flex items-center gap-2 text-violet-300">
            <Sparkles className="w-5 h-5" />
            <span className="font-medium">AI-Assisted</span>
          </div>
          <div className="w-px h-6 bg-slate-700"></div>
          <div className="flex items-center gap-2 text-fuchsia-300">
            <Camera className="w-5 h-5" />
            <span className="font-medium">Studio-Reviewed</span>
          </div>
          <div className="w-px h-6 bg-slate-700"></div>
          <div className="flex items-center gap-2 text-cyan-300">
            <Zap className="w-5 h-5" />
            <span className="font-medium">Delivered Fast</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col items-center justify-center gap-4 mb-8">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={onStart}
              className="group relative px-12 py-5 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-2xl font-bold text-lg text-white shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/50 transition-all duration-300 hover:scale-105 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative flex items-center gap-3">
                Start Photo Experience
                <Sparkles className="w-5 h-5" />
              </span>
            </button>

            <button
              onClick={onStudioLogin}
              className="px-12 py-5 bg-slate-800/50 backdrop-blur-sm border-2 border-slate-700 rounded-2xl font-semibold text-lg text-slate-300 hover:bg-slate-800/80 hover:border-slate-600 transition-all duration-300"
            >
              Studio Login
            </button>
          </div>

          {onPhotoBookDemo && (
            <button
              onClick={onPhotoBookDemo}
              className="group px-10 py-4 bg-cyan-600/20 backdrop-blur-sm border-2 border-cyan-600/50 rounded-xl font-semibold text-base text-cyan-300 hover:bg-cyan-600/30 hover:border-cyan-500 transition-all duration-300"
            >
              <span className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Try PhotoBook Editor
                <span className="text-xs bg-cyan-500/30 px-2 py-0.5 rounded-full">NEW</span>
              </span>
            </button>
          )}
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
          <div className="px-4 py-2 bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-full text-slate-300">
            ⚡ Results in 60 seconds
          </div>
          <div className="px-4 py-2 bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-full text-slate-300">
            📸 2-30 images supported
          </div>
          <div className="px-4 py-2 bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-full text-slate-300">
            🎨 3-5 unique themes
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 text-center text-slate-500 text-sm">
        Powered by enterprise AI • Secure & private
      </div>
    </div>
  );
}
