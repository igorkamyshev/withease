# Explicit start of the app

In Effector's [_Events_](https://effector.dev/docs/api/effector/event) can not be triggered implicitly. It gives you more control over the app's lifecycle and helps to avoid unexpected behavior.

## The code

In the simplest case, you can just create something like `appStarted` [_Event_](https://effector.dev/docs/api/effector/event) and trigger it right after the app initialization. Let's pass through the code line by line and explain what's going on here.

1. Create start [_Event_](https://effector.dev/docs/api/effector/event)

This [_Event_](https://effector.dev/docs/api/effector/event) will be used to trigger the start of the app. For example, you can attach some global listeners after this it.

```ts{3}
import { createEvent, fork, allSettled } from "effector";

const appStarted = createEvent();

const scope = fork();

await allSettled(appStarted, { scope });
```

2. Create isolated [_Scope_](https://effector.dev/docs/api/effector/scope)

Fork API allows you to create isolated [_Scope_](https://effector.dev/docs/api/effector/scope) which will be used across the app. It helps you to [prevent using global state](/magazine/global_variables) and avoid unexpected behavior.

```ts{5}
import { createEvent, fork, allSettled } from "effector";

const appStarted = createEvent();

const scope = fork();

await allSettled(appStarted, { scope });
```

3. Trigger start [_Event_](https://effector.dev/docs/api/effector/event) on the patricular [_Scope_](https://effector.dev/docs/api/effector/scope)

[`allSettled`](https://effector.dev/docs/api/effector/allSettled) function allows you to start an [_Event_](https://effector.dev/docs/api/effector/event) on particular [_Scope_](https://effector.dev/docs/api/effector/scope) and wait until all computations will be finished.

```ts{7}
import { createEvent, fork, allSettled } from "effector";

const appStarted = createEvent();

const scope = fork();

await allSettled(appStarted, { scope });
```

## The reasons

## Recap
