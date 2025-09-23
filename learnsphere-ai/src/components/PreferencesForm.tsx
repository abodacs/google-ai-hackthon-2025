'use client';

/**
 * PreferencesForm Component
 * Form component that combines grade and interest selection with submission
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GradeSelector } from './GradeSelector';
import { InterestSelector } from './InterestSelector';
import { GradeLevel, Interest, UserPreferences, GRADE_LEVEL_INFO, INTEREST_INFO } from '@/types/user-preferences';

interface PreferencesFormProps {
  onSubmit: (preferences: UserPreferences) => void;
  disabled?: boolean;
  title?: string;
  showSummary?: boolean;
  className?: string;
  initialValues?: Partial<UserPreferences>;
}

interface FormState {
  gradeLevel?: GradeLevel;
  interest?: Interest;
  isValid: boolean;
  errors: string[];
}

export function PreferencesForm({
  onSubmit,
  disabled = false,
  title = "Learning Preferences",
  showSummary = true,
  className = "",
  initialValues
}: PreferencesFormProps) {
  const [formState, setFormState] = useState<FormState>(() => ({
    gradeLevel: initialValues?.gradeLevel,
    interest: initialValues?.interest,
    isValid: false,
    errors: []
  }));

  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = useCallback((state: Partial<FormState>): FormState => {
    const errors: string[] = [];

    if (!state.gradeLevel) {
      errors.push('Please select a grade level');
    }

    if (!state.interest) {
      errors.push('Please select an interest');
    }

    return {
      gradeLevel: state.gradeLevel,
      interest: state.interest,
      isValid: errors.length === 0,
      errors
    };
  }, []);

  const handleGradeLevelChange = useCallback((gradeLevel: GradeLevel) => {
    const newState = validateForm({
      ...formState,
      gradeLevel
    });
    setFormState(newState);
  }, [formState, validateForm]);

  const handleInterestChange = useCallback((interest: Interest) => {
    const newState = validateForm({
      ...formState,
      interest
    });
    setFormState(newState);
  }, [formState, validateForm]);

  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formState.isValid || !formState.gradeLevel || !formState.interest) {
      return;
    }

    setIsSubmitting(true);

    try {
      const preferences: UserPreferences = {
        gradeLevel: formState.gradeLevel,
        interest: formState.interest,
        learningStyle: initialValues?.learningStyle,
        language: initialValues?.language || 'en'
      };

      await onSubmit(preferences);
    } catch (error) {
      console.error('Error submitting preferences:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formState, onSubmit, initialValues]);

  const resetForm = useCallback(() => {
    setFormState({
      gradeLevel: undefined,
      interest: undefined,
      isValid: false,
      errors: []
    });
  }, []);

  const isFormDisabled = disabled || isSubmitting;

  return (
    <Card className={className} data-testid="preferences-card">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-muted-foreground">
          Customize your learning experience by selecting your grade level and personal interest
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Grade Level Selection */}
          <GradeSelector
            value={formState.gradeLevel}
            onChange={handleGradeLevelChange}
            disabled={isFormDisabled}
            showDescription={false}
            title="Step 1: Select Your Grade Level"
          />

          {/* Interest Selection */}
          <InterestSelector
            value={formState.interest}
            onChange={handleInterestChange}
            disabled={isFormDisabled}
            showDescription={false}
            title="Step 2: Choose Your Interest"
          />

          {/* Preferences Summary */}
          {showSummary && formState.gradeLevel && formState.interest && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-md" data-testid="preferences-summary">
              <h4 className="font-medium text-gray-900 mb-3">Your Learning Preferences</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Grade Level:</span>
                  <Badge data-testid="selected-grade" className="bg-blue-100 text-blue-800">
                    {GRADE_LEVEL_INFO[formState.gradeLevel].displayName}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Interest:</span>
                  <Badge data-testid="selected-interest" variant="secondary">
                    {INTEREST_INFO[formState.interest].displayName}
                  </Badge>
                </div>
                <div className="text-xs text-gray-500 mt-2 p-2 bg-white rounded border">
                  <p className="font-medium">How this personalizes your experience:</p>
                  <p>
                    Content will be adapted for <strong>{GRADE_LEVEL_INFO[formState.gradeLevel].displayName}</strong> reading level
                    with analogies and examples from <strong>{INTEREST_INFO[formState.interest].displayName}</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {formState.errors.length > 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <h5 className="text-sm font-medium text-red-800 mb-1">Please complete the following:</h5>
              <ul className="text-sm text-red-700 space-y-1">
                {formState.errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
              disabled={isFormDisabled || (!formState.gradeLevel && !formState.interest)}
            >
              Reset Selections
            </button>

            <div className="flex items-center gap-3">
              {formState.isValid && (
                <div className="text-sm text-green-600 flex items-center gap-1">
                  <span>✓</span>
                  <span>Ready to generate</span>
                </div>
              )}

              <button
                type="submit"
                data-testid="generate-button"
                className={`
                  px-6 py-2 rounded-md font-medium transition-all
                  ${formState.isValid && !isFormDisabled
                    ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }
                  ${isSubmitting ? 'animate-pulse' : ''}
                `}
                disabled={!formState.isValid || isFormDisabled}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Generating...</span>
                  </div>
                ) : (
                  'Generate Learning Experience'
                )}
              </button>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-2 pt-2">
            <div className={`w-3 h-3 rounded-full ${formState.gradeLevel ? 'bg-blue-500' : 'bg-gray-300'}`} />
            <div className={`w-3 h-3 rounded-full ${formState.interest ? 'bg-blue-500' : 'bg-gray-300'}`} />
            <div className={`w-3 h-3 rounded-full ${formState.isValid ? 'bg-green-500' : 'bg-gray-300'}`} />
          </div>
          <div className="text-center text-xs text-gray-500">
            Step {!formState.gradeLevel ? '1' : !formState.interest ? '2' : '3'} of 3
          </div>
        </form>

        {/* Help Section */}
        {!formState.gradeLevel && !formState.interest && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h5 className="text-sm font-medium text-blue-900 mb-2">Why these preferences matter:</h5>
            <div className="text-sm text-blue-800 space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-blue-600">📚</span>
                <div>
                  <strong>Grade Level</strong> determines vocabulary complexity, sentence structure,
                  and conceptual depth appropriate for your learning stage.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600">🎯</span>
                <div>
                  <strong>Personal Interest</strong> helps create relatable analogies and examples
                  that make complex concepts easier to understand and remember.
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}