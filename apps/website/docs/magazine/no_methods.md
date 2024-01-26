---
title: Prefer Operators to Methods
---

# Prefer Operators to Methods

In Effector, there are two ways to create a new unit from an existing one:

- Methods, e.g. `event.map(...)`, `event.filter(...)`, `store.map(...)`
- Operators, e.g. `combine(...)` and `sample(...)`

In most cases, operators are more powerful and flexible than methods. You can add new features to operators without rewriting the code. Let us see how it works on a few examples.

## `combine`

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

## `sample`

It is even more noticeable when you need to filter an [_Event_](https://effector.dev/en/api/effector/event/) by a payload. Let us say you have an [_Event_](https://effector.dev/en/api/effector/event/) representing form submission and derived [_Event_](https://effector.dev/en/api/effector/event/) representing valid form submission:

```ts
const formSubmitted = createEvent();

const validFormSubmitted = formSubmitted.filter({
  fn: (form) => {
    return form.isValid();
  },
});
```

Some time later, you need to add a new feature: use external service to validate form instead of using `isValid` method. In this case, you will need to completely rewrite the code:

```ts
/* [!code --:5] */ const validFormSubmitted = formSubmitted.filter({
  fn: (form) => {
    return form.isValid();
  },
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

## Summary

Prefer `sample` to `event.filter`/`event.map` and `combine` to `store.map` to make your code more extensible and transformable.

::: tip Exception

There is only one exception when you have to use method instead of operator: `event.prepend(...)` does not have an operator equivalent.

:::
