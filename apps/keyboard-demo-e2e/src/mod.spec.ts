import { expect, test } from '@playwright/test';

const MOD_PAGE = '/mod.html';

test('TODO:', async ({ page }) => {
  await page.goto(MOD_PAGE);

  expect(true).toBe(true);
});
