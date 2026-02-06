import { useContext } from 'react';
import { AppContext } from '../contexts/AppContext';

/**
 * Custom hook to access app session data
 * Provides easy access to session state and actions
 */
export function useSession() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useSession must be used within AppProvider');
  }

  return context;
}
