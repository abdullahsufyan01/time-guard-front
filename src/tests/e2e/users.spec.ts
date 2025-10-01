import { test, expect } from '@playwright/test';

test.describe('User Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
  });

  test('should navigate to users page', async ({ page }) => {
    await page.goto('/users');
    await expect(page.locator('h1')).toContainText('Users');
  });

  test('should open add user form', async ({ page }) => {
    await page.goto('/users');
    await page.click('text=Add User');
    await expect(page).toHaveURL('/users/new');
    await expect(page.locator('h1')).toContainText('Add New User');
  });

  test('should search for users', async ({ page }) => {
    await page.goto('/users');
    await page.fill('input[placeholder="Search users..."]', 'Ali');
    await expect(page.locator('table')).toContainText('Ali');
  });
});
