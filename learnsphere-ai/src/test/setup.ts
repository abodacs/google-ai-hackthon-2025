/**
 * Vitest Test Setup
 * Global test configuration and utilities
 */

import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Global test utilities
declare global {
  var vi: typeof vi
}

// Make vi globally available
globalThis.vi = vi

// Mock window.matchMedia (commonly needed in React components)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock ResizeObserver (often needed for UI components)
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock IntersectionObserver (often needed for lazy loading)
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  root: null,
  rootMargin: '',
  thresholds: [],
}))

// Chrome AI API mocks (for your specific use case)
const createMockChromeAI = () => {
  const mockInstance = {
    summarize: vi.fn().mockResolvedValue('Mock summary'),
    rewrite: vi.fn().mockResolvedValue('Mock rewritten content'),
    write: vi.fn().mockResolvedValue('Mock generated content'),
    destroy: vi.fn(),
  }

  return {
    availability: vi.fn().mockResolvedValue('readily'),
    create: vi.fn().mockResolvedValue(mockInstance),
  }
}

// Reset Chrome AI mocks before each test
beforeEach(() => {
  // Reset all mocks
  vi.clearAllMocks()

  // Setup fresh Chrome AI mocks
  ;(globalThis as any).Summarizer = createMockChromeAI()
  ;(globalThis as any).Rewriter = createMockChromeAI()
  ;(globalThis as any).Writer = createMockChromeAI()
  ;(globalThis as any).LanguageModel = createMockChromeAI()
  ;(globalThis as any).Proofreader = createMockChromeAI()
  ;(globalThis as any).Translator = createMockChromeAI()
  ;(globalThis as any).LanguageDetector = createMockChromeAI()

  // Mock window object
  Object.defineProperty(global, 'window', {
    value: {
      matchMedia: window.matchMedia,
      ResizeObserver: global.ResizeObserver,
      IntersectionObserver: global.IntersectionObserver,
    },
    writable: true,
  })
})

// Cleanup after each test
afterEach(() => {
  // Clean up Chrome AI globals
  delete (globalThis as any).Summarizer
  delete (globalThis as any).Rewriter
  delete (globalThis as any).Writer
  delete (globalThis as any).LanguageModel
  delete (globalThis as any).Proofreader
  delete (globalThis as any).Translator
  delete (globalThis as any).LanguageDetector
})

// Suppress specific console warnings during tests
const originalError = console.error
beforeAll(() => {
  console.error = (...args: any[]) => {
    const message = args[0]
    if (
      typeof message === 'string' &&
      (message.includes('Warning: ReactDOM.render is deprecated') ||
        message.includes('Warning: componentWillReceiveProps has been renamed'))
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})