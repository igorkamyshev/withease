import {
  type Event,
  type EventCallable,
  type Store,
  combine,
  createEvent,
  createStore,
  createEffect,
  sample,
  attach,
  scopeBind,
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
    providers?: Array<
      typeof BrowserProvider | CustomProvider | globalThis.Geolocation
    >;
  }
): Geolocation {
  const providres = (
    params?.providers ?? /* In case of no providers, we will use the default one only */ [
      BrowserProvider,
    ]
  )
    .map((provider) => {
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
    })
    .filter(Boolean) as Array<
    ReturnType<CustomProvider> | globalThis.Geolocation
  >;

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

  const newPosition = createEvent<
    CustomGeolocationPosition | globalThis.GeolocationPosition
  >();

  sample({
    clock: newPosition,
    fn: (r) => ({ latitude: r.coords.latitude, longitude: r.coords.longitude }),
    target: $location,
  });

  // -- get current position

  const getCurrentPositionFx = createEffect<
    void,
    CustomGeolocationPosition | globalThis.GeolocationPosition,
    CustomGeolocationError | globalThis.GeolocationPositionError
  >(async () => {
    let geolocation:
      | globalThis.GeolocationPosition
      | CustomGeolocationPosition
      | null = null;

    for (const provider of providres) {
      if (isDefaultProvider(provider)) {
        geolocation = await new Promise<GeolocationPosition>(
          (resolve, rejest) =>
            provider.getCurrentPosition(resolve, rejest, params)
        );
      } else {
        geolocation = await provider.getCurrentPosition();
      }
    }

    if (!geolocation) {
      throw {
        code: 'POSITION_UNAVAILABLE',
        message: 'No avaiable geolocation provider',
      };
    }

    return geolocation;
  });

  sample({ clock: request, target: getCurrentPositionFx });
  sample({
    clock: getCurrentPositionFx.doneData,
    target: newPosition,
  });
  sample({ clock: getCurrentPositionFx.failData, target: failed });

  // -- watch position

  const $unsubscribe = createStore<Unsubscribe | null>(null);

  const watchPositionFx = createEffect(() => {
    const boundNewPosition = scopeBind(newPosition, { safe: true });
    const boundFailed = scopeBind(failed, { safe: true });

    const defaultUnwatchMap = new Map<(id: number) => void, number>();
    const customUnwatchSet = new Set<Unsubscribe>();

    for (const provider of providres) {
      if (isDefaultProvider(provider)) {
        const watchId = provider.watchPosition(
          boundNewPosition,
          boundFailed,
          params
        );

        defaultUnwatchMap.set((id: number) => provider.clearWatch(id), watchId);
      } else {
        const unwatch = provider.watchPosition(boundNewPosition, boundFailed);

        customUnwatchSet.add(unwatch);
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

function isDefaultProvider(provider: any): provider is globalThis.Geolocation {
  return (
    'getCurrentPosition' in provider &&
    'watchPosition' in provider &&
    'clearWatch' in provider
  );
}
