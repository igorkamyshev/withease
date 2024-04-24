import {
  type Event,
  type EventCallable,
  type Store,
  combine,
  createEvent,
  createStore,
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
    failed: Event<CustomGeolocationError>;
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

  const failed = createEvent<CustomGeolocationError>();

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
