---
title: Fork API rules
date: 2024-01-26
---

# Fork API rules

Fork API allows you to run multiple instances of the same application in the single process. It is useful for testing, SSR, and other cases. It is powerful mechanism, but it has some rules that you should follow to avoid unexpected behavior.

:::tip

Some of the rules can be validated by static analysis tools like [preset `scope` of `eslint-plugin-effector`](https://eslint.effector.dev/presets/scope.html), but others require runtime validation. Please, refer to the [tutorial](/magazine/scopefull/) to learn how to set up such validations in your project.

:::

## Prefer declarative code

All Effector's operators (like `sample` or `combine`) support Fork API out of the box, if you describe your application logic in a declarative way with Effector's operator, you do not have to do anything to make it work with Fork API.

Of course, in some cases, you have to use some logic without Effector's operators, in this case, you have to follow some rules.

## Do not mix [_Effects_](https://effector.dev/docs/api/effector/effect) and async functions

It is illegal to mix [_Effects_](https://effector.dev/docs/api/effector/effect) and async functions inside [_Effect_](https://effector.dev/docs/api/effector/effect) handler body. This code will lead to unexpected behavior:

```ts{10-14}
import { createEffect } from "effector";

async function regularAsyncFunction() {
  // do stuff
}

const asyncFunctionInFx = createEffect(async () => {
  // do other stuff
});

const doAllStuffFx = createEffect(async () => {
  await regularAsyncFunction(); // 🔴 regular async function
  await asyncFunctionInFx(); // 🔴 effect
});
```

Actually, it can be fixed in a simple way. Just wrap all async functions into [_Effects_](https://effector.dev/docs/api/effector/effect):

```ts{12-15}
import { createEffect } from "effector";

async function regularAsyncFunction() {
  // do stuff
}
const regularAsyncFunctionFx = createEffect(regularAsyncFunction);

const asyncFunctionInFx = createEffect(async () => {
  // do other stuff
});

const doAllStuffFx = createEffect(async () => {
  await regularAsyncFunctionFx(); // 🟢 effect
  await asyncFunctionInFx(); // 🟢 effect
});
```

::: details One more thing
The last example is supported by Fork API, but there is a better way to do it. You can use [`sample`](https://effector.dev/docs/api/effector/sample) operator to express the same logic:

```ts
const doAllStuff = createEvent();

sample({ clock: doAllStuff, target: regularAsyncFunctionFx });
sample({ clock: regularAsyncFunctionFx.done, target: asyncFunctionInFx });
```

It is more declarative and expandable. For example, you can easily handle errors from this [_Effects_](https://effector.dev/docs/api/effector/effect) independently:

```ts
sample({ clock: regularAsyncFunctionFx.fail, target: logError });
sample({ clock: asyncFunctionInFx.fail, target: showErrorMessage });
```

:::

### `Promise.all` and `Promise.race`

Fork API supports `Promise.all` and `Promise.race` out of the box. You can use them in your code without any restrictions.

```ts
const doAllStuffFx = createEffect(async () => {
  // 🟢 valid
  await Promise.all([regularAsyncFunctionFx(), asyncFunctionInFx()]);
});

const doRaceStuffFx = createEffect(async () => {
  // 🟢 valid
  await Promise.race([regularAsyncFunctionFx(), asyncFunctionInFx()]);
});
```

## Bind [_Events_](https://effector.dev/en/api/effector/event/) to particular [_Scope_](https://effector.dev/docs/api/effector/scope)

Another important rule is to bind [_Events_](https://effector.dev/en/api/effector/event/) to particular [_Scope_](https://effector.dev/docs/api/effector/scope) if you call them from external sources outside the Effector. For example, if you pass them as a callback to some external library, or if you call them from the UI layer as an event handler.

### `useUnit`

For UI-libraries (like SolidJS or React), Effector has a special hooks that help you to bind [_Events_](https://effector.dev/en/api/effector/event/) to the current [_Scope_](https://effector.dev/docs/api/effector/scope) automatically:

::: code-group

```ts [SolidJS]
import { useUnit } from 'effector-solid';

const doStuff = createEvent();

function Component() {
  const handleClick = useUnit(doStuff);

  return <button onClick={handleClick}>Click me</button>;
}
```

```ts [React]
import { useUnit } from 'effector-react';

const doStuff = createEvent();

function Component() {
  const handleClick = useUnit(doStuff);

  return <button onClick={handleClick}>Click me</button>;
}
```

:::

Also, you have to provide the current [_Scope_](https://effector.dev/docs/api/effector/scope) to UI-library through the context. Read more about it in the [official documentation](https://effector.dev).

### [`scopeBind`](https://effector.dev/docs/api/effector/scopeBind)

However, sometimes you have to call [_Events_](https://effector.dev/en/api/effector/event/) from the external sources, for example, pass them as a callback to some external library or DOM APIs. In this case, you have to use [`scopeBind`](https://effector.dev/docs/api/effector/scopeBind) function:

```ts{7-8}
import { createEvent, createEffect, scopeBind, sample } from 'effector'

const windowGotFocus = createEvent();

const setupListenersFx = createEffect(async () => {
  const boundWindowGotFocus = scopeBind(windowGotFocus);
  addEventListener('focus', boundWindowGotFocus);
});

sample({ clock: appStarted, target: setupListenersFx });
```

::: tip
In this example we have to [`scopeBind`](https://effector.dev/docs/api/effector/scopeBind) inside [_Effect_](https://effector.dev/docs/api/effector/effect) because it contains current [_Scope_](https://effector.dev/docs/api/effector/scope). To call this [_Effect_](https://effector.dev/docs/api/effector/effect) we use [explicit application start](/magazine/explicit_start) [_Event_](https://effector.dev/en/api/effector/event/).
:::

## Use explicit start of the application

The last rule is to use explicit start of the application. It is important because you have to provide the current [_Scope_](https://effector.dev/docs/api/effector/scope) to the Effector itself. To fulfill this requirement, you can call `start` function with the current [_Scope_](https://effector.dev/docs/api/effector/scope) through `allSetteled` method:

```ts
import { allSettled } from 'effector';

await allSettled(appStarted, { scope });
```

## Recap

- One effect is one [_Effect_](https://effector.dev/docs/api/effector/effect), do not use asynchronous functions inside [_Effect_](https://effector.dev/docs/api/effector/effect) body
- Always use [`scopeBind`](https://effector.dev/docs/api/effector/scopeBind) for [_Events_](https://effector.dev/en/api/effector/event/) that are passed to external sources
- Do not forget to use `useUnit` (or its analogs) for [_Events_](https://effector.dev/en/api/effector/event/) that are used in the UI layer
- Do not execute any logic just on module execution, prefer explicit start of the application
