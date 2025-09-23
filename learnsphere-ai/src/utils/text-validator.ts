/**
 * Text Content Validator
 * Validates and analyzes text content for processing
 */

import {
  ContentValidation,
  ContentValidationRules,
  ContentLimits,
  DEFAULT_CONTENT_LIMITS,
  TextStatistics
} from '@/types/text-content';

export class TextValidator {
  private rules: ContentValidationRules;

  constructor(rules?: Partial<ContentValidationRules>) {
    this.rules = {
      limits: DEFAULT_CONTENT_LIMITS,
      allowEmptyLines: true,
      requireAlphanumeric: true,
      forbiddenPatterns: [
        /^\s*$/, // Only whitespace
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, // Script tags
        /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi // Iframe tags
      ],
      requiredLanguages: ['en'],
      ...rules
    };
  }

  /**
   * Validate text content according to rules
   */
  public validate(content: string): ContentValidation {
    const stats = this.getTextStatistics(content);
    const errors: string[] = [];
    const warnings: string[] = [];

    // Length validations
    const lengthValidation = this.validateLength(content, stats);
    errors.push(...lengthValidation.errors);
    warnings.push(...lengthValidation.warnings);

    // Content quality validations
    const qualityValidation = this.validateQuality(content);
    errors.push(...qualityValidation.errors);
    warnings.push(...qualityValidation.warnings);

    // Security validations
    const securityValidation = this.validateSecurity(content);
    errors.push(...securityValidation.errors);
    warnings.push(...securityValidation.warnings);

    // Structure validations
    const structureValidation = this.validateStructure(content, stats);
    warnings.push(...structureValidation.warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      wordCount: stats.words,
      characterCount: stats.characters,
      estimatedReadingTime: stats.readingTime
    };
  }

  /**
   * Get comprehensive text statistics
   */
  public getTextStatistics(text: string): TextStatistics {
    const trimmedText = text.trim();

    if (trimmedText === '') {
      return {
        words: 0,
        characters: 0,
        charactersNoSpaces: 0,
        sentences: 0,
        paragraphs: 0,
        averageWordsPerSentence: 0,
        readingTime: 0,
        complexity: 'simple'
      };
    }

    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;
    const words = this.countWords(trimmedText);
    const sentences = this.countSentences(trimmedText);
    const paragraphs = this.countParagraphs(trimmedText);
    const averageWordsPerSentence = sentences > 0 ? words / sentences : 0;
    const readingTime = Math.ceil(words / 200); // 200 words per minute
    const complexity = this.determineComplexity(trimmedText, averageWordsPerSentence);

    return {
      words,
      characters,
      charactersNoSpaces,
      sentences,
      paragraphs,
      averageWordsPerSentence,
      readingTime,
      complexity
    };
  }

  /**
   * Validate content length against limits
   */
  private validateLength(content: string, stats: TextStatistics): { errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const { limits } = this.rules;

    // Character limits
    if (stats.characters < limits.minCharacters) {
      errors.push(`Content must be at least ${limits.minCharacters} characters long (currently ${stats.characters})`);
    }

    if (stats.characters > limits.maxCharacters) {
      errors.push(`Content must not exceed ${limits.maxCharacters} characters (currently ${stats.characters})`);
    }

    // Word limits
    if (stats.words < limits.minWords) {
      errors.push(`Content must contain at least ${limits.minWords} words (currently ${stats.words})`);
    }

    if (stats.words > limits.maxWords) {
      errors.push(`Content must not exceed ${limits.maxWords} words (currently ${stats.words})`);
    }

    // Sentence limits
    if (limits.maxSentences && stats.sentences > limits.maxSentences) {
      warnings.push(`Very long content with ${stats.sentences} sentences may take longer to process`);
    }

    // Warning thresholds
    if (stats.characters > 0 && stats.characters < 100) {
      warnings.push('Very short content may result in limited learning materials');
    }

    if (stats.characters > limits.maxCharacters * 0.8) {
      warnings.push('Content is approaching the maximum length limit');
    }

    return { errors, warnings };
  }

  /**
   * Validate content quality and structure
   */
  private validateQuality(content: string): { errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Require alphanumeric content
    if (this.rules.requireAlphanumeric && !/[a-zA-Z0-9]/.test(content)) {
      errors.push('Content must contain alphanumeric characters');
    }

    // Check for meaningful content
    if (content.trim().length > 0) {
      const meaningfulChars = content.replace(/[^a-zA-Z0-9]/g, '').length;
      const totalChars = content.length;

      if (meaningfulChars / totalChars < 0.3) {
        warnings.push('Content appears to contain mostly non-alphanumeric characters');
      }
    }

    // Check for repetitive content
    const words = content.toLowerCase().split(/\s+/);
    const uniqueWords = new Set(words);
    if (words.length > 10 && uniqueWords.size / words.length < 0.3) {
      warnings.push('Content appears to be very repetitive');
    }

    // Check for unusual formatting
    const consecutiveSpaces = /\s{5,}/.test(content);
    const consecutiveNewlines = /\n{5,}/.test(content);

    if (consecutiveSpaces || consecutiveNewlines) {
      warnings.push('Content contains unusual spacing or formatting');
    }

    return { errors, warnings };
  }

  /**
   * Validate content security (check for potentially harmful content)
   */
  private validateSecurity(content: string): { errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check forbidden patterns
    if (this.rules.forbiddenPatterns) {
      for (const pattern of this.rules.forbiddenPatterns) {
        if (pattern.test(content)) {
          errors.push('Content contains forbidden patterns or potentially unsafe elements');
          break;
        }
      }
    }

    // Check for potential code injection
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /data:text\/html/i,
      /vbscript:/i
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(content)) {
        warnings.push('Content may contain code or script elements');
        break;
      }
    }

    return { errors, warnings };
  }

  /**
   * Validate content structure and readability
   */
  private validateStructure(content: string, stats: TextStatistics): { warnings: string[] } {
    const warnings: string[] = [];

    // Check sentence length
    if (stats.averageWordsPerSentence > 30) {
      warnings.push('Very long sentences may be difficult to process');
    }

    if (stats.averageWordsPerSentence < 5 && stats.sentences > 5) {
      warnings.push('Very short sentences may indicate fragmented content');
    }

    // Check paragraph structure
    if (stats.paragraphs === 1 && stats.words > 200) {
      warnings.push('Consider breaking long content into paragraphs for better processing');
    }

    // Check complexity
    if (stats.complexity === 'complex') {
      warnings.push('Complex content may require higher grade levels for optimal adaptation');
    }

    return { warnings };
  }

  /**
   * Count words in text
   */
  private countWords(text: string): number {
    if (text.trim() === '') return 0;
    return text.trim().split(/\s+/).length;
  }

  /**
   * Count sentences in text
   */
  private countSentences(text: string): number {
    if (text.trim() === '') return 0;
    // Simple sentence counting based on sentence-ending punctuation
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    return Math.max(1, sentences.length);
  }

  /**
   * Count paragraphs in text
   */
  private countParagraphs(text: string): number {
    if (text.trim() === '') return 0;
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    return Math.max(1, paragraphs.length);
  }

  /**
   * Determine content complexity
   */
  private determineComplexity(text: string, averageWordsPerSentence: number): string {
    // Simple complexity analysis based on various factors
    let complexityScore = 0;

    // Sentence length factor
    if (averageWordsPerSentence > 20) complexityScore += 2;
    else if (averageWordsPerSentence > 15) complexityScore += 1;

    // Vocabulary complexity (simple check for longer words)
    const words = text.split(/\s+/);
    const longWords = words.filter(word => word.length > 6).length;
    const longWordRatio = longWords / words.length;

    if (longWordRatio > 0.3) complexityScore += 2;
    else if (longWordRatio > 0.2) complexityScore += 1;

    // Technical terms or complex punctuation
    if (/[();:]/.test(text)) complexityScore += 1;
    if (/\b(however|therefore|consequently|furthermore|moreover)\b/i.test(text)) complexityScore += 1;

    if (complexityScore >= 4) return 'complex';
    if (complexityScore >= 2) return 'moderate';
    return 'simple';
  }

  /**
   * Check if content is suitable for a specific grade level
   */
  public checkGradeSuitability(content: string, gradeLevel: string): {
    suitable: boolean;
    recommendations: string[];
  } {
    const stats = this.getTextStatistics(content);
    const recommendations: string[] = [];
    let suitable = true;

    const gradeNum = gradeLevel === 'undergrad' ? 13 : parseInt(gradeLevel);

    // Grade-specific checks
    if (gradeNum <= 5) { // Elementary
      if (stats.averageWordsPerSentence > 15) {
        suitable = false;
        recommendations.push('Consider shorter sentences for elementary grade levels');
      }
      if (stats.complexity === 'complex') {
        suitable = false;
        recommendations.push('Content complexity may be too high for elementary students');
      }
    } else if (gradeNum <= 8) { // Middle school
      if (stats.averageWordsPerSentence > 20) {
        recommendations.push('Consider simplifying sentence structure for middle school level');
      }
    } else if (gradeNum <= 12) { // High school
      if (stats.averageWordsPerSentence > 30) {
        recommendations.push('Very complex sentences may be challenging even for high school level');
      }
    }

    return { suitable, recommendations };
  }

  /**
   * Suggest improvements for content
   */
  public suggestImprovements(content: string): string[] {
    const stats = this.getTextStatistics(content);
    const suggestions: string[] = [];

    if (stats.words < 50) {
      suggestions.push('Add more detail to create richer learning materials');
    }

    if (stats.paragraphs === 1 && stats.words > 100) {
      suggestions.push('Break content into multiple paragraphs for better organization');
    }

    if (stats.averageWordsPerSentence > 25) {
      suggestions.push('Consider breaking up long sentences for better readability');
    }

    if (stats.complexity === 'simple' && stats.words > 200) {
      suggestions.push('Consider adding more detailed explanations or examples');
    }

    return suggestions;
  }
}

// Export singleton instance
export const textValidator = new TextValidator();

// Export additional utilities
export const validateText = (content: string) => textValidator.validate(content);
export const getTextStatistics = (content: string) => textValidator.getTextStatistics(content);
export const checkGradeSuitability = (content: string, gradeLevel: string) =>
  textValidator.checkGradeSuitability(content, gradeLevel);
export const suggestTextImprovements = (content: string) =>
  textValidator.suggestImprovements(content);