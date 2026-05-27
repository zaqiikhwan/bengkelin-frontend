import { test, expect } from '@playwright/test';

test('landing page loads with hero section', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Find Trusted Bengkels' })).toBeVisible();
  await expect(page.getByText('Discover reliable automotive workshops')).toBeVisible();
});

test('landing page has CTA buttons', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('link', { name: 'Find Bengkels' }).nth(1)).toBeVisible();
  await expect(page.getByRole('link', { name: 'Join as Mitra' })).toBeVisible();
});

test('landing page shows features section', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Why Choose Bengkelin?' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Verified Bengkels' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Quality Service' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Customer Reviews' })).toBeVisible();
});
