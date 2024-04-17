import { expect, test } from '@playwright/test';

const PREFERRED_LANGUAGES_PAGE = '/preferred-languages.html';

test.use({ locale: 'it-IT' });

test('should detect initial language', async ({ page }) => {
  await page.goto(PREFERRED_LANGUAGES_PAGE);

  const languageContainer = await page.$('#language');
  const languageTextContent = await languageContainer.textContent();

  expect(languageTextContent).toBe('it-IT');
});
