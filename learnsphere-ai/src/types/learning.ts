/**
 * Learning domain types based on specifications and Bloom's Taxonomy
 */

export type GradeLevel =
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "11"
  | "12"
  | "undergrad";

export type Interest =
  | "reading"
  | "science"
  | "art"
  | "writing"
  | "photography"
  | "nature"
  | "soccer"
  | "cycling"
  | "cooking"
  | "gaming"
  | "basketball"
  | "football"
  | "table_tennis"
  | "tennis"
  | "technology"
  | "skateboarding";

export type LearningStyle = "visual" | "auditory" | "kinesthetic" | "reading";

export interface UserPreferences {
  gradeLevel: GradeLevel;
  interest: Interest;
  learningStyle: LearningStyle[];
  language?: string;
}

export interface SourceContent {
  type: "text" | "pdf" | "txt_file";
  text: string;
  originalFile?: FileInfo;
  wordCount: number;
  characterCount: number;
  language?: string;
}

export interface FileInfo {
  name: string;
  size: number;
  type: string;
  lastModified: Date;
}

export interface LearningSession {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  status: SessionStatus;
  sourceContent: SourceContent;
  preferences: UserPreferences;
  generatedMaterials: GeneratedMaterials | null;
  metadata: SessionMetadata;
}

export enum SessionStatus {
  CREATED = "created",
  PROCESSING = "processing",
  COMPLETED = "completed",
  ERROR = "error",
}

export interface GeneratedMaterials {
  summary: string;
  adaptedContent: string;
  mindMap: MindMapData;
  audioLesson: AudioData;
  quiz: Quiz;
  bloomsAssessment: BloomsAssessment; // NEW: Bloom's Taxonomy assessment
  processingTime: number;
  generatedAt: Date;
}

// Bloom's Taxonomy Assessment Types
export interface BloomsAssessment {
  id: string;
  sessionId: string;
  levels: BloomsLevel[];
  overallScore?: BloomsScore;
  recommendations: string[];
  completedAt?: Date;
}

export interface BloomsLevel {
  level: BloomsTaxonomyLevel;
  description: string;
  questions: BloomsQuestion[];
  completed: boolean;
  score?: number;
  timeSpent?: number;
}

export enum BloomsTaxonomyLevel {
  REMEMBER = "remember", // Level 1: Recall facts, terms, basic concepts
  UNDERSTAND = "understand", // Level 2: Explain ideas or concepts
  APPLY = "apply", // Level 3: Use information in new situations
  ANALYZE = "analyze", // Level 4: Draw connections among ideas
  EVALUATE = "evaluate", // Level 5: Justify decisions or courses of action
  CREATE = "create", // Level 6: Produce new or original work
}

export interface BloomsQuestion {
  id: string;
  level: BloomsTaxonomyLevel;
  question: string;
  type: BloomsQuestionType;
  options?: string[];
  correctAnswer?: unknown;
  userAnswer?: unknown;
  explanation: string;
  points: number;
  difficulty: QuestionDifficulty;
  timeLimit?: number; // seconds
  completed: boolean;
  timeSpent?: number;
}

export enum BloomsQuestionType {
  MULTIPLE_CHOICE = "multiple_choice",
  TRUE_FALSE = "true_false",
  SHORT_ANSWER = "short_answer",
  ESSAY = "essay",
  ORDERING = "ordering",
  MATCHING = "matching",
  FILL_BLANK = "fill_blank",
}

export enum QuestionDifficulty {
  EASY = "easy",
  MEDIUM = "medium",
  HARD = "hard",
}

export interface BloomsScore {
  totalPoints: number;
  earnedPoints: number;
  percentage: number;
  levelScores: Record<
    BloomsTaxonomyLevel,
    {
      points: number;
      maxPoints: number;
      percentage: number;
    }
  >;
  strengths: BloomsTaxonomyLevel[];
  weaknesses: BloomsTaxonomyLevel[];
  recommendations: string[];
}

// Existing types from specification
export interface MindMapData {
  nodes: MindMapNode[];
  edges: MindMapEdge[];
  rootNodeId: string;
  layout: LayoutInfo;
}

export interface MindMapNode {
  id: string;
  label: string;
  description: string;
  level: number;
  category: ConceptCategory;
  importance: number;
}

export interface MindMapEdge {
  id: string;
  sourceId: string;
  targetId: string;
  relationship: string;
  weight: number;
}

export enum ConceptCategory {
  MAIN_TOPIC = "main_topic",
  SUBTOPIC = "subtopic",
  EXAMPLE = "example",
  DEFINITION = "definition",
  PROCESS = "process",
  RELATIONSHIP = "relationship",
}

export interface LayoutInfo {
  width: number;
  height: number;
  centerX: number;
  centerY: number;
}

export interface AudioData {
  text: string;
  duration: number;
  speed: number;
  voice?: string;
  language: string;
  segments: AudioSegment[];
}

export interface AudioSegment {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  isPlaying: boolean;
}

export interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
  totalPoints: number;
  timeEstimate: number;
  difficulty: GradeLevel;
}

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  points: number;
  category: string;
}

export enum QuestionType {
  MULTIPLE_CHOICE = "multiple_choice",
  TRUE_FALSE = "true_false",
  FILL_BLANK = "fill_blank",
}

export interface SessionMetadata {
  version: string;
  userAgent: string;
  aiApiVersions: Record<string, string>;
  processingSteps: ProcessingStep[];
  errors: ProcessingError[];
  shareUrl?: string;
}

export interface ProcessingStep {
  step: string;
  status: "pending" | "completed" | "error";
  startTime: Date;
  endTime?: Date;
  duration?: number;
}

export interface ProcessingError {
  step: string;
  error: string;
  timestamp: Date;
  recoverable: boolean;
}
