/**
 * Text Content Types
 * Interfaces for handling text content input and validation
 */

export enum ContentType {
  TEXT = 'text',
  PASTE = 'paste'
}

export interface ContentValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  wordCount: number;
  characterCount: number;
  estimatedReadingTime: number; // in minutes
}

export interface TextContent {
  type: ContentType;
  text: string;
  originalText?: string; // For tracking changes
  wordCount: number;
  characterCount: number;
  language?: string;
  validation: ContentValidation;
  metadata: TextContentMetadata;
}

export interface TextContentMetadata {
  createdAt: Date;
  lastModified: Date;
  source: 'user_input' | 'paste' | 'file_extract';
  encoding?: string;
  detectedLanguage?: string;
  complexity?: 'simple' | 'moderate' | 'complex';
  readingLevel?: number; // Grade level
}

export interface ContentProcessingOptions {
  removeExtraWhitespace?: boolean;
  normalizeLineBreaks?: boolean;
  detectLanguage?: boolean;
  validateLength?: boolean;
}

export interface TextStatistics {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  sentences: number;
  paragraphs: number;
  averageWordsPerSentence: number;
  readingTime: number; // minutes
  complexity: string;
}

export interface ContentLimits {
  minCharacters: number;
  maxCharacters: number;
  minWords: number;
  maxWords: number;
  maxSentences?: number;
}

export const DEFAULT_CONTENT_LIMITS: ContentLimits = {
  minCharacters: 50,
  maxCharacters: 50000,
  minWords: 10,
  maxWords: 10000,
  maxSentences: 500
};

export interface ContentValidationRules {
  limits: ContentLimits;
  allowEmptyLines: boolean;
  requireAlphanumeric: boolean;
  forbiddenPatterns?: RegExp[];
  requiredLanguages?: string[];
}