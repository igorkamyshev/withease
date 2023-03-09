# `@@trigger`

Protocol that allows start watching some external trigger and react on it with universal API.

::: tip Related packages

- [`@withease/web-api`](/web-api/)
- [`@farfetched/core`](https://farfetched.pages.dev)

:::

## Formulae

Trigger is an any object with the field `@@trigger` that a function that returns an object with fields:

- `fired`: [_Event_](https://effector.dev/docs/api/effector/event), external consumers will listen it to determine when trigger was activated
- `setup`: [_Event_](https://effector.dev/docs/api/effector/event), external consumers will call it to set up trigger
- `teardown`: [_Event_](https://effector.dev/docs/api/effector/event), external consumers will call it to stop trigger

::: tip
[_Event_](https://effector.dev/docs/api/effector/event) `setup` is presented in protocol, because it is better to provide [explicit start of the application](/magazine/explicit_start).
:::

## Example

Let's create simple trigger that will be activated every second after starting:

```ts
import {
  createEvent,
  createStore,
  createEffect,
  scopeBind,
  sample,
} from 'effector';

const intervalTrigger = {
  '@@trigger': () => {
    const setup = createEvent();
    const fired = createEvent();
    const teardown = createEvent();

    const $interval = createStore(null);

    const startInternalFx = createEffect(() => {
      const boundFired = scopeBind(fired, { safe: true });

      return setInterval(boundFired, 1000);
    });

    const stopIntervalFx = createEffect(clearInterval);

    sample({ clock: setup, target: startInternalFx });
    sample({ clock: startIntervalFx.doneData, target: $interval });
    sample({ clock: teardown, source: $interval, target: stopIntervalFx });
    sample({ clock: stopIntervalFx.done, target: $interval.reinit });

    return { setup, fired };
  },
};
```

That is it, we can use `intervalTrigger` everywhere as a trigger!
