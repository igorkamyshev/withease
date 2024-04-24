import {
  type Event,
  type EventCallable,
  type Store,
  combine,
  createEvent,
  createStore,
  createEffect,
  sample,
  restore,
  attach,
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
  watchPosition?: (
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
  params: GeolocationParams & {
    providers?: Array<CustomProvider | globalThis.Geolocation>;
  }
): Geolocation {
  // In case of no providers, we will use the default one only
  const providres = params.providers ?? [BrowserProvider];

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
  >(() => {
    // TODO: real code
    throw { code: 'POSITION_UNAVAILABLE', message: 'Not implemented' };
  });

  sample({ clock: request, target: getCurrentPositionFx });
  sample({
    clock: getCurrentPositionFx.doneData,
    target: newPosition,
  });
  sample({ clock: getCurrentPositionFx.failData, target: failed });

  // -- watch position

  const saveUnsubscribe = createEvent<Unsubscribe>();
  const $unsubscribe = restore(saveUnsubscribe, null);

  const watchPositionFx = createEffect(() => {
    // TODO: real code
    newPosition({} as any);
    failed({} as any);
    saveUnsubscribe(() => null);
  });

  const unwatchPositionFx = attach({
    source: $unsubscribe,
    effect(unwatch) {
      unwatch?.();
    },
  });

  sample({ clock: startWatching, target: watchPositionFx });
  sample({ clock: stopWatching, target: unwatchPositionFx });

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
