import { expect, test } from '@playwright/test';

const SEQUENCE_PAGE = '/sequence.html';

test('store', async ({ page }) => {
  await page.goto(SEQUENCE_PAGE);

  const DEFAULT_SEQUENCE = 'my-fav-st';

  await page.keyboard.type(DEFAULT_SEQUENCE);

  expect(
    await page
      .$(itemQuery('static', 1))
      .then((container) => container.textContent())
  ).toBe(DEFAULT_SEQUENCE);

  expect(await page.$(itemQuery('static', 2))).toBeNull();

  await page.keyboard.type(DEFAULT_SEQUENCE);

  expect(
    await page
      .$(itemQuery('static', 2))
      .then((container) => container.textContent())
  ).toBe(DEFAULT_SEQUENCE);
});

test('store', async ({ page }) => {
  await page.goto(SEQUENCE_PAGE);

  const DEFAULT_SEQUENCE = 'iddqd';

  await page.keyboard.type(DEFAULT_SEQUENCE);

  expect(
    await page
      .$(itemQuery('dynamic', 1))
      .then((container) => container.textContent())
  ).toBe(DEFAULT_SEQUENCE);

  expect(await page.$(itemQuery('dynamic', 2))).toBeNull();
});

test('change sequence on the fly', async ({ page }) => {
  await page.goto(SEQUENCE_PAGE);

  const DEFAULT_SEQUENCE = 'iddqd';

  await page.keyboard.type(DEFAULT_SEQUENCE);

  expect(
    await page
      .$(itemQuery('dynamic', 1))
      .then((container) => container.textContent())
  ).toBe(DEFAULT_SEQUENCE);

  const SECOND_SEQUENCE = 'idkfa';
  const secondSequenceInput = await page.$('#target-sequence');
  await secondSequenceInput.fill(SECOND_SEQUENCE);

  await page.keyboard.type(SECOND_SEQUENCE);

  expect(
    await page
      .$(itemQuery('dynamic', 2))
      .then((container) => container.textContent())
  ).toBe(SECOND_SEQUENCE);
});

function itemQuery(type: 'static' | 'dynamic', index: number) {
  return `#${type}-output-list li:nth-child(${index})`;
}
