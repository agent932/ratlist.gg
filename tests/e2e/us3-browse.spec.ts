import { test, expect } from '@playwright/test';

test.describe('US3: Browse the ratlist', () => {
  test('should display browse page with filters', async ({ page }) => {
    // Navigate to browse page
    await page.goto('/browse');
    
    // Verify heading
    await expect(page.getByRole('heading', { name: /browse the ratlist/i })).toBeVisible();
    
    // Verify filters are present
    await expect(page.getByLabel(/game/i)).toBeVisible();
    await expect(page.getByLabel(/period/i)).toBeVisible();
    
    // Verify leaderboard section
    await expect(page.getByRole('heading', { name: /top reported players/i })).toBeVisible();
    
    // Verify recent incidents section
    await expect(page.getByRole('heading', { name: /recent incidents/i })).toBeVisible();
  });

  test('should allow filtering by period', async ({ page }) => {
    await page.goto('/browse');
    
    // Select different period
    await page.getByLabel(/period/i).selectOption('month');
    
    // Wait for navigation
    await page.waitForURL(/period=month/);
    
    // Verify URL updated
    expect(page.url()).toContain('period=month');
  });
});
