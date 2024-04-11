---
title: .watch calls are (not) weird
date: 2024-01-26
---

# `.watch` calls are (not) weird

Sometimes, you can notice a _weird_ behavior in your code if you use `.watch` to track [_Store_](https://effector.dev/docs/api/effector/store) changes. Let us explain what is going on and how to deal with it.

## Effector's main mantra

::: tip Summary
`.watch` method immediately executes callback after module execution with the current value of the [_Store_](https://effector.dev/docs/api/effector/store).
:::

Effector is based on the idea of explicit initialization. It means that module execution should not produce any side effects. It is a good practice because it allows you to control the order of execution and avoid unexpected behavior. This mantra leads us to the idea of [explicit start of the app](/magazine/explicit_start).

However, it is one exception to this rule: callback in `.watch` call on [_Store_](https://effector.dev/docs/api/effector/store) is executed immediately after the store is created with a current value. This behavior is not quite obvious, but it is introduced on purpose.

::: details Why?

Effector introduced this behavior to be compatible with default behavior of [Redux](https://redux.js.org/) on the early stages of development. Also, it allows using Effector [_Stores_](https://effector.dev/docs/api/effector/store) in [Svelte](https://svelte.dev/) as its native stores without any additional compatibility layers.

**It is not a case anymore, but we still keep this behavior for historical reasons.**

:::

## The problem and solutions

Now, let us consider the following example:

```ts
const $store = createStore('original value');

$store.watch((value) => {
  console.log(value);
});

const scope = fork({
  values: [[$store, 'forked value']],
});

// -> 'original value'
```

In this example, console will print **only** `"original value"` since `fork` call does not produce any side effects.

Even if we change order of calls, it will not change the behavior:

```ts
const $store = createStore('original value');

const scope = fork({
  values: [[$store, 'forked value']],
});

$store.watch((value) => {
  console.log(value);
});

// -> 'original value'
```

It could be confusing, but it is not a bug. First `.watch` call executes only with current value of the [_Store_](https://effector.dev/docs/api/effector/store) outside of [_Scope_](https://effector.dev/docs/api/effector/scope/). In real-world applications, it means that you probably should not use `.watch`.

::: details Current value?

Actually, yes. Callback executes with the current value of the [_Store_](https://effector.dev/docs/api/effector/store) outside of [_Scope_](https://effector.dev/docs/api/effector/scope/). It means, you can change value of the [_Store_](https://effector.dev/docs/api/effector/store) before `.watch` call and it will be printed in the console:

```ts
const $store = createStore('original value');

$store.setState('something new');

$store.watch((value) => {
  console.log(value);
});

// -> 'something new'
```

However, it is a dangerous way, and you have to avoid it in application code.

:::

In general `.watch` could be useful for debugging purposes and as a way to track changes in [_Store_](https://effector.dev/docs/api/effector/store) and react somehow. Since, it is not a good idea to use it in the production code, let us consider some alternatives.

### Debug

Effector's ecosystem provides a way more powerful tool for debugging: [patronum/debug](https://patronum.effector.dev/methods/debug/). It correctly works with Fork API and has a lot of other useful features.

First, install it as a dependency:

::: code-group

```sh [pnpm]
pnpm install patronum
```

```sh [yarn]
yarn add patronum
```

```sh [npm]
npm install patronum
```

:::
Then, mark [_Store_](https://effector.dev/docs/api/effector/store) with `debug` method and register [_Scope_](https://effector.dev/docs/api/effector/scope/) with `debug.registerScope` method:

::: code-group

```ts [good]
import { createStore, fork } from 'effector';
import { debug } from 'patronum';

const $store = createStore('original value');

debug($store);

const scope = fork({
  values: [[$store, 'forked value']],
});

debug.registerScope(scope, { name: 'myAppScope' });

// -> [store] $store [getState] original value
// -> [store] (scope: myAppScope) $store [getState] forked value
```

```ts [bad]
import { createStore, fork } from 'effector';

const $store = createStore('original value');

$store.watch((value) => console.log('[store] $store', value));

const scope = fork({
  values: [[$store, 'forked value']],
});

// -> [store] $store original value
```

:::

That is it! Furthermore, you can use `debug` method not only to debug value of [_Store_](https://effector.dev/docs/api/effector/store) but also for track execution of other units like [_Event_](https://effector.dev/en/api/effector/event/) or [_Effect_](https://effector.dev/docs/api/effector/effect), for trace chain of calls and so on. For more details, please, check [patronum/debug](https://patronum.effector.dev/methods/debug/) documentation.

::: tip
Do not forget to remove `debug` calls from the production code. To ensure that, you can use [`effector/no-patronum-debug` rule for ESLint](https://eslint.effector.dev/rules/no-patronum-debug.html).
:::

### React on changes

If you need to react on changes in [_Store_](https://effector.dev/docs/api/effector/store), you can use `.updates` property. It is an [_Event_](https://effector.dev/en/api/effector/event/) that emits new values of the [_Store_](https://effector.dev/docs/api/effector/store) on each update. With a combination of [`sample`](https://effector.dev/docs/api/effector/sample) and [_Effect_](https://effector.dev/docs/api/effector/effect) it allows you to create side effects on changes in [_Store_](https://effector.dev/docs/api/effector/store) in a declarative and robust way.

::: code-group

```ts [good]
import {
  createEffect,
  createStore,
  createEvent,
  sample,
  fork,
  allSettled,
} from 'effector';

const someSideEffectFx = createEffect((storeValue) => {
  console.log('side effect with ', storeValue);
});

const $store = createStore('original value');

const appInited = createEvent();

sample({
  clock: [appInited, $store.updates],
  source: $store,
  target: someSideEffectFx,
});

const scope = fork({
  values: [[$store, 'forked value']],
});

allSettled(appInited, { scope });

// -> side effect with forked value
```

```ts [bad]
import { createStore, fork } from 'effector';

const $store = createStore('original value');

$store.watch((value) => console.log('side effect with ', value));

const scope = fork({
  values: [[$store, 'forked value']],
});

// -> side effect with original value
```

:::

::: tip
Since, Effector is based on idea of explicit triggers, in this example we use [explicit start of the app](/magazine/explicit_start).
:::

This approach not only solve problems that mentioned above but also increases code readability and maintainability. For example, real-world side effects can sometimes fail, and you need to handle errors. With `.watch` approach, you need to handle errors in each callback. With [_Effect_](https://effector.dev/docs/api/effector/effect) approach, you can handle errors in seamless declarative way, because [_Effect_](https://effector.dev/docs/api/effector/effect) has a built-in property `.fail` which is an [_Event_](https://effector.dev/en/api/effector/event/) that emits on each failure.

## Summary

- **Do not use `.watch`** for debug - use [`patronum/debug`](https://patronum.effector.dev/methods/debug/) instead
- **Do not use `.watch`** for logic and side effects - use [_Effects_](https://effector.dev/docs/api/effector/effect) instead
