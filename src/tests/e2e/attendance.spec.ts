import { test, expect } from '@playwright/test';

test.describe('Attendance Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
  });

  test('should display attendance records', async ({ page }) => {
    await page.goto('/attendance');
    await expect(page.locator('h1')).toContainText('Attendance');
    await expect(page.locator('table')).toBeVisible();
  });

  test('should filter attendance by date preset', async ({ page }) => {
    await page.goto('/attendance');
    await page.click('button:has-text("Today")');
    await page.click('text=Last 7 Days');
    await expect(page.locator('table')).toBeVisible();
  });

  test('should export attendance to CSV', async ({ page }) => {
    await page.goto('/attendance');
    const downloadPromise = page.waitForEvent('download');
    await page.click('text=Export CSV');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('attendance-export');
  });
});
