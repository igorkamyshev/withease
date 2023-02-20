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

The main reason for this approach is it allows you to control the app's lifecycle. It helps you to avoid unexpected behavior and make your app more predictable in some cases. Let's say we have a module with the following code:

```ts
// app.ts
import { createStore, createEvent, sample, bindScope } from "effector";

const $counter = createStore(0);
const increment = creaeEvent();

const startIncrementationIntervalFx = createEffect(() => {
  const boundIncrement = bindScope(scope, { safe: true });

  setInterval(() => {
    boundIncrement();
  }, 1000);
});

sample({
  clock: increment,
  source: $counter,
  fn: (counter) => counter + 1,
  target: $counter,
});

startIncrementationIntervalFx();
```

### Tests

We believe that any serious application has to be testable, so we have to isolate application lifecycle inside particular test-case. In case of implicit start (start of model logic by module execution), it will be impossible to test the app's behavior in different states.

::: tip
`bindScope` function allows you to bind an [_Event_](https://effector.dev/docs/api/effector/event) to particular [_Scope_](https://effector.dev/docs/api/effector/scope), more details you can find in the article [about Fork API rules](/magazine/fork_api_rules).
:::

Now, to test the app's behavior, we have to mock `setInterval` function and check that `$counter` value is correct after particular time.

```ts
// app.test.ts
import { $counter } from "./app";

test("$counter should be 5 after 5 seconds", async () => {
  // ... test
});

test("$counter should be 10 after 10 seconds", async () => {
  // ... test
});
```

But, counter will be started immediately after the module execution, and we will not be able to test the app's behavior in different states.

### SSR

In case of SSR, we have to start all application's logic on every user's request, and it will be impossible to do with implicit start.

```ts
// server.ts
import * as app from "./app";

function handleRequest(req, res) {
  // ...
}
```

But, counter will be started immediately after the module execution (aka application initialization), and we will not be able to start the app's logic on every user's request.

### Add explicit start

Let's rewrite the code and add explicit start of the app.

```ts
// app.ts
import { createStore, createEvent, sample, bindScope } from "effector";

const $counter = createStore(0);
const increment = creaeEvent();

const startIncrementationIntervalFx = createEffect(() => {
  const boundIncrement = bindScope(scope, { safe: true });

  setInterval(() => {
    boundIncrement();
  }, 1000);
});

sample({
  clock: increment,
  source: $counter,
  fn: (counter) => counter + 1,
  target: $counter,
});

startIncrementationIntervalFx(); // [!code --]
const appStarted = createEvent(); // [!code ++]
sample({ clock: appStarted, target: startIncrementationIntervalFx }); // [!code ++]
```

That's it! Now we can test the app's behavior in different states and start the app's logic on every user's request.

:::tip
In real-world applications, it's better to add not only explicit start of the app, but also explicit stop of the app. It will help you to avoid memory leaks and unexpected behavior.
:::

## One more thing

In this recipe, we used application-wide `appStarted` [_Event_](https://effector.dev/docs/api/effector/event) to trigger the start of the app. However, in real-world applications, it's better to use more granular [_Events_](https://effector.dev/docs/api/effector/event) to trigger the start of the particular part of the app.

## Recap

- Do not execute any logic just on module execution
- Use explicit start [_Event_](https://effector.dev/docs/api/effector/event) of the application
