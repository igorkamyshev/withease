---
title: Dependency injection
date: 2023-06-19
---

# Dependency injection

Effector provides a simple way to inject dependencies into your application — Fork API. Let us take a look at how it works.

:::tip
Application has to follow [some rules to work with Fork API](/magazine/fork_api_rules)
:::

## Why

Sometimes you need to inject some dependencies into your application in particular environment. For example, you want to disable logger in tests. The easiest way to do it is to declare global variable and check it in your code:

```ts{4}
// app.ts
import { createEffect } from "effector";

const logEnabled = Boolean(process.env.IS_TEST);

const logFx = createEffect((message) => {
  if (!logEnabled) {
    return;
  }

  console.log(message);
});

sample({ clock: somethingHappened, target: logFx });
```

But it is not the best way. What if we want to enable it back for a particular test? We have to change the code and support one more variable. So, it will lead to a mess in the code.

Other reason is that you may want to use different implementations of a logger in different environments. For example, in browser you want to send logs to some external system (like Rollbar or Sentry) and on server you want to write logs to `stdout`.

## How

To solve these problems we can use Fork API. It allows us to create a new instance of the application with different dependencies. Let us take a look at how it works.

```ts
// app.ts

// Store instance of a logger in a Store
const $logger = createStore(null);

const logFx = attach({
  source: $logger,
  effect: (logger, message) => logger?.(message),
});

sample({ clock: somethingHappened, target: logFx });
```

That is it, now we can inject logger into our application.

::: code-group

```ts{5-7} [In tests]
import { fork, allSettled } from "effector";

describe("app", () => {
  it("should not log anything", async () => {
    const scope = fork({
      values: [[$logger, null]],
    });

    await allSettled(somethingHappened, { scope });

    expect(console.log).not.toBeCalled();
  });
});
```

```ts{4-6} [On server]
import { fork, allSettled } from "effector";

function handleHttp(req, res) {
  const scope = fork({
    values: [[$logger, console.log]],
  });

  await allSettled(somethingHappened, { scope });

  // render the app
}
```

```ts{3-5} [In browser]
import { fork, allSettled } from "effector";

const scope = fork({
  values: [[$logger, Rollbar.log]],
});

await allSettled(somethingHappened, { scope });
```

:::

We can inject any dependencies into our application in particular environment without changing the code.

## Recap

- Follow [the rules](/magazine/fork_api_rules) to work with Fork API
- Use Fork API as a dependency injection
