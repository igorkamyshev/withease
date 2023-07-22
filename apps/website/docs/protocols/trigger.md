# `@@trigger`

Protocol that allows start watching some external trigger and react on it with universal API.

::: tip Packages that use `@@trigger`

- [`@farfetched/core`](https://farfetched.pages.dev/tutorial/trigger_api.html#external-triggers)

:::

::: tip Known `@@trigger`

- all integrations from [`@withease/web-api`](/web-api/)
- method `interval` from [`patronum`](https://patronum.effector.dev/methods/interval/)

:::

## Formulae

Trigger is an any object with the field `@@trigger` that a function that returns an object with fields:

- `fired`: [_Event_](https://effector.dev/docs/api/effector/event), external consumers will listen it to determine when trigger was activated
- `setup`: [_Event_](https://effector.dev/docs/api/effector/event), external consumers will call it to set up trigger
- `teardown`: [_Event_](https://effector.dev/docs/api/effector/event), external consumers will call it to stop trigger

::: tip
[_Events_](https://effector.dev/docs/api/effector/event) `setup` and `teardown` are presented in protocol, because it is better to provide [explicit start of the application](/magazine/explicit_start).
:::

## Single `fired`

Since `@@trigger` supports only one `fired` [_Event_](https://effector.dev/docs/api/effector/event), any operator that supports `@@trigger` protocol has to choose reasonable [_Event_](https://effector.dev/docs/api/effector/event) to use it as `fired`.

E.g., [`trackPageVisibility`](/web-api/page_visibility) returns [_Events_](https://effector.dev/docs/api/effector/event) `visible` and `hidden`, but `visible` seems more reasonable `fired` [_Event_](https://effector.dev/docs/api/effector/event).

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
