import { expect, test, devices } from '@playwright/test';

const SCREEN_ORIENTATION_PAGE = '/screen-orientation.html';

test.use(devices['iPhone 11 Pro Max landscape']);

test('should detect landscape orientation', async ({ page }) => {
  await page.goto(SCREEN_ORIENTATION_PAGE);

  await page.setViewportSize({ width: 1080, height: 10920 });

  const typeContainer = await page.$('#type');
  const typeTextContent = await typeContainer.textContent();

  expect(typeTextContent).toBe('landscape-primary');
});
