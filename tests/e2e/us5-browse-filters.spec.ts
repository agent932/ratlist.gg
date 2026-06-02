import { test, expect } from '@playwright/test';

test.describe('US5: Browse filters', () => {
  test('tier filter chips are all visible', async ({ page }) => {
    await page.goto('/browse');

    for (const tier of ['F', 'D', 'C', 'B', 'A', 'S']) {
      await expect(page.locator('button', { hasText: new RegExp(`^${tier}$`) })).toBeVisible();
    }
    await expect(page.locator('button', { hasText: /^All$/ })).toBeVisible();
  });

  test('clicking a tier chip updates the URL', async ({ page }) => {
    await page.goto('/browse');

    await page.locator('button', { hasText: /^F$/ }).click();
    await page.waitForURL(/tier=F/);
    expect(page.url()).toContain('tier=F');
  });

  test('clicking All clears the tier filter', async ({ page }) => {
    await page.goto('/browse?game=tarkov&period=week&tier=F');

    await page.locator('button', { hasText: /^All$/ }).click();
    await page.waitForURL((url) => !url.toString().includes('tier='));
    expect(page.url()).not.toContain('tier=');
  });

  test('clicking the same tier chip twice clears it', async ({ page }) => {
    await page.goto('/browse');

    await page.locator('button', { hasText: /^D$/ }).click();
    await page.waitForURL(/tier=D/);

    await page.locator('button', { hasText: /^D$/ }).click();
    await page.waitForURL((url) => !url.toString().includes('tier='));
    expect(page.url()).not.toContain('tier=');
  });

  test('period filter updates the URL', async ({ page }) => {
    await page.goto('/browse');

    await page.getByLabel(/period/i).selectOption('month');
    await page.waitForURL(/period=month/);
    expect(page.url()).toContain('period=month');
  });

  test('game filter updates the URL', async ({ page }) => {
    await page.goto('/browse');

    const gameSelect = page.getByLabel(/game/i);
    const options = await gameSelect.locator('option').all();

    if (options.length > 1) {
      const secondValue = await options[1].getAttribute('value');
      if (secondValue) {
        await gameSelect.selectOption(secondValue);
        await page.waitForURL(new RegExp(`game=${secondValue}`));
        expect(page.url()).toContain(`game=${secondValue}`);
      }
    }
  });

  test('leaderboard section is present', async ({ page }) => {
    await page.goto('/browse');
    await expect(page.getByRole('heading', { name: /top reported players/i })).toBeVisible();
  });

  test('tier filter persists alongside period filter', async ({ page }) => {
    await page.goto('/browse');

    await page.locator('button', { hasText: /^C$/ }).click();
    await page.waitForURL(/tier=C/);

    await page.getByLabel(/period/i).selectOption('all');
    await page.waitForURL(/period=all/);

    expect(page.url()).toContain('tier=C');
    expect(page.url()).toContain('period=all');
  });
});
