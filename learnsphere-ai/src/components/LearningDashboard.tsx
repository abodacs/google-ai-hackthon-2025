'use client';

/**
 * Learning Dashboard Component
 * Main dashboard for displaying generated learning materials
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GeneratedMaterials } from '@/types/generated-materials';
import { LearningSession } from '@/types/learning-session';
import { GRADE_LEVEL_INFO, INTEREST_INFO } from '@/types/user-preferences';

interface LearningDashboardProps {
  session: LearningSession;
  materials: GeneratedMaterials;
  onSaveSession?: () => Promise<void> | void;
  onShareSession?: () => Promise<void> | void;
  onDownloadSession?: () => Promise<void> | void;
  className?: string;
}

interface TabConfig {
  id: string;
  label: string;
  icon: string;
  description: string;
}

const DASHBOARD_TABS: TabConfig[] = [
  {
    id: 'summary',
    label: 'Summary',
    icon: '📝',
    description: 'Key points and overview'
  },
  {
    id: 'adapted',
    label: 'Immersive Text',
    icon: '📖',
    description: 'Content adapted for your level'
  },
  {
    id: 'mindmap',
    label: 'Mind Map',
    icon: '🧠',
    description: 'Visual concept overview'
  },
  {
    id: 'audio',
    label: 'Audio Lesson',
    icon: '🎧',
    description: 'Listen to your content'
  },
  {
    id: 'quiz',
    label: 'Quiz',
    icon: '📋',
    description: 'Test your understanding'
  }
];

export function LearningDashboard({
  session,
  materials,
  onSaveSession,
  onShareSession,
  onDownloadSession,
  className = ""
}: LearningDashboardProps) {
  const [activeTab, setActiveTab] = useState('summary');
  const [isSaving, setIsSaving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const gradeInfo = GRADE_LEVEL_INFO[session.preferences.gradeLevel];
  const interestInfo = INTEREST_INFO[session.preferences.interest];

  const handleSaveSession = useCallback(async () => {
    if (!onSaveSession) return;

    setIsSaving(true);
    try {
      await Promise.resolve(onSaveSession());
    } finally {
      setIsSaving(false);
    }
  }, [onSaveSession]);

  const handleShareSession = useCallback(async () => {
    if (!onShareSession) return;

    setIsSharing(true);
    try {
      await Promise.resolve(onShareSession());
    } finally {
      setIsSharing(false);
    }
  }, [onShareSession]);

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const renderTabContent = (tabId: string) => {
    switch (tabId) {
      case 'summary':
        return (
          <div data-testid="summary-content" className="space-y-4">
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed">
                {materials.summary.text}
              </p>
            </div>

            {materials.summary.keyPoints.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-3">Key Points</h4>
                <ul className="space-y-2">
                  {materials.summary.keyPoints.map((point, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span className="text-gray-700">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="text-sm text-gray-500 pt-4 border-t">
              <p>Summary contains {materials.summary.wordCount} words</p>
            </div>
          </div>
        );

      case 'adapted':
        return (
          <div data-testid="adapted-content" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Badge className="bg-blue-100 text-blue-800">
                Adapted for {gradeInfo.displayName}
              </Badge>
              <Badge variant="secondary">
                {interestInfo.displayName} Examples
              </Badge>
            </div>

            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed">
                {materials.adaptedContent.text}
              </p>
            </div>

            <div className="text-sm text-gray-500 pt-4 border-t">
              <p>
                Adapted from {materials.adaptedContent.originalLength} to {materials.adaptedContent.adaptedLength} characters
              </p>
            </div>
          </div>
        );

      case 'mindmap':
        return (
          <div data-testid="mindmap-container" className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-6 min-h-[400px] flex flex-col items-center justify-center">
              <div className="text-center space-y-4">
                <div className="text-4xl">🧠</div>
                <h3 className="text-lg font-medium text-gray-900">Interactive Mind Map</h3>
                <p className="text-gray-600 max-w-md">
                  A visual representation of the key concepts would be displayed here with interactive nodes and connections.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                  {materials.mindMap.nodes.slice(0, 6).map((node) => (
                    <div
                      key={node.id}
                      data-testid="mindmap-node"
                      className="bg-white p-3 rounded-md border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <h5 className="font-medium text-sm">{node.label}</h5>
                      <p className="text-xs text-gray-600 mt-1">{node.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-500">
              <p>Mind map contains {materials.mindMap.nodes.length} concepts with {materials.mindMap.edges.length} connections</p>
            </div>
          </div>
        );

      case 'audio':
        return (
          <div data-testid="audio-player" className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Audio Lesson</h3>
                <Badge variant="secondary">
                  {Math.floor(materials.audioLesson.duration / 60)}:{String(materials.audioLesson.duration % 60).padStart(2, '0')}
                </Badge>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <button
                  data-testid="audio-play-button"
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <span>▶️</span>
                  <span>Play Audio Lesson</span>
                </button>

                <select
                  data-testid="audio-speed-control"
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                  defaultValue={materials.audioLesson.speed}
                >
                  <option value={0.5}>0.5x</option>
                  <option value={0.75}>0.75x</option>
                  <option value={1.0}>1.0x</option>
                  <option value={1.25}>1.25x</option>
                  <option value={1.5}>1.5x</option>
                  <option value={2.0}>2.0x</option>
                </select>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '0%' }}></div>
              </div>

              <p className="text-sm text-gray-600">
                Click play to start the audio lesson. The content has been optimized for audio learning.
              </p>
            </div>

            {materials.audioLesson.segments.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Audio Segments</h4>
                <div className="space-y-1">
                  {materials.audioLesson.segments.slice(0, 3).map((segment) => (
                    <div key={segment.id} className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500">{Math.floor(segment.startTime)}s</span>
                      <span className="text-gray-700">{segment.text.substring(0, 60)}...</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'quiz':
        return (
          <div data-testid="quiz-container" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">{materials.quiz.title}</h3>
                <p className="text-sm text-gray-600">
                  {materials.quiz.questions.length} questions • {materials.quiz.totalPoints} points • ~{materials.quiz.timeEstimate} minutes
                </p>
              </div>
              <Badge className="bg-purple-100 text-purple-800">
                {gradeInfo.displayName} Level
              </Badge>
            </div>

            <div className="space-y-6">
              {materials.quiz.questions.map((question, index) => (
                <div
                  key={question.id}
                  data-testid="quiz-question"
                  className="bg-gray-50 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 data-testid="question-text" className="font-medium">
                      {index + 1}. {question.question}
                    </h4>
                    <Badge variant="secondary">{question.points} pts</Badge>
                  </div>

                  <div className="space-y-2">
                    {question.options.map((option) => (
                      <label
                        key={option.id}
                        data-testid="quiz-option"
                        className="flex items-center gap-3 p-2 rounded border hover:bg-white transition-colors cursor-pointer"
                      >
                        <input
                          type="radio"
                          name={`question_${question.id}`}
                          value={option.id}
                          className="text-blue-600"
                        />
                        <span>{option.text}</span>
                      </label>
                    ))}
                  </div>

                  <button
                    data-testid="submit-answer"
                    className="mt-3 px-4 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Submit Answer
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="font-medium text-blue-900 mb-2">Quiz Instructions</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Select one answer for each question</li>
                <li>• Submit each answer to see immediate feedback</li>
                <li>• Questions are adapted for your {gradeInfo.displayName} level</li>
                <li>• Use your {interestInfo.displayName} knowledge to help with analogies</li>
              </ul>
            </div>
          </div>
        );

      default:
        return <div>Content not found</div>;
    }
  };

  return (
    <div className={`space-y-6 ${className}`} data-testid="learning-dashboard">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Learning Dashboard</h1>
          <p className="text-gray-600 mt-1">{session.title}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge>{gradeInfo.displayName}</Badge>
            <Badge variant="secondary">{interestInfo.displayName}</Badge>
            <span className="text-sm text-gray-500">
              • Processed in {formatDuration(materials.processingTime)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {onSaveSession && (
            <button
              data-testid="save-session-button"
              onClick={handleSaveSession}
              disabled={isSaving}
              className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : '💾 Save'}
            </button>
          )}

          {onShareSession && (
            <button
              data-testid="share-session-button"
              onClick={handleShareSession}
              disabled={isSharing}
              className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              {isSharing ? 'Sharing...' : '🔗 Share'}
            </button>
          )}

          {onDownloadSession && (
            <button
              data-testid="download-session-button"
              onClick={onDownloadSession}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              📥 Download
            </button>
          )}
        </div>
      </div>

      {/* Content Metadata */}
      <div data-testid="content-metadata" className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-sm text-gray-600">Content Length</div>
          <div className="font-medium">{session.sourceContent.wordCount} words</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-sm text-gray-600">Reading Time</div>
          <div className="font-medium">~{session.sourceContent.validation.estimatedReadingTime} min</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-sm text-gray-600">Processing Time</div>
          <div className="font-medium">{formatDuration(materials.processingTime)}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-sm text-gray-600">Generated</div>
          <div className="font-medium">{materials.generatedAt.toLocaleDateString()}</div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 w-full">
          {DASHBOARD_TABS.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              data-testid={`${tab.id}-tab`}
              className="flex flex-col items-center gap-1 py-3"
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="text-xs font-medium">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {DASHBOARD_TABS.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{tab.icon}</span>
                  <div>
                    <CardTitle>{tab.label}</CardTitle>
                    <p className="text-sm text-muted-foreground">{tab.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {renderTabContent(tab.id)}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Progress Indicator */}
      <div data-testid="completion-progress" className="text-center text-sm text-gray-500">
        Learning materials are 100% complete • Ready for study
      </div>
    </div>
  );
}