# Page visibility

Allows tracking window focus and blur with [_Events_](https://effector.dev/docs/api/effector/event) and [_Stores_](https://effector.dev/docs/api/effector/store).

::: info

Uses [Page Visibility API](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API) under the hood

:::

## Usage

All you need to do is to create an integration by calling `trackWindowFocus` with an integration options:

- `setup`: after this [_Event_](https://effector.dev/docs/api/effector/event) all listeners will be installed, and the integration will be ready to use; it is required because it is better to use [explicit initialization _Event_ in the application](/magazine/explicit_start).
- `teardown?`: after this [_Event_](https://effector.dev/docs/api/effector/event) all listeners will be removed, and the integration will be ready to be destroyed.

```ts
import { trackPageVisibility } from '@withease/web-api';

const { visible, hidden, $visible, $hidden } = trackPageVisibility({
  setup: appStarted,
});
```

Returns an object with:

- `visible`: [_Event_](https://effector.dev/docs/api/effector/event) fired when the content of a tab has become visible
- `hidden`: [_Event_](https://effector.dev/docs/api/effector/event) fired when the content of a tab has been hidden
- `$visible`: [_Store_](https://effector.dev/docs/api/effector/store) with `true` if document is visible and `false` if it is hidden
- `$hidden`: [_Store_](https://effector.dev/docs/api/effector/store) with `false` if document is visible and `true` if it is hidden

::: tip
It supports [`@@trigger` protocol](/protocols/trigger). Since it allows firing only one [_Event_](https://effector.dev/docs/api/effector/event) `trackPageVisibility` triggers `visible` as a `fired` in case of [`@@trigger` protocol](/protocols/trigger).

```ts
import { trackPageVisibility } from '@withease/web-api';

somethingExpectsTrigger(trackPageVisibility);
```

:::

## Live demo

Let us show you a live demo of how it works. The following demo displays history of `hidden` and `visible` [_Events_](https://effector.dev/docs/api/effector/event). _Switch to other tab and return there see how it works._

<script setup lang="ts">
import { createEvent, createStore } from 'effector';
import { useStore } from 'effector-vue/composition'

import { trackPageVisibility } from '../../../../packages/web-api';

const appStarted = createEvent();

const { visible, hidden } = trackPageVisibility(
  { setup: appStarted }
);

const $history = createStore([])
  .on(visible, (state) => [...state, { at: new Date, action: 'visible' }])
  .on(hidden, (state) => [...state, { at: new Date, action: 'hidden' }]);

const history = useStore($history)

appStarted();

</script>

::: details Source code

```ts
import { createEvent, createStore } from 'effector';
import { useStore } from 'effector-vue/composition';
import { trackPageVisibility } from '@withease/web-api';

const appStarted = createEvent();

const { visible, hidden } = trackPageVisibility({ setup: appStarted });

const $history = createStore([])
  .on(visible, (state) => [...state, { at: new Date(), action: 'visible' }])
  .on(hidden, (state) => [...state, { at: new Date(), action: 'hidden' }]);

const history = useStore($history);

appStarted();
```

:::

Event's history:

<ul>
<li v-for="event in history">{{ event.action }} at {{ event.at.toLocaleTimeString() }}</li>
</ul>

<span v-if="history.length === 0">No events yet</span>
