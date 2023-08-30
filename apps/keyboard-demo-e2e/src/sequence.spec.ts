import { expect, test } from '@playwright/test';

const SEQUENCE_PAGE = '/sequence.html';

test('TODO:', async ({ page }) => {
  await page.goto(SEQUENCE_PAGE);

  expect(true).toBe(true);
});
