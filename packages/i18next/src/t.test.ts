import { allSettled, createEvent, createStore, fork } from 'effector';
import { createInstance, type i18n } from 'i18next';
import { describe, expect, test } from 'vitest';

import { createI18nextIntegration } from './integration';

describe('integration.$t', () => {
  test('returns identity function while not initialized', async () => {
    const setup = createEvent();

    const { $t } = createI18nextIntegration({
      instance: createStore<i18n | null>(null),
      setup,
    });

    const $result = $t.map((t) => t('common:foo') ?? null);

    const scope = fork();

    expect(scope.getState($result)).toBe('common:foo');
  });

  test('returns identity function while initialized without instance', async () => {
    const setup = createEvent();

    const { $t } = createI18nextIntegration({
      instance: createStore<i18n | null>(null),
      setup,
    });

    const $result = $t.map((t) => t('common:foo') ?? null);

    const scope = fork();

    await allSettled(setup, { scope });

    expect(scope.getState($result)).toBe('common:foo');
  });

  test('returns t-function while initialized with instance (static)', async () => {
    const instance = createInstance({
      resources: { th: { common: { foo: 'bar' } } },
      lng: 'th',
    });

    const setup = createEvent();

    const { $t } = createI18nextIntegration({
      instance,
      setup,
    });

    const $result = $t.map((t) => t('common:foo') ?? null);

    const scope = fork();

    await allSettled(setup, { scope });

    expect(scope.getState($result)).toBe('bar');
  });

  test('returns t-function while initialized with instance (store)', async () => {
    const instance = createInstance({
      resources: { th: { common: { foo: 'bar' } } },
      lng: 'th',
    });

    const setup = createEvent();

    const { $t } = createI18nextIntegration({
      instance: createStore<i18n | null>(instance),
      setup,
    });

    const $result = $t.map((t) => t('common:foo') ?? null);

    const scope = fork();

    await allSettled(setup, { scope });

    expect(scope.getState($result)).toBe('bar');
  });

  test('returns t-function while initialized with instance (lazy store)', async () => {
    const $instance = createStore<i18n | null>(null);
    const instance = createInstance({
      resources: { th: { common: { foo: 'bar' } } },
      lng: 'th',
    });

    const setup = createEvent();

    const { $t } = createI18nextIntegration({
      instance: $instance,
      setup,
    });

    const $result = $t.map((t) => t('common:foo') ?? null);

    const scope = fork();

    await allSettled(setup, { scope });
    expect(scope.getState($result)).toBe('common:foo');

    await allSettled($instance, { scope, params: instance });

    expect(scope.getState($result)).toBe('bar');
  });

  test('recalculates t-function when language changes', async () => {
    const instance = createInstance({
      resources: {
        th: { common: { hello: 'Sawa dee' } },
        en: { common: { hello: 'Hello' } },
      },
      lng: 'th',
    });

    const setup = createEvent();

    const { $t } = createI18nextIntegration({
      instance,
      setup,
    });

    const $result = $t.map((t) => t('common:hello') ?? null);

    const scope = fork();

    await allSettled(setup, { scope });

    expect(scope.getState($result)).toBe('Sawa dee');

    instance.changeLanguage('en');

    await allSettled(scope);
    expect(scope.getState($result)).toBe('Hello');
  });

  test('recalculates t-function when resource added', async () => {
    const instance = createInstance({
      lng: 'th',
    });

    const setup = createEvent();

    const { $t } = createI18nextIntegration({
      instance,
      setup,
    });

    const $result = $t.map((t) => t('common:hello') ?? null);

    const scope = fork();

    await allSettled(setup, { scope });
    expect(scope.getState($result)).toBe('hello');

    instance.addResource('th', 'common', 'hello', 'Sawa dee');
    await allSettled(scope);

    expect(scope.getState($result)).toBe('Sawa dee');
  });

  test('recalculates t-function when resource bundle added', async () => {
    const instance = createInstance({
      lng: 'th',
    });

    const setup = createEvent();

    const { $t } = createI18nextIntegration({
      instance,
      setup,
    });

    const $result = $t.map((t) => t('common:hello') ?? null);

    const scope = fork();

    await allSettled(setup, { scope });
    expect(scope.getState($result)).toBe('hello');

    instance.addResourceBundle('th', 'common', { hello: 'Sawa dee' });
    await allSettled(scope);

    expect(scope.getState($result)).toBe('Sawa dee');
  });

  test('recalculates t-function when resources added', async () => {
    const instance = createInstance({
      lng: 'th',
    });

    const setup = createEvent();

    const { $t } = createI18nextIntegration({
      instance,
      setup,
    });

    const $result = $t.map((t) => t('common:hello') ?? null);

    const scope = fork();

    await allSettled(setup, { scope });
    expect(scope.getState($result)).toBe('hello');

    instance.addResources('th', 'common', { hello: 'Sawa dee' });
    await allSettled(scope);

    expect(scope.getState($result)).toBe('Sawa dee');
  });

  test('unsubscribe from instance on teardown (language change)', async () => {
    const instance = createInstance({
      resources: {
        th: { common: { hello: 'Sawa dee' } },
        en: { common: { hello: 'Hello' } },
      },
      lng: 'th',
    });

    const setup = createEvent();
    const teardown = createEvent();

    const { $t } = createI18nextIntegration({
      instance,
      setup,
      teardown,
    });

    const $result = $t.map((t) => t('common:hello') ?? null);

    const scope = fork();

    await allSettled(setup, { scope });

    expect(scope.getState($result)).toBe('Sawa dee');

    await allSettled(teardown, { scope });

    instance.changeLanguage('en');

    await allSettled(scope);
    expect(scope.getState($result)).toBe('Sawa dee');
  });

  test('unsubscribe from instance on teardown (resorces change)', async () => {
    const instance = createInstance({
      lng: 'th',
    });

    const setup = createEvent();
    const teardown = createEvent();

    const { $t } = createI18nextIntegration({
      instance,
      setup,
      teardown,
    });

    const $result = $t.map((t) => t('common:hello') ?? null);

    const scope = fork();

    await allSettled(setup, { scope });

    expect(scope.getState($result)).toBe('hello');

    await allSettled(teardown, { scope });

    instance.addResource('th', 'common', 'hello', 'Sawa dee');
    await allSettled(scope);

    expect(scope.getState($result)).toBe('hello');
  });

  test('does not trigger re-calculate if inited instance is provided even before setup', async () => {
    const instance = createInstance({
      lng: 'th',
    });
    instance.init();

    const setup = createEvent();

    const { $t } = createI18nextIntegration({
      instance,
      setup,
    });

    const $result = $t.map((t) => t('common:hello') ?? null);

    const scope = fork();
    expect(scope.getState($result)).toBe('hello');

    await allSettled(setup, { scope });

    expect(scope.getState($result)).toBe('hello');
  });
});
