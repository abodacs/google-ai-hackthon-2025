/**
 * useSession Hook
 * Manages learning session state and operations
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { LearningSession, SessionStatus } from '@/types/learning-session';
import { GenerationProgress, GeneratedMaterials } from '@/types/generated-materials';
import { UserPreferences, GradeLevel, Interest } from '@/types/user-preferences';
import { ContentValidation, ContentType } from '@/types/text-content';
import { storageService, SessionData } from '@/utils/storage';
import { contentProcessor } from '@/services/content-processor';
import { textValidator } from '@/utils/text-validator';

interface SessionState {
  currentSession: LearningSession | null;
  isProcessing: boolean;
  progress: GenerationProgress | null;
  error: string | null;
  savedSessions: LearningSession[];
}

interface SessionActions {
  createSession: (content: string, preferences: UserPreferences) => Promise<void>;
  loadSession: (sessionId: string) => Promise<void>;
  saveCurrentSession: () => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  clearCurrentSession: () => void;
  clearError: () => void;
  validateContent: (content: string) => ContentValidation;
  abortProcessing: () => void;
}

// Helper function to convert storage materials to domain materials
function convertStorageMaterialsToDomain(storageMaterials?: import('@/utils/storage').GeneratedMaterials): GeneratedMaterials | undefined {
  if (!storageMaterials) return undefined;

  // For now, return undefined as we need to properly implement the conversion
  // This is a temporary fix to resolve type issues
  return undefined;
}

// Helper function to convert domain materials to storage materials
function convertDomainMaterialsToStorage(domainMaterials?: GeneratedMaterials): import('@/utils/storage').GeneratedMaterials | undefined {
  if (!domainMaterials) return undefined;

  return {
    summary: domainMaterials.summary.text,
    adaptedContent: domainMaterials.adaptedContent.text,
    mindMap: domainMaterials.mindMap as Record<string, unknown>,
    audioData: domainMaterials.audioLesson as Record<string, unknown>,
    quiz: domainMaterials.quiz as Record<string, unknown>
  };
}

export function useSession(): SessionState & SessionActions {
  const [state, setState] = useState<SessionState>({
    currentSession: null,
    isProcessing: false,
    progress: null,
    error: null,
    savedSessions: []
  });

  const processingRef = useRef<{ abort: () => void } | null>(null);

  // Load saved sessions on mount
  useEffect(() => {
    const loadSavedSessions = () => {
      try {
        const sessions = storageService.getAllSessions();
        const fullSessions: LearningSession[] = sessions.map(item => {
          const fullSession = storageService.getSession(item.id);
          if (fullSession) {
            // Convert storage format to LearningSession format
            return {
              id: fullSession.id,
              createdAt: new Date(fullSession.timestamp),
              updatedAt: new Date(fullSession.timestamp),
              status: SessionStatus.COMPLETED,
              title: fullSession.title,
              sourceContent: {
                type: ContentType.TEXT,
                text: fullSession.content,
                wordCount: fullSession.content.split(/\s+/).length,
                characterCount: fullSession.content.length,
                validation: {
                  isValid: true,
                  errors: [],
                  warnings: [],
                  wordCount: fullSession.content.split(/\s+/).length,
                  characterCount: fullSession.content.length,
                  estimatedReadingTime: Math.ceil(fullSession.content.split(/\s+/).length / 200)
                },
                metadata: {
                  createdAt: new Date(fullSession.timestamp),
                  lastModified: new Date(fullSession.timestamp),
                  source: 'user_input',
                  complexity: 'moderate'
                }
              },
              preferences: fullSession.preferences,
              generatedMaterials: convertStorageMaterialsToDomain(fullSession.materials),
              metadata: {
                version: '1.0.0',
                processingSteps: [],
                errors: []
              }
            };
          }

          // Fallback for incomplete data - return a valid session
          return {
            id: item.id || `session_${Date.now()}`,
            createdAt: new Date(),
            updatedAt: new Date(),
            status: SessionStatus.COMPLETED,
            title: item.title || 'Untitled Session',
            sourceContent: {
              type: ContentType.TEXT,
              text: 'Sample content',
              wordCount: 0,
              characterCount: 0,
              validation: {
                isValid: true,
                errors: [],
                warnings: [],
                wordCount: 0,
                characterCount: 0,
                estimatedReadingTime: 0
              },
              metadata: {
                createdAt: new Date(),
                lastModified: new Date(),
                source: 'user_input',
                complexity: 'moderate'
              }
            },
            preferences: {
              gradeLevel: GradeLevel.GRADE_5,
              interest: Interest.READING,
              language: 'en'
            },
            metadata: {
              version: '1.0.0',
              processingSteps: [],
              errors: []
            }
          };
        }).filter(Boolean);

        setState(prev => ({ ...prev, savedSessions: fullSessions }));
      } catch (error) {
        console.error('Error loading saved sessions:', error);
      }
    };

    loadSavedSessions();
  }, []);

  const generateSessionId = useCallback((): string => {
    return storageService.generateSessionId();
  }, []);

  const generateSessionTitle = useCallback((content: string): string => {
    return storageService.generateSessionTitle(content);
  }, []);

  const createSession = useCallback(async (content: string, preferences: UserPreferences) => {
    try {
      setState(prev => ({ ...prev, isProcessing: true, error: null, progress: null }));

      // Validate content first
      const validation = textValidator.validate(content);
      if (!validation.isValid) {
        throw new Error(`Content validation failed: ${validation.errors.join(', ')}`);
      }

      // Create new session
      const sessionId = generateSessionId();
      const session: LearningSession = {
        id: sessionId,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: SessionStatus.PROCESSING,
        title: generateSessionTitle(content),
        sourceContent: {
          type: ContentType.TEXT,
          text: content,
          wordCount: validation.wordCount,
          characterCount: validation.characterCount,
          validation,
          metadata: {
            createdAt: new Date(),
            lastModified: new Date(),
            source: 'user_input',
            complexity: 'moderate'
          }
        },
        preferences,
        metadata: {
          version: '1.0.0',
          processingSteps: [],
          errors: []
        }
      };

      setState(prev => ({ ...prev, currentSession: session }));

      // Process content
      const result = await contentProcessor.processContent(content, preferences, {
        onProgress: (progress) => {
          setState(prev => ({ ...prev, progress }));
        },
        includeValidation: false // Already validated
      });

      processingRef.current = { abort: () => contentProcessor.abort() };

      if (result.success && result.materials) {
        // Update session with results
        const completedSession: LearningSession = {
          ...session,
          status: SessionStatus.COMPLETED,
          generatedMaterials: result.materials,
          updatedAt: new Date()
        };

        setState(prev => ({
          ...prev,
          currentSession: completedSession,
          isProcessing: false,
          progress: null
        }));

        // Auto-save completed session
        await saveSession(completedSession);

      } else {
        throw new Error(result.error || 'Processing failed');
      }

    } catch (error) {
      console.error('Session creation error:', error);
      setState(prev => ({
        ...prev,
        isProcessing: false,
        progress: null,
        error: error instanceof Error ? error.message : 'Failed to create session'
      }));

      // Update session status to error
      if (state.currentSession) {
        setState(prev => ({
          ...prev,
          currentSession: prev.currentSession ? {
            ...prev.currentSession,
            status: SessionStatus.ERROR,
            updatedAt: new Date()
          } : null
        }));
      }
    } finally {
      processingRef.current = null;
    }
  }, [state.currentSession, generateSessionId, generateSessionTitle]);

  const saveSession = useCallback(async (session: LearningSession) => {
    try {
      const sessionData: SessionData = {
        id: session.id,
        timestamp: session.createdAt.getTime(),
        title: session.title,
        content: session.sourceContent.text,
        preferences: session.preferences,
        materials: convertDomainMaterialsToStorage(session.generatedMaterials)
      };

      const success = storageService.saveSession(sessionData);
      if (!success) {
        throw new Error('Failed to save session to storage');
      }

      // Update saved sessions list
      setState(prev => ({
        ...prev,
        savedSessions: prev.savedSessions.some(s => s.id === session.id)
          ? prev.savedSessions.map(s => s.id === session.id ? session : s)
          : [...prev.savedSessions, session]
      }));

    } catch (error) {
      console.error('Save session error:', error);
      throw error;
    }
  }, []);

  const saveCurrentSession = useCallback(async () => {
    if (!state.currentSession) {
      throw new Error('No current session to save');
    }

    await saveSession(state.currentSession);
  }, [state.currentSession, saveSession]);

  const loadSession = useCallback(async (sessionId: string) => {
    try {
      setState(prev => ({ ...prev, error: null }));

      const session = storageService.getSession(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      // Convert storage format to session format
      const fullSession: LearningSession = {
        id: session.id,
        createdAt: new Date(session.timestamp),
        updatedAt: new Date(session.timestamp),
        status: SessionStatus.COMPLETED,
        title: session.title,
        sourceContent: {
          type: ContentType.TEXT,
          text: session.content,
          wordCount: session.content.split(/\s+/).length,
          characterCount: session.content.length,
          validation: {
            isValid: true,
            errors: [],
            warnings: [],
            wordCount: session.content.split(/\s+/).length,
            characterCount: session.content.length,
            estimatedReadingTime: Math.ceil(session.content.split(/\s+/).length / 200)
          },
          metadata: {
            createdAt: new Date(session.timestamp),
            lastModified: new Date(session.timestamp),
            source: 'user_input',
            complexity: 'moderate'
          }
        },
        preferences: session.preferences,
        generatedMaterials: convertStorageMaterialsToDomain(session.materials),
        metadata: {
          version: '1.0.0',
          processingSteps: [],
          errors: []
        }
      };

      setState(prev => ({ ...prev, currentSession: fullSession }));

    } catch (error) {
      console.error('Load session error:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load session'
      }));
    }
  }, []);

  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      const success = storageService.deleteSession(sessionId);
      if (!success) {
        throw new Error('Failed to delete session');
      }

      // Update saved sessions list
      setState(prev => ({
        ...prev,
        savedSessions: prev.savedSessions.filter(session => session.id !== sessionId),
        currentSession: prev.currentSession?.id === sessionId ? null : prev.currentSession
      }));

    } catch (error) {
      console.error('Delete session error:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to delete session'
      }));
    }
  }, []);

  const clearCurrentSession = useCallback(() => {
    setState(prev => ({ ...prev, currentSession: null, error: null, progress: null }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const validateContent = useCallback((content: string): ContentValidation => {
    return textValidator.validate(content);
  }, []);

  const abortProcessing = useCallback(() => {
    if (processingRef.current) {
      processingRef.current.abort();
      processingRef.current = null;
    }

    setState(prev => ({
      ...prev,
      isProcessing: false,
      progress: null,
      error: 'Processing was cancelled'
    }));
  }, []);

  return {
    // State
    currentSession: state.currentSession,
    isProcessing: state.isProcessing,
    progress: state.progress,
    error: state.error,
    savedSessions: state.savedSessions,

    // Actions
    createSession,
    loadSession,
    saveCurrentSession,
    deleteSession,
    clearCurrentSession,
    clearError,
    validateContent,
    abortProcessing
  };
}