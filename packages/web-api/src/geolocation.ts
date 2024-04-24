import { Event, EventCallable, Store } from 'effector';

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
  $location: Store<number | null>;
  $latitude: Store<number | null>;
  $longitude: Store<{ latitude: number; longitude: number } | null>;
  request: EventCallable<void>;
  watching: {
    start: EventCallable<void>;
    stop: EventCallable<void>;
    $active: Store<boolean>;
  };
  reporting: {
    failed: Event<unknown>;
  };
};

const BrowserProvider = Symbol('BrowserProvider');

export function trackGeolocation(
  params: GeolocationParams & {
    providers?: Array<CustomProvider>;
  }
): Geolocation {
  return {} as any;
}

trackGeolocation.browserProvider = BrowserProvider;
