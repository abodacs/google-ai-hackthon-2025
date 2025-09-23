'use client';

/**
 * Main App Component for LearnSphere AI
 * Handles the complete learning experience flow
 */

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GradeLevel, Interest, UserPreferences } from '@/types/user-preferences';
import { LearningSession, SessionStatus } from '@/types/learning-session';
import { GeneratedMaterials } from '@/types/generated-materials';
import { ContentType } from '@/types/text-content';
import { chromeAIService } from '@/features/ai-playground/services/chrome-ai.service';

interface AppState {
  currentStep: 'input' | 'preferences' | 'processing' | 'dashboard';
  content: string;
  preferences?: UserPreferences;
  session?: LearningSession;
  materials?: GeneratedMaterials;
  error?: string;
  isProcessing: boolean;
}

export function App() {
  const [state, setState] = useState<AppState>({
    currentStep: 'input',
    content: '',
    isProcessing: false
  });

  const [apiSupport, setApiSupport] = useState<{
    supported: boolean;
    capabilities?: unknown;
  }>({ supported: false });

  React.useEffect(() => {
    // Check Chrome AI support on mount
    const checkSupport = async () => {
      const supported = chromeAIService.isSupported();
      if (supported) {
        const capabilities = await chromeAIService.checkCapabilities();
        setApiSupport({ supported: true, capabilities });
      } else {
        setApiSupport({ supported: false });
      }
    };

    checkSupport();
  }, []);

  const handleContentInput = useCallback((content: string) => {
    setState(prev => ({
      ...prev,
      content,
      currentStep: content.length >= 50 ? 'preferences' : 'input'
    }));
  }, []);

  const processContent = useCallback(async (content: string, preferences: UserPreferences) => {
    setState(prev => ({ ...prev, isProcessing: true, error: undefined }));

    try {
      // Create session
      const sessionId = `session_${Date.now()}`;
      const session: LearningSession = {
        id: sessionId,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: SessionStatus.PROCESSING,
        title: generateTitle(content),
        sourceContent: {
          type: ContentType.TEXT,
          text: content,
          wordCount: content.split(/\s+/).length,
          characterCount: content.length,
          validation: {
            isValid: true,
            errors: [],
            warnings: [],
            wordCount: content.split(/\s+/).length,
            characterCount: content.length,
            estimatedReadingTime: Math.ceil(content.split(/\s+/).length / 200)
          },
          metadata: {
            createdAt: new Date(),
            lastModified: new Date(),
            source: 'user_input',
            complexity: 'moderate'
          }
        },
        preferences,
        metadata: {
          version: '1.0.0',
          processingSteps: [],
          errors: []
        }
      };

      setState(prev => ({ ...prev, session }));

      // Process content with Chrome AI
      const summary = await chromeAIService.summarize(content, {
        type: 'key-points',
        format: 'plain-text',
        length: 'medium'
      });

      const adaptedContent = await chromeAIService.rewrite(content, {
        tone: 'more-casual',
        format: 'plain-text',
        context: `Adapt this for ${preferences.gradeLevel} grade level student interested in ${preferences.interest}`
      });

      // Create generated materials
      const materials: GeneratedMaterials = {
        summary: {
          text: summary,
          keyPoints: summary.split('\n').filter(line => line.trim().startsWith('-')),
          wordCount: summary.split(/\s+/).length,
          type: 'key-points',
          metadata: {
            generatedAt: new Date(),
            processingTime: 1000,
            gradeLevel: preferences.gradeLevel,
            interest: preferences.interest
          }
        },
        adaptedContent: {
          text: adaptedContent,
          originalLength: content.length,
          adaptedLength: adaptedContent.length,
          adaptations: [],
          gradeLevel: preferences.gradeLevel,
          interest: preferences.interest,
          metadata: {
            generatedAt: new Date(),
            processingTime: 1500,
            gradeLevel: preferences.gradeLevel,
            interest: preferences.interest
          }
        },
        mindMap: {
          nodes: [
            {
              id: 'root',
              label: 'Main Topic',
              description: 'Central concept',
              level: 0,
              category: 'main_topic',
              importance: 10
            }
          ],
          edges: [],
          rootNodeId: 'root',
          layout: { width: 800, height: 600, centerX: 400, centerY: 300 },
          metadata: {
            generatedAt: new Date(),
            processingTime: 800,
            gradeLevel: preferences.gradeLevel,
            interest: preferences.interest
          }
        },
        audioLesson: {
          text: adaptedContent,
          duration: 120,
          speed: 1.0,
          language: 'en',
          segments: [],
          metadata: {
            generatedAt: new Date(),
            processingTime: 500,
            gradeLevel: preferences.gradeLevel,
            interest: preferences.interest
          }
        },
        quiz: {
          id: `quiz_${sessionId}`,
          title: 'Learning Assessment',
          questions: [], // Parse quiz text into questions
          totalPoints: 100,
          timeEstimate: 5,
          difficulty: preferences.gradeLevel,
          metadata: {
            generatedAt: new Date(),
            processingTime: 1200,
            gradeLevel: preferences.gradeLevel,
            interest: preferences.interest
          }
        },
        processingTime: 4000,
        generatedAt: new Date(),
        version: '1.0.0'
      };

      // Update session
      const updatedSession: LearningSession = {
        ...session,
        status: SessionStatus.COMPLETED,
        generatedMaterials: materials,
        updatedAt: new Date()
      };

      setState(prev => ({
        ...prev,
        session: updatedSession,
        materials,
        currentStep: 'dashboard',
        isProcessing: false
      }));

    } catch (error) {
      console.error('Processing error:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Processing failed',
        isProcessing: false,
        currentStep: 'preferences'
      }));
    }
  }, []);

  const handlePreferencesSet = useCallback((preferences: UserPreferences) => {
    setState(prev => ({
      ...prev,
      preferences,
      currentStep: 'processing'
    }));

    // Start processing
    processContent(state.content, preferences);
  }, [state.content, processContent]);


  const generateTitle = (content: string): string => {
    const words = content.split(/\s+/).slice(0, 8);
    return words.join(' ') + (content.split(/\s+/).length > 8 ? '...' : '');
  };

  const renderCompatibilityWarning = () => {
    if (apiSupport.supported) return null;

    return (
      <Card className="border-yellow-200 bg-yellow-50 mb-6" data-testid="compatibility-warning">
        <CardHeader>
          <CardTitle className="text-yellow-800 flex items-center gap-2">
            ⚠️ Chrome AI Not Available
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-yellow-700 mb-4">
            LearnSphere AI requires Chrome Built-in AI APIs to function. Please enable them in Chrome.
          </p>
          <div className="bg-yellow-100 p-3 rounded-md" data-testid="setup-instructions">
            <p className="font-semibold text-yellow-800">Setup Instructions:</p>
            <ol className="list-decimal list-inside mt-2 text-yellow-700 space-y-1">
              <li>Open <code className="bg-yellow-200 px-1 rounded">chrome://flags</code></li>
              <li>Enable &quot;Prompt API for Gemini Nano&quot;</li>
              <li>Enable &quot;Summarization API for Gemini Nano&quot;</li>
              <li>Enable &quot;Rewriter API for Gemini Nano&quot;</li>
              <li>Enable &quot;Writer API for Gemini Nano&quot;</li>
              <li>Restart Chrome</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderCurrentStep = () => {
    switch (state.currentStep) {
      case 'input':
        return (
          <Card data-testid="content-input-card">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Image
                  src="/logo.svg"
                  alt="LearnSphere AI Logo"
                  className="w-10 h-10"
                  width={40}
                  height={40}
                />
                <CardTitle>Welcome to LearnSphere AI</CardTitle>
              </div>
              <p className="text-muted-foreground">
                Transform any text into personalized learning experiences
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label htmlFor="content-input" className="block text-sm font-medium mb-2">
                    Paste your content here (minimum 50 characters)
                  </label>
                  <textarea
                    id="content-input"
                    data-testid="text-input"
                    className="w-full h-40 p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter the text you want to learn about..."
                    value={state.content}
                    onChange={(e) => handleContentInput(e.target.value)}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span
                      className="text-sm text-gray-500"
                      data-testid="character-count"
                    >
                      {state.content.length} characters
                    </span>
                    {state.content.length > 0 && state.content.length < 50 && (
                      <span
                        className="text-sm text-red-500"
                        data-testid="min-length-error"
                      >
                        Minimum 50 characters required
                      </span>
                    )}
                    {state.content.length > 50000 && (
                      <span
                        className="text-sm text-red-500"
                        data-testid="content-error"
                      >
                        Content too long (max 50,000 characters)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'preferences':
        return (
          <Card data-testid="preferences-card">
            <CardHeader>
              <CardTitle>Learning Preferences</CardTitle>
              <p className="text-muted-foreground">
                Help us personalize your learning experience
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Grade Level
                  </label>
                  <select
                    data-testid="grade-selector"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => {
                      const gradeLevel = e.target.value as GradeLevel;
                      setState(prev => ({
                        ...prev,
                        preferences: { ...prev.preferences!, gradeLevel }
                      }));
                    }}
                  >
                    <option value="">Select grade level...</option>
                    {Object.values(GradeLevel).map(grade => (
                      <option key={grade} value={grade} data-testid={`grade-option-${grade}`}>
                        {grade === 'undergrad' ? 'Undergraduate' : `Grade ${grade}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Interest
                  </label>
                  <select
                    data-testid="interest-selector"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => {
                      const interest = e.target.value as Interest;
                      setState(prev => ({
                        ...prev,
                        preferences: { ...prev.preferences!, interest }
                      }));
                    }}
                  >
                    <option value="">Select your interest...</option>
                    {Object.values(Interest).map(interest => (
                      <option key={interest} value={interest} data-testid={`interest-option-${interest}`}>
                        {interest.replace('_', ' ').split(' ').map(word =>
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </option>
                    ))}
                  </select>
                </div>

                {state.preferences?.gradeLevel && state.preferences?.interest && (
                  <div data-testid="preferences-summary">
                    <h4 className="font-medium mb-2">Selected Preferences:</h4>
                    <div className="flex gap-2">
                      <Badge data-testid="selected-grade">
                        {state.preferences.gradeLevel === 'undergrad'
                          ? 'Undergraduate'
                          : `Grade ${state.preferences.gradeLevel}`}
                      </Badge>
                      <Badge variant="secondary" data-testid="selected-interest">
                        {state.preferences.interest.replace('_', ' ').split(' ').map(word =>
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </Badge>
                    </div>
                  </div>
                )}

                <button
                  data-testid="generate-button"
                  className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={!state.preferences?.gradeLevel || !state.preferences?.interest || !apiSupport.supported}
                  onClick={() => handlePreferencesSet(state.preferences!)}
                >
                  Generate Learning Experience
                </button>
              </div>
            </CardContent>
          </Card>
        );

      case 'processing':
        return (
          <Card data-testid="processing-card">
            <CardHeader>
              <CardTitle>Creating Your Learning Experience</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4" data-testid="processing-indicator">
                <div className="space-y-2">
                  <div className="flex items-center gap-2" data-testid="step-summarizing">
                    <div className="w-4 h-4 border-2 border-blue-600 rounded-full animate-spin" />
                    <span>Summarizing content...</span>
                  </div>
                  <div className="flex items-center gap-2" data-testid="step-adapting">
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                    <span className="text-gray-500">Adapting for your grade level...</span>
                  </div>
                  <div className="flex items-center gap-2" data-testid="step-mindmap">
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                    <span className="text-gray-500">Creating mind map...</span>
                  </div>
                  <div className="flex items-center gap-2" data-testid="step-audio">
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                    <span className="text-gray-500">Generating audio lesson...</span>
                  </div>
                  <div className="flex items-center gap-2" data-testid="step-quiz">
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                    <span className="text-gray-500">Creating quiz...</span>
                  </div>
                </div>
                {state.error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md" data-testid="processing-error">
                    <p className="text-red-800">{state.error}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );

      case 'dashboard':
        return (
          <div data-testid="learning-dashboard">
            <div className="mb-6">
              <h1 className="text-2xl font-bold">Learning Dashboard</h1>
              <p className="text-gray-600">Your personalized learning materials are ready!</p>
            </div>

            <div className="grid gap-4">
              <Card data-testid="summary-tab">
                <CardHeader>
                  <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div data-testid="summary-content">
                    {state.materials?.summary.text}
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="adapted-content-tab">
                <CardHeader>
                  <CardTitle>Adapted Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <div data-testid="adapted-content">
                    {state.materials?.adaptedContent.text}
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="mindmap-tab">
                <CardHeader>
                  <CardTitle>Mind Map</CardTitle>
                </CardHeader>
                <CardContent>
                  <div data-testid="mindmap-container" className="h-40 bg-gray-50 rounded flex items-center justify-center">
                    Mind map visualization would appear here
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="audio-tab">
                <CardHeader>
                  <CardTitle>Audio Lesson</CardTitle>
                </CardHeader>
                <CardContent>
                  <div data-testid="audio-player" className="space-y-2">
                    <button
                      data-testid="audio-play-button"
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      ▶️ Play
                    </button>
                    <div className="text-sm text-gray-600">
                      Duration: {Math.floor((state.materials?.audioLesson.duration || 0) / 60)}:
                      {String((state.materials?.audioLesson.duration || 0) % 60).padStart(2, '0')}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="quiz-tab">
                <CardHeader>
                  <CardTitle>Quiz</CardTitle>
                </CardHeader>
                <CardContent>
                  <div data-testid="quiz-container">
                    <div data-testid="quiz-question" className="space-y-2">
                      <div data-testid="question-text" className="font-medium">
                        Sample question about the content would appear here
                      </div>
                      <div className="space-y-1">
                        <label className="flex items-center gap-2" data-testid="quiz-option">
                          <input type="radio" name="q1" />
                          <span>Option A</span>
                        </label>
                        <label className="flex items-center gap-2" data-testid="quiz-option">
                          <input type="radio" name="q1" />
                          <span>Option B</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {renderCompatibilityWarning()}
        {renderCurrentStep()}
      </div>
    </div>
  );
}