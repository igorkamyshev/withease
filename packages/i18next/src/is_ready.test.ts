import { allSettled, createEvent, createStore, fork } from 'effector';
import { createInstance, type i18n } from 'i18next';
import { describe, expect, test } from 'vitest';

import { createI18nextIntegration } from './integration';

describe('integration.$t', () => {
  test('not ready if not initialized', async () => {
    const setup = createEvent();

    const { $isReady } = createI18nextIntegration({
      instance: createStore<i18n | null>(null),
      setup,
    });

    const scope = fork();

    expect(scope.getState($isReady)).toBeFalsy();
  });

  test('not ready if initialized without instance', async () => {
    const setup = createEvent();

    const { $isReady } = createI18nextIntegration({
      instance: createStore<i18n | null>(null),
      setup,
    });

    const scope = fork();

    await allSettled(setup, { scope });

    expect(scope.getState($isReady)).toBeFalsy();
  });

  test('ready after  initialized with instance (static)', async () => {
    const instance = createInstance({
      resources: { th: { common: { foo: 'bar' } } },
      lng: 'th',
    });

    const setup = createEvent();

    const { $isReady } = createI18nextIntegration({
      instance,
      setup,
    });

    const scope = fork();

    expect(scope.getState($isReady)).toBeFalsy();

    await allSettled(setup, { scope });

    expect(scope.getState($isReady)).toBeTruthy();
  });

  test('ready after initialized with instance (store)', async () => {
    const instance = createInstance({
      resources: { th: { common: { foo: 'bar' } } },
      lng: 'th',
    });

    const setup = createEvent();

    const { $isReady } = createI18nextIntegration({
      instance: createStore<i18n | null>(instance),
      setup,
    });

    const scope = fork();

    expect(scope.getState($isReady)).toBeFalsy();

    await allSettled(setup, { scope });

    expect(scope.getState($isReady)).toBeTruthy();
  });

  test('ready after initialized with instance (lazy store)', async () => {
    const $instance = createStore<i18n | null>(null);
    const instance = createInstance({
      resources: { th: { common: { foo: 'bar' } } },
      lng: 'th',
    });

    const setup = createEvent();

    const { $isReady } = createI18nextIntegration({
      instance: $instance,
      setup,
    });

    const scope = fork();

    expect(scope.getState($isReady)).toBeFalsy();

    await allSettled(setup, { scope });
    expect(scope.getState($isReady)).toBeFalsy();

    await allSettled($instance, { scope, params: instance });
    expect(scope.getState($isReady)).toBeTruthy();
  });

  test('not ready after teardown', async () => {
    const instance = createInstance({
      resources: { th: { common: { foo: 'bar' } } },
      lng: 'th',
    });

    const setup = createEvent();
    const teardown = createEvent();

    const { $isReady } = createI18nextIntegration({
      instance,
      setup,
      teardown,
    });

    const scope = fork();

    expect(scope.getState($isReady)).toBeFalsy();

    await allSettled(setup, { scope });
    expect(scope.getState($isReady)).toBeTruthy();

    await allSettled(teardown, { scope });
    expect(scope.getState($isReady)).toBeFalsy();
  });
});
