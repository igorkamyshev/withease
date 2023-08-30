import { expect, test } from '@playwright/test';

const SEQUENCE_PAGE = '/sequence.html';

test('static string as a sequence', async ({ page }) => {
  const itemQuery = createItemQuery('static');

  await page.goto(SEQUENCE_PAGE);

  /* This sequence is harcoded in keyboard-demo/src/sequence.ts */
  const DEFAULT_SEQUENCE = 'my-fav-st';

  await page.keyboard.type(DEFAULT_SEQUENCE);

  /* List contains single hardcoded sequence as an item */
  expect(
    await page.$(itemQuery(1)).then((container) => container.textContent())
  ).toBe(DEFAULT_SEQUENCE);
  expect(await page.$(itemQuery(2))).toBeNull();

  await page.keyboard.type(DEFAULT_SEQUENCE);

  /* List contains second hardcoded sequence as an item */
  expect(
    await page.$(itemQuery(2)).then((container) => container.textContent())
  ).toBe(DEFAULT_SEQUENCE);
});

test('change sequence on the fly', async ({ page }) => {
  const itemQuery = createItemQuery('dynamic');

  await page.goto(SEQUENCE_PAGE);

  /* This sequence is default value for dynamic sequence in keyboard-demo/src/sequence.ts */
  const DEFAULT_SEQUENCE = 'iddqd';

  await page.keyboard.type(DEFAULT_SEQUENCE);

  /* List contains single default sequence as an item */
  expect(
    await page.$(itemQuery(1)).then((container) => container.textContent())
  ).toBe(DEFAULT_SEQUENCE);
  expect(await page.$(itemQuery(2))).toBeNull();

  /* Change target sequence by input */
  const SECOND_SEQUENCE = 'idkfa';
  const secondSequenceInput = await page.$('#target-sequence');
  await secondSequenceInput.fill(SECOND_SEQUENCE);

  await page.keyboard.type(SECOND_SEQUENCE);

  /* List contains single changed sequence as an item */
  expect(
    await page.$(itemQuery(2)).then((container) => container.textContent())
  ).toBe(SECOND_SEQUENCE);
});

function createItemQuery(type: 'static' | 'dynamic') {
  return (index: number) => `#${type}-output-list li:nth-child(${index})`;
}
