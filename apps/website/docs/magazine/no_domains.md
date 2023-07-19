---
title: You Don't Need Domains
---

# You Don't Need Domains

[_Domain_](https://effector.dev/docs/api/effector/domain) in Effector is a namespace for [_Events_](https://effector.dev/docs/api/effector/event), [_Effects_](https://effector.dev/docs/api/effector/effect) and [_Stores_](https://effector.dev/docs/api/effector/store). It could be used for two purposes:

1. Semantic grouping of units
2. Bulk operations on units

However, in most cases, you do not need [_Domains_](https://effector.dev/docs/api/effector/domain) at all. Let us see why.

## Semantic Grouping

JavaScript does have semantic grouping of entities: it is **modules**. Since you do not have an option not to use modules, you will be using them to group your units anyway. So, why do you need another grouping mechanism?

::: code-group

```ts [module]
// 👇 all units are already grouped by module
// src/features/counter.ts

import { createEvent, createStore, sample } from 'effector';

export const increment = createEvent();
export const decrement = createEvent();

export const $counter = createStore(0);

sample({
  source: $counter,
  clock: increment,
  fn: (counter) => counter + 1,
  target: $counter,
});

sample({
  source: $counter,
  clock: decrement,
  fn: (counter) => counter - 1,
  target: $counter,
});
```

```ts [module and domain]
// 👇 all units are already grouped by module
// src/features/counter.ts

import { createDomain, createEvent, createStore, sample } from 'effector';

// AND by domain, so it is redundant
const counterDomain = createDomain();

export const increment = createEvent({ domain: counterDomain });
export const decrement = createEvent({ domain: counterDomain });

export const $counter = createStore(0, { domain: counterDomain });

sample({
  source: $counter,
  clock: increment,
  fn: (counter) => counter + 1,
  target: $counter,
});

sample({
  source: $counter,
  clock: decrement,
  fn: (counter) => counter - 1,
  target: $counter,
});
```

:::

## Bulk Operations

But [_Domains_](https://effector.dev/docs/api/effector/domain) are not only about grouping. They also allow you to perform bulk operations on units.

For example, you can reset values of all [_Stores_](https://effector.dev/docs/api/effector/store) in the [_Domain_](https://effector.dev/docs/api/effector/domain) with the following code:

```ts
import { createDomain, createStore, createEvent } from 'effector';

const domain = createDomain();

export const someEvent = createEvent({ domain });

export const $store1 = createStore(0, { domain });
export const $store2 = createStore(0, { domain });
export const $store3 = createStore(0, { domain });

// 👇 callback will be called on every Store in the Domain
domain.onCreateStore((store) => {
  store.reset(someEvent);
});
```

This approach has a significant drawback: **it is implicit**. In case of creating a new [_Store_](https://effector.dev/docs/api/effector/store) in the [_Domain_](https://effector.dev/docs/api/effector/domain), you will have to remember that trigger of `someEvent` will reset the new [_Store_](https://effector.dev/docs/api/effector/store) as well. It is really easy to forget about it.

Things become even worse if you have more than one bulk operations in the [_Domain_](https://effector.dev/docs/api/effector/domain).

Instead of using [_Domains_](https://effector.dev/docs/api/effector/domain), you can **explicitly** perform bulk operations on units. The previous example can be rewritten as follows:

```ts
import { createDomain, createStore, createEvent } from 'effector';

const domain = createDomain(); // [!code --]

export const someEvent = createEvent({
  domain, // [!code --]
});

export const $store1 = createStore(0, {
  domain, // [!code --]
});
export const $store2 = createStore(0, {
  domain, // [!code --]
});
export const $store3 = createStore(0, {
  domain, // [!code --]
});

// 👇 callback will be called on every Store in the Domain
domain.onCreateStore((store) => {
  store.reset(someEvent); // [!code --]
});

// 👇 now it is explicit
resetMany({ stores: [$store1, $store2, $store3], reset: someEvent }); // [!code ++]

function resetMany({ stores, reset }) {
  for (const unit of stores) {
    unit.reset(reset);
  }
}
```

This approach not only more explicit but also less verbose, because you do not need to specify [_Domain_](https://effector.dev/docs/api/effector/domain) for every unit.

## Summary

- **Do not use [_Domains_](https://effector.dev/docs/api/effector/domain)** for semantic grouping - use modules instead
- **Do not use [_Domains_](https://effector.dev/docs/api/effector/domain)** for bulk operations - use explicit functions instead
