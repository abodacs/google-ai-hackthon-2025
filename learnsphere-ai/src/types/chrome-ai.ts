/**
 * Chrome Built-in AI API Types
 * Updated based on official Chrome AI API documentation
 * Supports: Summarizer, Rewriter, Writer, Prompt (LanguageModel), Proofreader, Translator, Language Detection
 */

// Global AI API Detection
export interface ChromeAI {
  canCreateTextSession(): Promise<"readily" | "after-download" | "no">;
  createTextSession(options?: object): Promise<object>;
}

// Chrome Built-in AI APIs - Global Objects
declare global {
  interface Window {
    ai?: ChromeAI;
  }

  var Summarizer: SummarizerAPI;
  var Rewriter: RewriterAPI;
  var Writer: WriterAPI;
  var LanguageModel: LanguageModelAPI;
  var Proofreader: ProofreaderAPI;
  var Translator: TranslatorAPI;
  var LanguageDetector: LanguageDetectorAPI;
}

// Base Types
export type AvailabilityStatus = "readily" | "after-download" | "no";

export interface MonitorCallback {
  (monitor: EventTarget): void;
}

export interface DownloadProgressEvent extends Event {
  loaded: number;
  total: number;
}

// Legacy aliases for backward compatibility
export type AICapabilityAvailability = AvailabilityStatus;
export type AITone = "formal" | "neutral" | "casual";
export type AIFormat = "plain-text" | "markdown";
export type AILength = "short" | "medium" | "long";

// Summarizer API
export interface SummarizerCreateOptions {
  type?: "key-points" | "tldr" | "teaser" | "headline";
  format?: "markdown" | "plain-text";
  length?: "short" | "medium" | "long";
  sharedContext?: string;
  signal?: AbortSignal;
  monitor?: MonitorCallback;
}

export interface SummarizeOptions {
  context?: string;
  signal?: AbortSignal;
}

export interface Summarizer {
  summarize(input: string, options?: SummarizeOptions): Promise<string>;
  summarizeStreaming(
    input: string,
    options?: SummarizeOptions,
  ): ReadableStream<string>;
  destroy(): void;
}

export interface SummarizerAPI {
  availability(): Promise<AvailabilityStatus>;
  create(options?: SummarizerCreateOptions): Promise<Summarizer>;
}

export declare class SummarizerClass implements Summarizer {
  static availability(): Promise<AvailabilityStatus>;
  static create(options?: SummarizerCreateOptions): Promise<Summarizer>;
  summarize(input: string, options?: SummarizeOptions): Promise<string>;
  summarizeStreaming(
    input: string,
    options?: SummarizeOptions,
  ): ReadableStream<string>;
  destroy(): void;
}

// Rewriter API
export interface RewriterCreateOptions {
  sharedContext?: string;
  tone?: "more-formal" | "as-is" | "more-casual";
  format?: "as-is" | "markdown" | "plain-text";
  length?: "shorter" | "as-is" | "longer";
  signal?: AbortSignal;
  monitor?: MonitorCallback;
}

export interface RewriteOptions {
  context?: string;
  signal?: AbortSignal;
}

export interface Rewriter {
  rewrite(input: string, options?: RewriteOptions): Promise<string>;
  rewriteStreaming(
    input: string,
    options?: RewriteOptions,
  ): ReadableStream<string>;
  destroy(): void;
}

export interface RewriterAPI {
  availability(): Promise<AvailabilityStatus>;
  create(options?: RewriterCreateOptions): Promise<Rewriter>;
}

export declare class RewriterClass implements Rewriter {
  static availability(): Promise<AvailabilityStatus>;
  static create(options?: RewriterCreateOptions): Promise<Rewriter>;
  rewrite(input: string, options?: RewriteOptions): Promise<string>;
  rewriteStreaming(
    input: string,
    options?: RewriteOptions,
  ): ReadableStream<string>;
  destroy(): void;
}

// Writer API
export interface WriterCreateOptions {
  tone?: "formal" | "neutral" | "casual";
  format?: "markdown" | "plain-text";
  length?: "short" | "medium" | "long";
  sharedContext?: string;
  signal?: AbortSignal;
  monitor?: MonitorCallback;
}

export interface WriteOptions {
  context?: string;
  signal?: AbortSignal;
}

export interface Writer {
  write(input: string, options?: WriteOptions): Promise<string>;
  writeStreaming(input: string, options?: WriteOptions): ReadableStream<string>;
  destroy(): void;
}

export interface WriterAPI {
  availability(): Promise<AvailabilityStatus>;
  create(options?: WriterCreateOptions): Promise<Writer>;
}

export declare class WriterClass implements Writer {
  static availability(): Promise<AvailabilityStatus>;
  static create(options?: WriterCreateOptions): Promise<Writer>;
  write(input: string, options?: WriteOptions): Promise<string>;
  writeStreaming(input: string, options?: WriteOptions): ReadableStream<string>;
  destroy(): void;
}

// Language Model (Prompt API)
export interface LanguageModelCreateOptions {
  temperature?: number; // 0.0 - 1.0
  topK?: number; // 1 - 40
  systemPrompt?: string;
  signal?: AbortSignal;
  monitor?: MonitorCallback;
}

export interface MultimodalContent {
  role: "user" | "assistant";
  content: Array<{
    type: "text" | "image" | "audio";
    value: string | Blob;
  }>;
}

export interface PromptOptions {
  context?: string;
  signal?: AbortSignal;
  responseConstraint?: JSONSchema; // JSON Schema for structured output
}

// JSON Schema type for structured output
export interface JSONSchema {
  type: "string" | "number" | "boolean" | "object" | "array";
  properties?: Record<string, JSONSchema>;
  items?: JSONSchema;
  required?: string[];
  enum?: unknown[];
  minimum?: number;
  maximum?: number;
  minItems?: number;
  maxItems?: number;
  minLength?: number;
  maxLength?: number;
}

export interface LanguageModel {
  prompt(
    input: string | MultimodalContent[],
    options?: PromptOptions,
  ): Promise<string>;
  promptStreaming(
    input: string | MultimodalContent[],
    options?: PromptOptions,
  ): ReadableStream<string>;
  clone(): Promise<LanguageModel>;
  destroy(): void;
}

export interface LanguageModelAPI {
  availability(): Promise<AvailabilityStatus>;
  create(options?: LanguageModelCreateOptions): Promise<LanguageModel>;
}

export declare class LanguageModelClass implements LanguageModel {
  static availability(): Promise<AvailabilityStatus>;
  static create(options?: LanguageModelCreateOptions): Promise<LanguageModel>;
  prompt(
    input: string | MultimodalContent[],
    options?: PromptOptions,
  ): Promise<string>;
  promptStreaming(
    input: string | MultimodalContent[],
    options?: PromptOptions,
  ): ReadableStream<string>;
  clone(): Promise<LanguageModel>;
  destroy(): void;
}

// Legacy Message interface for backward compatibility
export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

// Proofreader API
export interface ProofreaderCreateOptions {
  expectedInputLanguages?: string[];
  signal?: AbortSignal;
  monitor?: MonitorCallback;
}

export interface ProofreadOptions {
  context?: string;
  signal?: AbortSignal;
}

export interface ProofreadCorrection {
  original: string;
  suggestion: string;
  type: "grammar" | "spelling" | "punctuation" | "style" | "clarity";
  explanation: string;
  startIndex: number;
  endIndex: number;
  confidence?: number;
}

export interface ProofreadResult {
  corrections: ProofreadCorrection[];
}

export interface Proofreader {
  proofread(
    input: string,
    options?: ProofreadOptions,
  ): Promise<ProofreadResult>;
  destroy(): void;
}

export interface ProofreaderAPI {
  availability(): Promise<AvailabilityStatus>;
  create(options?: ProofreaderCreateOptions): Promise<Proofreader>;
}

export declare class ProofreaderClass implements Proofreader {
  static availability(): Promise<AvailabilityStatus>;
  static create(options?: ProofreaderCreateOptions): Promise<Proofreader>;
  proofread(
    input: string,
    options?: ProofreadOptions,
  ): Promise<ProofreadResult>;
  destroy(): void;
}

// Translator API
export interface TranslatorCreateOptions {
  sourceLanguage: string;
  targetLanguage: string;
  signal?: AbortSignal;
  monitor?: MonitorCallback;
}

export interface TranslateOptions {
  context?: string;
  signal?: AbortSignal;
}

export interface AvailabilityOptions {
  sourceLanguage: string;
  targetLanguage: string;
}

export interface Translator {
  translate(input: string, options?: TranslateOptions): Promise<string>;
  translateStreaming(
    input: string,
    options?: TranslateOptions,
  ): ReadableStream<string>;
  destroy(): void;
}

export interface TranslatorAPI {
  availability(options: AvailabilityOptions): Promise<AvailabilityStatus>;
  create(options: TranslatorCreateOptions): Promise<Translator>;
}

export declare class TranslatorClass implements Translator {
  static availability(
    options: AvailabilityOptions,
  ): Promise<AvailabilityStatus>;
  static create(options: TranslatorCreateOptions): Promise<Translator>;
  translate(input: string, options?: TranslateOptions): Promise<string>;
  translateStreaming(
    input: string,
    options?: TranslateOptions,
  ): ReadableStream<string>;
  destroy(): void;
}

// Language Detection API
export interface LanguageDetectorCreateOptions {
  signal?: AbortSignal;
  monitor?: MonitorCallback;
}

export interface LanguageDetectionResult {
  detectedLanguage: string;
  confidence: number; // 0.0 to 1.0
}

export interface LanguageDetector {
  detect(input: string): Promise<LanguageDetectionResult[]>;
  destroy(): void;
}

export interface LanguageDetectorAPI {
  availability(): Promise<AvailabilityStatus>;
  create(options?: LanguageDetectorCreateOptions): Promise<LanguageDetector>;
}

export declare class LanguageDetectorClass implements LanguageDetector {
  static availability(): Promise<AvailabilityStatus>;
  static create(
    options?: LanguageDetectorCreateOptions,
  ): Promise<LanguageDetector>;
  detect(input: string): Promise<LanguageDetectionResult[]>;
  destroy(): void;
}

// Service wrapper types for LearnSphere AI
export interface AICapabilities {
  summarizer: AvailabilityStatus;
  rewriter: AvailabilityStatus;
  writer: AvailabilityStatus;
  languageModel: AvailabilityStatus;
  proofreader: AvailabilityStatus;
  translator: AvailabilityStatus;
  languageDetector: AvailabilityStatus;
  overall: boolean;
}

export interface AIServiceError {
  code: AIErrorCode;
  message: string;
  apiName?: string;
  originalError?: unknown;
}

export enum AIErrorCode {
  API_UNAVAILABLE = "API_UNAVAILABLE",
  MODEL_NOT_READY = "MODEL_NOT_READY",
  RATE_LIMITED = "RATE_LIMITED",
  CONTENT_TOO_LONG = "CONTENT_TOO_LONG",
  PROCESSING_ERROR = "PROCESSING_ERROR",
  NETWORK_ERROR = "NETWORK_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

// Common error handling for all APIs
export class AIError extends Error {
  constructor(
    message: string,
    public code: AIErrorCode,
    public apiName?: string,
  ) {
    super(message);
    this.name = "AIError";
  }
}

// API Detection Helpers
export function isSummarizerSupported(): boolean {
  return "Summarizer" in globalThis;
}

export function isRewriterSupported(): boolean {
  return "Rewriter" in globalThis;
}

export function isWriterSupported(): boolean {
  return "Writer" in globalThis;
}

export function isLanguageModelSupported(): boolean {
  return "LanguageModel" in globalThis;
}

export function isProofreaderSupported(): boolean {
  return "Proofreader" in globalThis;
}

export function isTranslatorSupported(): boolean {
  return "Translator" in globalThis;
}

export function isLanguageDetectorSupported(): boolean {
  return "LanguageDetector" in globalThis;
}

export function isChromeAISupported(): boolean {
  // Do NOT use window.ai here to avoid TypeScript errors
  if (typeof window === "undefined") {
    return false;
  }
  // Basic check for Chrome AI support
  // this is wrong 'ai' in globalThis && 'canCreateTextSession' in (globalThis as unknown as { ai: ChromeAI }).ai
  return true;
}

export function getAllSupportedAPIs(): string[] {
  const supported: string[] = [];
  if (isSummarizerSupported()) supported.push("Summarizer");
  if (isRewriterSupported()) supported.push("Rewriter");
  if (isWriterSupported()) supported.push("Writer");
  if (isLanguageModelSupported()) supported.push("LanguageModel");
  if (isProofreaderSupported()) supported.push("Proofreader");
  if (isTranslatorSupported()) supported.push("Translator");
  if (isLanguageDetectorSupported()) supported.push("LanguageDetector");
  return supported;
}

// Type Guards
export function isAIServiceError(error: unknown): error is AIServiceError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    "message" in error &&
    typeof (error as { code: unknown }).code === "string" &&
    typeof (error as { message: unknown }).message === "string"
  );
}
