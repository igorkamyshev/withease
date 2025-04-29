import { allSettled, createEvent, createStore, fork } from 'effector';
import { createInstance } from 'i18next';
import { describe, expect, test } from 'vitest';

import { createI18nextIntegration } from './integration';

describe('integration.translated', () => {
  describe('overload: key', () => {
    test('supports simple key', async () => {
      const instance = createInstance({
        resources: { th: { common: { key: 'valueOne' } } },
        lng: 'th',
      });

      const setup = createEvent();

      const { translated } = createI18nextIntegration({
        instance,
        setup,
      });

      const $result = translated('common:key');

      const scope = fork();

      await allSettled(setup, { scope });

      expect(scope.getState($result)).toBe('valueOne');
    });

    test('supports simple key and language change', async () => {
      const instance = createInstance({
        resources: {
          th: { common: { key: 'valueOne' } },
          en: { common: { key: 'valueTwo' } },
        },
        lng: 'th',
      });

      const setup = createEvent();

      const { translated, changeLanguageFx } = createI18nextIntegration({
        instance,
        setup,
      });

      const $result = translated('common:key');

      const scope = fork();

      await allSettled(setup, { scope });

      expect(scope.getState($result)).toBe('valueOne');

      await allSettled(changeLanguageFx, { scope, params: 'en' });

      expect(scope.getState($result)).toBe('valueTwo');
    });
  });

  describe('overload: template literal', () => {
    test('changes after key store changed', async () => {
      const instance = createInstance({
        resources: { th: { common: { one: 'valueOne', two: 'valueTwo' } } },
        lng: 'th',
      });

      const setup = createEvent();

      const { translated } = createI18nextIntegration({
        instance,
        setup,
      });

      const $key = createStore('one');

      const $result = translated`common:${$key}`;

      const scope = fork();

      await allSettled(setup, { scope });

      expect(scope.getState($result)).toBe('valueOne');

      await allSettled($key, { scope, params: 'two' });

      expect(scope.getState($result)).toBe('valueTwo');
    });
  });

  describe('overload: key with variables', () => {
    test('changes after variables store changed', async () => {
      const instance = createInstance({
        resources: { th: { common: { key: 'valueOne {{name}}' } } },
        lng: 'th',
      });

      const setup = createEvent();

      const { translated } = createI18nextIntegration({
        instance,
        setup,
      });

      const $name = createStore('wow');

      const $result = translated('common:key', { name: $name });

      const scope = fork();

      await allSettled(setup, { scope });

      expect(scope.getState($result)).toBe('valueOne wow');

      await allSettled($name, { scope, params: 'kek' });

      expect(scope.getState($result)).toBe('valueOne kek');
    });
  });
});
