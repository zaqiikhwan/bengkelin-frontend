import { test, expect } from '@playwright/test';

test('Find Bengkels button navigates to /bengkels', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Find Bengkels' }).nth(1).click();
  await expect(page).toHaveURL('/bengkels');
});

test('Join as Mitra button navigates to /register', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Join as Mitra' }).click();
  await expect(page).toHaveURL('/register');
});

test('unknown route shows 404 page', async ({ page }) => {
  await page.goto('/nonexistent-page');
  await expect(page.getByText('404')).toBeVisible();
});
