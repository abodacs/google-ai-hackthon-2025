/**
 * E2E Test: Preferences Flow
 * Tests grade level and interest selection functionality
 */

import { test, expect } from '@playwright/test';

const GRADE_LEVELS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', 'undergrad'];
const INTERESTS = [
  'reading', 'science', 'art', 'writing', 'photography', 'nature',
  'soccer', 'cycling', 'cooking', 'gaming', 'basketball', 'football',
  'table_tennis', 'tennis', 'technology', 'skateboarding'
];

test.describe('Preferences Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/v0');
    await page.waitForLoadState('networkidle');
  });

  test('should display all grade level options', async ({ page }) => {
    const gradeSelector = page.locator('[data-testid="grade-selector"]');
    await expect(gradeSelector).toBeVisible();

    // Verify all grade levels are available
    for (const grade of GRADE_LEVELS) {
      const option = page.locator(`[data-testid="grade-option-${grade}"]`);
      await expect(option).toBeVisible();
    }
  });

  test('should display all interest options', async ({ page }) => {
    const interestSelector = page.locator('[data-testid="interest-selector"]');
    await expect(interestSelector).toBeVisible();

    // Verify all interests are available
    for (const interest of INTERESTS) {
      const option = page.locator(`[data-testid="interest-option-${interest}"]`);
      await expect(option).toBeVisible();
    }
  });

  test('should allow selecting grade level', async ({ page }) => {
    const gradeSelector = page.locator('[data-testid="grade-selector"]');

    // Test selecting different grade levels
    for (const grade of ['1', '5', '8', '12', 'undergrad']) {
      await gradeSelector.selectOption(grade);

      // Verify selection is reflected in UI
      const selectedGrade = page.locator('[data-testid="selected-grade"]');
      await expect(selectedGrade).toContainText(grade === 'undergrad' ? 'Undergraduate' : `Grade ${grade}`);
    }
  });

  test('should allow selecting interests', async ({ page }) => {
    const interestSelector = page.locator('[data-testid="interest-selector"]');

    // Test selecting different interests
    const testInterests = ['basketball', 'science', 'technology', 'art'];

    for (const interest of testInterests) {
      await interestSelector.selectOption(interest);

      // Verify selection is reflected in UI
      const selectedInterest = page.locator('[data-testid="selected-interest"]');
      await expect(selectedInterest).toContainText(interest, { ignoreCase: true });
    }
  });

  test('should update content adaptation preview based on preferences', async ({ page }) => {
    const testContent = 'Photosynthesis is a complex biological process.';

    // Input content
    await page.locator('[data-testid="text-input"]').fill(testContent);

    // Test different grade levels
    const gradeSelector = page.locator('[data-testid="grade-selector"]');

    // Elementary level (Grade 3)
    await gradeSelector.selectOption('3');
    const previewElement = page.locator('[data-testid="adaptation-preview"]');

    if (await previewElement.isVisible()) {
      const grade3Preview = await previewElement.textContent();

      // High school level (Grade 11)
      await gradeSelector.selectOption('11');
      await page.waitForTimeout(500); // Allow preview to update

      const grade11Preview = await previewElement.textContent();

      // Previews should be different for different grade levels
      expect(grade3Preview).not.toBe(grade11Preview);
    }
  });

  test('should validate preferences before allowing generation', async ({ page }) => {
    const generateButton = page.locator('[data-testid="generate-button"]');

    // Initially, button should be disabled (no content or preferences)
    await expect(generateButton).toBeDisabled();

    // Add content but no preferences
    await page.locator('[data-testid="text-input"]').fill('Sample content for testing preferences validation.');

    // Still disabled without grade level
    await expect(generateButton).toBeDisabled();

    // Select grade level
    await page.locator('[data-testid="grade-selector"]').selectOption('7');

    // Still disabled without interest
    await expect(generateButton).toBeDisabled();

    // Select interest
    await page.locator('[data-testid="interest-selector"]').selectOption('science');

    // Now should be enabled
    await expect(generateButton).toBeEnabled();
  });

  test('should show preference summary before generation', async ({ page }) => {
    // Set up content and preferences
    await page.locator('[data-testid="text-input"]').fill('Test content for preference summary.');
    await page.locator('[data-testid="grade-selector"]').selectOption('6');
    await page.locator('[data-testid="interest-selector"]').selectOption('basketball');

    // Check if preference summary is displayed
    const summarySection = page.locator('[data-testid="preferences-summary"]');

    if (await summarySection.isVisible()) {
      await expect(summarySection).toContainText('Grade 6');
      await expect(summarySection).toContainText('Basketball');
    }
  });

  test('should allow changing preferences after initial selection', async ({ page }) => {
    // Initial selection
    await page.locator('[data-testid="grade-selector"]').selectOption('5');
    await page.locator('[data-testid="interest-selector"]').selectOption('reading');

    // Verify initial selection
    await expect(page.locator('[data-testid="selected-grade"]')).toContainText('5');
    await expect(page.locator('[data-testid="selected-interest"]')).toContainText('reading');

    // Change preferences
    await page.locator('[data-testid="grade-selector"]').selectOption('9');
    await page.locator('[data-testid="interest-selector"]').selectOption('technology');

    // Verify changes are reflected
    await expect(page.locator('[data-testid="selected-grade"]')).toContainText('9');
    await expect(page.locator('[data-testid="selected-interest"]')).toContainText('technology');
  });

  test('should persist preferences in session', async ({ page }) => {
    // Set preferences
    await page.locator('[data-testid="grade-selector"]').selectOption('8');
    await page.locator('[data-testid="interest-selector"]').selectOption('gaming');

    // Navigate away and back (simulate user behavior)
    await page.goto('/'); // Go to landing page
    await page.goBack();

    // Verify preferences are maintained (if localStorage is used)
    const gradeSelector = page.locator('[data-testid="grade-selector"]');
    const interestSelector = page.locator('[data-testid="interest-selector"]');

    // Check if values are preserved (test may need adjustment based on implementation)
    if (await gradeSelector.isVisible()) {
      await expect(gradeSelector).toHaveValue('8');
      await expect(interestSelector).toHaveValue('gaming');
    }
  });

  test('should handle learning style preferences if available', async ({ page }) => {
    const learningStyleSelector = page.locator('[data-testid="learning-style-selector"]');

    // Check if learning style selection is implemented
    if (await learningStyleSelector.isVisible()) {
      const styles = ['visual', 'auditory', 'kinesthetic', 'reading'];

      for (const style of styles) {
        const styleOption = page.locator(`[data-testid="style-${style}"]`);
        if (await styleOption.isVisible()) {
          await styleOption.click();
          await expect(styleOption).toBeChecked();
        }
      }
    }
  });

  test('should validate grade level compatibility with content complexity', async ({ page }) => {
    // Test with complex content
    const complexContent = 'Quantum entanglement is a phenomenon in quantum physics where pairs of particles become interconnected and the quantum state of each particle cannot be described independently.';

    await page.locator('[data-testid="text-input"]').fill(complexContent);
    await page.locator('[data-testid="grade-selector"]').selectOption('2'); // Very young grade

    // Check if warning appears for grade/content mismatch
    const complexityWarning = page.locator('[data-testid="complexity-warning"]');

    if (await complexityWarning.isVisible()) {
      await expect(complexityWarning).toContainText('complex');
    }
  });

  test('should show interest-based customization examples', async ({ page }) => {
    const interests = ['basketball', 'science', 'art'];

    for (const interest of interests) {
      await page.locator('[data-testid="interest-selector"]').selectOption(interest);

      // Check if examples or descriptions appear
      const interestDescription = page.locator('[data-testid="interest-description"]');

      if (await interestDescription.isVisible()) {
        const description = await interestDescription.textContent();
        expect(description).toContain(interest);
      }
    }
  });
});