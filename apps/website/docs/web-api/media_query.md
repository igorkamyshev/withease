# Media query

Allows tracking any media query matching state with [_Events_](https://effector.dev/docs/api/effector/event) and [_Stores_](https://effector.dev/docs/api/effector/store).

::: info

Uses [Window.matchMedia](https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia) under the hood

:::

## Usage

### Single query

All you need to do is to create an integration by calling `trackMediaQuery` with query to track an integration options:

- `setup`: after this [_Event_](https://effector.dev/docs/api/effector/event) all listeners will be installed, and the integration will be ready to use; it is required because it is better to use [explicit initialization _Event_ in the application](/magazine/explicit_start).
- `teardown?`: after this [_Event_](https://effector.dev/docs/api/effector/event) all listeners will be removed, and the integration will be ready to be destroyed.

```ts
import { trackMediaQuery } from '@withease/web-api';

const { $matches, matched } = trackMediaQuery('(max-width: 600px)', {
  setup: appStarted,
});
```

Returns an object with:

- `$matches`: [_Store_](https://effector.dev/docs/api/effector/store) with `true` if query is matches current state and `false` if it is not
- `matched`: [_Event_](https://effector.dev/docs/api/effector/event) fired when query starts to match current state

::: tip
It supports [`@@trigger` protocol](/protocols/trigger). Since it allows firing only one [_Event_](https://effector.dev/docs/api/effector/event) `trackMediaQuery` triggers `matched` as a `fired` in case of [`@@trigger` protocol](/protocols/trigger).

```ts
import { trackMediaQuery } from '@withease/web-api';

somethingExpectsTrigger(trackMediaQuery('(max-width: 600px)'));
```

To use it as a `@@trigger` protocol you do not have to pass `setup` and `teardown` options.

:::

### Multiple queries

You can track multiple queries by calling `trackMediaQueries` with queries to track and integration options:

```ts
import { trackMediaQuery } from '@withease/web-api';

const { mobile, desktop } = trackMediaQuery(
  { mobile: '(max-width: 600px)', desktop: '(min-width: 601px)' },
  { setup: appStarted }
);

mobile.$matches; // Store<boolean>
mobile.matched; // Event<void>

desktop.$matches; // Store<boolean>
desktop.matched; // Event<void>
```

## Live demo

Let us show you a live demo of how it works. The following demo displays a `$matches` value of the query in the screen. _Change the screen size to see how it works._

<script setup lang="ts">
import { createEvent } from 'effector';
import { useStore } from 'effector-vue/composition'

import { trackMediaQuery } from '../../../../packages/web-api';

const appStarted = createEvent();

const { mobile, desktop } = trackMediaQuery(
  { desktop: '(min-width: 601px)', mobile: '(max-width: 600px)' },
  { setup: appStarted }
);

const matchesMobile = useStore(mobile.$matches)
const matchesDesktop = useStore(desktop.$matches)

appStarted();

</script>

::: details Source code

```ts
import { createEvent } from 'effector';
import { useStore } from 'effector-vue/composition';
import { trackMediaQuery } from '@withease/web-api';

const appStarted = createEvent();

const { mobile, desktop } = trackMediaQuery(
  {
    desktop: '(min-width: 601px)',
    mobile: '(max-width: 600px)',
  },
  { setup: appStarted }
);

const matchesMobile = useStore(mobile.$matches);
const matchesDesktop = useStore(desktop.$matches);

appStarted();
```

:::

- Query matches mobile (max-width: 600px) : **{{ matchesMobile }}**
- Query matches desktop (min-width: 601px) : **{{ matchesDesktop }}**
