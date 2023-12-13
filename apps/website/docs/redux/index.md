---
outline: [2, 3]
---

# @withease/redux

Minimalistic package to allow simpler migration from Redux to Effector.
Also can handle any other usecase, where one needs to communicate with Redux Store from Effector's code.

This is a API reference article, for the Redux -> Effector migration guide [see the "Migrating from Redux to Effector" article](/magazine/migration_from_redux).

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

### `createReduxIntegration`

Effector <-> Redux interoperability works through special "interop" object, which provides Effector-compatible API to Redux Store.

```ts
const myReduxStore = configureStore({
  // ...
});

const reduxInterop = createReduxIntegration({
  reduxStore: myReduxStore,
  setup: appStarted,
});
```

Explicit `setup` event is required to initilize the interoperability. Usually it would be an `appStarted` event or any other "app's lifecycle" event.

You can read more about this practice [in the "Explicit start of the app" article](/magazine/explicit_start).

### Interoperability object

Redux Interoperability object provides few useful APIs.

#### `reduxInterop.fromState`

This method takes an selector and returns Effector's store.

```ts
const $user = reduxInterop.fromState((x) => x.user);
```

It is useful to mirror some part of the Redux state into Effector's world.

Notice, that `fromState` method supports Redux Store typings, which can be useful

#### `reduxInterop.dispatch`

This is a Effector's Effect, which calls Redux Store's `dispatch` method under the hood.
Since it is a normal [Effect](https://effector.dev/en/api/effector/effect) - it supports all methods of `Effect` type.

It is recommended to create separate events for each specific action via `.prepend` method of `Effect`.

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

const reduxInterop = createReduxIntegration({
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
      // Providing mock version of the redux store
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

Notice, that it is recommended to create a mock version of Redux Store for any test like this, since the Store is containg state, which could leak between the tests.