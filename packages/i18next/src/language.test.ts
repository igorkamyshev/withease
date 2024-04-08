import { describe, test, expect } from 'vitest';
import { allSettled, createEvent, fork } from 'effector';
import { createInstance } from 'i18next';

import { createI18nextIntegration } from './integration';

describe('integration.$language/changeLanguage', () => {
  test('change language', async () => {
    const setup = createEvent();

    const instance = createInstance({
      resources: {
        th: { common: { key: 'th value' } },
        en: { common: { key: 'en value' } },
      },
      lng: 'th',
    });

    const { $language, changeLanguage, translated } = createI18nextIntegration({
      instance,
      setup,
    });

    const $val = translated('common:key');

    const scope = fork();

    // Before initialization
    expect(scope.getState($language)).toBeNull();

    await allSettled(setup, { scope });

    // Initial value
    expect(scope.getState($language)).toBe('th');
    expect(scope.getState($val)).toBe('th value');

    await allSettled(changeLanguage, { scope, params: 'en' });

    // After change
    expect(scope.getState($language)).toBe('en');
    expect(scope.getState($val)).toBe('en value');
  });
});
