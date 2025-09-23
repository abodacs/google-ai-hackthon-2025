'use client';

/**
 * InterestSelector Component
 * Component for selecting personal interests (16 categories)
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Interest, INTEREST_INFO } from '@/types/user-preferences';

interface InterestSelectorProps {
  value?: Interest;
  onChange: (interest: Interest) => void;
  disabled?: boolean;
  showDescription?: boolean;
  title?: string;
  className?: string;
}

export function InterestSelector({
  value,
  onChange,
  disabled = false,
  showDescription = true,
  title = "Personal Interest",
  className = ""
}: InterestSelectorProps) {
  const interestsByCategory = React.useMemo(() => {
    const interests = Object.values(INTEREST_INFO);

    const grouped = {
      academic: interests.filter(i => i.category === 'academic'),
      creative: interests.filter(i => i.category === 'creative'),
      sports: interests.filter(i => i.category === 'sports'),
      technology: interests.filter(i => i.category === 'technology'),
      lifestyle: interests.filter(i => i.category === 'lifestyle')
    };

    return grouped;
  }, []);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'academic': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'creative': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'sports': return 'bg-green-100 text-green-800 border-green-200';
      case 'technology': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'lifestyle': return 'bg-pink-100 text-pink-800 border-pink-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'academic': return '📚';
      case 'creative': return '🎨';
      case 'sports': return '⚽';
      case 'technology': return '💻';
      case 'lifestyle': return '🌟';
      default: return '📝';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'academic': return 'Academic';
      case 'creative': return 'Creative Arts';
      case 'sports': return 'Sports & Fitness';
      case 'technology': return 'Technology';
      case 'lifestyle': return 'Lifestyle';
      default: return category;
    }
  };

  const getInterestIcon = (interest: Interest) => {
    const icons: Record<Interest, string> = {
      [Interest.READING]: '📖',
      [Interest.SCIENCE]: '🔬',
      [Interest.ART]: '🎨',
      [Interest.WRITING]: '✍️',
      [Interest.PHOTOGRAPHY]: '📸',
      [Interest.NATURE]: '🌲',
      [Interest.SOCCER]: '⚽',
      [Interest.CYCLING]: '🚴',
      [Interest.COOKING]: '👨‍🍳',
      [Interest.GAMING]: '🎮',
      [Interest.BASKETBALL]: '🏀',
      [Interest.FOOTBALL]: '🏈',
      [Interest.TABLE_TENNIS]: '🏓',
      [Interest.TENNIS]: '🎾',
      [Interest.TECHNOLOGY]: '💻',
      [Interest.SKATEBOARDING]: '🛹'
    };
    return icons[interest] || '📝';
  };

  const selectedInterest = value ? INTEREST_INFO[value] : null;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {showDescription && (
          <p className="text-muted-foreground">
            Choose an interest to personalize analogies and examples in your learning materials
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Current Selection Display */}
          {selectedInterest && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md" data-testid="selected-interest">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{getInterestIcon(value!)}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-blue-900">{selectedInterest.displayName}</h4>
                    <Badge className={getCategoryColor(selectedInterest.category)}>
                      {getCategoryLabel(selectedInterest.category)}
                    </Badge>
                  </div>
                  <p className="text-sm text-blue-700 mb-2">{selectedInterest.description}</p>
                  <div className="space-y-1">
                    <p className="text-xs text-blue-600 font-medium">Example analogies:</p>
                    <ul className="text-xs text-blue-600 space-y-1">
                      {selectedInterest.analogyExamples.slice(0, 2).map((example, index) => (
                        <li key={index}>• &quot;{example}&quot;</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Interest Selection by Category */}
          <div className="space-y-6">
            {Object.entries(interestsByCategory).map(([category, categoryInterests]) => (
              <div key={category} className="space-y-3">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <span className="text-lg">{getCategoryIcon(category)}</span>
                  <Badge className={getCategoryColor(category)}>
                    {getCategoryLabel(category)}
                  </Badge>
                  <span className="text-xs text-gray-500">({categoryInterests.length} options)</span>
                </h4>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {categoryInterests.map((interestInfo) => (
                    <button
                      key={interestInfo.interest}
                      data-testid={`interest-option-${interestInfo.interest}`}
                      className={`
                        p-3 text-sm rounded-md border-2 transition-all text-left
                        ${value === interestInfo.interest
                          ? `border-blue-500 bg-blue-50 text-blue-700`
                          : `border-gray-200 hover:border-gray-300 hover:bg-gray-50`
                        }
                        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                      onClick={() => !disabled && onChange(interestInfo.interest)}
                      disabled={disabled}
                      title={interestInfo.description}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getInterestIcon(interestInfo.interest)}</span>
                        <span className="font-medium">{interestInfo.displayName}</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {interestInfo.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Alternative dropdown for compact view */}
          <div className="md:hidden">
            <select
              data-testid="interest-selector"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              value={value || ''}
              onChange={(e) => onChange(e.target.value as Interest)}
              disabled={disabled}
            >
              <option value="">Select your interest...</option>
              {Object.entries(interestsByCategory).map(([category, categoryInterests]) => (
                <optgroup key={category} label={getCategoryLabel(category)}>
                  {categoryInterests.map((interestInfo) => (
                    <option
                      key={interestInfo.interest}
                      value={interestInfo.interest}
                      data-testid={`interest-option-${interestInfo.interest}`}
                    >
                      {getInterestIcon(interestInfo.interest)} {interestInfo.displayName}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Help text */}
          {!selectedInterest && (
            <div className="text-sm text-gray-500">
              <p className="font-medium">How your interest personalizes learning:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li><strong>Analogies:</strong> Complex concepts explained using familiar terms</li>
                <li><strong>Examples:</strong> Real-world scenarios from your area of interest</li>
                <li><strong>Context:</strong> Learning materials become more relatable and memorable</li>
                <li><strong>Engagement:</strong> Content connects to what you already enjoy</li>
              </ul>
            </div>
          )}

          {/* Search functionality for future enhancement */}
          {Object.values(INTEREST_INFO).length > 12 && !selectedInterest && (
            <div className="pt-4 border-t">
              <input
                type="text"
                placeholder="Search interests..."
                className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                data-testid="interest-search"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}