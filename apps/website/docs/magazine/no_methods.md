---
title: Prefer Operators to Methods
outline: [2, 3]
---

# Prefer Operators to Methods

In Effector, there are two ways to create a new unit from an existing one:

- Methods, e.g. `event.map(...)`, `event.filter(...)`, `store.map(...)`
- Operators, e.g. `combine(...)` and `sample(...)`

In most cases, operators are more powerful and flexible than methods.

## Extensibility

Operators are more extensible than methods. You can add new features to operators without rewriting the code. Let us see how it works on a few examples.

### `combine` vs `store.map`

Let us say you have a derived [_Store_](https://effector.dev/docs/api/effector/store) to calculate a discount percentage for user:

```ts
const $discountPercentage = $user.map((user) => {
  if (user.isPremium) return 20;
  return 0;
});
```

Some time later, you need to add a new feature: use current market conditions to calculate a discount percentage. In this case, you will need to completely rewrite the code:

```ts
/* [!code --:4] */ const $discountPercentage = $user.map((user) => {
  if (user.isPremium) return 20;
  return 0;
});

/* [!code ++:8] */ const $discountPercentage = combine(
  { user: $user, market: $market },
  ({ user, market }) => {
    if (user.isPremium) return 20;
    if (market.isChristmas) return 10;
    return 0;
  }
);
```

But if you use `combine` from the very beginning, you will be able to add a new feature without rewriting the code:

```ts
const $discountPercentage = combine(
  {
    user: $user,
    market: $market, // [!code ++]
  },
  ({ user, market }) => {
    if (user.isPremium) return 20;
    if (market.isChristmas) return 10; // [!code ++]
    return 0;
  }
);
```

### `sample` vs `event.filter`/`event.map`

It is even more noticeable when you need to filter an [_Event_](https://effector.dev/docs/api/effector/event) by a payload. Let us say you have an [_Event_](https://effector.dev/docs/api/effector/event) representing form submission and derived [_Event_](https://effector.dev/docs/api/effector/event) representing valid form submission:

```ts
const formSubmitted = createEvent();

const validFormSubmitted = formSubmitted.filter((form) => {
  return form.isValid();
});
```

Some time later, you need to add a new feature: use external service to validate form instead of using `isValid` method. In this case, you will need to completely rewrite the code:

```ts
/* [!code --:3] */ const validFormSubmitted = formSubmitted.filter((form) => {
  return form.isValid();
});

/* [!code ++:5] */ const validFormSubmitted = sample({
  clock: formSubmitted,
  source: $externalValidator,
  filter: (validator, form) => validator(form),
});
```

But if you use `sample` from the very beginning, you will be able to add a new feature without rewriting the code:

```ts
const validFormSubmitted = sample({
  clock: formSubmitted,
  filter: (form) => form.isValid(), // [!code --]
  source: $externalValidator, // [!code ++]
  filter: (validator, form) => validator(form), // [!code ++]
});
```

With a `sample` we can go even further and add payload transformation just by adding a new argument:

```ts
const validFormSubmitted = sample({
  clock: formSubmitted,
  source: $externalValidator,
  filter: (validator, form) => validator(form),
  fn: (_, form) => form.toJson(), // [!code ++]
});
```

Cool, right? But it is not the end. We can add a new feature: use external [_Store_](https://effector.dev/docs/api/effector/store) to enrich the payload:

```ts
const validFormSubmitted = sample({
  clock: formSubmitted,
  source: {
    validator: $externalValidator,
    userName: $userName, // [!code ++]
  },
  filter: ({ validator }, form) => validator(form),
  fn: ({ userName }, form) => ({
    ...form.toJson(),
    userName, // [!code ++]
  }),
});
```

## Code transformation

The second reason to prefer operators to methods is code transformation. Since [Effector requires some code transformation to work in specific cases like SSR](https://farfetched.pages.dev/recipes/sids.html), it is important to write code that can be transformed with robustness.

Code transformation tools like Babel and SWC have access to the source code of the particular file, but they do not have access to the whole project. It means that they do not have any information about the types of variables and functions. So, they cannot transform code that uses methods like `map` and `filter` because they do not whether it is an Effector's unit or plain JavaScript's array of something else that has `map` and `filter` methods.

Operators are functions imported from Effector's library, so code transformation tools can easily recognize them and transform the code.

## Summary

Prefer `sample` to `event.filter`/`event.map` and `combine` to `store.map` to make your code more extensible and transformable.

::: tip Exception

There are only one exception when you have to use methods instead of operators: `event.prepend(...)` does not have an operator equivalent.

:::
