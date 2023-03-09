# `trackNetworkStatus`

Allows tracking network status with [_Events_](https://effector.dev/docs/api/effector/event) and [_Stores_](https://effector.dev/docs/api/effector/store).

## Usage

All you need to do is to create an integration by calling `trackNetworkStatus` with an integration options:

- `setup` - after this [_Event_](https://effector.dev/docs/api/effector/event) all listeners will be installed, and the integration will be ready to use; it is required because it is better to use [explicit initialization _Event_ in the application](/magazine/explicit_start).
- `teardown?` — after this [_Event_](https://effector.dev/docs/api/effector/event) all listeners will be removed, and the integration will be ready to be destroyed.

```ts
import { trackNetworkStatus } from '@withease/web-api';

const { connected, disconnected, $online, $offline } = trackNetworkStatus({
  setup: appStarted,
});
```

Returns an object with:

- `connected`: [_Event_](https://effector.dev/docs/api/effector/event) that fires on connection restore
- `disconnected`: [_Event_](https://effector.dev/docs/api/effector/event) that fires on connection loss
- `$online`: [_Store_](https://effector.dev/docs/api/effector/store) with `true` if connection is restored and `false` if connection is lost
- `$offline`: [_Store_](https://effector.dev/docs/api/effector/store) with `true` if connection is lost and `false` if connection is restored

::: tip
It supports [`@@trigger` protocol](/protocols/trigger) which fires on network reconnect

```ts
import { trackNetworkStatus } from '@withease/web-api';

somethingExpectsTrigget(trackNetworkStatus);
```

:::