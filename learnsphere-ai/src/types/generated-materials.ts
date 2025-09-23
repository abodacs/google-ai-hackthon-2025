/**
 * Generated Materials Types
 * Interfaces for AI-generated learning content
 */

import { GradeLevel, Interest } from './user-preferences';

export interface GenerationMetadata {
  generatedAt: Date;
  processingTime: number; // milliseconds
  aiVersion?: string;
  gradeLevel: GradeLevel;
  interest: Interest;
  model?: string;
}

export interface SummaryContent {
  text: string;
  keyPoints: string[];
  wordCount: number;
  type: 'key-points' | 'tldr' | 'teaser' | 'headline';
  metadata: GenerationMetadata;
}

export interface AdaptedContent {
  text: string;
  originalLength: number;
  adaptedLength: number;
  adaptations: ContentAdaptation[];
  gradeLevel: GradeLevel;
  interest: Interest;
  metadata: GenerationMetadata;
}

export interface ContentAdaptation {
  type: 'vocabulary' | 'structure' | 'analogy' | 'example' | 'simplification';
  original: string;
  adapted: string;
  reason: string;
}

export interface MindMapNode {
  id: string;
  label: string;
  description: string;
  level: number;
  category: 'main_topic' | 'subtopic' | 'example' | 'definition' | 'process';
  importance: number; // 1-10
  x?: number; // Position for rendering
  y?: number;
}

export interface MindMapEdge {
  id: string;
  sourceId: string;
  targetId: string;
  relationship: string;
  weight: number; // 1-10
  type: 'hierarchical' | 'associative' | 'causal' | 'temporal';
}

export interface MindMapData {
  nodes: MindMapNode[];
  edges: MindMapEdge[];
  rootNodeId: string;
  layout: {
    width: number;
    height: number;
    centerX: number;
    centerY: number;
  };
  metadata: GenerationMetadata;
}

export interface AudioSegment {
  id: string;
  text: string;
  startTime: number; // seconds
  endTime: number; // seconds
  isPlaying: boolean;
  speed: number;
}

export interface AudioData {
  text: string;
  duration: number; // seconds
  speed: number; // 0.5 - 2.0
  voice?: string;
  language: string;
  segments: AudioSegment[];
  metadata: GenerationMetadata;
}

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation?: string;
}

export interface QuizQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'fill_blank';
  question: string;
  options: QuizOption[];
  correctAnswer: string; // Option ID
  explanation: string;
  points: number;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit?: number; // seconds
}

export interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
  totalPoints: number;
  timeEstimate: number; // minutes
  difficulty: GradeLevel;
  metadata: GenerationMetadata;
}

export interface QuizResult {
  sessionId: string;
  completedAt: Date;
  score: number;
  totalPoints: number;
  percentage: number;
  timeSpent: number; // seconds
  answers: QuizAnswer[];
}

export interface QuizAnswer {
  questionId: string;
  selectedOption?: string;
  isCorrect: boolean;
  timeSpent: number; // seconds
  pointsEarned: number;
}

export interface GeneratedMaterials {
  summary: SummaryContent;
  adaptedContent: AdaptedContent;
  mindMap: MindMapData;
  audioLesson: AudioData;
  quiz: Quiz;
  processingTime: number; // Total time for all generation
  generatedAt: Date;
  version: string;
}

export interface GenerationProgress {
  step: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  progress: number; // 0-100
  message?: string;
  error?: string;
  startTime?: Date;
  endTime?: Date;
}

export interface GenerationOptions {
  gradeLevel: GradeLevel;
  interest: Interest;
  summaryType?: 'key-points' | 'tldr' | 'teaser' | 'headline';
  audioSpeed?: number;
  audioVoice?: string;
  quizDifficulty?: 'easy' | 'medium' | 'hard';
  maxQuizQuestions?: number;
  includeExplanations?: boolean;
}

export interface GenerationResult {
  success: boolean;
  materials?: GeneratedMaterials;
  error?: string;
  warnings?: string[];
  stats: {
    totalTime: number;
    stepTimes: Record<string, number>;
    apiCalls: number;
    tokensUsed?: number;
  };
}

export interface MaterialValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  completeness: number; // 0-100
  quality: number; // 0-100
}

export const GENERATION_STEPS = [
  'summarizing',
  'adapting',
  'creating_mindmap',
  'generating_audio',
  'creating_quiz',
  'finalizing'
] as const;

export type GenerationStep = typeof GENERATION_STEPS[number];