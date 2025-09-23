'use client';

/**
 * GradeSelector Component
 * Component for selecting grade level (1-12, undergrad)
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GradeLevel, GRADE_LEVEL_INFO } from '@/types/user-preferences';

interface GradeSelectorProps {
  value?: GradeLevel;
  onChange: (gradeLevel: GradeLevel) => void;
  disabled?: boolean;
  showDescription?: boolean;
  title?: string;
  className?: string;
}

export function GradeSelector({
  value,
  onChange,
  disabled = false,
  showDescription = true,
  title = "Grade Level",
  className = ""
}: GradeSelectorProps) {
  const gradesByComplexity = React.useMemo(() => {
    const grades = Object.values(GRADE_LEVEL_INFO).sort((a, b) => a.order - b.order);

    const grouped = {
      elementary: grades.filter(g => g.complexity === 'elementary'),
      middle: grades.filter(g => g.complexity === 'middle'),
      high: grades.filter(g => g.complexity === 'high'),
      college: grades.filter(g => g.complexity === 'college')
    };

    return grouped;
  }, []);

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'elementary': return 'bg-green-100 text-green-800 border-green-200';
      case 'middle': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'high': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'college': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getComplexityLabel = (complexity: string) => {
    switch (complexity) {
      case 'elementary': return 'Elementary School';
      case 'middle': return 'Middle School';
      case 'high': return 'High School';
      case 'college': return 'College Level';
      default: return complexity;
    }
  };

  const selectedGrade = value ? GRADE_LEVEL_INFO[value] : null;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {showDescription && (
          <p className="text-muted-foreground">
            Select your current grade level to personalize content complexity
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Current Selection Display */}
          {selectedGrade && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md" data-testid="selected-grade">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-blue-900">{selectedGrade.displayName}</h4>
                  <p className="text-sm text-blue-700">{selectedGrade.description}</p>
                  <p className="text-xs text-blue-600 mt-1">Age: {selectedGrade.ageRange}</p>
                </div>
                <Badge className={getComplexityColor(selectedGrade.complexity)}>
                  {getComplexityLabel(selectedGrade.complexity)}
                </Badge>
              </div>
            </div>
          )}

          {/* Grade Selection */}
          <div className="space-y-4">
            <label className="block text-sm font-medium">
              Choose your grade level:
            </label>

            {/* Elementary School */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-green-700 flex items-center gap-2">
                <Badge className={getComplexityColor('elementary')}>
                  Elementary School
                </Badge>
                <span className="text-xs text-gray-500">(Ages 6-11)</span>
              </h4>
              <div className="grid grid-cols-5 gap-2">
                {gradesByComplexity.elementary.map((grade) => (
                  <button
                    key={grade.grade}
                    data-testid={`grade-option-${grade.grade}`}
                    className={`
                      p-3 text-sm rounded-md border-2 transition-all
                      ${value === grade.grade
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-green-200 hover:border-green-300 hover:bg-green-50'
                      }
                      ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                    onClick={() => !disabled && onChange(grade.grade)}
                    disabled={disabled}
                  >
                    Grade {grade.grade}
                  </button>
                ))}
              </div>
            </div>

            {/* Middle School */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-blue-700 flex items-center gap-2">
                <Badge className={getComplexityColor('middle')}>
                  Middle School
                </Badge>
                <span className="text-xs text-gray-500">(Ages 11-14)</span>
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {gradesByComplexity.middle.map((grade) => (
                  <button
                    key={grade.grade}
                    data-testid={`grade-option-${grade.grade}`}
                    className={`
                      p-3 text-sm rounded-md border-2 transition-all
                      ${value === grade.grade
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-blue-200 hover:border-blue-300 hover:bg-blue-50'
                      }
                      ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                    onClick={() => !disabled && onChange(grade.grade)}
                    disabled={disabled}
                  >
                    Grade {grade.grade}
                  </button>
                ))}
              </div>
            </div>

            {/* High School */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-purple-700 flex items-center gap-2">
                <Badge className={getComplexityColor('high')}>
                  High School
                </Badge>
                <span className="text-xs text-gray-500">(Ages 14-18)</span>
              </h4>
              <div className="grid grid-cols-4 gap-2">
                {gradesByComplexity.high.map((grade) => (
                  <button
                    key={grade.grade}
                    data-testid={`grade-option-${grade.grade}`}
                    className={`
                      p-3 text-sm rounded-md border-2 transition-all
                      ${value === grade.grade
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-purple-200 hover:border-purple-300 hover:bg-purple-50'
                      }
                      ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                    onClick={() => !disabled && onChange(grade.grade)}
                    disabled={disabled}
                  >
                    Grade {grade.grade}
                  </button>
                ))}
              </div>
            </div>

            {/* College Level */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-orange-700 flex items-center gap-2">
                <Badge className={getComplexityColor('college')}>
                  College Level
                </Badge>
                <span className="text-xs text-gray-500">(Ages 18+)</span>
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {gradesByComplexity.college.map((grade) => (
                  <button
                    key={grade.grade}
                    data-testid={`grade-option-${grade.grade}`}
                    className={`
                      p-3 text-sm rounded-md border-2 transition-all
                      ${value === grade.grade
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-orange-200 hover:border-orange-300 hover:bg-orange-50'
                      }
                      ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                    onClick={() => !disabled && onChange(grade.grade)}
                    disabled={disabled}
                  >
                    {grade.displayName}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Alternative dropdown for compact view */}
          <div className="md:hidden">
            <select
              data-testid="grade-selector"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              value={value || ''}
              onChange={(e) => onChange(e.target.value as GradeLevel)}
              disabled={disabled}
            >
              <option value="">Select grade level...</option>
              {Object.values(GRADE_LEVEL_INFO)
                .sort((a, b) => a.order - b.order)
                .map((grade) => (
                  <option key={grade.grade} value={grade.grade} data-testid={`grade-option-${grade.grade}`}>
                    {grade.displayName} ({grade.ageRange})
                  </option>
                ))}
            </select>
          </div>

          {/* Help text */}
          {!selectedGrade && (
            <div className="text-sm text-gray-500">
              <p className="font-medium">How content adapts by grade level:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li><strong>Elementary:</strong> Simple vocabulary, concrete examples</li>
                <li><strong>Middle School:</strong> Moderate complexity, relatable analogies</li>
                <li><strong>High School:</strong> Advanced concepts, abstract thinking</li>
                <li><strong>College:</strong> Academic depth, specialized terminology</li>
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}