'use client';

/**
 * AdaptedText Component
 * Displays adapted content with grade level and interest personalization
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AdaptedContent } from '@/types/generated-materials';
import { GRADE_LEVEL_INFO, INTEREST_INFO } from '@/types/user-preferences';

interface AdaptedTextProps {
  content: AdaptedContent;
  originalText?: string;
  showComparison?: boolean;
  showMetadata?: boolean;
  className?: string;
}

interface TextStats {
  readingTime: number;
  wordCount: number;
  sentenceCount: number;
  averageWordsPerSentence: number;
  readingLevel: string;
}

export function AdaptedText({
  content,
  originalText,
  showComparison = false,
  showMetadata = true,
  className = ""
}: AdaptedTextProps) {
  const [showOriginal, setShowOriginal] = useState(false);

  const gradeInfo = GRADE_LEVEL_INFO[content.gradeLevel];
  const interestInfo = INTEREST_INFO[content.interest];

  const adaptedStats = useMemo((): TextStats => {
    return calculateTextStats(content.text);
  }, [content.text]);

  const originalStats = useMemo((): TextStats => {
    return originalText ? calculateTextStats(originalText) : adaptedStats;
  }, [originalText, adaptedStats]);

  function calculateTextStats(text: string): TextStats {
    const words = text.trim().split(/\s+/);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

    return {
      readingTime: Math.ceil(words.length / 200), // 200 words per minute
      wordCount: words.length,
      sentenceCount: sentences.length,
      averageWordsPerSentence: words.length / Math.max(sentences.length, 1),
      readingLevel: determineReadingLevel(words.length / Math.max(sentences.length, 1))
    };
  }

  function determineReadingLevel(avgWordsPerSentence: number): string {
    if (avgWordsPerSentence < 10) return 'Elementary';
    if (avgWordsPerSentence < 15) return 'Middle School';
    if (avgWordsPerSentence < 20) return 'High School';
    return 'College';
  }

  const adaptationImprovements = useMemo(() => {
    if (!originalText) return [];

    const improvements = [];

    if (content.adaptedLength < content.originalLength) {
      const reduction = ((content.originalLength - content.adaptedLength) / content.originalLength * 100).toFixed(1);
      improvements.push(`Reduced length by ${reduction}%`);
    }

    if (adaptedStats.averageWordsPerSentence < originalStats.averageWordsPerSentence) {
      improvements.push('Simplified sentence structure');
    }

    if (adaptedStats.readingLevel !== originalStats.readingLevel) {
      improvements.push(`Adjusted reading level to ${adaptedStats.readingLevel}`);
    }

    improvements.push(`Added ${interestInfo.displayName} analogies`);

    return improvements;
  }, [content, originalText, adaptedStats, originalStats, interestInfo]);

  const renderTextWithHighlights = (text: string) => {
    // Simple highlighting for interest-related terms
    const interestTerms = interestInfo.analogyExamples
      .flatMap(example => example.split(' '))
      .filter(word => word.length > 3)
      .slice(0, 5);

    let highlightedText = text;

    interestTerms.forEach(term => {
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      highlightedText = highlightedText.replace(
        regex,
        `<mark class="bg-yellow-100 px-1 rounded">${term}</mark>`
      );
    });

    return { __html: highlightedText };
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium">Personalized Content</h3>
          <Badge className="bg-blue-100 text-blue-800">
            {gradeInfo.displayName}
          </Badge>
          <Badge variant="secondary">
            {interestInfo.displayName}
          </Badge>
        </div>

        {originalText && showComparison && (
          <button
            onClick={() => setShowOriginal(!showOriginal)}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
          >
            {showOriginal ? 'Show Adapted' : 'Show Original'}
          </button>
        )}
      </div>

      {/* Content Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>📖</span>
            <span>{showOriginal ? 'Original Content' : 'Adapted Content'}</span>
          </CardTitle>
          {!showOriginal && (
            <p className="text-sm text-muted-foreground">
              Content adapted for {gradeInfo.description.toLowerCase()} with {interestInfo.displayName.toLowerCase()} examples
            </p>
          )}
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            {showOriginal ? (
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {originalText}
              </p>
            ) : (
              <div
                className="text-gray-700 leading-relaxed whitespace-pre-wrap"
                dangerouslySetInnerHTML={renderTextWithHighlights(content.text)}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Adaptation Metadata */}
      {showMetadata && !showOriginal && (
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="text-sm">Personalization Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Reading Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-600">
                  {adaptedStats.readingTime}m
                </div>
                <div className="text-xs text-gray-600">Reading Time</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600">
                  {adaptedStats.wordCount}
                </div>
                <div className="text-xs text-gray-600">Words</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-purple-600">
                  {adaptedStats.sentenceCount}
                </div>
                <div className="text-xs text-gray-600">Sentences</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-orange-600">
                  {adaptedStats.averageWordsPerSentence.toFixed(1)}
                </div>
                <div className="text-xs text-gray-600">Avg Words/Sentence</div>
              </div>
            </div>

            {/* Adaptations Made */}
            {adaptationImprovements.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-gray-900 mb-2">Adaptations Made</h5>
                <ul className="space-y-1">
                  {adaptationImprovements.map((improvement, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-green-600">✓</span>
                      <span>{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Interest Integration */}
            <div>
              <h5 className="text-sm font-medium text-gray-900 mb-2">
                {interestInfo.displayName} Integration
              </h5>
              <div className="text-sm text-gray-600">
                <p className="mb-2">{interestInfo.description}</p>
                <div className="flex flex-wrap gap-1">
                  {interestInfo.analogyExamples.slice(0, 3).map((example, index) => (
                    <span
                      key={index}
                      className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs"
                    >
                      &quot;{example}&quot;
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Reading Level Indicator */}
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-sm text-gray-600">Reading Level:</span>
              <Badge
                className={
                  adaptedStats.readingLevel === gradeInfo.complexity
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }
              >
                {adaptedStats.readingLevel}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comparison View */}
      {originalText && showComparison && !showOriginal && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Before & After Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Original Stats */}
              <div>
                <h5 className="font-medium text-gray-700 mb-2">Original</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Length:</span>
                    <span>{content.originalLength} characters</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Words:</span>
                    <span>{originalStats.wordCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Reading Level:</span>
                    <span>{originalStats.readingLevel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Sentence Length:</span>
                    <span>{originalStats.averageWordsPerSentence.toFixed(1)} words</span>
                  </div>
                </div>
              </div>

              {/* Adapted Stats */}
              <div>
                <h5 className="font-medium text-gray-700 mb-2">Adapted</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Length:</span>
                    <span className="text-green-600">{content.adaptedLength} characters</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Words:</span>
                    <span className="text-green-600">{adaptedStats.wordCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Reading Level:</span>
                    <span className="text-green-600">{adaptedStats.readingLevel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Sentence Length:</span>
                    <span className="text-green-600">{adaptedStats.averageWordsPerSentence.toFixed(1)} words</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}