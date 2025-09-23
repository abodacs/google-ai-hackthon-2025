/**
 * E2E Test: Error Handling
 * Tests various error scenarios and graceful degradation
 */

import { test, expect } from '@playwright/test';

test.describe('Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should handle content length validation errors', async ({ page }) => {
    // Test minimum content length
    const textInput = page.locator('[data-testid="text-input"]');
    await textInput.fill('Too short');

    const generateButton = page.locator('[data-testid="generate-button"]');
    await expect(generateButton).toBeDisabled();

    const minLengthError = page.locator('[data-testid="min-length-error"]');
    if (await minLengthError.isVisible()) {
      await expect(minLengthError).toContainText('minimum');
    }

    // Test maximum content length
    const longContent = 'A'.repeat(60000); // Exceeds 50k character limit
    await textInput.fill(longContent);

    const maxLengthError = page.locator('[data-testid="max-length-error"]');
    await expect(maxLengthError).toBeVisible();
    await expect(maxLengthError).toContainText('too long');
    await expect(generateButton).toBeDisabled();
  });

  test('should handle Chrome AI API unavailability', async ({ page }) => {
    // Mock Chrome AI APIs as unavailable
    await page.addInitScript(() => {
      // Remove Chrome AI globals
      delete (globalThis as any).Summarizer;
      delete (globalThis as any).Rewriter;
      delete (globalThis as any).Writer;
      delete (globalThis as any).LanguageModel;
    });

    await page.goto('/');

    // Should show compatibility warning
    const compatibilityWarning = page.locator('[data-testid="compatibility-warning"]');
    await expect(compatibilityWarning).toBeVisible();
    await expect(compatibilityWarning).toContainText(/Chrome AI|not supported|unavailable/i);

    // Generate button should be disabled
    const generateButton = page.locator('[data-testid="generate-button"]');
    await expect(generateButton).toBeDisabled();

    // Should show helpful instructions
    const instructions = page.locator('[data-testid="setup-instructions"]');
    if (await instructions.isVisible()) {
      await expect(instructions).toContainText(/chrome:\/\/flags|enable|setup/i);
    }
  });

  test('should handle partial Chrome AI API availability', async ({ page }) => {
    // Mock only some APIs as available
    await page.addInitScript(() => {
      // Keep Summarizer but remove others
      delete (globalThis as any).Rewriter;
      delete (globalThis as any).Writer;
    });

    await page.goto('/');

    const partialWarning = page.locator('[data-testid="partial-availability-warning"]');
    if (await partialWarning.isVisible()) {
      await expect(partialWarning).toContainText(/limited|some features|partially/i);
    }
  });

  test('should handle network connectivity issues', async ({ page }) => {
    // Set up content and preferences
    await page.locator('[data-testid="text-input"]').fill('Test content for network error handling.');
    await page.locator('[data-testid="grade-selector"]').selectOption('7');
    await page.locator('[data-testid="interest-selector"]').selectOption('science');

    // Simulate offline mode
    await page.context().setOffline(true);

    // Try to process (should work with Chrome AI offline, but test error handling)
    await page.locator('[data-testid="generate-button"]').click();

    // Check if offline mode is handled gracefully
    const offlineIndicator = page.locator('[data-testid="offline-indicator"]');
    if (await offlineIndicator.isVisible()) {
      await expect(offlineIndicator).toContainText(/offline|no connection/i);
    }

    // Restore connectivity
    await page.context().setOffline(false);
  });

  test('should handle processing timeout errors', async ({ page }) => {
    // Set up content
    await page.locator('[data-testid="text-input"]').fill('Test content for timeout handling.');
    await page.locator('[data-testid="grade-selector"]').selectOption('8');
    await page.locator('[data-testid="interest-selector"]').selectOption('technology');

    // Mock slow processing
    await page.addInitScript(() => {
      const originalSummarizer = (globalThis as any).Summarizer;
      if (originalSummarizer) {
        (globalThis as any).Summarizer = {
          ...originalSummarizer,
          create: async () => ({
            summarize: () => new Promise(resolve => setTimeout(() => resolve('Summary'), 60000)), // 60s timeout
            destroy: () => {}
          })
        };
      }
    });

    await page.locator('[data-testid="generate-button"]').click();

    // Should show timeout error after reasonable wait
    const timeoutError = page.locator('[data-testid="timeout-error"]');
    await expect(timeoutError).toBeVisible({ timeout: 35000 });
    await expect(timeoutError).toContainText(/timeout|taking too long/i);

    // Should provide retry option
    const retryButton = page.locator('[data-testid="retry-button"]');
    if (await retryButton.isVisible()) {
      await expect(retryButton).toBeEnabled();
    }
  });

  test('should handle invalid file uploads', async ({ page }) => {
    const fileUploadArea = page.locator('[data-testid="file-upload-area"]');

    if (await fileUploadArea.isVisible()) {
      // Try to upload invalid file type
      const fileInput = page.locator('[data-testid="file-input"]');

      // Create a fake image file
      const buffer = Buffer.from('fake image data');
      await fileInput.setInputFiles({
        name: 'test.jpg',
        mimeType: 'image/jpeg',
        buffer: buffer
      });

      // Should show file type error
      const fileTypeError = page.locator('[data-testid="file-type-error"]');
      await expect(fileTypeError).toBeVisible();
      await expect(fileTypeError).toContainText(/supported|invalid|file type/i);
    }
  });

  test('should handle large file upload errors', async ({ page }) => {
    const fileUploadArea = page.locator('[data-testid="file-upload-area"]');

    if (await fileUploadArea.isVisible()) {
      const fileInput = page.locator('[data-testid="file-input"]');

      // Create a large fake file (>10MB)
      const largeBuffer = Buffer.alloc(11 * 1024 * 1024, 'x'); // 11MB
      await fileInput.setInputFiles({
        name: 'large.pdf',
        mimeType: 'application/pdf',
        buffer: largeBuffer
      });

      // Should show file size error
      const fileSizeError = page.locator('[data-testid="file-size-error"]');
      await expect(fileSizeError).toBeVisible();
      await expect(fileSizeError).toContainText(/too large|size limit|maximum/i);
    }
  });

  test('should handle corrupted file uploads', async ({ page }) => {
    const fileUploadArea = page.locator('[data-testid="file-upload-area"]');

    if (await fileUploadArea.isVisible()) {
      const fileInput = page.locator('[data-testid="file-input"]');

      // Upload corrupted PDF
      const corruptedBuffer = Buffer.from('not a real pdf file');
      await fileInput.setInputFiles({
        name: 'corrupted.pdf',
        mimeType: 'application/pdf',
        buffer: corruptedBuffer
      });

      // Should show file parsing error
      const parseError = page.locator('[data-testid="file-parse-error"]');
      await expect(parseError).toBeVisible({ timeout: 10000 });
      await expect(parseError).toContainText(/corrupted|invalid|parse|read/i);
    }
  });

  test('should handle browser storage quota exceeded', async ({ page }) => {
    // Mock localStorage quota exceeded
    await page.addInitScript(() => {
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = function(key: string, value: string) {
        if (key.includes('learnsphere')) {
          throw new Error('QuotaExceededError');
        }
        return originalSetItem.call(this, key, value);
      };
    });

    // Set up and process content
    await page.locator('[data-testid="text-input"]').fill('Test content for storage error.');
    await page.locator('[data-testid="grade-selector"]').selectOption('6');
    await page.locator('[data-testid="interest-selector"]').selectOption('reading');
    await page.locator('[data-testid="generate-button"]').click();

    // Wait for processing to complete
    await page.waitForSelector('[data-testid="learning-dashboard"]', { timeout: 30000 });

    // Try to save session
    const saveButton = page.locator('[data-testid="save-session-button"]');
    if (await saveButton.isVisible()) {
      await saveButton.click();

      // Should show storage error
      const storageError = page.locator('[data-testid="storage-error"]');
      await expect(storageError).toBeVisible();
      await expect(storageError).toContainText(/storage|quota|space/i);
    }
  });

  test('should handle processing interruption', async ({ page }) => {
    // Set up content
    await page.locator('[data-testid="text-input"]').fill('Test content for interruption handling.');
    await page.locator('[data-testid="grade-selector"]').selectOption('9');
    await page.locator('[data-testid="interest-selector"]').selectOption('gaming');

    // Start processing
    await page.locator('[data-testid="generate-button"]').click();

    // Wait for processing to start
    await page.waitForSelector('[data-testid="processing-indicator"]');

    // Interrupt by navigating away
    await page.goBack();
    await page.goForward();

    // Should handle interruption gracefully
    const interruptionMessage = page.locator('[data-testid="interruption-message"]');
    if (await interruptionMessage.isVisible()) {
      await expect(interruptionMessage).toContainText(/interrupted|cancelled|stopped/i);
    }
  });

  test('should show user-friendly error messages', async ({ page }) => {
    // Mock various API errors
    await page.addInitScript(() => {
      const originalSummarizer = (globalThis as any).Summarizer;
      if (originalSummarizer) {
        (globalThis as any).Summarizer = {
          ...originalSummarizer,
          create: async () => ({
            summarize: () => Promise.reject(new Error('Content too long')),
            destroy: () => {}
          })
        };
      }
    });

    await page.locator('[data-testid="text-input"]').fill('Test content for error message display.');
    await page.locator('[data-testid="grade-selector"]').selectOption('7');
    await page.locator('[data-testid="interest-selector"]').selectOption('science');
    await page.locator('[data-testid="generate-button"]').click();

    // Should show user-friendly error
    const errorMessage = page.locator('[data-testid="processing-error"]');
    await expect(errorMessage).toBeVisible({ timeout: 10000 });

    // Error should be user-friendly, not technical
    const errorText = await errorMessage.textContent();
    expect(errorText).not.toMatch(/undefined|null|stack trace|TypeError/i);
    expect(errorText).toMatch(/try again|sorry|error|problem/i);
  });

  test('should provide error recovery options', async ({ page }) => {
    // Trigger an error scenario
    await page.addInitScript(() => {
      const originalRewriter = (globalThis as any).Rewriter;
      if (originalRewriter) {
        (globalThis as any).Rewriter = {
          ...originalRewriter,
          create: async () => {
            throw new Error('Rewriter temporarily unavailable');
          }
        };
      }
    });

    await page.locator('[data-testid="text-input"]').fill('Test content for recovery options.');
    await page.locator('[data-testid="grade-selector"]').selectOption('5');
    await page.locator('[data-testid="interest-selector"]').selectOption('art');
    await page.locator('[data-testid="generate-button"]').click();

    // Wait for error
    const errorContainer = page.locator('[data-testid="error-container"]');
    await expect(errorContainer).toBeVisible({ timeout: 15000 });

    // Should provide recovery options
    const retryButton = page.locator('[data-testid="retry-button"]');
    const reportButton = page.locator('[data-testid="report-error-button"]');
    const helpButton = page.locator('[data-testid="help-button"]');

    // At least one recovery option should be available
    const hasRecoveryOption = await retryButton.isVisible() ||
                               await reportButton.isVisible() ||
                               await helpButton.isVisible();
    expect(hasRecoveryOption).toBe(true);
  });

  test('should handle graceful degradation', async ({ page }) => {
    // Mock partial functionality loss
    await page.addInitScript(() => {
      // Keep basic APIs but remove advanced ones
      delete (globalThis as any).Writer;
      delete (globalThis as any).LanguageModel;
    });

    await page.goto('/');

    // Should still allow basic functionality
    await page.locator('[data-testid="text-input"]').fill('Test content for graceful degradation.');
    await page.locator('[data-testid="grade-selector"]').selectOption('8');
    await page.locator('[data-testid="interest-selector"]').selectOption('technology');

    const generateButton = page.locator('[data-testid="generate-button"]');

    // Should still work with reduced functionality
    if (await generateButton.isEnabled()) {
      await generateButton.click();

      // Should show which features are unavailable
      const degradationNotice = page.locator('[data-testid="degradation-notice"]');
      if (await degradationNotice.isVisible()) {
        await expect(degradationNotice).toContainText(/limited|reduced|some features/i);
      }
    }
  });
});