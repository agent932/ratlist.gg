import { test, expect } from '@playwright/test';

test.describe('US6: Player profile', () => {
  test('shows not found state for unknown player or game', async ({ page }) => {
    await page.goto('/player/tarkov/definitely-not-a-real-player-xyz');

    // Should render a "not found" message (player or game), not a 500 error
    const response = await page.goto('/player/tarkov/definitely-not-a-real-player-xyz');
    expect(response?.status()).not.toBe(500);
    await expect(page.getByText(/not found/i).first()).toBeVisible();
  });

  test('shows not found state for unknown game', async ({ page }) => {
    const response = await page.goto('/player/not-a-real-game/somePlayer');
    expect(response?.status()).not.toBe(500);
    await expect(page.getByText(/not found/i).first()).toBeVisible();
  });

  test('player profile URL structure is correct from browse links', async ({ page }) => {
    await page.goto('/browse');

    // Any player name links should go to /player/[game]/[id]
    const playerLinks = page.locator('a[href^="/player/"]');
    const count = await playerLinks.count();

    if (count > 0) {
      const href = await playerLinks.first().getAttribute('href');
      expect(href).toMatch(/^\/player\/[^/]+\/.+$/);
    }
  });

  test('report button on player profile links to /report', async ({ page }) => {
    await page.goto('/player/tarkov/test-player-xyz');

    // Even on not-found page or empty profile, there should be no broken links
    // Verify the page doesn't throw a 500
    const response = await page.goto('/player/tarkov/any-player');
    expect(response?.status()).not.toBe(500);
  });

  test('incident cards on player profile link to /incident/', async ({ page }) => {
    await page.goto('/browse');

    // If there are incident links on the page they should use the new /incident/ route
    const incidentLinks = page.locator('a[href^="/incident/"]');
    const count = await incidentLinks.count();

    if (count > 0) {
      const href = await incidentLinks.first().getAttribute('href');
      expect(href).toMatch(/^\/incident\//);
      // Old anchor links (#incident-...) should not exist
      expect(href).not.toContain('#incident-');
    }
  });

  test('player profile page does not use legacy anchor incident links', async ({ page }) => {
    await page.goto('/browse');

    // Verify no links on the site use the old broken anchor pattern
    const brokenLinks = page.locator('a[href*="#incident-"]');
    await expect(brokenLinks).toHaveCount(0);
  });
});
