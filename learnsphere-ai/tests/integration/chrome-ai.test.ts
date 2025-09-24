/**
 * Integration Tests: Chrome AI Service
 * Tests the Chrome AI service wrapper and its integration with browser APIs
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { ChromeAIService } from '@/features/ai-playground/services/chrome-ai.service';
import { AIErrorCode } from '@/features/ai-playground/types/chrome-ai';

// Mock Chrome AI APIs for testing
const mockSummarizer = {
  summarize: vi.fn().mockResolvedValue('This is a test summary.'),
  destroy: vi.fn()
};

const mockRewriter = {
  rewrite: vi.fn().mockResolvedValue('This is rewritten content.'),
  destroy: vi.fn()
};

const mockWriter = {
  write: vi.fn().mockResolvedValue('This is generated content.'),
  destroy: vi.fn()
};

const mockSummarizerAPI = {
  availability: vi.fn().mockResolvedValue('readily'),
  create: vi.fn().mockResolvedValue(mockSummarizer)
};

const mockRewriterAPI = {
  availability: vi.fn().mockResolvedValue('readily'),
  create: vi.fn().mockResolvedValue(mockRewriter)
};

const mockWriterAPI = {
  availability: vi.fn().mockResolvedValue('readily'),
  create: vi.fn().mockResolvedValue(mockWriter)
};

describe('Chrome AI Service Integration', () => {
  let chromeAIService: ChromeAIService;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Mock Chrome AI globals
    (globalThis as any).Summarizer = mockSummarizerAPI;
    (globalThis as any).Rewriter = mockRewriterAPI;
    (globalThis as any).Writer = mockWriterAPI;
    (globalThis as any).LanguageModel = { availability: vi.fn().mockResolvedValue('readily') };
    (globalThis as any).Proofreader = { availability: vi.fn().mockResolvedValue('readily') };
    (globalThis as any).Translator = { availability: vi.fn().mockResolvedValue('readily') };
    (globalThis as any).LanguageDetector = { availability: vi.fn().mockResolvedValue('readily') };

    // Mock window object
    Object.defineProperty(global, 'window', {
      value: {},
      writable: true
    });

    chromeAIService = new ChromeAIService();
  });

  afterEach(() => {
    // Clean up globals
    delete (globalThis as any).Summarizer;
    delete (globalThis as any).Rewriter;
    delete (globalThis as any).Writer;
    delete (globalThis as any).LanguageModel;
    delete (globalThis as any).Proofreader;
    delete (globalThis as any).Translator;
    delete (globalThis as any).LanguageDetector;
  });

  describe('API Support Detection', () => {
    test('should detect Chrome AI support correctly', () => {
      expect(chromeAIService.isSupported()).toBe(true);
    });

    test('should return correct API support status', () => {
      const support = chromeAIService.getAPISupport();

      expect(support.summarizer).toBe(true);
      expect(support.rewriter).toBe(true);
      expect(support.writer).toBe(true);
      expect(support.languageModel).toBe(true);
      expect(support.proofreader).toBe(true);
      expect(support.translator).toBe(true);
      expect(support.languageDetector).toBe(true);
    });

    test('should detect when APIs are not supported', () => {
      delete (globalThis as any).Summarizer;
      delete (globalThis as any).Rewriter;

      const support = chromeAIService.getAPISupport();

      expect(support.summarizer).toBe(false);
      expect(support.rewriter).toBe(false);
      expect(support.writer).toBe(true);
    });
  });

  describe('Capabilities Checking', () => {
    test('should check all API capabilities', async () => {
      const capabilities = await chromeAIService.checkCapabilities();

      expect(capabilities.summarizer).toBe('readily');
      expect(capabilities.rewriter).toBe('readily');
      expect(capabilities.writer).toBe('readily');
      expect(capabilities.languageModel).toBe('readily');
      expect(capabilities.proofreader).toBe('readily');
      expect(capabilities.translator).toBe('readily');
      expect(capabilities.languageDetector).toBe('readily');
      expect(capabilities.overall).toBe(true);
    });

    test('should handle API availability check failures', async () => {
      mockSummarizerAPI.availability.mockRejectedValue(new Error('API not available'));

      const capabilities = await chromeAIService.checkCapabilities();

      expect(capabilities.summarizer).toBe('no');
      expect(capabilities.overall).toBe(true); // Other APIs still available
    });

    test('should return no support when no APIs available', async () => {
      delete (globalThis as any).Summarizer;
      delete (globalThis as any).Rewriter;
      delete (globalThis as any).Writer;
      delete (globalThis as any).LanguageModel;
      delete (globalThis as any).Proofreader;
      delete (globalThis as any).Translator;
      delete (globalThis as any).LanguageDetector;

      const capabilities = await chromeAIService.checkCapabilities();

      expect(capabilities.overall).toBe(false);
    });
  });

  describe('Summarizer Integration', () => {
    test('should create and use summarizer successfully', async () => {
      const testText = 'This is a long text that needs to be summarized.';
      const result = await chromeAIService.summarize(testText);

      expect(mockSummarizerAPI.create).toHaveBeenCalled();
      expect(mockSummarizer.summarize).toHaveBeenCalledWith(testText, { context: undefined });
      expect(mockSummarizer.destroy).toHaveBeenCalled();
      expect(result).toBe('This is a test summary.');
    });

    test('should pass options to summarizer', async () => {
      const options = {
        type: 'key-points' as const,
        format: 'markdown' as const,
        length: 'short' as const,
        context: 'Educational content'
      };

      await chromeAIService.summarize('Test text', options);

      expect(mockSummarizerAPI.create).toHaveBeenCalledWith({
        type: 'key-points',
        format: 'markdown',
        length: 'short'
      });
      expect(mockSummarizer.summarize).toHaveBeenCalledWith('Test text', {
        context: 'Educational content'
      });
    });

    test('should handle summarizer creation failure', async () => {
      delete (globalThis as any).Summarizer;

      await expect(chromeAIService.summarize('Test text')).rejects.toThrow('Summarizer API not available');
    });

    test('should handle summarizer API not available', async () => {
      mockSummarizerAPI.availability.mockResolvedValue('no');

      await expect(chromeAIService.createSummarizer()).rejects.toThrow('Summarizer is not available');
    });
  });

  describe('Rewriter Integration', () => {
    test('should create and use rewriter successfully', async () => {
      const testText = 'This text needs to be rewritten.';
      const options = {
        tone: 'more-casual' as const,
        format: 'plain-text' as const
      };

      const result = await chromeAIService.rewrite(testText, options);

      expect(mockRewriterAPI.create).toHaveBeenCalledWith({
        tone: 'more-casual',
        format: 'plain-text'
      });
      expect(mockRewriter.rewrite).toHaveBeenCalledWith(testText, { context: undefined });
      expect(mockRewriter.destroy).toHaveBeenCalled();
      expect(result).toBe('This is rewritten content.');
    });

    test('should handle rewriter errors', async () => {
      mockRewriter.rewrite.mockRejectedValue(new Error('Content too long'));

      await expect(chromeAIService.rewrite('Test text')).rejects.toMatchObject({
        code: AIErrorCode.PROCESSING_ERROR,
        message: expect.stringContaining('Failed to rewrite')
      });
    });
  });

  describe('Writer Integration', () => {
    test('should create and use writer successfully', async () => {
      const testPrompt = 'Write about machine learning.';
      const options = {
        tone: 'neutral' as const,
        format: 'markdown' as const,
        length: 'medium' as const
      };

      const result = await chromeAIService.write(testPrompt, options);

      expect(mockWriterAPI.create).toHaveBeenCalledWith({
        tone: 'neutral',
        format: 'markdown',
        length: 'medium'
      });
      expect(mockWriter.write).toHaveBeenCalledWith(testPrompt, { context: undefined });
      expect(mockWriter.destroy).toHaveBeenCalled();
      expect(result).toBe('This is generated content.');
    });

    test('should handle different writer tones', async () => {
      const tones = ['formal', 'neutral', 'casual'] as const;

      for (const tone of tones) {
        await chromeAIService.write('Test prompt', { tone });
        expect(mockWriterAPI.create).toHaveBeenCalledWith({ tone });
      }
    });
  });

  describe('Error Handling', () => {
    test('should handle NotSupportedError correctly', async () => {
      const error = new Error('Not supported');
      error.name = 'NotSupportedError';
      mockSummarizer.summarize.mockRejectedValue(error);

      await expect(chromeAIService.summarize('Test')).rejects.toMatchObject({
        code: AIErrorCode.API_UNAVAILABLE
      });
    });

    test('should handle InvalidStateError correctly', async () => {
      const error = new Error('Invalid state');
      error.name = 'InvalidStateError';
      mockSummarizer.summarize.mockRejectedValue(error);

      await expect(chromeAIService.summarize('Test')).rejects.toMatchObject({
        code: AIErrorCode.MODEL_NOT_READY
      });
    });

    test('should handle QuotaExceededError correctly', async () => {
      const error = new Error('Quota exceeded');
      error.name = 'QuotaExceededError';
      mockSummarizer.summarize.mockRejectedValue(error);

      await expect(chromeAIService.summarize('Test')).rejects.toMatchObject({
        code: AIErrorCode.RATE_LIMITED
      });
    });

    test('should handle content too long error', async () => {
      const error = new Error('Content is too long for processing');
      mockSummarizer.summarize.mockRejectedValue(error);

      await expect(chromeAIService.summarize('Test')).rejects.toMatchObject({
        code: AIErrorCode.CONTENT_TOO_LONG
      });
    });

    test('should handle network errors', async () => {
      const error = new Error('Network failed');
      error.name = 'NetworkError';
      mockSummarizer.summarize.mockRejectedValue(error);

      await expect(chromeAIService.summarize('Test')).rejects.toMatchObject({
        code: AIErrorCode.NETWORK_ERROR
      });
    });

    test('should handle unknown errors', async () => {
      mockSummarizer.summarize.mockRejectedValue('Unknown error type');

      await expect(chromeAIService.summarize('Test')).rejects.toMatchObject({
        code: AIErrorCode.UNKNOWN_ERROR
      });
    });
  });

  describe('Resource Management', () => {
    test('should properly destroy API instances', async () => {
      await chromeAIService.summarize('Test text');
      await chromeAIService.rewrite('Test text');
      await chromeAIService.write('Test prompt');

      expect(mockSummarizer.destroy).toHaveBeenCalled();
      expect(mockRewriter.destroy).toHaveBeenCalled();
      expect(mockWriter.destroy).toHaveBeenCalled();
    });

    test('should destroy instances even when operations fail', async () => {
      mockSummarizer.summarize.mockRejectedValue(new Error('Operation failed'));

      await expect(chromeAIService.summarize('Test')).rejects.toThrow();
      expect(mockSummarizer.destroy).toHaveBeenCalled();
    });
  });

  describe('API Instance Creation', () => {
    test('should create summarizer with options', async () => {
      const options = {
        type: 'tldr' as const,
        format: 'markdown' as const,
        sharedContext: 'Educational content'
      };

      await chromeAIService.createSummarizer(options);

      expect(mockSummarizerAPI.create).toHaveBeenCalledWith(options);
    });

    test('should create rewriter with options', async () => {
      const options = {
        tone: 'more-formal' as const,
        length: 'longer' as const
      };

      await chromeAIService.createRewriter(options);

      expect(mockRewriterAPI.create).toHaveBeenCalledWith(options);
    });

    test('should create writer with options', async () => {
      const options = {
        tone: 'formal' as const,
        format: 'plain-text' as const,
        sharedContext: 'Academic writing'
      };

      await chromeAIService.createWriter(options);

      expect(mockWriterAPI.create).toHaveBeenCalledWith(options);
    });
  });

  describe('Browser Environment', () => {
    test('should handle server-side rendering', () => {
      // Mock server environment
      Object.defineProperty(global, 'window', {
        value: undefined,
        writable: true
      });

      const serverService = new ChromeAIService();
      expect(serverService.isSupported()).toBe(false);
    });

    test('should handle missing globals gracefully', () => {
      delete (globalThis as any).Summarizer;

      const support = chromeAIService.getAPISupport();
      expect(support.summarizer).toBe(false);
    });
  });

  describe('Concurrent Operations', () => {
    test('should handle multiple concurrent summarization requests', async () => {
      const promises = [
        chromeAIService.summarize('Text 1'),
        chromeAIService.summarize('Text 2'),
        chromeAIService.summarize('Text 3')
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(mockSummarizerAPI.create).toHaveBeenCalledTimes(3);
      expect(mockSummarizer.destroy).toHaveBeenCalledTimes(3);
    });

    test('should handle mixed API operations', async () => {
      const promises = [
        chromeAIService.summarize('Text to summarize'),
        chromeAIService.rewrite('Text to rewrite'),
        chromeAIService.write('Prompt for writing')
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(results[0]).toBe('This is a test summary.');
      expect(results[1]).toBe('This is rewritten content.');
      expect(results[2]).toBe('This is generated content.');
    });
  });
});