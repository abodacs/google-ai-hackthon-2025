/**
 * Simple localStorage utility for basic session data
 * Handles session persistence for LearnSphere AI
 */

import { GradeLevel, Interest, LearningStyle } from '@/types/user-preferences';
import { GeneratedMaterials as DomainGeneratedMaterials } from '@/types/generated-materials';

export interface SessionData {
  id: string;
  timestamp: number;
  title: string;
  content: string;
  preferences: UserPreferences;
  materials?: GeneratedMaterials;
}

export interface UserPreferences {
  gradeLevel: GradeLevel;
  interest: Interest;
  learningStyle?: LearningStyle[];
  language?: string;
}

export interface GeneratedMaterials {
  summary: string;
  adaptedContent: string;
  mindMap?: Record<string, unknown>;
  audioData?: Record<string, unknown>;
  quiz?: Record<string, unknown>;
}

const STORAGE_KEY = 'learnsphere-sessions';
const MAX_SESSIONS = 10;

export class StorageService {
  /**
   * Check if localStorage is available
   */
  public isAvailable(): boolean {
    try {
      return typeof localStorage !== 'undefined';
    } catch {
      return false;
    }
  }

  /**
   * Get all saved sessions
   */
  public getAllSessions(): SessionData[] {
    if (!this.isAvailable()) return [];

    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading sessions from localStorage:', error);
      return [];
    }
  }

  /**
   * Save a session
   */
  public saveSession(session: SessionData): boolean {
    if (!this.isAvailable()) return false;

    try {
      const sessions = this.getAllSessions();

      // Check if session already exists and update it
      const existingIndex = sessions.findIndex(s => s.id === session.id);
      if (existingIndex >= 0) {
        sessions[existingIndex] = session;
      } else {
        // Add new session
        sessions.unshift(session);

        // Keep only the most recent sessions
        if (sessions.length > MAX_SESSIONS) {
          sessions.splice(MAX_SESSIONS);
        }
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
      return true;
    } catch (error) {
      console.error('Error saving session to localStorage:', error);
      return false;
    }
  }

  /**
   * Get a specific session by ID
   */
  public getSession(id: string): SessionData | null {
    const sessions = this.getAllSessions();
    return sessions.find(session => session.id === id) || null;
  }

  /**
   * Delete a session
   */
  public deleteSession(id: string): boolean {
    if (!this.isAvailable()) return false;

    try {
      const sessions = this.getAllSessions();
      const filteredSessions = sessions.filter(session => session.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredSessions));
      return true;
    } catch (error) {
      console.error('Error deleting session from localStorage:', error);
      return false;
    }
  }

  /**
   * Clear all sessions
   */
  public clearAllSessions(): boolean {
    if (!this.isAvailable()) return false;

    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing sessions from localStorage:', error);
      return false;
    }
  }

  /**
   * Get storage usage statistics
   */
  public getStorageStats(): { used: number; available: number; percentage: number } {
    if (!this.isAvailable()) {
      return { used: 0, available: 0, percentage: 0 };
    }

    try {
      const data = localStorage.getItem(STORAGE_KEY) || '';
      const used = new Blob([data]).size;
      const available = 5 * 1024 * 1024; // Assume 5MB localStorage limit
      const percentage = (used / available) * 100;

      return { used, available, percentage };
    } catch (error) {
      console.error('Error calculating storage stats:', error);
      return { used: 0, available: 0, percentage: 0 };
    }
  }

  /**
   * Generate a unique session ID
   */
  public generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Generate a session title from content
   */
  public generateSessionTitle(content: string, maxLength: number = 50): string {
    const words = content.trim().split(/\s+/);
    let title = words.slice(0, 8).join(' ');

    if (title.length > maxLength) {
      title = title.substring(0, maxLength - 3) + '...';
    }

    return title || 'Untitled Session';
  }
}

// Export singleton instance
export const storageService = new StorageService();