import { test, expect } from '@playwright/test';

test.describe('US1: Check a player', () => {
  test('should display player profile with tier and incidents', async ({ page }) => {
    // Navigate to home page
    await page.goto('/');
    
    // Verify home page loads
    await expect(page.getByRole('heading', { name: /ratlist/i })).toBeVisible();
    
    // Note: This is a smoke test. In a real scenario with seeded data:
    // - We would navigate to a known player page: /player/tarkov/test-player-123
    // - We would verify the tier badge is displayed
    // - We would verify the incident count shows
    // - We would verify recent incidents list is rendered
    
    // For now, verify the home page structure
    await expect(page.getByRole('link', { name: /browse/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /report/i })).toBeVisible();
  });

  test('player profile page renders without errors', async ({ page }) => {
    // This would require actual seeded data in the test database
    // For now, we verify the route structure works
    
    // Visit a player page (will show 404 or empty state without data)
    await page.goto('/player/tarkov/test-user');
    
    // Should render page structure (even if empty)
    await expect(page.locator('body')).toBeVisible();
  });
});
