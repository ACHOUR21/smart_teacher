import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('landing page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/EduAI/);
    await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible();
  });

  test('login page renders form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
    await expect(page.getByPlaceholder(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('register page renders role picker', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByText(/student/i).first()).toBeVisible();
    await expect(page.getByText(/teacher/i).first()).toBeVisible();
    await expect(page.getByText(/parent/i).first()).toBeVisible();
  });

  test('login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder(/email/i).fill('notreal@test.com');
    await page.getByPlaceholder(/password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.getByText(/invalid credentials|error/i)).toBeVisible({ timeout: 5000 });
  });

  test('forgot password page works', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.getByPlaceholder(/email/i).fill('test@test.com');
    await page.getByRole('button', { name: /send/i }).click();
    await expect(page.getByText(/check your email|sent/i)).toBeVisible({ timeout: 5000 });
  });
});
