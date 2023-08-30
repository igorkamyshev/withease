import { expect, test } from '@playwright/test';

const HOTKEY_PAGE = '/hotkey.html';

test('TODO:', async ({ page }) => {
  await page.goto(HOTKEY_PAGE);

  expect(true).toBe(true);
});
