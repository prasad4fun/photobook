import React from 'react';
import { AppProvider } from './contexts/AppContext';
import { StudioProvider } from './contexts/StudioContext';
import ErrorBoundary from './components/ErrorBoundary';
import { useSession } from './hooks/useSession';
import LandingScreen from './components/LandingScreen';
import UploadScreen from './components/UploadScreen';
import AnalysisScreen from './components/AnalysisScreen';
import ThemePreviewScreen from './components/ThemePreviewScreen';
import EditorScreen from './components/EditorScreen';
import PhotobookEditorScreen from './components/photobook/PhotobookEditorScreen';
import PhotobookStudioDemo from './components/PhotobookStudioDemo';
import ConfirmationScreen from './components/ConfirmationScreen';
import ProcessingScreen from './components/ProcessingScreen';
import DeliveryScreen from './components/DeliveryScreen';
import StudioDashboard from './components/StudioDashboard';
import { trackPageView } from './utils/analytics';
import { PhotobookEditorState } from './types';

function AppContent() {
  const {
    currentScreen,
    isStudioMode,
    sessionData,
    navigateTo,
    enterStudioMode,
    exitStudioMode,
    updateSession,
    resetSession,
  } = useSession();

  // Track page views
  React.useEffect(() => {
    trackPageView(currentScreen);
  }, [currentScreen]);

  if (isStudioMode) {
    return <StudioDashboard onExit={exitStudioMode} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900">
      {currentScreen === 'landing' && (
        <LandingScreen
          onStart={() => navigateTo('upload')}
          onStudioLogin={enterStudioMode}
          onPhotoBookDemo={() => navigateTo('photobook-studio')}
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
          jobId={sessionData.jobId || `job_${Date.now()}`}
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
            navigateTo('editor');
          }}
          onCreatePhotobook={(theme) => {
            updateSession({ selectedTheme: theme });
            navigateTo('photobook-editor');
          }}
          onBack={() => navigateTo('upload')}
        />
      )}

      {currentScreen === 'editor' && sessionData.selectedTheme && (
        <EditorScreen
          theme={sessionData.selectedTheme}
          images={sessionData.uploadedImages}
          onComplete={(generatedImages, editorState) => {
            updateSession({ generatedImages, editorState });
            navigateTo('confirmation');
          }}
          onBack={() => navigateTo('theme-preview')}
        />
      )}

      {currentScreen === 'photobook-editor' && (
        <PhotobookEditorScreen
          initialImages={sessionData.uploadedImages}
          projectId={sessionData.jobId || undefined}
          projectName={sessionData.selectedTheme?.name || 'My Photobook'}
          onExit={() => navigateTo('theme-preview')}
          onOrder={(photobookState: PhotobookEditorState) => {
            updateSession({
              photobookEditorState: photobookState,
              orderDetails: {
                package: 'photobook',
                price: 2499,
                imageCount: sessionData.uploadedImages.length,
                theme: sessionData.selectedTheme!,
              },
            });
            navigateTo('confirmation');
          }}
        />
      )}

      {currentScreen === 'photobook-studio' && (
        <PhotobookStudioDemo onBack={() => navigateTo('landing')} />
      )}

      {currentScreen === 'confirmation' && sessionData.selectedTheme && (
        <ConfirmationScreen
          selectedTheme={sessionData.selectedTheme}
          imageCount={sessionData.uploadedImages.length}
          onConfirm={(orderDetails) => {
            updateSession({ orderDetails });
            navigateTo('processing');
          }}
          onBack={() => navigateTo('editor')}
        />
      )}

      {currentScreen === 'processing' && (
        <ProcessingScreen
          jobId={sessionData.jobId || `job_${Date.now()}`}
          onComplete={() => navigateTo('delivery')}
        />
      )}

      {currentScreen === 'delivery' && (
        <DeliveryScreen
          jobId={sessionData.jobId || `job_${Date.now()}`}
          orderDetails={sessionData.orderDetails}
          onStartNew={resetSession}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <StudioProvider>
          <AppContent />
        </StudioProvider>
      </AppProvider>
    </ErrorBoundary>
  );
}
