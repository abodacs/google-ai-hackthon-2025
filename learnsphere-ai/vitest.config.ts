/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],

  // Disable PostCSS for tests
  css: {
    postcss: false
  },
  test: {
    // Test environment
    environment: 'jsdom',

    // Global setup
    globals: true,
    setupFiles: ['./src/test/setup.ts'],

    // File patterns
    include: [
      'tests/**/*.{test,spec}.{js,ts,jsx,tsx}',
      'src/**/*.{test,spec}.{js,ts,jsx,tsx}'
    ],
    exclude: [
      'node_modules',
      'dist',
      '.netlify',
      'out',
      'tests/e2e/**/*'
    ],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'out/',
        '.netlify/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.{js,ts}',
        'src/test/**/*',
        'next.config.ts',
        'tailwind.config.ts'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },

    // Performance
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        isolate: false
      }
    },

    // Timeouts
    testTimeout: 10000,
    hookTimeout: 10000,

    // Reporters
    reporters: ['default', 'verbose'],

    // Watch configuration
    watch: true
  },

  // Path resolution (same as Next.js)
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  },

  // Define for environment variables
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'test')
  }
})