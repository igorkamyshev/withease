# `trackWindowFocus`

Allows tracking window focus and blur with [_Events_](https://effector.dev/docs/api/effector/event) and [_Stores_](https://effector.dev/docs/api/effector/store).

## Usage

All you need to do is to create an integration by calling `trackWindowFocus` with an integration options:

- `setup` - after this [_Event_](https://effector.dev/docs/api/effector/event) all listeners will be installed, and the integration will be ready to use; it is required because it is better to use [explicit initialization _Event_ in the application](/magazine/explicit_start).
- `teardown?` — after this [_Event_](https://effector.dev/docs/api/effector/event) all listeners will be removed, and the integration will be ready to be destroyed.

```ts
import { trackWindowFocus } from '@withease/web-api';

const { focused, blured, $focused } = trackWindowFocus({
  setup: appStarted,
});
```

Returns an object with:

- `focused`: [_Event_](https://effector.dev/docs/api/effector/event) that fires on window focus
- `blured`: [_Event_](https://effector.dev/docs/api/effector/event) that fires on window blur
- `$focused`: [_Store_](https://effector.dev/docs/api/effector/store) with `true` if window is focused and `false` if window is blurred

::: tip
It supports [`@@trigger` protocol](/protocols/trigger) which fires on window focus

```ts
import { trackNetworkStatus } from '@withease/web-api';

somethingExpectsTrigget(trackWindowFocus);
```

:::
