/**
 * E2E Test: Text Processing Flow
 * Tests the complete user journey from text input to learning materials generation
 */

import { test, expect } from '@playwright/test';

const TEST_CONTENT = `Photosynthesis is the process by which plants convert sunlight into energy. During this process, plants take in carbon dioxide from the air and water from their roots. Using chlorophyll in their leaves, they combine these ingredients with sunlight to create glucose (sugar) and oxygen. The glucose provides energy for the plant to grow, while oxygen is released into the atmosphere as a byproduct.`;

test.describe('Text Processing Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/v0');

    // Wait for the application to load
    await page.waitForLoadState('networkidle');
  });

  test('should complete full text processing flow', async ({ page }) => {
    // Step 1: Input text content
    const textInput = page.locator('[data-testid="text-input"]');
    await expect(textInput).toBeVisible();
    await textInput.fill(TEST_CONTENT);

    // Verify character count updates
    const charCount = page.locator('[data-testid="character-count"]');
    await expect(charCount).toContainText('400'); // Approximate count

    // Step 2: Select grade level
    const gradeSelector = page.locator('[data-testid="grade-selector"]');
    await gradeSelector.selectOption('5'); // 5th grade

    // Step 3: Select interest
    const interestSelector = page.locator('[data-testid="interest-selector"]');
    await interestSelector.selectOption('basketball');

    // Step 4: Verify preferences are set
    await expect(page.locator('[data-testid="selected-grade"]')).toContainText('5');
    await expect(page.locator('[data-testid="selected-interest"]')).toContainText('basketball');

    // Step 5: Start processing
    const generateButton = page.locator('[data-testid="generate-button"]');
    await expect(generateButton).toBeEnabled();
    await generateButton.click();

    // Step 6: Verify processing starts
    const processingIndicator = page.locator('[data-testid="processing-indicator"]');
    await expect(processingIndicator).toBeVisible();

    // Step 7: Wait for processing to complete (with timeout)
    await page.waitForSelector('[data-testid="learning-dashboard"]', { timeout: 30000 });

    // Step 8: Verify learning dashboard is displayed
    const dashboard = page.locator('[data-testid="learning-dashboard"]');
    await expect(dashboard).toBeVisible();

    // Step 9: Verify all learning material tabs are present
    await expect(page.locator('[data-testid="summary-tab"]')).toBeVisible();
    await expect(page.locator('[data-testid="adapted-content-tab"]')).toBeVisible();
    await expect(page.locator('[data-testid="mindmap-tab"]')).toBeVisible();
    await expect(page.locator('[data-testid="audio-tab"]')).toBeVisible();
    await expect(page.locator('[data-testid="quiz-tab"]')).toBeVisible();

    // Step 10: Verify content is generated in each tab
    // Summary tab
    await page.locator('[data-testid="summary-tab"]').click();
    const summaryContent = page.locator('[data-testid="summary-content"]');
    await expect(summaryContent).toBeVisible();
    await expect(summaryContent).not.toBeEmpty();

    // Adapted content tab
    await page.locator('[data-testid="adapted-content-tab"]').click();
    const adaptedContent = page.locator('[data-testid="adapted-content"]');
    await expect(adaptedContent).toBeVisible();
    await expect(adaptedContent).not.toBeEmpty();

    // Mind map tab
    await page.locator('[data-testid="mindmap-tab"]').click();
    const mindMap = page.locator('[data-testid="mindmap-container"]');
    await expect(mindMap).toBeVisible();

    // Audio tab
    await page.locator('[data-testid="audio-tab"]').click();
    const audioPlayer = page.locator('[data-testid="audio-player"]');
    await expect(audioPlayer).toBeVisible();

    // Quiz tab
    await page.locator('[data-testid="quiz-tab"]').click();
    const quiz = page.locator('[data-testid="quiz-container"]');
    await expect(quiz).toBeVisible();

    // Verify quiz has questions
    const quizQuestions = page.locator('[data-testid="quiz-question"]');
    const questionCount = await quizQuestions.count();
    expect(questionCount).toBeGreaterThan(0);
    await expect(quizQuestions.first()).toBeVisible();
  });

  test('should validate content length limits', async ({ page }) => {
    const textInput = page.locator('[data-testid="text-input"]');

    // Test minimum content requirement
    await textInput.fill('Short');
    const generateButton = page.locator('[data-testid="generate-button"]');
    await expect(generateButton).toBeDisabled();

    // Test maximum content limit
    const longContent = 'A'.repeat(60000); // Exceeds 50k limit
    await textInput.fill(longContent);

    const errorMessage = page.locator('[data-testid="content-error"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('too long');
  });

  test('should show processing progress indicators', async ({ page }) => {
    // Input valid content and preferences
    await page.locator('[data-testid="text-input"]').fill(TEST_CONTENT);
    await page.locator('[data-testid="grade-selector"]').selectOption('7');
    await page.locator('[data-testid="interest-selector"]').selectOption('science');

    // Start processing
    await page.locator('[data-testid="generate-button"]').click();

    // Verify progress steps appear
    const progressSteps = [
      '[data-testid="step-summarizing"]',
      '[data-testid="step-adapting"]',
      '[data-testid="step-mindmap"]',
      '[data-testid="step-audio"]',
      '[data-testid="step-quiz"]'
    ];

    for (const step of progressSteps) {
      await expect(page.locator(step)).toBeVisible({ timeout: 10000 });
    }
  });

  test('should handle Chrome AI API unavailability gracefully', async ({ page }) => {
    // Mock Chrome AI APIs as unavailable
    await page.addInitScript(() => {
      // Remove Chrome AI globals to simulate unavailability
      delete (globalThis as any).Summarizer;
      delete (globalThis as any).Rewriter;
      delete (globalThis as any).Writer;
    });

    await page.goto('/');

    // Should show compatibility warning
    const compatibilityWarning = page.locator('[data-testid="compatibility-warning"]');
    await expect(compatibilityWarning).toBeVisible();
    await expect(compatibilityWarning).toContainText('Chrome AI');

    // Generate button should be disabled or show alternative message
    const generateButton = page.locator('[data-testid="generate-button"]');
    await expect(generateButton).toBeDisabled();
  });

  test('should maintain user preferences across page reloads', async ({ page }) => {
    // Set preferences
    await page.locator('[data-testid="text-input"]').fill(TEST_CONTENT);
    await page.locator('[data-testid="grade-selector"]').selectOption('10');
    await page.locator('[data-testid="interest-selector"]').selectOption('technology');

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify preferences are restored (if implemented)
    // Note: This test may need adjustment based on actual implementation
    const gradeSelector = page.locator('[data-testid="grade-selector"]');
    const interestSelector = page.locator('[data-testid="interest-selector"]');

    // These assertions may need to be adjusted based on implementation
    await expect(gradeSelector).toHaveValue('10');
    await expect(interestSelector).toHaveValue('technology');
  });
});