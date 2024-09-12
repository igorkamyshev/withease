---
outline: [2, 3]
---

# factories

In Effector's world any factory is a function that returns a set of [_Stores_](https://effector.dev/docs/api/effector/store), [_Events_](https://effector.dev/en/api/effector/event/) or [_Effects_](https://effector.dev/docs/api/effector/effect). It's a way to encapsulate some logic and reuse it in different places.

If your application has any unit-tests or meant to be rendered on the server (SSR) factories have to be added to `factories` field in config of [`effector/babel-plugin`](https://effector.dev/docs/api/effector/babel-plugin/) or [`@effector/swc-plugin`](https://effector.dev/en/api/effector/swc-plugin/). The reasons of this limitation are described in [this article](https://effector.dev/en/explanation/sids/).

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

Second, you need to setup [`effector/babel-plugin`](https://effector.dev/docs/api/effector/babel-plugin/) or [`@effector/swc-plugin`](https://effector.dev/en/api/effector/swc-plugin/). Please follow the instructions in the corresponding documentation.

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

::: warning
You have to invoke factories only in the top-level of your application. It means that you **must not** invoke it during component rendering or in any other place that can be called multiple times. Otherwise, you will get a memory leak.

This limitation is applied to any factory, not only to factories created with `@withease/factories`.
:::

```ts
import { invoke } from '@withease/factories';

const { $counter, increment, decrement } = invoke(createCounter, {
  initialValue: 2,
});
```

Now we can use `$counter`, `increment`, and `decrement` in our components. Here is how you might use them in different UI frameworks:

::: details Example usage in React

```jsx
import { useUnit } from 'effector-react';
import { $counter, increment, decrement } from './model'; // assuming you've invoked your factory in `model.js`/`model.ts`

const CounterComponent = () => {
  const counter = useUnit($counter);
  const [onIncrement, onDecrement] = useUnit(increment, decrement);

  return (
    <div>
      <p>Counter: {counter}</p>
      <button onClick={() => onIncrement()}>Increment</button>
      <button onClick={() => onDecrement()}>Decrement</button>
    </div>
  );
};
```

:::

::: details Example usage in Vue

```html
<template>
  <div>
    <p>Counter: {{ counter }}</p>
    <button @click="increment">Increment</button>
    <button @click="decrement">Decrement</button>
  </div>
</template>

<script setup>
  import { useUnit } from 'effector-vue/composition';
  import { $counter, increment, decrement } from './model'; // assuming you've invoked your factory in `model.js`/`model.ts`

  const counter = useUnit($counter);
</script>
```

:::
