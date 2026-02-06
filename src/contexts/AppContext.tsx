import { createContext, useState, ReactNode } from 'react';
import { SessionData, Screen } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface AppContextType {
  // State
  currentScreen: Screen;
  isStudioMode: boolean;
  sessionData: SessionData;

  // Actions
  navigateTo: (screen: Screen) => void;
  enterStudioMode: () => void;
  exitStudioMode: () => void;
  updateSession: (updates: Partial<SessionData>) => void;
  resetSession: () => void;
}

const initialSessionData: SessionData = {
  jobId: null,
  uploadedImages: [],
  imageSummaries: [],
  themes: [],
  selectedTheme: null,
  orderDetails: null,
  // Editor-related fields
  generatedImages: [],
  editorState: {
    mode: 'edit',
    selectedImageId: null,
    layerStack: [],
    history: [],
    historyIndex: 0,
    template: null,
  },
  selectedTemplate: null,
  aiSuggestions: [],
  pdfExportOptions: {
    format: 'A4',
    orientation: 'portrait',
    dpi: 300,
    colorSpace: 'RGB',
    includeCover: false,
    includeBackCover: false,
    margins: { top: 0, right: 0, bottom: 0, left: 0 },
  },
  // Photobook editor state
  photobookEditorState: null,
};

export const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  const [isStudioMode, setIsStudioMode] = useState(false);

  // Persist session to localStorage
  const [sessionData, setSessionData] = useLocalStorage<SessionData>(
    'aiPhotoThemes_session',
    initialSessionData
  );

  const navigateTo = (screen: Screen) => {
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

  const updateSession = (updates: Partial<SessionData>) => {
    setSessionData((prev) => ({ ...prev, ...updates }));
  };

  const resetSession = () => {
    setSessionData(initialSessionData);
    setCurrentScreen('landing');
  };

  const value: AppContextType = {
    currentScreen,
    isStudioMode,
    sessionData,
    navigateTo,
    enterStudioMode,
    exitStudioMode,
    updateSession,
    resetSession,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
