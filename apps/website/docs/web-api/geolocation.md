---
title: Geolocation
---

# Geolocation <Badge text="since v1.3.0" />

::: info

Uses [Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API) under the hood

:::

## Usage

All you need to do is to create an integration by calling `trackGeolocation` with an integration options:

- `setup`: after this [_Event_](https://effector.dev/en/api/effector/event/) all listeners will be installed, and the integration will be ready to use; it is required because it is better to use [explicit initialization _Event_ in the application](/magazine/explicit_start).
- `teardown?`: after this [_Event_](https://effector.dev/en/api/effector/event/) all listeners will be removed, and the integration will be ready to be destroyed.
- `options?`: an object with the following properties:
  - `maximumAge?`: a positive `number` representing the maximum age in milliseconds of a possible cached position that is acceptable to return. If set to `0`, it means that the device cannot use a cached position and must attempt to retrieve the real current position. If set to `Infinity` the device must return a cached position regardless of its age.
  - `timeout?`: a positive `number` representing the maximum length of time (in milliseconds) the device is allowed to take in order to return a position. The maximum value for this attribute is `Infinity`.
  - `enableHighAccuracy?`: a `boolean` that indicates the application would like to receive the best possible results.

```ts
import { trackGeolocation } from '@withease/web-api';

const { $location, $latitude, $longitude, request, watching, reporting } =
  trackGeolocation({
    setup: appStarted,
    options: {
      maximumAge,
      timeout,
      enableHighAccuracy,
    },
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

### Regional restrictions

In some countries and regions, the use of geolocation can be restricted. If you are aiming to provide a service in such locations, you use some local providers to get the location of the user. For example, in China, you can use [Baidu](https://lbsyun.baidu.com/index.php?title=jspopular/guide/geolocation), [Autonavi](https://lbsyun.baidu.com/index.php?title=jspopular/guide/geolocation), or [Tencent](https://lbs.qq.com/webApi/component/componentGuide/componentGeolocation).

Geolocation integration of `@withease/web-api` allows to use any provider additionally to the default one provided by the browser. To do so, you need to pass an `additionalProviders` option to the `trackGeolocation` function.

```ts
import { trackGeolocation } from '@withease/web-api';

const geo = trackGeolocation({
  /* ... */
  additionalProviders: [
    /* your custom providers */
  ],
});
```

Any provider should conform to the following contract:

```ts
type CustomProvider = {
  getCurrentPosition: () => Promise<{ latitude; longitude }>;
};
```

For example, in case of Baidu, you can write something like this:

```ts
// Create a Baidu geolocation instance outside of the getCurrentPosition function
// to avoid creating a new instance every time the function is called
const geolocation = new BMap.Geolocation();

const baiduProvider = {
  async getCurrentPosition() {
    // getCurrentPosition function should return a Promise
    return new Promise((resolve, reject) => {
      geolocation.getCurrentPosition(function (r) {
        if (this.getStatus() == BMAP_STATUS_SUCCESS) {
          // in case of success, resolve with the coordinates
          resolve({ latitude: r.point.lat, longitude: r.point.lng });
        } else {
          // otherwise, reject with an error
          reject(new Error(this.getStatus()));
        }
      });
    });
  },
};

const geo = trackGeolocation({
  /* ... */
  additionalProviders: [baiduProvider],
});
```

Array of `additionalProviders` would be used in the order they are passed to the `trackGeolocation` function. The first provider that returns the coordinates would be used. It is used only if the browser [Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API) is not available or fails.
