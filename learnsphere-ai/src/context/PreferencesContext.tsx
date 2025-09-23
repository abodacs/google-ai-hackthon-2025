'use client';

/**
 * Preferences Context
 * Global state management for user preferences
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  UserPreferences,
  GradeLevel,
  Interest,
  LearningStyle,
  PreferencesWithMetadata,
  PreferencesMetadata
} from '@/types/user-preferences';

interface PreferencesState {
  preferences: UserPreferences | null;
  metadata: PreferencesMetadata | null;
  isLoading: boolean;
  error: string | null;
}

interface PreferencesActions {
  setGradeLevel: (gradeLevel: GradeLevel) => void;
  setInterest: (interest: Interest) => void;
  setLearningStyles: (styles: LearningStyle[]) => void;
  setLanguage: (language: string) => void;
  setPreferences: (preferences: UserPreferences) => void;
  clearPreferences: () => void;
  savePreferences: () => Promise<void>;
  loadPreferences: () => Promise<void>;
  resetToDefaults: () => void;
  clearError: () => void;
}

interface PreferencesContextType extends PreferencesState, PreferencesActions {}

const PreferencesContext = createContext<PreferencesContextType | null>(null);

const STORAGE_KEY = 'learnsphere-preferences';
const PREFERENCES_VERSION = '1.0.0';

const DEFAULT_PREFERENCES: UserPreferences = {
  gradeLevel: GradeLevel.GRADE_8,
  interest: Interest.TECHNOLOGY,
  learningStyle: [LearningStyle.VISUAL, LearningStyle.READING],
  language: 'en'
};

interface PreferencesProviderProps {
  children: React.ReactNode;
  autoLoad?: boolean;
  autoSave?: boolean;
}

export function PreferencesProvider({
  children,
  autoLoad = true,
  autoSave = true
}: PreferencesProviderProps) {
  const [state, setState] = useState<PreferencesState>({
    preferences: null,
    metadata: null,
    isLoading: autoLoad,
    error: null
  });

  // Auto-load preferences on mount
  useEffect(() => {
    if (autoLoad) {
      loadStoredPreferences();
    }
  }, [autoLoad]);

  // Auto-save preferences when they change
  useEffect(() => {
    if (autoSave && state.preferences && state.metadata && !state.metadata.isDefault) {
      const timeoutId = setTimeout(() => {
        saveStoredPreferences();
      }, 1000); // Debounce saves

      return () => clearTimeout(timeoutId);
    }
  }, [state.preferences, autoSave]);

  const createMetadata = useCallback((
    isDefault = false,
    source: PreferencesMetadata['source'] = 'user_selection'
  ): PreferencesMetadata => ({
    lastUpdated: new Date(),
    version: PREFERENCES_VERSION,
    isDefault,
    source
  }), []);

  const loadStoredPreferences = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data: PreferencesWithMetadata = JSON.parse(stored);

        // Validate stored preferences
        if (isValidPreferences(data.preferences)) {
          setState(prev => ({
            ...prev,
            preferences: data.preferences,
            metadata: {
              ...data.metadata,
              lastUpdated: new Date(data.metadata.lastUpdated)
            },
            isLoading: false
          }));
          return;
        }
      }

      // No valid stored preferences, use defaults
      setState(prev => ({
        ...prev,
        preferences: DEFAULT_PREFERENCES,
        metadata: createMetadata(true, 'default'),
        isLoading: false
      }));

    } catch (error) {
      console.error('Error loading preferences:', error);
      setState(prev => ({
        ...prev,
        preferences: DEFAULT_PREFERENCES,
        metadata: createMetadata(true, 'default'),
        isLoading: false,
        error: 'Failed to load saved preferences'
      }));
    }
  }, [createMetadata]);

  const saveStoredPreferences = useCallback(async () => {
    try {
      if (!state.preferences || !state.metadata) return;

      const data: PreferencesWithMetadata = {
        preferences: state.preferences,
        metadata: {
          ...state.metadata,
          lastUpdated: new Date()
        }
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

    } catch (error) {
      console.error('Error saving preferences:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to save preferences'
      }));
    }
  }, [state.preferences, state.metadata]);

  const updatePreferences = useCallback((
    updates: Partial<UserPreferences>,
    source: PreferencesMetadata['source'] = 'user_selection'
  ) => {
    setState(prev => {
      if (!prev.preferences) return prev;

      const newPreferences = { ...prev.preferences, ...updates };
      const newMetadata = createMetadata(false, source);

      return {
        ...prev,
        preferences: newPreferences,
        metadata: newMetadata
      };
    });
  }, [createMetadata]);

  const setGradeLevel = useCallback((gradeLevel: GradeLevel) => {
    updatePreferences({ gradeLevel });
  }, [updatePreferences]);

  const setInterest = useCallback((interest: Interest) => {
    updatePreferences({ interest });
  }, [updatePreferences]);

  const setLearningStyles = useCallback((learningStyle: LearningStyle[]) => {
    updatePreferences({ learningStyle });
  }, [updatePreferences]);

  const setLanguage = useCallback((language: string) => {
    updatePreferences({ language });
  }, [updatePreferences]);

  const setPreferences = useCallback((preferences: UserPreferences) => {
    setState(prev => ({
      ...prev,
      preferences,
      metadata: createMetadata(false, 'user_selection')
    }));
  }, [createMetadata]);

  const clearPreferences = useCallback(() => {
    setState(prev => ({
      ...prev,
      preferences: null,
      metadata: null
    }));

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing preferences:', error);
    }
  }, []);

  const savePreferences = useCallback(async () => {
    await saveStoredPreferences();
  }, [saveStoredPreferences]);

  const loadPreferences = useCallback(async () => {
    await loadStoredPreferences();
  }, [loadStoredPreferences]);

  const resetToDefaults = useCallback(() => {
    setState(prev => ({
      ...prev,
      preferences: DEFAULT_PREFERENCES,
      metadata: createMetadata(true, 'default')
    }));
  }, [createMetadata]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const contextValue: PreferencesContextType = {
    // State
    preferences: state.preferences,
    metadata: state.metadata,
    isLoading: state.isLoading,
    error: state.error,

    // Actions
    setGradeLevel,
    setInterest,
    setLearningStyles,
    setLanguage,
    setPreferences,
    clearPreferences,
    savePreferences,
    loadPreferences,
    resetToDefaults,
    clearError
  };

  return (
    <PreferencesContext.Provider value={contextValue}>
      {children}
    </PreferencesContext.Provider>
  );
}

// Helper function to validate preferences
function isValidPreferences(preferences: unknown): preferences is UserPreferences {
  if (!preferences || typeof preferences !== 'object') {
    return false;
  }

  const pref = preferences as Record<string, unknown>;

  return (
    'gradeLevel' in pref &&
    'interest' in pref &&
    Object.values(GradeLevel).includes(pref.gradeLevel as GradeLevel) &&
    Object.values(Interest).includes(pref.interest as Interest)
  );
}

// Hook to use preferences context
export function usePreferences(): PreferencesContextType {
  const context = useContext(PreferencesContext);

  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }

  return context;
}

// Hook to check if preferences are complete
export function usePreferencesComplete(): boolean {
  const { preferences } = usePreferences();

  return !!(
    preferences &&
    preferences.gradeLevel &&
    preferences.interest
  );
}

// Hook to get preferences summary
export function usePreferencesSummary() {
  const { preferences, metadata } = usePreferences();

  if (!preferences || !metadata) {
    return null;
  }

  return {
    gradeLevel: preferences.gradeLevel,
    interest: preferences.interest,
    learningStyles: preferences.learningStyle || [],
    language: preferences.language || 'en',
    isDefault: metadata.isDefault,
    lastUpdated: metadata.lastUpdated,
    source: metadata.source
  };
}

// Utility function to export preferences
export function exportPreferences(preferences: UserPreferences, metadata: PreferencesMetadata): string {
  const data: PreferencesWithMetadata = { preferences, metadata };
  return JSON.stringify(data, null, 2);
}

// Utility function to import preferences
export function importPreferences(jsonString: string): PreferencesWithMetadata | null {
  try {
    const data = JSON.parse(jsonString);
    if (isValidPreferences(data.preferences)) {
      return data;
    }
    return null;
  } catch {
    return null;
  }
}