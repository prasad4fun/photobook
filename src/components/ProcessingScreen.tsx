import { useState, useEffect } from 'react';
import { Lock, Image, Sparkles, CheckCircle2 } from 'lucide-react';

interface ProcessingScreenProps {
  jobId: string;
  onComplete: () => void;
}

export default function ProcessingScreen({ jobId, onComplete }: ProcessingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [eta, setEta] = useState(20);

  const steps = [
    {
      id: 'locked',
      title: 'Theme Locked',
      description: 'Your selected theme has been confirmed',
      icon: Lock,
      color: 'text-violet-400',
      bgColor: 'bg-violet-500/20'
    },
    {
      id: 'processing',
      title: 'Images Processing',
      description: 'Applying AI enhancements and theme styling',
      icon: Image,
      color: 'text-fuchsia-400',
      bgColor: 'bg-fuchsia-500/20'
    },
    {
      id: 'finalizing',
      title: 'Finalizing',
      description: 'Studio review and quality check',
      icon: Sparkles,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/20'
    }
  ];

  useEffect(() => {
    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1;
      });
    }, 200);

    // Update steps
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 6000);

    // Update ETA
    const etaInterval = setInterval(() => {
      setEta(prev => {
        if (prev > 0) {
          return prev - 1;
        }
        return 0;
      });
    }, 60000);

    // Complete after processing
    setTimeout(() => {
      onComplete();
    }, 18000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
      clearInterval(etaInterval);
    };
  }, [onComplete]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-3xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 mb-6">
            <Sparkles className="w-10 h-10 text-violet-400 animate-pulse" />
          </div>
          <h2 className="text-4xl font-black text-transparent bg-gradient-to-r from-violet-300 to-fuchsia-300 bg-clip-text mb-4">
            Processing Your Photos
          </h2>
          <p className="text-slate-400 text-lg">
            Job ID: <span className="text-slate-300 font-mono">{jobId}</span>
          </p>
        </div>

        {/* Progress Circle */}
        <div className="flex items-center justify-center mb-12">
          <div className="relative">
            <svg className="w-48 h-48 transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-slate-800"
              />
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="url(#gradient)"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 88}`}
                strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress / 100)}`}
                className="transition-all duration-300 ease-out"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#d946ef" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-5xl font-black text-slate-100 mb-1">{progress}%</div>
                <div className="text-sm text-slate-500">Complete</div>
              </div>
            </div>
          </div>
        </div>

        {/* ETA */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-full">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-slate-300 font-medium">
              Estimated time: <span className="text-emerald-400 font-bold">{eta} minutes</span>
            </span>
          </div>
        </div>

        {/* Processing Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = index === currentStep;
            const isComplete = index < currentStep;

            return (
              <div
                key={step.id}
                className={`relative p-6 rounded-2xl border-2 backdrop-blur-sm transition-all duration-500 ${
                  isActive
                    ? 'bg-slate-800/50 border-violet-500/50 scale-102'
                    : isComplete
                    ? 'bg-slate-800/30 border-slate-700/30'
                    : 'bg-slate-800/20 border-slate-800/30 opacity-50'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isActive ? step.bgColor : 'bg-slate-800/50'
                    }`}
                  >
                    {isComplete ? (
                      <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                    ) : (
                      <StepIcon className={`w-7 h-7 ${isActive ? step.color : 'text-slate-600'}`} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className={`text-lg font-bold mb-1 ${
                      isActive ? 'text-slate-100' : isComplete ? 'text-slate-300' : 'text-slate-500'
                    }`}>
                      {step.title}
                    </h3>
                    <p className={`text-sm ${
                      isActive ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      {step.description}
                    </p>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex-shrink-0">
                    {isActive && (
                      <div className="w-8 h-8 border-3 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                    )}
                    {isComplete && (
                      <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress bar for active step */}
                {isActive && (
                  <div className="mt-4 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all duration-300"
                      style={{ width: `${((progress % 33) / 33) * 100}%` }}
                    ></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Info Box */}
        <div className="mt-8 p-6 bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h4 className="text-slate-200 font-bold mb-2">What's happening?</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Our AI is applying your selected theme to each photo while our studio team performs quality checks. 
                You'll be notified as soon as your photos are ready for download.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
