'use client';

/**
 * TextInput Component
 * A textarea component for content input with validation and character counting
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DEFAULT_CONTENT_LIMITS, ContentValidation } from '@/types/text-content';

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidationChange?: (validation: ContentValidation) => void;
  placeholder?: string;
  title?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export function TextInput({
  value,
  onChange,
  onValidationChange,
  placeholder = "Enter the text you want to learn about...",
  title = "Content Input",
  description = "Paste your content here",
  disabled = false,
  className = ""
}: TextInputProps) {
  const [validation, setValidation] = useState<ContentValidation>({
    isValid: false,
    errors: [],
    warnings: [],
    wordCount: 0,
    characterCount: 0,
    estimatedReadingTime: 0
  });

  const validateContent = useCallback((content: string): ContentValidation => {
    const characterCount = content.length;
    const wordCount = content.trim() === '' ? 0 : content.trim().split(/\s+/).length;
    const estimatedReadingTime = Math.ceil(wordCount / 200); // 200 words per minute

    const errors: string[] = [];
    const warnings: string[] = [];

    // Check minimum length
    if (characterCount < DEFAULT_CONTENT_LIMITS.minCharacters) {
      errors.push(`Content must be at least ${DEFAULT_CONTENT_LIMITS.minCharacters} characters long`);
    }

    // Check maximum length
    if (characterCount > DEFAULT_CONTENT_LIMITS.maxCharacters) {
      errors.push(`Content must not exceed ${DEFAULT_CONTENT_LIMITS.maxCharacters} characters`);
    }

    // Check minimum words
    if (wordCount < DEFAULT_CONTENT_LIMITS.minWords) {
      errors.push(`Content must contain at least ${DEFAULT_CONTENT_LIMITS.minWords} words`);
    }

    // Check maximum words
    if (wordCount > DEFAULT_CONTENT_LIMITS.maxWords) {
      errors.push(`Content must not exceed ${DEFAULT_CONTENT_LIMITS.maxWords} words`);
    }

    // Warnings for very short content
    if (characterCount > 0 && characterCount < 100) {
      warnings.push('Very short content may result in limited learning materials');
    }

    // Warnings for very long content
    if (characterCount > 30000) {
      warnings.push('Very long content may take longer to process');
    }

    // Check for meaningful content
    if (content.trim().length > 0 && !/[a-zA-Z0-9]/.test(content)) {
      errors.push('Content must contain alphanumeric characters');
    }

    const validation: ContentValidation = {
      isValid: errors.length === 0,
      errors,
      warnings,
      wordCount,
      characterCount,
      estimatedReadingTime
    };

    return validation;
  }, []);

  const handleChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = event.target.value;
    onChange(newValue);

    const newValidation = validateContent(newValue);
    setValidation(newValidation);

    if (onValidationChange) {
      onValidationChange(newValidation);
    }
  }, [onChange, onValidationChange, validateContent]);

  const getCharacterCountColor = () => {
    const { characterCount } = validation;
    if (characterCount === 0) return 'text-gray-500';
    if (characterCount < DEFAULT_CONTENT_LIMITS.minCharacters) return 'text-red-500';
    if (characterCount > DEFAULT_CONTENT_LIMITS.maxCharacters) return 'text-red-500';
    if (characterCount > 30000) return 'text-yellow-600';
    return 'text-green-600';
  };

  const showProgress = validation.characterCount > 0;
  const progressPercentage = Math.min(
    (validation.characterCount / DEFAULT_CONTENT_LIMITS.maxCharacters) * 100,
    100
  );

  return (
    <Card className={className} data-testid="content-input-card">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && (
          <p className="text-muted-foreground">
            {description} (minimum {DEFAULT_CONTENT_LIMITS.minCharacters} characters)
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative">
            <textarea
              id="content-input"
              data-testid="text-input"
              className={`
                w-full h-40 p-3 border rounded-md resize-none
                focus:ring-2 focus:ring-blue-500 focus:border-transparent
                disabled:opacity-50 disabled:cursor-not-allowed
                ${validation.errors.length > 0 ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}
              `}
              placeholder={placeholder}
              value={value}
              onChange={handleChange}
              disabled={disabled}
              maxLength={DEFAULT_CONTENT_LIMITS.maxCharacters + 1000} // Allow slight overflow for better UX
            />

            {/* Progress bar */}
            {showProgress && (
              <div className="absolute bottom-2 right-2 w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    progressPercentage > 90 ? 'bg-red-500' :
                    progressPercentage > 70 ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            )}
          </div>

          {/* Character count and stats */}
          <div className="flex justify-between items-center text-sm">
            <div className="flex gap-4">
              <span
                className={getCharacterCountColor()}
                data-testid="character-count"
              >
                {validation.characterCount.toLocaleString()} / {DEFAULT_CONTENT_LIMITS.maxCharacters.toLocaleString()} characters
              </span>
              {validation.wordCount > 0 && (
                <span className="text-gray-500" data-testid="word-count">
                  {validation.wordCount.toLocaleString()} words
                </span>
              )}
              {validation.estimatedReadingTime > 0 && (
                <span className="text-gray-500" data-testid="reading-time">
                  ~{validation.estimatedReadingTime} min read
                </span>
              )}
            </div>
          </div>

          {/* Validation messages */}
          {validation.errors.length > 0 && (
            <div className="space-y-1">
              {validation.errors.map((error, index) => (
                <p
                  key={index}
                  className="text-sm text-red-600"
                  data-testid={index === 0 ? "content-error" : `content-error-${index}`}
                >
                  {error}
                </p>
              ))}
            </div>
          )}

          {validation.warnings.length > 0 && validation.errors.length === 0 && (
            <div className="space-y-1">
              {validation.warnings.map((warning, index) => (
                <p
                  key={index}
                  className="text-sm text-yellow-600"
                  data-testid={`content-warning-${index}`}
                >
                  ⚠️ {warning}
                </p>
              ))}
            </div>
          )}

          {/* Help text */}
          {validation.characterCount === 0 && (
            <div className="text-sm text-gray-500">
              <p>Tips for better learning materials:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Include main concepts and key details</li>
                <li>Use clear, well-structured content</li>
                <li>Aim for {DEFAULT_CONTENT_LIMITS.minCharacters}-{DEFAULT_CONTENT_LIMITS.maxCharacters} characters for optimal results</li>
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}