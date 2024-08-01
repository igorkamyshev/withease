/*
 * This file contains tests only for custom geolocation providers.
 * e2e-tests for built-in browser navigator.geolocation in apps/web-api-demo/test/geolocation.spec.ts
 */

import { allSettled, createStore, createWatch, fork } from 'effector';
import { describe, expect, test, vi } from 'vitest';

import { trackGeolocation } from './geolocation';

describe('trackGeolocation', () => {
  test('request', async () => {
    let lat = 41.890221;
    let lon = 12.492348;
    const myCustomProvider = vi.fn(() => ({
      async getCurrentPosition() {
        return {
          coords: { latitude: lat, longitude: lon },
          timestamp: Date.now(),
        };
      },
      watchPosition(success: any, error: any) {
        return () => {};
      },
    }));

    const geo = trackGeolocation({ providers: [myCustomProvider] });

    const scope = fork();

    expect(scope.getState(geo.$location)).toMatchInlineSnapshot(`null`);

    await allSettled(geo.request, { scope });
    expect(scope.getState(geo.$location)).toMatchInlineSnapshot(`
      {
        "latitude": 41.890221,
        "longitude": 12.492348,
      }
    `);

    lat = 42.890221;
    lon = 13.492348;

    await allSettled(geo.request, { scope });
    expect(scope.getState(geo.$location)).toMatchInlineSnapshot(`
      {
        "latitude": 42.890221,
        "longitude": 13.492348,
      }
    `);

    expect(myCustomProvider).toBeCalledTimes(1);
  });

  test('watching', async () => {
    const $externalLocation: any = createStore({
      latitude: 41.890221,
      longitude: 12.492348,
    });

    const myCustomProvider = vi.fn(() => ({
      async getCurrentPosition() {
        return {
          coords: $externalLocation.getState(),
          timestamp: Date.now(),
        };
      },
      watchPosition(success: any, error: any) {
        return $externalLocation.watch((location: any) =>
          success({
            coords: location,
            timestamp: Date.now(),
          })
        );
      },
    }));

    const geo = trackGeolocation({ providers: [myCustomProvider] });

    const scope = fork();

    expect(scope.getState(geo.$location)).toMatchInlineSnapshot(`null`);

    await allSettled(geo.watching.start, { scope });
    expect(scope.getState(geo.$location)).toMatchInlineSnapshot(`
      {
        "latitude": 41.890221,
        "longitude": 12.492348,
      }
    `);

    $externalLocation.setState({ latitude: 42.890221, longitude: 13.492348 });
    expect(scope.getState(geo.$location)).toMatchInlineSnapshot(`
      {
        "latitude": 42.890221,
        "longitude": 13.492348,
      }
    `);

    await allSettled(geo.watching.stop, { scope });
    $externalLocation.setState({ latitude: 43.890221, longitude: 14.492348 });
    expect(scope.getState(geo.$location)).toMatchInlineSnapshot(`
      {
        "latitude": 42.890221,
        "longitude": 13.492348,
      }
    `);

    expect(myCustomProvider).toBeCalledTimes(1);
  });

  test('reporting', async () => {
    const myCustomProvider = () => ({
      async getCurrentPosition() {
        throw {
          code: 'PERMISSION_DENIED',
          message: 'User denied the request for Geolocation.',
          raw: '用户拒绝了地理位置请求。',
        };
      },
      watchPosition(success: any, error: any) {
        return () => {};
      },
    });

    const failedListener = vi.fn();

    const geo = trackGeolocation({ providers: [myCustomProvider] });

    const scope = fork();

    createWatch({ unit: geo.reporting.failed, fn: failedListener, scope });

    await allSettled(geo.request, { scope });

    expect(failedListener).toBeCalledWith({
      code: 'PERMISSION_DENIED',
      message: 'User denied the request for Geolocation.',
      raw: '用户拒绝了地理位置请求。',
    });
  });

  test('do not throw if default provider is not available', async () => {
    expect(() => trackGeolocation()).not.toThrow();
  });
});

describe('trackGeolocation, providers as a Store', () => {
  const firstProvider = () => ({
    name: 'firstProvider',
    async getCurrentPosition() {
      return {
        coords: { latitude: 1, longitude: 1 },
        timestamp: Date.now(),
      };
    },
    watchPosition(success: any, error: any) {
      return () => {};
    },
  });

  const secondProvider = () => ({
    name: 'secondProvider',
    async getCurrentPosition() {
      return {
        coords: { latitude: 2, longitude: 2 },
        timestamp: Date.now(),
      };
    },
    watchPosition(success: any, error: any) {
      return () => {};
    },
  });

  const $providers = createStore([firstProvider]);

  const geo = trackGeolocation({ providers: $providers });

  test('request', async () => {
    const scopeWithOriginal = fork();
    const scopeWithReplace = fork({ values: [[$providers, [secondProvider]]] });

    await allSettled(geo.request, { scope: scopeWithReplace });
    expect(scopeWithReplace.getState(geo.$location)).toMatchInlineSnapshot(`
      {
        "latitude": 2,
        "longitude": 2,
      }
    `);

    await allSettled(geo.request, { scope: scopeWithOriginal });
    expect(scopeWithOriginal.getState(geo.$location)).toMatchInlineSnapshot(`
      {
        "latitude": 1,
        "longitude": 1,
      }
    `);
  });
});

describe('trackGeolocation, failure of provider', () => {
  const brokenProvider = () => ({
    async getCurrentPosition() {
      throw new Error('Wow, government do not want you to use this provider!');
    },
    watchPosition(success: any, error: any) {
      throw new Error('Wow, government do not want you to use this provider!');
    },
  });

  const slightlyBrokenProvider = () => ({
    async getCurrentPosition() {
      throw new Error('Not this time, buddy!');
    },
    watchPosition(success: any, error: any) {
      error(new Error('Not this time, buddy!'));

      return () => {};
    },
  });

  const okProvider = () => ({
    async getCurrentPosition() {
      return {
        coords: { latitude: 2, longitude: 2 },
        timestamp: Date.now(),
      };
    },
    watchPosition(success: any, error: any) {
      success({
        coords: { latitude: 2, longitude: 2 },
        timestamp: Date.now(),
      });
      return () => {};
    },
  });

  const geo = trackGeolocation({
    providers: [brokenProvider, slightlyBrokenProvider, okProvider],
  });

  test('request', async () => {
    const scope = fork();

    const failedWatcher = vi.fn();
    createWatch({ unit: geo.reporting.failed, fn: failedWatcher, scope });

    await allSettled(geo.request, { scope });

    expect(scope.getState(geo.$location)).toMatchInlineSnapshot(`
      {
        "latitude": 2,
        "longitude": 2,
      }
    `);

    expect(failedWatcher.mock.calls).toMatchInlineSnapshot(`
      [
        [
          [Error: Wow, government do not want you to use this provider!],
        ],
        [
          [Error: Not this time, buddy!],
        ],
      ]
    `);
  });

  test('watching', async () => {
    const scope = fork();

    const failedWatcher = vi.fn();
    createWatch({ unit: geo.reporting.failed, fn: failedWatcher, scope });

    await allSettled(geo.watching.start, { scope });

    expect(scope.getState(geo.$location)).toMatchInlineSnapshot(`
      {
        "latitude": 2,
        "longitude": 2,
      }
    `);

    expect(failedWatcher.mock.calls).toMatchInlineSnapshot(`
      [
        [
          [Error: Wow, government do not want you to use this provider!],
        ],
        [
          [Error: Not this time, buddy!],
        ],
      ]
    `);
  });
});
