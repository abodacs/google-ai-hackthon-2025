'use client';

/**
 * TabNavigation Component
 * Simple and reusable tab navigation component
 */

import React, { useState, useCallback } from 'react';

export interface Tab {
  id: string;
  label: string;
  icon?: string;
  content: React.ReactNode;
  disabled?: boolean;
  badge?: string | number;
}

interface TabNavigationProps {
  tabs: Tab[];
  defaultTab?: string;
  onTabChange?: (tabId: string) => void;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'default' | 'pills' | 'underline';
  className?: string;
}

export function TabNavigation({
  tabs,
  defaultTab,
  onTabChange,
  orientation = 'horizontal',
  variant = 'default',
  className = ""
}: TabNavigationProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id || '');

  const handleTabChange = useCallback((tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab || tab.disabled) return;

    setActiveTab(tabId);
    onTabChange?.(tabId);
  }, [tabs, onTabChange]);

  const getTabClasses = (tab: Tab, isActive: boolean) => {
    const baseClasses = "relative transition-all duration-200 cursor-pointer";

    if (tab.disabled) {
      return `${baseClasses} opacity-50 cursor-not-allowed`;
    }

    switch (variant) {
      case 'pills':
        return `${baseClasses} px-4 py-2 rounded-full text-sm font-medium ${
          isActive
            ? 'bg-blue-600 text-white'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        }`;

      case 'underline':
        return `${baseClasses} px-4 py-2 text-sm font-medium border-b-2 ${
          isActive
            ? 'text-blue-600 border-blue-600'
            : 'text-gray-600 border-transparent hover:text-gray-900 hover:border-gray-300'
        }`;

      case 'default':
      default:
        return `${baseClasses} px-4 py-2 text-sm font-medium rounded-md ${
          isActive
            ? 'bg-blue-100 text-blue-700'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        }`;
    }
  };

  const getContainerClasses = () => {
    const baseClasses = "tab-navigation";

    if (orientation === 'vertical') {
      return `${baseClasses} flex gap-6`;
    }

    return `${baseClasses} space-y-4`;
  };

  const getTabListClasses = () => {
    const baseClasses = "tab-list";

    if (orientation === 'vertical') {
      return `${baseClasses} flex flex-col space-y-1 min-w-[200px]`;
    }

    switch (variant) {
      case 'underline':
        return `${baseClasses} flex space-x-0 border-b`;
      case 'pills':
        return `${baseClasses} flex flex-wrap gap-2 p-1 bg-gray-100 rounded-lg w-fit`;
      case 'default':
      default:
        return `${baseClasses} flex flex-wrap gap-2`;
    }
  };

  const activeTabContent = tabs.find(tab => tab.id === activeTab);

  return (
    <div className={`${getContainerClasses()} ${className}`}>
      {/* Tab Headers */}
      <div className={getTabListClasses()}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              className={getTabClasses(tab, isActive)}
              onClick={() => handleTabChange(tab.id)}
              disabled={tab.disabled}
              aria-selected={isActive}
              role="tab"
              data-testid={`tab-${tab.id}`}
            >
              <div className="flex items-center gap-2">
                {tab.icon && (
                  <span className="text-lg" aria-hidden="true">
                    {tab.icon}
                  </span>
                )}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </div>

              {/* Active indicator for underline variant */}
              {variant === 'underline' && isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="tab-content flex-1">
        {activeTabContent && (
          <div
            role="tabpanel"
            aria-labelledby={`tab-${activeTab}`}
            data-testid={`panel-${activeTab}`}
            className="focus:outline-none"
          >
            {activeTabContent.content}
          </div>
        )}
      </div>
    </div>
  );
}

// Preset configurations for common use cases
export const LearningTabsConfig = {
  summary: {
    id: 'summary',
    label: 'Summary',
    icon: '📝'
  },
  content: {
    id: 'content',
    label: 'Content',
    icon: '📖'
  },
  mindmap: {
    id: 'mindmap',
    label: 'Mind Map',
    icon: '🧠'
  },
  audio: {
    id: 'audio',
    label: 'Audio',
    icon: '🎧'
  },
  quiz: {
    id: 'quiz',
    label: 'Quiz',
    icon: '📋'
  }
};

// Helper function to create learning dashboard tabs
export function createLearningTabs(
  summary: React.ReactNode,
  content: React.ReactNode,
  mindmap: React.ReactNode,
  audio: React.ReactNode,
  quiz: React.ReactNode
): Tab[] {
  return [
    {
      ...LearningTabsConfig.summary,
      content: summary
    },
    {
      ...LearningTabsConfig.content,
      content: content
    },
    {
      ...LearningTabsConfig.mindmap,
      content: mindmap
    },
    {
      ...LearningTabsConfig.audio,
      content: audio
    },
    {
      ...LearningTabsConfig.quiz,
      content: quiz
    }
  ];
}

// Simple tabs for basic use cases
export function SimpleTabs({ tabs, className = "" }: { tabs: Tab[]; className?: string }) {
  return (
    <TabNavigation
      tabs={tabs}
      variant="underline"
      className={className}
    />
  );
}

// Pill-style tabs for navigation
export function PillTabs({ tabs, className = "" }: { tabs: Tab[]; className?: string }) {
  return (
    <TabNavigation
      tabs={tabs}
      variant="pills"
      className={className}
    />
  );
}

// Vertical tabs for sidebars
export function VerticalTabs({ tabs, className = "" }: { tabs: Tab[]; className?: string }) {
  return (
    <TabNavigation
      tabs={tabs}
      orientation="vertical"
      className={className}
    />
  );
}