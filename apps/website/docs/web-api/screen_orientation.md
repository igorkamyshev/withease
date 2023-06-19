# Screen orientation

Allows tracking device screen orientation with [_Events_](https://effector.dev/docs/api/effector/event) and [_Stores_](https://effector.dev/docs/api/effector/store).

::: info

Uses [Screen Orientation API](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Orientation_API) under the hood

:::

## Usage

All you need to do is to create an integration by calling `trackScreenOrientation` with an integration options:

- `setup`: after this [_Event_](https://effector.dev/docs/api/effector/event) all listeners will be installed, and the integration will be ready to use; it is required because it is better to use [explicit initialization _Event_ in the application](/magazine/explicit_start).
- `teardown?`: after this [_Event_](https://effector.dev/docs/api/effector/event) all listeners will be removed, and the integration will be ready to be destroyed.

```ts
import { trackScreenOrientation } from '@withease/web-api';

const { $type, $angle } = trackScreenOrientation({
  setup: appStarted,
});
```

Returns an object with:

- `$type`: [_Store_](https://effector.dev/docs/api/effector/store) with current orientation type, one of "portrait-primary", "portrait-secondary", "landscape-primary", or "landscape-secondary"
- `$angle`: [_Store_](https://effector.dev/docs/api/effector/store) with a `number` which represents the current orientation angle in degrees

::: tip
It supports [`@@trigger` protocol](/protocols/trigger). Since it allows firing only one [_Event_](https://effector.dev/docs/api/effector/event) `trackScreenOrientation` triggers any updates of `$type` as a `fired` in case of [`@@trigger` protocol](/protocols/trigger).

```ts
import { trackScreenOrientation } from '@withease/web-api';

somethingExpectsTrigger(trackScreenOrientation);
```

:::

## Live demo

Let us show you a live demo of how it works. The following demo displays `$type` and `$angle` values of the current screen orientation. _Rotate your device to see how it works._

<script setup lang="ts">
import { createEvent } from 'effector';
import { useStore } from 'effector-vue/composition'

import { trackScreenOrientation } from '../../../../packages/web-api';

const appStarted = createEvent();

const { $type, $angle } = trackScreenOrientation(
  { setup: appStarted }
);

const type = useStore($type)
const angle = useStore($angle)

appStarted();

</script>

::: details Source code

```ts
import { createEvent } from 'effector';
import { useStore } from 'effector-vue/composition';
import { trackScreenOrientation } from '@withease/web-api';

const appStarted = createEvent();

const { $type, $angle } = trackScreenOrientation({ setup: appStarted });

const type = useStore($type);
const angle = useStore($angle);

appStarted();
```

:::

- Screen orientation type: **{{ type }}**
- Screen orientation angle: **{{ angle }}**
