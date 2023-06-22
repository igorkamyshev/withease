import { allSettled, createEvent, fork } from 'effector';
import { describe, test, expect } from 'vitest';

import { trackPreferredLanguages } from './preferred_languages';

describe('trackPreferredLanguages on server', () => {
  const setup = createEvent();

  const { $languages } = trackPreferredLanguages({ setup });

  test('do nothing for empty header', async () => {
    const scope = fork();

    await allSettled(setup, { scope });

    expect(scope.getState($languages)).toEqual([]);
  });

  test.each([
    { header: 'en-US,en;q=0.9', result: ['en-US', 'en'] },
    {
      header: 'fr-CH, fr;q=0.9, en;q=0.8, de;q=0.7, *;q=0.5',
      result: ['fr-CH', 'fr', 'en', 'de'],
    },
    {
      header: 'de-CH',
      result: ['de-CH'],
    },
  ])('use value from valid header $header', async ({ header, result }) => {
    const scope = fork({
      values: [[trackPreferredLanguages.$acceptLanguageHeader, header]],
    });

    await allSettled(setup, { scope });

    expect(scope.getState($languages)).toEqual(result);
  });
});
