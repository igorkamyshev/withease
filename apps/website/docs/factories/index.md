---
outline: [2, 3]
---

# factories

In Effector's world any factory is a function that returns a set of [_Stores_](https://effector.dev/docs/api/effector/store), [_Events_](https://effector.dev/en/api/effector/event/) or [_Effects_](https://effector.dev/docs/api/effector/effect). It's a way to encapsulate some logic and reuse it in different places.

If your application has any unit-tests or meant to be rendered on the server (SSR) factories have to be added to `factories` field in config of [`effector/babel-plugin`](https://effector.dev/docs/api/effector/babel-plugin/) or [`@effector/swc-plugin`](https://github.com/effector/swc-plugin). The reasons of this limitation are described in [this article](https://farfetched.pages.dev/recipes/sids.html).

In real world it is easy to add any third-party library that uses factories to the config because it has an exact import path. But adding factories from your own code is a bit more complicated. There are no automatic ways to validate that all factories are added to the config. This library is solving this problem: just add `@withease/factories` to the config and use it to create and invoke factories.

Also, this library covers a few edge-cases that are really important for SSR. To learn more about them, read the [motivation](./motivation).

## Installation

First, you need to install package:

::: code-group

```sh [pnpm]
pnpm install @withease/factories
```

```sh [yarn]
yarn add @withease/factories
```

```sh [npm]
npm install @withease/factories
```

:::

Second, you need to add `@withease/factories` to the config of [`effector/babel-plugin`](https://effector.dev/docs/api/effector/babel-plugin/) or [`@effector/swc-plugin`](https://github.com/effector/swc-plugin):

::: code-group

```json [effector/babel-plugin]
{
  "plugins": [["effector/babel-plugin"]]
}
```

```json [@effector/swc-plugin]
{
  "$schema": "https://json.schemastore.org/swcrc",
  "jsc": {
    "experimental": {
      "plugins": [["@effector/swc-plugin"]]
    }
  }
}
```

:::

That's it! Now you can use `@withease/factories` to create and invoke factories across your application.

## API

### `createFactory`

To create a factory you need to call `createFactory` with a factory creator callback:

```js
import { createStore, createEvent, sample } from 'effector';
import { createFactory } from '@withease/factories';

const createCounter = createFactory(({ initialValue }) => {
  const $counter = createStore(initialValue);

  const increment = createEvent();
  const decrement = createEvent();

  sample({
    clock: increment,
    source: $counter,
    fn: (counter) => counter + 1,
    target: $counter,
  });

  sample({
    clock: decrement,
    source: $counter,
    fn: (counter) => counter - 1,
    target: $counter,
  });

  return {
    $counter,
    increment,
    decrement,
  };
});
```

### `invoke`

Anywhere in your application you can invoke a factory by calling `invoke` with a factory and its arguments:

```ts
import { invoke } from '@withease/factories';

const counter = invoke(createCounter, { initialValue: 2 });
```

::: warning
You have to invoke factories only in the top-level of your application. It means that you **must not** invoke it during component rendering or in any other place that can be called multiple times. Otherwise, you will get a memory leak.

This limitation is applied to any factory, not only to factories created with `@withease/factories`.
:::
