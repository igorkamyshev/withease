import { allSettled, createEvent, createStore, fork } from 'effector';
import { createInstance, type i18n } from 'i18next';
import { describe, expect, test, vi } from 'vitest';

import { createI18nextIntegration } from './integration';

describe('integration.reporting.missingKey', () => {
  test('do not call on exists key', async () => {
    const instance = createInstance({
      resources: { th: { common: { key: 'value' } } },
      lng: 'th',
      saveMissing: true,
    });

    const listener = vi.fn();

    const setup = createEvent();

    const { $t, reporting } = createI18nextIntegration({
      instance,
      setup,
    });

    reporting.missingKey.watch(listener);

    const $result = $t.map((t) => t('common:key'));

    const scope = fork();

    await allSettled(setup, { scope });

    expect(scope.getState($result)).toBe('value');
    expect(listener).not.toBeCalled();
  });

  test('call on absent key', async () => {
    const instance = createInstance({
      resources: { th: { common: { key: 'value' } } },
      lng: 'th',
      saveMissing: true,
    });

    const listener = vi.fn();

    const setup = createEvent();

    const { $t, reporting } = createI18nextIntegration({
      instance,
      setup,
    });

    reporting.missingKey.watch(listener);

    const $result = $t.map((t) => t('common:other_key'));

    const scope = fork();

    await allSettled(setup, { scope });

    expect(scope.getState($result)).toBe('other_key');
    expect(listener).toBeCalled();
    expect(listener).toBeCalledWith({
      key: 'other_key',
      lngs: ['dev'],
      namespace: 'common',
      res: 'other_key',
    });
  });

  test('stop calling after teardown', async () => {
    const instance = createInstance({
      resources: { th: { common: { key: 'value' } } },
      lng: 'th',
      saveMissing: true,
    });

    const listener = vi.fn();

    const setup = createEvent();
    const teardown = createEvent();

    const { reporting, translated } = createI18nextIntegration({
      instance,
      setup,
      teardown,
    });

    const $key = createStore('other_key');

    reporting.missingKey.watch(listener);

    const $result = translated`common:${$key}`;

    const scope = fork();

    await allSettled(setup, { scope });

    expect(scope.getState($result)).toBe('other_key');
    expect(listener).toBeCalledTimes(1);

    await allSettled(teardown, { scope });
    await allSettled($key, { scope, params: 'one_more_key' });

    expect(listener).toBeCalledTimes(1);
  });
});
