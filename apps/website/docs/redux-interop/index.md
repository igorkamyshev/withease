---
outline: [2, 3]
---

# @withease/redux

This is a minimalistic package to allow simpler migration from Redux to Effector.

## Installation

First, you need to install package:

::: code-group

```sh [pnpm]
pnpm install @withease/redux
```

```sh [yarn]
yarn add @withease/redux
```

```sh [npm]
npm install @withease/redux
```

:::

## API

### `createReduxInterop`

Effector <-> Redux interoperability works through special "interop" object, which provides Effector-compatible API to Redux Store.

```ts
const myReduxStore = configureStore({
  // ...
});

const reduxInterop = createReduxInterop({
  reduxStore: myReduxStore,
  setup: appStarted,
});
```

Explicit `setup` event is required to initilize the interoperability. Usually it would be an `appStarted` event or any other "app's lifecycle" event.

You can read more about this practice [in the "Explicit start of the app" article](/magazine/explicit_start).

### Interop object

Redux Interop object provides few useful APIs.

#### `reduxInterop.fromState`

This method takes an selector and returns Effector's store.

```ts
const $user = reduxInterop.fromState((x) => x.user);
```

It is useful to mirror some part of the Redux state into Effector's world.

#### `reduxInterop.dispatch`

This is a Effector's Event, which calls are redirected into Redux Store's `dispatch` method.
Since it is a normal [Event](https://effector.dev/en/api/effector/event) - it supports all methods of `EventCallable` type.

It is recommended to create separate events for each specific action via `.prepend` method of `EventCallable`.

```ts
const updateUserName = reduxInterop.dispatch.prepend((name: string) =>
  userSlice.changeName(name)
);

sample({
  clock: saveButtonClicked,
  source: $nextName,
  target: updateUserName,
});
```

#### `reduxInterop.$store`

This is a Effector's Store, which contains provided instance of Redux Store.

It is useful, since it makes possible to use [Effector's Fork API to write tests](https://effector.dev/en/guides/testing/) for the logic, contained in the Redux Store!

So even if the logic is mixed between the two like this:

```ts
// app code
const myReduxStore = configureStore({
  // ...
});

const reduxInterop = createReduxInterop({
  reduxStore: myReduxStore,
  setup: appStarted,
});

// user model
const $user = reduxInterop.fromState((x) => x.user);

const updateUserName = reduxInterop.dispatch.prepend((name: string) =>
  userSlice.changeName(name)
);

sample({
  clock: saveButtonClicked,
  source: $nextName,
  target: updateUserName,
});
```

It is still possible to write a proper test like this:

```ts
test('username updated after save button click', async () => {
  const mockStore = configureStore({
    // ...
  });

  const scope = fork({
    values: [
      // Providing mock version of the redux store, *if needed*
      [reduxInterop.$store, mockStore],
      // Mocking anything else, if needed
      [$nextName, 'updated'],
    ],
  });

  await allSettled(appStarted, { scope });

  expect(scope.getState($userName)).toBe('initial');

  await allSettled(saveButtonClicked, { scope });

  expect(scope.getState($userName)).toBe('updated');
});
```

☝️ This test will be especially useful in the future, when this part of logic will be ported to Effector.
