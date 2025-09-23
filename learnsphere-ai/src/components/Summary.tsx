'use client';

/**
 * Summary Component
 * Displays summarized content with key points and metadata
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SummaryContent } from '@/types/generated-materials';
import { GRADE_LEVEL_INFO, INTEREST_INFO } from '@/types/user-preferences';

interface SummaryProps {
  summary: SummaryContent;
  originalWordCount?: number;
  showMetadata?: boolean;
  expandable?: boolean;
  className?: string;
}

type SummaryDisplayMode = 'overview' | 'detailed' | 'keypoints';

export function Summary({
  summary,
  originalWordCount,
  showMetadata = true,
  expandable = true,
  className = ""
}: SummaryProps) {
  const [displayMode, setDisplayMode] = useState<SummaryDisplayMode>('overview');
  const [isExpanded, setIsExpanded] = useState(false);

  const gradeInfo = GRADE_LEVEL_INFO[summary.metadata.gradeLevel];
  const interestInfo = INTEREST_INFO[summary.metadata.interest];

  const summaryStats = useMemo(() => {
    const compressionRatio = originalWordCount
      ? ((originalWordCount - summary.wordCount) / originalWordCount * 100).toFixed(1)
      : '0';

    const sentences = summary.text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgWordsPerSentence = summary.wordCount / Math.max(sentences.length, 1);

    return {
      compressionRatio: parseFloat(compressionRatio),
      sentenceCount: sentences.length,
      avgWordsPerSentence: avgWordsPerSentence.toFixed(1),
      readingTime: Math.ceil(summary.wordCount / 200),
      efficiency: summary.keyPoints.length > 0 ? 'High' : 'Medium'
    };
  }, [summary, originalWordCount]);

  const getSummaryTypeInfo = (type: string) => {
    switch (type) {
      case 'key-points':
        return {
          icon: '📝',
          label: 'Key Points',
          description: 'Main concepts and important details'
        };
      case 'tldr':
        return {
          icon: '⚡',
          label: 'TL;DR',
          description: 'Quick overview and essential information'
        };
      case 'teaser':
        return {
          icon: '🎯',
          label: 'Teaser',
          description: 'Engaging preview of the content'
        };
      case 'headline':
        return {
          icon: '📰',
          label: 'Headline',
          description: 'Concise title and main points'
        };
      default:
        return {
          icon: '📄',
          label: 'Summary',
          description: 'Content overview'
        };
    }
  };

  const typeInfo = getSummaryTypeInfo(summary.type);

  const renderContent = () => {
    switch (displayMode) {
      case 'keypoints':
        return (
          <div className="space-y-4">
            {summary.keyPoints.length > 0 ? (
              <ul className="space-y-3">
                {summary.keyPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center mt-1">
                      {index + 1}
                    </span>
                    <span className="text-gray-700 leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-2xl mb-2">📝</div>
                <p>No specific key points were extracted from this summary.</p>
                <p className="text-sm mt-1">The main content contains the essential information.</p>
              </div>
            )}
          </div>
        );

      case 'detailed':
        return (
          <div className="space-y-4">
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed">{summary.text}</p>
            </div>

            {summary.keyPoints.length > 0 && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h5 className="font-medium text-blue-900 mb-3">Key Takeaways</h5>
                <ul className="space-y-2">
                  {summary.keyPoints.map((point, index) => (
                    <li key={index} className="flex items-start gap-2 text-blue-800">
                      <span className="text-blue-600 mt-1">▸</span>
                      <span className="text-sm">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );

      case 'overview':
      default:
        const maxLength = isExpanded ? summary.text.length : 300;
        const displayText = summary.text.length > maxLength
          ? summary.text.substring(0, maxLength) + '...'
          : summary.text;

        return (
          <div className="space-y-4">
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed">{displayText}</p>
            </div>

            {summary.text.length > 300 && expandable && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                {isExpanded ? 'Show less' : 'Read more'}
              </button>
            )}

            {summary.keyPoints.length > 0 && (
              <div className="mt-4">
                <button
                  onClick={() => setDisplayMode('keypoints')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View {summary.keyPoints.length} key points →
                </button>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with Type and Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{typeInfo.icon}</span>
          <div>
            <h3 className="text-lg font-medium">{typeInfo.label}</h3>
            <p className="text-sm text-gray-600">{typeInfo.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge className="bg-green-100 text-green-800">
            {summary.wordCount} words
          </Badge>
          {originalWordCount && (
            <Badge variant="secondary">
              {summaryStats.compressionRatio}% shorter
            </Badge>
          )}
        </div>
      </div>

      {/* Display Mode Selector */}
      <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg w-fit">
        <button
          onClick={() => setDisplayMode('overview')}
          className={`px-3 py-1 text-sm rounded-md transition-colors ${
            displayMode === 'overview'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Overview
        </button>
        {summary.keyPoints.length > 0 && (
          <button
            onClick={() => setDisplayMode('keypoints')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              displayMode === 'keypoints'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Key Points ({summary.keyPoints.length})
          </button>
        )}
        <button
          onClick={() => setDisplayMode('detailed')}
          className={`px-3 py-1 text-sm rounded-md transition-colors ${
            displayMode === 'detailed'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Detailed
        </button>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">
              {displayMode === 'keypoints' ? 'Key Points' :
               displayMode === 'detailed' ? 'Complete Summary' : 'Summary Overview'}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{gradeInfo.displayName}</Badge>
              <Badge variant="outline">{interestInfo.displayName}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      {showMetadata && (
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="text-sm">Summary Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-600">
                  {summaryStats.readingTime}m
                </div>
                <div className="text-xs text-gray-600">Reading Time</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600">
                  {summaryStats.compressionRatio}%
                </div>
                <div className="text-xs text-gray-600">Compression</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-purple-600">
                  {summaryStats.sentenceCount}
                </div>
                <div className="text-xs text-gray-600">Sentences</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-orange-600">
                  {summaryStats.avgWordsPerSentence}
                </div>
                <div className="text-xs text-gray-600">Avg Words/Sentence</div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Summary Quality:</span>
                <Badge
                  className={
                    summaryStats.efficiency === 'High'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }
                >
                  {summaryStats.efficiency}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-600">Generated:</span>
                <span className="text-gray-700">
                  {summary.metadata.generatedAt.toLocaleDateString()} at{' '}
                  {summary.metadata.generatedAt.toLocaleTimeString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-600">Processing Time:</span>
                <span className="text-gray-700">
                  {(summary.metadata.processingTime / 1000).toFixed(1)}s
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Helpful Actions */}
      <div className="flex items-center gap-2 pt-2">
        <button className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 border border-blue-200 rounded-md hover:bg-blue-50">
          📋 Copy Summary
        </button>
        <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-700 border border-gray-200 rounded-md hover:bg-gray-50">
          📤 Share
        </button>
        <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-700 border border-gray-200 rounded-md hover:bg-gray-50">
          💾 Save
        </button>
      </div>
    </div>
  );
}