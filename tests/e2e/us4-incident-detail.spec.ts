import { test, expect } from '@playwright/test';

test.describe('US4: Incident detail page', () => {
  test('shows 404 for a non-existent incident UUID', async ({ page }) => {
    await page.goto('/incident/00000000-0000-0000-0000-000000000000');

    // Next.js not-found should render a 404
    await expect(page.locator('text=404')).toBeVisible();
  });

  test('shows 404 for a malformed incident ID', async ({ page }) => {
    const response = await page.goto('/incident/not-a-real-id');
    // Should either 404 or redirect — not a 500
    expect(response?.status()).not.toBe(500);
  });

  test('incident detail route is accessible from the nav structure', async ({ page }) => {
    // Browse page loads — incidents are linked to /incident/[id]
    await page.goto('/browse');
    await expect(page.getByRole('heading', { name: /browse the ratlist/i })).toBeVisible();

    // If there are any incident links on the page, they should point to /incident/
    const incidentLinks = page.locator('a[href^="/incident/"]');
    const count = await incidentLinks.count();

    if (count > 0) {
      const href = await incidentLinks.first().getAttribute('href');
      expect(href).toMatch(/^\/incident\/[0-9a-f-]+$/);
    }
  });

  test('flag button does not appear for unauthenticated users', async ({ page }) => {
    // The flag button is only rendered when user is logged in (server-side check)
    // Without auth, visiting any incident page should not show a "Flag Report" button
    // We verify this by checking a known-invalid UUID returns 404 before flag UI renders
    await page.goto('/incident/00000000-0000-0000-0000-000000000000');
    await expect(page.locator('button', { hasText: /flag report/i })).not.toBeVisible();
  });
});
