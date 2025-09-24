/**
 * Test Utilities
 * Common testing helpers and utilities
 */

import { vi } from 'vitest'
import { render, RenderOptions } from '@testing-library/react'
import { ReactElement, ReactNode } from 'react'

// Custom render function with common providers
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  function Wrapper({ children }: { children?: ReactNode }) {
    // Add your providers here (e.g., Theme, Router, State Management)
    return <>{children}</>
  }

  return render(ui, { wrapper: Wrapper, ...options })
}

// Chrome AI Mock Factory
export const createChromeAIMock = (overrides: Record<string, any> = {}) => {
  const defaultMock = {
    summarize: vi.fn().mockResolvedValue('Mock summary'),
    rewrite: vi.fn().mockResolvedValue('Mock rewritten content'),
    write: vi.fn().mockResolvedValue('Mock generated content'),
    destroy: vi.fn(),
    ...overrides,
  }

  return {
    availability: vi.fn().mockResolvedValue('readily'),
    create: vi.fn().mockResolvedValue(defaultMock),
  }
}

// Setup Chrome AI globals for testing
export const setupChromeAIMocks = () => {
  const mocks = {
    Summarizer: createChromeAIMock(),
    Rewriter: createChromeAIMock(),
    Writer: createChromeAIMock(),
    LanguageModel: createChromeAIMock(),
    Proofreader: createChromeAIMock(),
    Translator: createChromeAIMock(),
    LanguageDetector: createChromeAIMock(),
  }

  Object.entries(mocks).forEach(([key, mock]) => {
    ;(globalThis as any)[key] = mock
  })

  return mocks
}

// Clean up Chrome AI globals
export const cleanupChromeAIMocks = () => {
  const keys = [
    'Summarizer',
    'Rewriter',
    'Writer',
    'LanguageModel',
    'Proofreader',
    'Translator',
    'LanguageDetector'
  ]

  keys.forEach(key => {
    delete (globalThis as any)[key]
  })
}

// Wait for async operations to complete
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0))

// Mock user preferences for testing
export const mockUserPreferences = {
  gradeLevel: '10' as const,
  interest: 'science' as const,
  learningStyle: ['visual'] as const,
  language: 'en'
}

// Mock text content for testing
export const mockTextContent = {
  content: 'This is a sample text content for testing purposes. It should be long enough to trigger AI processing.',
  title: 'Test Content',
  source: 'Test Source'
}

// Mock learning session for testing
export const mockLearningSession = {
  id: 'test-session-123',
  createdAt: new Date('2025-01-01T00:00:00.000Z'),
  updatedAt: new Date('2025-01-01T01:00:00.000Z'),
  status: 'completed' as const,
  title: 'Test Learning Session',
  sourceContent: mockTextContent,
  preferences: mockUserPreferences,
  metadata: {
    processingTime: 1500,
    version: '1.0.0'
  }
}

// Error simulation helpers
export const createMockError = (name: string, message: string) => {
  const error = new Error(message)
  error.name = name
  return error
}

// Common error types for Chrome AI
export const chromeAIErrors = {
  notSupported: () => createMockError('NotSupportedError', 'API not supported'),
  invalidState: () => createMockError('InvalidStateError', 'Invalid state'),
  quotaExceeded: () => createMockError('QuotaExceededError', 'Quota exceeded'),
  network: () => createMockError('NetworkError', 'Network failed'),
  contentTooLong: () => createMockError('Error', 'Content is too long for processing')
}

// Export all utilities
export * from '@testing-library/react'
export * from '@testing-library/user-event'
export { vi } from 'vitest'