---
title: Geolocation

outline: [2, 3]
---

# Geolocation <Badge text="since v1.3.0" />

Allows tracking geolocation with [_Events_](https://effector.dev/en/api/effector/event/) and [_Stores_](https://effector.dev/docs/api/effector/store).

::: info

Uses [Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API) under the hood

:::

## Usage

All you need to do is to create an integration by calling `trackGeolocation` with an integration options:

- `maximumAge?`: a positive `number` representing the maximum age in milliseconds of a possible cached position that is acceptable to return. If set to `0`, it means that the device cannot use a cached position and must attempt to retrieve the real current position. If set to `Infinity` the device must return a cached position regardless of its age.
- `timeout?`: a positive `number` representing the maximum length of time (in milliseconds) the device is allowed to take in order to return a position. The maximum value for this attribute is `Infinity`.
- `enableHighAccuracy?`: a `boolean` that indicates the application would like to receive the best possible results.

```ts
import { trackGeolocation } from '@withease/web-api';

const { $location, $latitude, $longitude, request, reporting, watching } =
  trackGeolocation({
    maximumAge,
    timeout,
    enableHighAccuracy,
  });
```

Returns an object with:

- `$location` - [_Store_](https://effector.dev/docs/api/effector/store) with the current location in the format `{ latitude, longitude }`
- `$latitude` - [_Store_](https://effector.dev/docs/api/effector/store) with the current latitude
- `$longitude` - [_Store_](https://effector.dev/docs/api/effector/store) with the current longitude
- `request` - [_EventCallable_](https://effector.dev/en/api/effector/event/#eventCallable) that has to be called to get the current location
- `watching` - an object with the following properties:
  - `start` - [_EventCallable_](https://effector.dev/en/api/effector/event/#eventCallable) that has to be called to start watching the current location
  - `stop` - [_EventCallable_](https://effector.dev/en/api/effector/event/#eventCallable) that has to be called to stop watching the current location
  - `$active` - [_Store_](https://effector.dev/docs/api/effector/store) with `true` if watching is started and `false` if watching is stopped
- `reporting` - an object with the following properties:
  - `failed` - [_Event_](https://effector.dev/en/api/effector/event) that fires when the location request fails

### Regional restrictions

In some countries and regions, the use of geolocation can be restricted. If you are aiming to provide a service in such locations, you use some local providers to get the location of the user. For example, in China, you can use [Baidu](https://lbsyun.baidu.com/index.php?title=jspopular/guide/geolocation), [Autonavi](https://lbsyun.baidu.com/index.php?title=jspopular/guide/geolocation), or [Tencent](https://lbs.qq.com/webApi/component/componentGuide/componentGeolocation).

Geolocation integration of `@withease/web-api` allows to use any provider additionally to the default one provided by the browser. To do so, you need to pass an `providers` option to the `trackGeolocation` function.

```ts
import { trackGeolocation } from '@withease/web-api';

const geo = trackGeolocation({
  /* ... */
  providers: [
    /* default browser Geolocation API */
    trackGeolocation.browserProvider,
    /* your custom providers */
  ],
});
```

Any provider should conform to the following contract:

```ts
/* This type mimics https://developer.mozilla.org/en-US/docs/Web/API/GeolocationPosition */
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

/* This type mimics https://developer.mozilla.org/en-US/docs/Web/API/GeolocationPositionError */
type CustomGeolocationError = {
  /*
   * You have to map your error codes to the Geolocation API error codes
   * In case of unknown error, you are free to skip this field
   */
  code?: 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT';
  /*
   * You can provide a custom message for the error
   */
  message?: string;
  /*
   * You can provide a raw error object from your provider
   */
  raw?: unknown;
};

type CustomProvider = (
  /* All options would be passed from trackGeolocation call */ {
    maximumAge,
    timeout,
    enableHighAccuracy,
  }
) => {
  /* This function can throw CustomGeolocationError in case of error */
  getCurrentPosition: () => Promise<CustomGeolocationPosition>;
  /*
   * This function should call successCallback with the position or errorCallback with the error.
   * Function should return an Unsubscribe function, which should stop watching the position.
   */
  watchPosition?: (
    successCallback: (position: CustomGeolocationPosition) => void,
    errorCallback: (error: CustomGeolocationError) => void
  ) => Unsubscribe;
};
```

::: details Baidu example

For example, in case of Baidu, you can write something like this:

```ts
function baiduProvider({ maximumAge, timeout, enableHighAccuracy }) {
  // Create a Baidu geolocation instance outside of the getCurrentPosition function
  // to avoid creating a new instance every time the function is called
  const geolocation = new BMap.Geolocation();

  const getCurrentPosition = ({ maximumAge, timeout, enableHighAccuracy }) => {
    // getCurrentPosition function should return a Promise
    return new Promise((resolve, reject) => {
      geolocation.getCurrentPosition(function (r) {
        if (this.getStatus() === BMAP_STATUS_SUCCESS) {
          // in case of success, resolve with the result
          resolve({
            timestamp: Date.now(),
            coords: { latitude: r.point.lat, longitude: r.point.lng },
          });
        } else {
          // map Baidu error codes to the Geolocation API error codes
          let code;
          switch (this.getStatus()) {
            case BMAP_STATUS_PERMISSION_DENIED:
              code = 'PERMISSION_DENIED';
              break;
            case BMAP_STATUS_SERVICE_UNAVAILABLE:
              code = 'POSITION_UNAVAILABLE';
              break;
            case BMAP_STATUS_TIMEOUT:
              code = 'TIMEOUT';
              break;
          }

          // reject with the error object
          reject({ code, raw: this.getStatus() });
        }
      });
    });
  };

  /*
   * Bailu does not support watching the position
   * so, we have to write an imitation of the watchPosition function
   */
  const watchPosition = (successCallback, errorCallback) => {
    const timerId = setInterval(async () => {
      try {
        const position = await getCurrentPosition();

        successCallback(position);
      } catch (error) {
        errorCallback(error);
      }
    }, 1_000);

    return () => clearInterval(timerId);
  };

  return {
    getCurrentPosition,
    watchPosition,
  };
}

const geo = trackGeolocation({
  /* ... */
  providers: [
    /* default browser Geolocation API */
    trackGeolocation.browserProvider,
    /* Baidu provider */
    baiduProvider,
  ],
});
```

:::

Array of `providers` would be used in the order they are passed to the `trackGeolocation` function. The first provider that returns the coordinates would be used.

### React Native

In case of React Native, it is recommended to use the [`@react-native-community/geolocation`](https://github.com/michalchudziak/react-native-geolocation) package and do not use `navigator.geolocation` directly. You can easily achieve this by excluding `trackGeolocation.browserProvider` from the list of providers.

```ts
import ReactNativeGeolocation from '@react-native-community/geolocation';

const geo = trackGeolocation({
  /* ... */
  providers: [
    trackGeolocation.browserProvider, // [!code --]
    ReactNativeGeolocation, // [!code ++]
  ],
});
```