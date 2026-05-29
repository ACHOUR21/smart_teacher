import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('redirects unauthenticated user from dashboard', async ({ page }) => {
    await page.goto('/student');
    await expect(page).toHaveURL(/\/login/);
  });

  test('redirects unauthenticated user from teacher dashboard', async ({ page }) => {
    await page.goto('/teacher');
    await expect(page).toHaveURL(/\/login/);
  });

  test('redirects unauthenticated user from admin dashboard', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/login/);
  });

  test('404 page renders for unknown route', async ({ page }) => {
    await page.goto('/this-route-does-not-exist');
    await expect(page.getByText(/404|not found/i)).toBeVisible();
  });

  test('search page is accessible', async ({ page }) => {
    await page.goto('/search');
    // redirects to login if not authenticated
    await expect(page).toHaveURL(/\/login|search/);
  });
});
