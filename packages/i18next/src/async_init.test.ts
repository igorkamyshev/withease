import { describe, expect, test } from 'vitest';
import { allSettled, createEffect, createEvent, fork } from 'effector';

import { createI18nextIntegration } from './integration';
import { createInstance } from 'i18next';

describe('integration, async init', () => {
  test('instance as Effect', async () => {
    const setup = createEvent();

    const instance = createInstance();

    const integration = createI18nextIntegration({
      instance: createEffect(() => instance),
      setup,
    });

    const scope = fork();

    expect(scope.getState(integration.$isReady)).toBeFalsy();
    expect(scope.getState(integration.$instance)).toBeNull();

    await allSettled(setup, { scope });

    expect(scope.getState(integration.$isReady)).toBeTruthy();
    expect(scope.getState(integration.$instance)).toBe(instance);
  });

  test('instance as function', async () => {
    const setup = createEvent();

    const instance = createInstance();

    const integration = createI18nextIntegration({
      instance: async () => instance,
      setup,
    });

    const scope = fork();

    expect(scope.getState(integration.$isReady)).toBeFalsy();
    expect(scope.getState(integration.$instance)).toBeNull();

    await allSettled(setup, { scope });

    expect(scope.getState(integration.$isReady)).toBeTruthy();
    expect(scope.getState(integration.$instance)).toBe(instance);
  });
});
