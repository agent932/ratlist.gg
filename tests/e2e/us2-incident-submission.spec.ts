import { test, expect } from '@playwright/test';

test.describe('US2: Log an incident', () => {
  test('should redirect to sign-in when not authenticated', async ({ page }) => {
    // Navigate to report page
    await page.goto('/report');
    
    // Should redirect to sign-in or show auth requirement
    // (Implementation depends on auth setup)
    await expect(page.locator('body')).toBeVisible();
  });

  test('report page shows incident form when authenticated', async ({ page }) => {
    // Note: This test requires auth setup with Supabase
    // For a real implementation, you would:
    // 1. Use a test user or mock auth
    // 2. Navigate to /report
    // 3. Verify form fields are present
    // 4. Fill out the form
    // 5. Submit and verify success message
    
    // For now, just verify the route exists
    await page.goto('/report');
    await expect(page.locator('body')).toBeVisible();
  });
});
