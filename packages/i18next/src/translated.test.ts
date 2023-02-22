import { allSettled, createEvent, createStore, fork } from 'effector';
import { createInstance } from 'i18next';
import { describe, expect, test } from 'vitest';

import { createI18nextIntegration } from './integration';

describe('integration.$t', () => {
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

  describe('overload: with object', () => {
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
