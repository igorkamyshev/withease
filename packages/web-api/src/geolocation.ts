import {
  type Event,
  type EventCallable,
  type Store,
  type Effect,
  combine,
  createEvent,
  createStore,
  sample,
  attach,
  scopeBind,
  is,
} from 'effector';

import { readonly } from './shared';

type GeolocationParams = {
  maximumAge?: number;
  timeout?: number;
  enableHighAccuracy?: boolean;
};

/**
 * This type mimics GeolocationPostion
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/GeolocationPosition}
 */
type CustomGeolocationPosition = {
  timestamp: number;
  coords: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    altitude?: number;
    altitudeAccuracy?: number;
    heading?: number;
    speed?: number;
  };
};

/**
 * This type mimics GeolocationPositionError
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/GeolocationPositionError}
 */
type CustomGeolocationError = {
  code?: 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT';
  message?: string;
  raw?: unknown;
};

type Unsubscribe = () => void;

type CustomProvider = (params: GeolocationParams) => {
  getCurrentPosition: () => Promise<CustomGeolocationPosition>;
  watchPosition: (
    successCallback: (position: CustomGeolocationPosition) => void,
    errorCallback: (error: CustomGeolocationError) => void
  ) => Unsubscribe;
};

type Geolocation = {
  $location: Store<{ latitude: number; longitude: number } | null>;
  $latitude: Store<number | null>;
  $longitude: Store<number | null>;
  request: EventCallable<void>;
  watching: {
    start: EventCallable<void>;
    stop: EventCallable<void>;
    $active: Store<boolean>;
  };
  reporting: {
    failed: Event<CustomGeolocationError | globalThis.GeolocationPositionError>;
  };
};

const BrowserProvider = Symbol('BrowserProvider');

export function trackGeolocation(
  params?: GeolocationParams & {
    providers?:
      | Array<typeof BrowserProvider | CustomProvider | globalThis.Geolocation>
      | Store<
          Array<
            typeof BrowserProvider | CustomProvider | globalThis.Geolocation
          >
        >;
  }
): Geolocation {
  let $providers: Store<
    Array<typeof BrowserProvider | CustomProvider | globalThis.Geolocation>
  >;
  const providersFromParams = params?.providers;
  if (is.store(providersFromParams)) {
    $providers = providersFromParams;
  } else {
    $providers = createStore(providersFromParams ?? [BrowserProvider]);
  }

  const initializeAllProvidersFx = attach({
    source: $providers,
    effect(providers) {
      return providers
        .map((provider) => initializeProvider(provider, params))
        .filter(Boolean) as Array<
        ReturnType<CustomProvider> | globalThis.Geolocation
      >;
    },
  });

  const $initializedProviders = createStore<Array<
    ReturnType<CustomProvider> | globalThis.Geolocation
  > | null>(null, { serialize: 'ignore' }).on(
    initializeAllProvidersFx.doneData,
    (_, providers) => providers
  );

  // -- units

  const $location = createStore<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const $longitude = combine(
    $location,
    (location) => location?.longitude ?? null
  );

  const $latitude = combine(
    $location,
    (location) => location?.latitude ?? null
  );

  const request = createEvent();

  const startWatching = createEvent();
  const stopWatching = createEvent();
  const $watchingActive = createStore(false);

  const failed = createEvent<
    CustomGeolocationError | globalThis.GeolocationPositionError
  >();

  // -- shared logic

  sample({
    clock: [request, startWatching],
    source: $initializedProviders,
    filter: (providers) => !providers,
    target: initializeAllProvidersFx,
  });

  const newPosition = createEvent<
    CustomGeolocationPosition | globalThis.GeolocationPosition
  >();

  sample({
    clock: newPosition,
    fn: (r) => ({ latitude: r.coords.latitude, longitude: r.coords.longitude }),
    target: $location,
  });

  // -- get current position

  const getCurrentPositionFx: Effect<
    void,
    CustomGeolocationPosition | globalThis.GeolocationPosition,
    CustomGeolocationError | globalThis.GeolocationPositionError
  > = attach({
    source: $initializedProviders,
    async effect(providers) {
      let geolocation:
        | globalThis.GeolocationPosition
        | CustomGeolocationPosition
        | null = null;

      const boundFailed = scopeBind(failed, { safe: true });

      for (const provider of providers ?? []) {
        try {
          if (isDefaultProvider(provider)) {
            geolocation = await new Promise<GeolocationPosition>(
              (resolve, reject) =>
                provider.getCurrentPosition(resolve, reject, params)
            );
          } else {
            geolocation = await provider.getCurrentPosition();
          }
        } catch (e: any) {
          boundFailed(e);
        }
      }

      if (!geolocation) {
        throw {
          code: 'POSITION_UNAVAILABLE',
          message: 'No available geolocation provider',
        };
      }

      return geolocation;
    },
  });

  sample({ clock: request, target: getCurrentPositionFx });
  sample({
    clock: getCurrentPositionFx.doneData,
    target: newPosition,
  });
  sample({ clock: getCurrentPositionFx.failData, target: failed });

  // -- watch position

  const $unsubscribe = createStore<Unsubscribe | null>(null);

  const watchPositionFx = attach({
    source: $initializedProviders,
    effect(providers) {
      const boundNewPosition = scopeBind(newPosition, { safe: true });
      const boundFailed = scopeBind(failed, { safe: true });

      const defaultUnwatchMap = new Map<(id: number) => void, number>();
      const customUnwatchSet = new Set<Unsubscribe>();

      for (const provider of providers ?? []) {
        try {
          if (isDefaultProvider(provider)) {
            const watchId = provider.watchPosition(
              boundNewPosition,
              boundFailed,
              params
            );

            defaultUnwatchMap.set(
              (id: number) => provider.clearWatch(id),
              watchId
            );
          } else {
            const unwatch = provider.watchPosition(
              boundNewPosition,
              boundFailed
            );

            customUnwatchSet.add(unwatch);
          }
        } catch (e: any) {
          boundFailed(e);
        }
      }

      return () => {
        for (const [unwatch, id] of defaultUnwatchMap) {
          unwatch(id);
          defaultUnwatchMap.delete(unwatch);
        }

        for (const unwatch of customUnwatchSet) {
          unwatch();
          customUnwatchSet.delete(unwatch);
        }
      };
    },
  });

  const unwatchPositionFx = attach({
    source: $unsubscribe,
    effect(unwatch) {
      unwatch?.();
    },
  });

  sample({ clock: startWatching, target: watchPositionFx });
  sample({ clock: watchPositionFx.doneData, target: $unsubscribe });
  sample({ clock: stopWatching, target: unwatchPositionFx });
  sample({ clock: unwatchPositionFx.finally, target: $unsubscribe.reinit });

  $watchingActive.on(startWatching, () => true).on(stopWatching, () => false);

  // -- public API

  return {
    $location: readonly($location),
    $longitude,
    $latitude,
    request,
    watching: {
      start: startWatching,
      stop: stopWatching,
      $active: readonly($watchingActive),
    },
    reporting: {
      failed: readonly(failed),
    },
  };
}

trackGeolocation.browserProvider = BrowserProvider;

function initializeProvider(
  provider: typeof BrowserProvider | CustomProvider | globalThis.Geolocation,
  params?: GeolocationParams
) {
  /* BrowserProvider symbol means usage of navigator.geolocation */
  if (provider === BrowserProvider) {
    const browserGeolocationAvailable =
      globalThis.navigator && 'geolocation' in globalThis.navigator;
    if (!browserGeolocationAvailable) {
      return null;
    }

    return globalThis.navigator.geolocation;
  }

  if (isDefaultProvider(provider)) {
    return provider;
  }

  return provider(params ?? {});
}

function isDefaultProvider(provider: any): provider is globalThis.Geolocation {
  return (
    'getCurrentPosition' in provider &&
    'watchPosition' in provider &&
    'clearWatch' in provider
  );
}
