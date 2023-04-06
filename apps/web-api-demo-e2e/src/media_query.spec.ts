import { expect, test } from '@playwright/test';

test('should detect mobile viewport', async ({ page }) => {
  await page.goto('/');
  await page.setViewportSize({ width: 500, height: 1000 });

  const mobileContainer = await page.$('#mobile');
  const mobileTextContent = await mobileContainer.textContent();

  const desktopContainer = await page.$('#desktop');
  const desktopTextContent = await desktopContainer.textContent();

  expect(mobileTextContent).toBe('true');
  expect(desktopTextContent).toBe('false');
});

test('should detect desktop viewport', async ({ page }) => {
  await page.goto('/');
  await page.setViewportSize({ width: 1000, height: 1000 });

  const mobileContainer = await page.$('#mobile');
  const mobileTextContent = await mobileContainer.textContent();

  const desktopContainer = await page.$('#desktop');
  const desktopTextContent = await desktopContainer.textContent();

  expect(mobileTextContent).toBe('false');
  expect(desktopTextContent).toBe('true');
});
