/**
 * Learning Session Types
 * Core interfaces for managing learning sessions in LearnSphere AI
 */

import { UserPreferences } from './user-preferences';
import { TextContent } from './text-content';
import { GeneratedMaterials } from './generated-materials';

export enum SessionStatus {
  CREATED = 'created',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  ERROR = 'error'
}

export interface ProcessingStep {
  step: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  error?: string;
}

export interface SessionMetadata {
  version: string;
  userAgent?: string;
  aiApiVersions?: Record<string, string>;
  processingSteps: ProcessingStep[];
  errors: string[];
  shareUrl?: string;
  processingTime?: number;
}

export interface LearningSession {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  status: SessionStatus;
  title: string;
  sourceContent: TextContent;
  preferences: UserPreferences;
  generatedMaterials?: GeneratedMaterials;
  metadata: SessionMetadata;
}

export interface CreateSessionOptions {
  content: string;
  preferences: UserPreferences;
  title?: string;
}

export interface UpdateSessionOptions {
  title?: string;
  preferences?: Partial<UserPreferences>;
  status?: SessionStatus;
}

export interface SessionListItem {
  id: string;
  title: string;
  createdAt: Date;
  status: SessionStatus;
  preview: string;
  grade: string;
  interest: string;
}

export interface SessionStorageData {
  sessions: SessionListItem[];
  currentSessionId?: string;
  lastSavedAt: Date;
}