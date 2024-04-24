import { Event, EventCallable, Store } from 'effector';

type GeolocationParams = {
  maximumAge?: number;
  timeout?: number;
  enableHighAccuracy?: boolean;
};

type CustomProvider = (params: GeolocationParams) => {
  getCurrentPosition: () => Promise<{ latitude: number; longitude: number }>;
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

function trackGeolocation(
  params: GeolocationParams & {
    additionalProviders?: Array<CustomProvider>;
  }
): Geolocation {
  return {} as any;
}
