/**
 * Content Processor Service
 * Handles the complete pipeline for processing content with Chrome AI
 */

import { chromeAIService } from '@/features/ai-playground/services/chrome-ai.service';
import { textValidator } from '@/utils/text-validator';
import {
  UserPreferences,
  GradeLevel,
  Interest,
  GRADE_LEVEL_INFO,
  INTEREST_INFO
} from '@/types/user-preferences';
import {
  GeneratedMaterials,
  GenerationOptions,
  GenerationResult,
  GenerationProgress,
  GENERATION_STEPS,
  GenerationStep
} from '@/types/generated-materials';
import { ContentValidation } from '@/types/text-content';

export interface ProcessingOptions {
  onProgress?: (progress: GenerationProgress) => void;
  signal?: AbortSignal;
  includeValidation?: boolean;
}

export class ContentProcessor {
  private abortController?: AbortController;

  /**
   * Process content through the complete AI pipeline
   */
  public async processContent(
    content: string,
    preferences: UserPreferences,
    options: ProcessingOptions = {}
  ): Promise<GenerationResult> {
    const startTime = Date.now();
    const stats = {
      totalTime: 0,
      stepTimes: {} as Record<string, number>,
      apiCalls: 0,
      tokensUsed: 0
    };

    try {
      // Set up abort handling
      this.abortController = new AbortController();
      if (options.signal) {
        options.signal.addEventListener('abort', () => {
          this.abortController?.abort();
        });
      }

      // Step 1: Validate content
      if (options.includeValidation !== false) {
        this.updateProgress(options.onProgress, 'validation', 'in_progress', 5, 'Validating content...');

        const validation = textValidator.validate(content);
        if (!validation.isValid) {
          throw new Error(`Content validation failed: ${validation.errors.join(', ')}`);
        }

        this.updateProgress(options.onProgress, 'validation', 'completed', 10, 'Content validated');
      }

      // Step 2: Generate summary
      const summaryStepStart = Date.now();
      this.updateProgress(options.onProgress, 'summarizing', 'in_progress', 20, 'Creating summary...');

      const summary = await this.generateSummary(content, preferences);
      stats.stepTimes.summarizing = Date.now() - summaryStepStart;
      stats.apiCalls++;

      this.updateProgress(options.onProgress, 'summarizing', 'completed', 35, 'Summary created');

      // Step 3: Adapt content
      const adaptStepStart = Date.now();
      this.updateProgress(options.onProgress, 'adapting', 'in_progress', 45, 'Adapting content for grade level...');

      const adaptedContent = await this.adaptContentForGrade(content, preferences);
      stats.stepTimes.adapting = Date.now() - adaptStepStart;
      stats.apiCalls++;

      this.updateProgress(options.onProgress, 'adapting', 'completed', 60, 'Content adapted');

      // Step 4: Generate mind map
      const mindMapStepStart = Date.now();
      this.updateProgress(options.onProgress, 'creating_mindmap', 'in_progress', 70, 'Creating mind map...');

      const mindMap = await this.generateMindMap(content, preferences);
      stats.stepTimes.creating_mindmap = Date.now() - mindMapStepStart;
      stats.apiCalls++;

      this.updateProgress(options.onProgress, 'creating_mindmap', 'completed', 80, 'Mind map created');

      // Step 5: Generate audio content
      const audioStepStart = Date.now();
      this.updateProgress(options.onProgress, 'generating_audio', 'in_progress', 85, 'Preparing audio lesson...');

      const audioLesson = await this.generateAudioLesson(adaptedContent.text, preferences);
      stats.stepTimes.generating_audio = Date.now() - audioStepStart;

      this.updateProgress(options.onProgress, 'generating_audio', 'completed', 90, 'Audio lesson prepared');

      // Step 6: Generate quiz
      const quizStepStart = Date.now();
      this.updateProgress(options.onProgress, 'creating_quiz', 'in_progress', 95, 'Creating quiz questions...');

      const quiz = await this.generateQuiz(content, preferences);
      stats.stepTimes.creating_quiz = Date.now() - quizStepStart;
      stats.apiCalls++;

      this.updateProgress(options.onProgress, 'creating_quiz', 'completed', 98, 'Quiz created');

      // Step 7: Finalize
      this.updateProgress(options.onProgress, 'finalizing', 'in_progress', 99, 'Finalizing materials...');

      const materials: GeneratedMaterials = {
        summary,
        adaptedContent,
        mindMap,
        audioLesson,
        quiz,
        processingTime: Date.now() - startTime,
        generatedAt: new Date(),
        version: '1.0.0'
      };

      stats.totalTime = Date.now() - startTime;

      this.updateProgress(options.onProgress, 'finalizing', 'completed', 100, 'Learning materials ready!');

      return {
        success: true,
        materials,
        stats
      };

    } catch (error) {
      console.error('Content processing error:', error);

      const errorMessage = error instanceof Error ? error.message : 'Unknown processing error';

      if (options.onProgress) {
        this.updateProgress(options.onProgress, 'error', 'error', 0, errorMessage);
      }

      return {
        success: false,
        error: errorMessage,
        stats: {
          ...stats,
          totalTime: Date.now() - startTime
        }
      };
    }
  }

  /**
   * Generate summary using Chrome AI
   */
  private async generateSummary(content: string, preferences: UserPreferences) {
    const summaryText = await chromeAIService.summarize(content, {
      type: 'key-points',
      format: 'plain-text',
      length: 'medium',
      context: `Create a summary for a ${preferences.gradeLevel} grade student interested in ${preferences.interest}`
    });

    return {
      text: summaryText,
      keyPoints: this.extractKeyPoints(summaryText),
      wordCount: summaryText.split(/\s+/).length,
      type: 'key-points' as const,
      metadata: {
        generatedAt: new Date(),
        processingTime: 1000, // Will be updated by caller
        gradeLevel: preferences.gradeLevel,
        interest: preferences.interest
      }
    };
  }

  /**
   * Adapt content for specific grade level and interest
   */
  private async adaptContentForGrade(content: string, preferences: UserPreferences) {
    const gradeInfo = GRADE_LEVEL_INFO[preferences.gradeLevel];
    const interestInfo = INTEREST_INFO[preferences.interest];

    const adaptationPrompt = this.buildAdaptationPrompt(content, gradeInfo, interestInfo);

    const adaptedText = await chromeAIService.rewrite(content, {
      tone: gradeInfo.complexity === 'elementary' ? 'more-casual' : 'as-is',
      format: 'plain-text',
      context: adaptationPrompt
    });

    return {
      text: adaptedText,
      originalLength: content.length,
      adaptedLength: adaptedText.length,
      adaptations: [], // Could be enhanced to track specific changes
      gradeLevel: preferences.gradeLevel,
      interest: preferences.interest,
      metadata: {
        generatedAt: new Date(),
        processingTime: 1500, // Will be updated by caller
        gradeLevel: preferences.gradeLevel,
        interest: preferences.interest
      }
    };
  }

  /**
   * Generate mind map structure
   */
  private async generateMindMap(content: string, preferences: UserPreferences) {
    const mindMapPrompt = `Extract key concepts from this content and organize them as a mind map structure.
    Create a JSON response with main topics, subtopics, and relationships.
    Adapt for ${preferences.gradeLevel} grade level with ${preferences.interest} examples.

    Content: ${content.substring(0, 2000)}...`;

    const mindMapResponse = await chromeAIService.write(mindMapPrompt, {
      tone: 'neutral',
      format: 'plain-text'
    });

    // Parse the response and create mind map structure
    const concepts = this.extractConcepts(content);

    return {
      nodes: concepts.map((concept, index) => ({
        id: `node_${index}`,
        label: concept,
        description: `Key concept: ${concept}`,
        level: index === 0 ? 0 : 1,
        category: index === 0 ? 'main_topic' as const : 'subtopic' as const,
        importance: index === 0 ? 10 : Math.max(5, 10 - index)
      })),
      edges: concepts.slice(1).map((_, index) => ({
        id: `edge_${index}`,
        sourceId: 'node_0',
        targetId: `node_${index + 1}`,
        relationship: 'contains',
        weight: 8,
        type: 'hierarchical' as const
      })),
      rootNodeId: 'node_0',
      layout: {
        width: 800,
        height: 600,
        centerX: 400,
        centerY: 300
      },
      metadata: {
        generatedAt: new Date(),
        processingTime: 800, // Will be updated by caller
        gradeLevel: preferences.gradeLevel,
        interest: preferences.interest
      }
    };
  }

  /**
   * Generate audio lesson data
   */
  private async generateAudioLesson(adaptedText: string, preferences: UserPreferences) {
    // For now, we'll create audio metadata without actual TTS
    // This could be enhanced with Web Speech API integration

    const words = adaptedText.split(/\s+/);
    const estimatedDuration = Math.ceil(words.length / 3); // ~3 words per second

    return {
      text: adaptedText,
      duration: estimatedDuration,
      speed: 1.0,
      language: 'en',
      segments: this.createAudioSegments(adaptedText, estimatedDuration),
      metadata: {
        generatedAt: new Date(),
        processingTime: 500, // Will be updated by caller
        gradeLevel: preferences.gradeLevel,
        interest: preferences.interest
      }
    };
  }

  /**
   * Generate quiz questions
   */
  private async generateQuiz(content: string, preferences: UserPreferences) {
    const gradeInfo = GRADE_LEVEL_INFO[preferences.gradeLevel];
    const difficulty = this.mapGradeToDifficulty(preferences.gradeLevel);

    const quizPrompt = `Create 3-5 multiple choice questions about this content for ${gradeInfo.displayName} students.
    Use ${preferences.interest} examples where relevant.
    Make questions ${difficulty} difficulty level.

    Content: ${content.substring(0, 1500)}...`;

    const quizResponse = await chromeAIService.write(quizPrompt, {
      tone: 'neutral',
      format: 'plain-text'
    });

    // Parse quiz response and create structured questions
    const questions = this.parseQuizQuestions(quizResponse, difficulty);

    return {
      id: `quiz_${Date.now()}`,
      title: 'Learning Assessment',
      questions,
      totalPoints: questions.reduce((sum, q) => sum + q.points, 0),
      timeEstimate: Math.max(3, questions.length * 2),
      difficulty: preferences.gradeLevel,
      metadata: {
        generatedAt: new Date(),
        processingTime: 1200, // Will be updated by caller
        gradeLevel: preferences.gradeLevel,
        interest: preferences.interest
      }
    };
  }

  /**
   * Build adaptation prompt for content rewriting
   */
  private buildAdaptationPrompt(content: string, gradeInfo: typeof GRADE_LEVEL_INFO[keyof typeof GRADE_LEVEL_INFO], interestInfo: typeof INTEREST_INFO[keyof typeof INTEREST_INFO]): string {
    return `Rewrite this content for ${gradeInfo.displayName} students (${gradeInfo.ageRange}).
    Use vocabulary appropriate for ${gradeInfo.complexity} level.
    Include analogies and examples from ${interestInfo.displayName} (${interestInfo.description}).
    Keep the core information but make it more accessible and engaging.
    Example analogies to use: ${interestInfo.analogyExamples.slice(0, 2).join(', ')}`;
  }

  /**
   * Extract key points from summary text
   */
  private extractKeyPoints(summaryText: string): string[] {
    const lines = summaryText.split('\n');
    return lines
      .filter(line => line.trim().startsWith('-') || line.trim().startsWith('•'))
      .map(line => line.replace(/^[-•]\s*/, '').trim())
      .filter(point => point.length > 0);
  }

  /**
   * Extract main concepts from content
   */
  private extractConcepts(content: string): string[] {
    // Simple concept extraction - could be enhanced with NLP
    const words = content.toLowerCase().split(/\s+/);
    const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those']);

    const wordFreq = new Map<string, number>();
    words.forEach(word => {
      const cleanWord = word.replace(/[^\w]/g, '');
      if (cleanWord.length > 3 && !commonWords.has(cleanWord)) {
        wordFreq.set(cleanWord, (wordFreq.get(cleanWord) || 0) + 1);
      }
    });

    return Array.from(wordFreq.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8)
      .map(([word]) => word.charAt(0).toUpperCase() + word.slice(1));
  }

  /**
   * Create audio segments for text
   */
  private createAudioSegments(text: string, totalDuration: number) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const segmentDuration = totalDuration / sentences.length;

    return sentences.map((sentence, index) => ({
      id: `segment_${index}`,
      text: sentence.trim(),
      startTime: index * segmentDuration,
      endTime: (index + 1) * segmentDuration,
      isPlaying: false,
      speed: 1.0
    }));
  }

  /**
   * Map grade level to quiz difficulty
   */
  private mapGradeToDifficulty(gradeLevel: GradeLevel): 'easy' | 'medium' | 'hard' {
    const gradeInfo = GRADE_LEVEL_INFO[gradeLevel];

    switch (gradeInfo.complexity) {
      case 'elementary': return 'easy';
      case 'middle': return 'medium';
      case 'high':
      case 'college': return 'hard';
      default: return 'medium';
    }
  }

  /**
   * Parse quiz questions from AI response
   */
  private parseQuizQuestions(response: string, difficulty: 'easy' | 'medium' | 'hard') {
    // Simple quiz parsing - could be enhanced with better parsing
    const basePoints = difficulty === 'easy' ? 2 : difficulty === 'medium' ? 3 : 4;

    // Create sample questions (in real implementation, parse the AI response)
    return Array.from({ length: 3 }, (_, index) => ({
      id: `question_${index + 1}`,
      type: 'multiple_choice' as const,
      question: `Sample question ${index + 1} based on the content`,
      options: [
        { id: 'a', text: 'Option A', isCorrect: index === 0, explanation: 'Explanation for option A' },
        { id: 'b', text: 'Option B', isCorrect: index === 1, explanation: 'Explanation for option B' },
        { id: 'c', text: 'Option C', isCorrect: index === 2, explanation: 'Explanation for option C' },
        { id: 'd', text: 'Option D', isCorrect: false, explanation: 'Explanation for option D' }
      ],
      correctAnswer: ['a', 'b', 'c'][index] || 'a',
      explanation: `This is the explanation for question ${index + 1}`,
      points: basePoints,
      category: 'comprehension',
      difficulty,
      timeLimit: 60
    }));
  }

  /**
   * Update progress callback
   */
  private updateProgress(
    onProgress: ((progress: GenerationProgress) => void) | undefined,
    step: string,
    status: 'pending' | 'in_progress' | 'completed' | 'error',
    progress: number,
    message?: string
  ) {
    if (onProgress) {
      onProgress({
        step,
        status,
        progress,
        message,
        startTime: status === 'in_progress' ? new Date() : undefined,
        endTime: status === 'completed' || status === 'error' ? new Date() : undefined
      });
    }
  }

  /**
   * Abort current processing
   */
  public abort() {
    this.abortController?.abort();
  }
}

// Export singleton instance
export const contentProcessor = new ContentProcessor();