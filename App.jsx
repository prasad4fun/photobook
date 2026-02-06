import React, { useState } from 'react';
import LandingScreen from '@/components/LandingScreen';
import UploadScreen from '@/components/UploadScreen';
import AnalysisScreen from '@/components/AnalysisScreen';
import ThemePreviewScreen from '@/components/ThemePreviewScreen';
import ConfirmationScreen from '@/components/ConfirmationScreen';
import ProcessingScreen from '@/components/ProcessingScreen';
import DeliveryScreen from '@/components/DeliveryScreen';
import StudioDashboard from '@/components/StudioDashboard';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('landing');
  const [isStudioMode, setIsStudioMode] = useState(false);
  const [sessionData, setSessionData] = useState({
    jobId: null,
    uploadedImages: [],
    imageSummaries: [],
    themes: [],
    selectedTheme: null,
    orderDetails: null
  });

  const updateSession = (updates) => {
    setSessionData(prev => ({ ...prev, ...updates }));
  };

  const navigateTo = (screen) => {
    setCurrentScreen(screen);
  };

  const enterStudioMode = () => {
    setIsStudioMode(true);
    setCurrentScreen('studio-dashboard');
  };

  const exitStudioMode = () => {
    setIsStudioMode(false);
    setCurrentScreen('landing');
  };

  if (isStudioMode) {
    return <StudioDashboard onExit={exitStudioMode} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900">
      {currentScreen === 'landing' && (
        <LandingScreen 
          onStart={() => navigateTo('upload')}
          onStudioLogin={enterStudioMode}
        />
      )}
      
      {currentScreen === 'upload' && (
        <UploadScreen 
          onComplete={(images) => {
            updateSession({ uploadedImages: images, jobId: `job_${Date.now()}` });
            navigateTo('analysis');
          }}
          onBack={() => navigateTo('landing')}
        />
      )}
      
      {currentScreen === 'analysis' && (
        <AnalysisScreen 
          images={sessionData.uploadedImages}
          jobId={sessionData.jobId}
          onComplete={(summaries, themes) => {
            updateSession({ imageSummaries: summaries, themes });
            navigateTo('theme-preview');
          }}
          onCancel={() => navigateTo('upload')}
        />
      )}
      
      {currentScreen === 'theme-preview' && (
        <ThemePreviewScreen 
          themes={sessionData.themes}
          onSelectTheme={(theme) => {
            updateSession({ selectedTheme: theme });
            navigateTo('confirmation');
          }}
          onBack={() => navigateTo('upload')}
        />
      )}
      
      {currentScreen === 'confirmation' && (
        <ConfirmationScreen 
          selectedTheme={sessionData.selectedTheme}
          imageCount={sessionData.uploadedImages.length}
          onConfirm={(orderDetails) => {
            updateSession({ orderDetails });
            navigateTo('processing');
          }}
          onBack={() => navigateTo('theme-preview')}
        />
      )}
      
      {currentScreen === 'processing' && (
        <ProcessingScreen 
          jobId={sessionData.jobId}
          onComplete={() => navigateTo('delivery')}
        />
      )}
      
      {currentScreen === 'delivery' && (
        <DeliveryScreen 
          jobId={sessionData.jobId}
          orderDetails={sessionData.orderDetails}
          onStartNew={() => {
            setSessionData({
              jobId: null,
              uploadedImages: [],
              imageSummaries: [],
              themes: [],
              selectedTheme: null,
              orderDetails: null
            });
            navigateTo('landing');
          }}
        />
      )}
    </div>
  );
}
