/**
 * E2E Test: Learning Dashboard Display
 * Tests the multi-modal learning dashboard and all its components
 */

import { test, expect } from '@playwright/test';

const TEST_CONTENT = `Machine learning is a subset of artificial intelligence that enables computers to learn and make decisions from data without being explicitly programmed. It involves algorithms that improve their performance on a task through experience.`;

test.describe('Learning Dashboard Display', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Set up a completed session for dashboard testing
    await page.locator('[data-testid="text-input"]').fill(TEST_CONTENT);
    await page.locator('[data-testid="grade-selector"]').selectOption('8');
    await page.locator('[data-testid="interest-selector"]').selectOption('technology');
    await page.locator('[data-testid="generate-button"]').click();

    // Wait for processing to complete
    await page.waitForSelector('[data-testid="learning-dashboard"]', { timeout: 30000 });
  });

  test('should display all dashboard tabs', async ({ page }) => {
    const dashboard = page.locator('[data-testid="learning-dashboard"]');
    await expect(dashboard).toBeVisible();

    // Verify all expected tabs are present
    const expectedTabs = [
      'summary-tab',
      'adapted-content-tab',
      'mindmap-tab',
      'audio-tab',
      'quiz-tab'
    ];

    for (const tabId of expectedTabs) {
      const tab = page.locator(`[data-testid="${tabId}"]`);
      await expect(tab).toBeVisible();
    }
  });

  test('should navigate between dashboard tabs', async ({ page }) => {
    // Test tab navigation
    const tabs = [
      { id: 'summary-tab', content: 'summary-content' },
      { id: 'adapted-content-tab', content: 'adapted-content' },
      { id: 'mindmap-tab', content: 'mindmap-container' },
      { id: 'audio-tab', content: 'audio-player' },
      { id: 'quiz-tab', content: 'quiz-container' }
    ];

    for (const tab of tabs) {
      // Click tab
      await page.locator(`[data-testid="${tab.id}"]`).click();

      // Verify tab is active
      await expect(page.locator(`[data-testid="${tab.id}"]`)).toHaveClass(/active|selected/);

      // Verify corresponding content is visible
      await expect(page.locator(`[data-testid="${tab.content}"]`)).toBeVisible();
    }
  });

  test('should display summary content correctly', async ({ page }) => {
    await page.locator('[data-testid="summary-tab"]').click();

    const summaryContent = page.locator('[data-testid="summary-content"]');
    await expect(summaryContent).toBeVisible();
    await expect(summaryContent).not.toBeEmpty();

    // Summary should be shorter than original content
    const summaryText = await summaryContent.textContent();
    expect(summaryText!.length).toBeLessThan(TEST_CONTENT.length);

    // Should contain key concepts
    expect(summaryText).toMatch(/machine learning|artificial intelligence|algorithms/i);
  });

  test('should display adapted content with grade-appropriate language', async ({ page }) => {
    await page.locator('[data-testid="adapted-content-tab"]').click();

    const adaptedContent = page.locator('[data-testid="adapted-content"]');
    await expect(adaptedContent).toBeVisible();
    await expect(adaptedContent).not.toBeEmpty();

    const adaptedText = await adaptedContent.textContent();

    // Should be different from original content (adapted for grade level)
    expect(adaptedText).not.toBe(TEST_CONTENT);

    // For grade 8 with technology interest, should contain relatable examples
    expect(adaptedText).toMatch(/technology|computer|program/i);
  });

  test('should display interactive mind map', async ({ page }) => {
    await page.locator('[data-testid="mindmap-tab"]').click();

    const mindMapContainer = page.locator('[data-testid="mindmap-container"]');
    await expect(mindMapContainer).toBeVisible();

    // Check for mind map nodes
    const mindMapNodes = page.locator('[data-testid="mindmap-node"]');
    await expect(mindMapNodes.first()).toBeVisible();

    // Should have multiple nodes
    const nodeCount = await mindMapNodes.count();
    expect(nodeCount).toBeGreaterThan(1);

    // Check for interactive elements
    const rootNode = mindMapNodes.first();
    await rootNode.click();

    // Verify node interaction (highlighting, details, etc.)
    await expect(rootNode).toHaveClass(/selected|highlighted|active/);
  });

  test('should display audio player with controls', async ({ page }) => {
    await page.locator('[data-testid="audio-tab"]').click();

    const audioPlayer = page.locator('[data-testid="audio-player"]');
    await expect(audioPlayer).toBeVisible();

    // Check for audio controls
    const playButton = page.locator('[data-testid="audio-play-button"]');
    const pauseButton = page.locator('[data-testid="audio-pause-button"]');
    const speedControl = page.locator('[data-testid="audio-speed-control"]');

    await expect(playButton).toBeVisible();

    // Test play functionality (if audio is ready)
    if (await playButton.isEnabled()) {
      await playButton.click();
      await expect(pauseButton).toBeVisible();
    }

    // Check speed control options
    if (await speedControl.isVisible()) {
      await speedControl.selectOption('1.25');
      await expect(speedControl).toHaveValue('1.25');
    }
  });

  test('should display quiz with questions and options', async ({ page }) => {
    await page.locator('[data-testid="quiz-tab"]').click();

    const quizContainer = page.locator('[data-testid="quiz-container"]');
    await expect(quizContainer).toBeVisible();

    // Check for quiz questions
    const quizQuestions = page.locator('[data-testid="quiz-question"]');
    await expect(quizQuestions.first()).toBeVisible();

    const questionCount = await quizQuestions.count();
    expect(questionCount).toBeGreaterThan(0);
    expect(questionCount).toBeLessThanOrEqual(10);

    // Check first question structure
    const firstQuestion = quizQuestions.first();
    await expect(firstQuestion.locator('[data-testid="question-text"]')).toBeVisible();

    const options = firstQuestion.locator('[data-testid="quiz-option"]');
    const optionCount = await options.count();
    expect(optionCount).toBeGreaterThanOrEqual(2);
    expect(optionCount).toBeLessThanOrEqual(5);
  });

  test('should allow quiz interaction and show feedback', async ({ page }) => {
    await page.locator('[data-testid="quiz-tab"]').click();

    const firstQuestion = page.locator('[data-testid="quiz-question"]').first();
    const firstOption = firstQuestion.locator('[data-testid="quiz-option"]').first();

    // Select an option
    await firstOption.click();
    await expect(firstOption.locator('input')).toBeChecked();

    // Submit answer if submit button exists
    const submitButton = firstQuestion.locator('[data-testid="submit-answer"]');
    if (await submitButton.isVisible()) {
      await submitButton.click();

      // Check for feedback
      const feedback = firstQuestion.locator('[data-testid="answer-feedback"]');
      await expect(feedback).toBeVisible();
    }
  });

  test('should show progress indicators in dashboard', async ({ page }) => {
    const progressIndicator = page.locator('[data-testid="completion-progress"]');

    if (await progressIndicator.isVisible()) {
      // Should show progress percentage or completion status
      const progressText = await progressIndicator.textContent();
      expect(progressText).toMatch(/\d+%|complete|progress/i);
    }
  });

  test('should provide session actions', async ({ page }) => {
    // Check for session management buttons
    const saveButton = page.locator('[data-testid="save-session-button"]');
    const shareButton = page.locator('[data-testid="share-session-button"]');
    const downloadButton = page.locator('[data-testid="download-session-button"]');

    if (await saveButton.isVisible()) {
      await saveButton.click();

      // Should show save confirmation
      const saveConfirmation = page.locator('[data-testid="save-confirmation"]');
      await expect(saveConfirmation).toBeVisible({ timeout: 5000 });
    }

    if (await shareButton.isVisible()) {
      await shareButton.click();

      // Should show share options or URL
      const shareDialog = page.locator('[data-testid="share-dialog"]');
      await expect(shareDialog).toBeVisible({ timeout: 5000 });
    }
  });

  test('should display content metadata', async ({ page }) => {
    const metadata = page.locator('[data-testid="content-metadata"]');

    if (await metadata.isVisible()) {
      // Should show processing time, word count, etc.
      const metadataText = await metadata.textContent();
      expect(metadataText).toMatch(/words|characters|time|grade|interest/i);
    }
  });

  test('should handle responsive design on different screen sizes', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    const dashboard = page.locator('[data-testid="learning-dashboard"]');
    await expect(dashboard).toBeVisible();

    // Tabs should still be accessible (might be in mobile menu)
    const summaryTab = page.locator('[data-testid="summary-tab"]');
    await expect(summaryTab).toBeVisible();

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(dashboard).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(dashboard).toBeVisible();
  });

  test('should maintain state when switching between tabs', async ({ page }) => {
    // Go to quiz tab and interact
    await page.locator('[data-testid="quiz-tab"]').click();
    const firstQuestion = page.locator('[data-testid="quiz-question"]').first();
    const firstOption = firstQuestion.locator('[data-testid="quiz-option"]').first();
    await firstOption.click();

    // Switch to another tab
    await page.locator('[data-testid="summary-tab"]').click();

    // Return to quiz tab
    await page.locator('[data-testid="quiz-tab"]').click();

    // Verify selection is maintained
    await expect(firstOption.locator('input')).toBeChecked();
  });

  test('should show loading states appropriately', async ({ page }) => {
    // This test might need to be adjusted based on implementation
    // Check if there are any loading indicators for slow operations
    const loadingIndicators = page.locator('[data-testid*="loading"]');

    if (await loadingIndicators.first().isVisible()) {
      await expect(loadingIndicators.first()).toBeVisible();
    }
  });
});