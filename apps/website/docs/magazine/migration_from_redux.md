# Migrating from Redux to Effector

This guide explains how to perform a gradual, non-blocking code migration from Redux to Effector.

## Preparation

### Install effector

First, you need to install the `effector` package. See [the official documentation for instructions](https://effector.dev/en/introduction/installation/).

:::tip
It is also highly recommended setting up the official [Effector ESLint Plugin](https://eslint.effector.dev/), so it would be easier for you to follow Effector's best practices.
:::

Also, it is recommended to read at least some of the Effector's docs, so it is easier to follow the guide.
E.g. you can read [Effector-related terminology here](https://effector.dev/en/explanation/glossary/).

### Install @withease/redux

This guide uses the `@withease/redux` package, which is a minimalistic set of helpers to simplify the migration, so it is recommended to install it too.

See [the package documentation](/redux/) for detailed installation instructions.

### Create Redux interoperability object

In order for Redux and Effector to communicate effectively with each other, a special object must be created.

You should do it by using `createReduxIntegration` method of the `@withease/redux` somewhere near the Redux Store configuration itself.

:::info
Redux Toolkit `configureStore` is used here as an example, `@withease/redux` supports any kind of Redux Store.
:::

```ts
// src/redux-store
import { createReduxIntegration } from '@withease/redux';
import { configureStore } from '@reduxjs/tookit';

export const myReduxStore = configureStore({
  // ...
});

export const reduxInterop = createReduxIntegration({
  reduxStore: myReduxStore,
  setup: appStarted,
});
```

☝️ Notice, how explicit `setup` event is required to initialize the interoperability. Usually it would be an `appStarted` event or any other "app's lifecycle" event.

You can read more about this best-practice [in the "Explicit start of the app" article](/magazine/explicit_start).

It is recommended to pick a place in your project architecture and add a model for the app lifecycle events declaration:

```ts
// e.g. shared/app-lifecycle/index.ts
import { createEvent } from 'effector';

export const appStarted = createEvent();
```

And then call this event in the point, which corresponds to "start of the app" - usually this is somewhere near the render.

```tsx
import { appStarted } from 'root/shared/app-lifecycle';

appStarted();

render(<App />);
```

After that, you have everything ready to start a gradual migration.

## Migration

Now you have existing code with Redux" that implements the features of your product.
There is no point in stopping development altogether to migrate between technologies, this process should be integrated into the product development.

:::tip
It is a good idea to select one of the existing functions in your code, rewrite it for the new technology and **show the resulting Pull Request to your colleagues** before starting a full-fledged migration.

This way you can **evaluate** whether this technology helps you solve your problems and **how well it suits** your team.
:::

This is a list of cases with examples of organizing a migration from Redux code to Effector code.

### Migrating existing feature

First thing you need to do in that case is to create an Effector model somewhere, where you want to put a new implementation.

#### Effector API for the Redux code

At first new model will only contain a "mirrored" stores and events, which are reading and sending updates to Redux Store:

```ts
// src/features/user-info/model.ts
export const $userName = combine(
  reduxInterop.$state,
  (state) => state.userInfo.name ?? ''
);
export const updateName = reduxInterop.dispatch.prepend((name: string) =>
  userInfoSlice.updateName(name)
);
```

:::tip
It is recommended to use `.prepend` API of `reduxInterop.dispatch` effect to create separate Effector events, connected to their Redux action counterparts.

The same is recommended for `reduxInterop.$state` - it is better to create separate stores via `combine` for "slices" of the Redux state, because it makes gradual migration easier.

But since `reduxInterop.dispatch` is a normal Effect and `reduxInterop.$state` is a normal store, you can safely use both of them like so.
:::

This model then can be used anywhere in place of classic actions and selectors.

E.g. a UI component:

```tsx
import { useUnit } from 'effector-react';

function UserInfoForm() {
  const { name, nameUpdated } = useUnit({
    name: $userName,
    nameUpdated: updateName,
  });

  return (
    <Wrapper>
      <Input
        value={name}
        onChange={(e) => {
          nameUpdated(e.currentTarget.value);
        }}
      />
    </Wrapper>
  );
}
```

You can find [API reference of UI-framework integrations in the Effector's documentation](https://effector.dev/en/api/).

#### Testing

Now that we have the Effector API for the old code, we can write some tests for it, so that the behavior of the Redux code will be captured, and we won't break anything when porting the feature implementation to Effector.

:::tip
Notice, that we also need to create mock version of the Redux Store, so this test is independent of any other.

Testable version of the Redux Store should also properly mock any thunks or custom middlewares, which are used in the test.
:::

```ts
import { configureStore } from '@reduxjs/tookit';

import { $userName, updateName } from 'root/features/user-info';
import { reduxInterop } from 'root/redux-store';
import { appStarted } from 'root/shared/app-lifecycle';

test('username is updated', async () => {
  const mockStore = configureStore({
    // ...
  });

  const scope = fork({
    values: [
      // Providing mock version of the redux store
      [reduxInterop.$reduxStore, mockStore],
    ],
  });

  await allSettled(appStarted, { scope });

  expect(scope.getState($userName)).toBe('');

  await allSettled(updateName, { scope, params: 'John' });

  expect(scope.getState($userName)).toBe('John');
});
```

Such tests will allow us to notice any changes in logic early on.

:::info
You can find more details about Effector-way testing [in the "Writing tests" guide in the documentation](https://effector.dev/en/guides/testing/).
:::

#### Gradual rewrite

We can now extend this model with new logic or carry over existing logic from Redux, while keeping public API of Effector units.

```ts
// src/features/user-info/model.ts
export const $userName = combine(
  reduxInterop.$state,
  (state) => state.userInfo.name ?? ''
);
export const updateName = createEvent<string>();

sample({
  clock: updateName,
  filter: (name) => name.length <= 20,
  target: [
    reduxInterop.dispatch.prepend((name: string) =>
      userInfoSlice.updateName(name)
    ),
  ],
});
```

☝️ Effector's model for the feature is extended with new logic (name can't be longer than 20 characters), but the public API of `$userName` store and `updateName` event is unchanged and state of the username is still lives inside Redux.

#### Moving the state

Eventually you should end up with a situation where:

1. The state of the feature is still stored in Redux
2. But all related logic and side effects are now managed by the Effector
3. and all external consumers (UI-components, other features, etc.) interact with the feature through its Effector-model.

After that you can safely move the state into the model and get rid of Redux-reducer for it:

```ts
// src/features/user-info/model.ts
export const $userName = createStore('');
export const updateName = createEvent<string>();

sample({
  clock: updateName,
  filter: (name) => name.length <= 20,
  target: $userName,
});
```

☝️ Feature is completely ported to Effector, `reduxInterop` is not used here anymore.

##### Edge-case

If there is still code that consumes this state via the Redux Store selector, and there is currently no way to move that consumer to use the Effector model, it is still possible to "sync" the state back into Redux as a read-only mirror of the Effector model state:

```ts
// src/features/user-info/model.ts

// ...main code

// sync state back to Redux
sample({
  clock: $userName,
  target: [
    reduxInterop.dispatch.prepend((name: string) =>
      userInfoSlice.syncNameFromEffector(name)
    ),
  ],
});
```

☝️ But it's important to make sure that this is a read-only mirror that won't be changed in Redux in any other way - because then there would be two parallel versions of this state, which would probably lead to nasty bugs.

## New feature

Adding a new feature on Effector to a Redux project is not much different from the initial step of migrating an existing feature:

1. Any new code is written in Effector
2. Any dependencies to Redux Store should work through `reduxInterop` API

## Special cases

### Middleware with side effects

Sometimes Redux actions are not changing state, but trigger side effects via middlewares.

Suppose Redux Store has middleware that reacts to action like `{ type: SEND_ANALYTICS_EVENT, payload }` and sends the event to our analytics.

Sending analytics is usually involved in almost all code of the application and migration of such a feature will be much more complicated.

In this case, the recommended upgrade path is as follows:

#### Mirror of the action

First, create a mirror Effector's event of the `SEND_ANALYTICS_EVENT` action by using its action-creator:

```ts
// src/shared/analytics/model.ts
import { reduxInterop } from 'root/redux-store';
import { sendAnalyticsEventAction } from './actions';

export const sendAnalytics = reduxInterop.dispatch.prepend((payload) =>
  sendAnalyticsEventAction(payload)
);
```

#### Move to event instead of an action

As a second step, gradually change all dispatches of this action to an event call.

E.g. instead of

```ts
import { sendAnalyticsEventAction } from 'root/analytics';

dispatch(sendAnalyticsEventAction(payload));
```

do

```ts
import { sendAnalytics } from 'root/analytics';

sendAnalytics(payload);
```

It is safe to do, because the `sendAnalytics(payload)` call here is a full equivalent of the `dispatch(sendAnalyticsEventAction(payload))` and can be used instead of it - the action will still be dispatched by the `reduxInterop.dispatch` under the hood.

In the end Redux, Effector and your UI-framework should all use this event instead of dispatching the action.

#### Move the implementation

Since now all analytics is sent via this event, it is now possible to fully move from the analytics middleware to Effector's model:

```ts
// src/shared/analytics/model.ts
import { createEvent, createEffect, sample } from 'effector';
import { sendEvent } from 'root/shared/analytics-client';

export const sendAnalytics = createEvent();

const sendEventFx = createEffect(sendEvent);

sample({
  clock: sendAnalytics,
  target: sendEventFx,
});
```

### Redux Thunks

Redux Thunks are a standard approach for writing asynchronous logic in Redux apps, and are commonly used for data fetching, so your app is probably already have a bunch of thunks, which should also be migrated at some point.

The closest equivalent to Thunk in Effector is an [Effect](https://effector.dev/en/api/effector/effect/), which is a container for any function, which produces side effects (like fetching the data from remote source) - so Thunks should be converted to Effects.

#### Create an Effect representation for a Thunk

You can convert any Thunk to Effect by using Effector's [`attach` operator](https://effector.dev/en/api/effector/attach/) and wrapping a `reduxInterop.dispatch` with it.

```ts
import { createAsyncThunk } from '@reduxjs/toolkit';
import { attach } from 'effector';

import { reduxInterop } from 'root/redux-store';

const someThunk = createAsyncThunk(
  'some/thunk',
  async (p: number, thunkApi) => {
    // thunk code
  }
);

/**
 * This is a redux-thunk, converted into an effector Effect.
 *
 * This allows gradual migration from redux-thunks to effector Effects
 */
const someFx = attach({
  mapParams: (p: number) => someThunk(p),
  effect: interop.dispatch,
});
```

Now you can use it in any new code with Effector:

```ts
sample({
  clock: doSomeButtonClicked,
  target: someFx,
});
```

:::info
Adding of `Fx` postfix for Effects is an Effector's naming convention, just like adding `$` to the store names.

It is described in details in [the "Naming convention" article in the docs](https://effector.dev/en/conventions/naming/).
:::

#### Use this Effect instead of original Thunk

Created Effect can be safely used anywhere, where you would use the original thunk - this will allow to simply swap Effect's implementation from Thunk usage later.

##### UI Component

```tsx
const doSome = useUnit(someThunkFx);

return <button onClick={doSome}>Do thunk</button>;
```

##### Other Thunk

```ts
const makeASandwichWithSecretSauce = (clientName) = async (dispatch) => {
  try {
    const result = await sandwichApi.getSandwichFor(clientName)

    dispatch(sandwichSlice.ready(result))
  } catch(error) {
    dispatch(sandwichSlice.failed(error))
  }
};

const makeASandwichFx = attach({
  mapParams(client) {
    return makeASandwichWithSecretSauce(client)
  },
  effect: reduxInterop.dispatch,
})

function makeSandwichesForEverybody() {
  return function (dispatch, getState) {
    if (!getState().sandwiches.isShopOpen) {
      return Promise.resolve();
    }

    return dispatch(makeASandwichWithSecretSauce('My Grandma'))
      .then(() =>
        Promise.all([
          makeASandwichFx('Me')),
          // ☝️ Notice, that this Effect is intertwined with the Thunk flow
          dispatch(makeANormalSandwich('My wife')),
        ])
      )
  };
}
```

### Swap Effect's implementation

After this Effect is used everywhere instead of a Thunk you can safely swap implementation:

```ts
// If Thunk was dispatching some actions internally, you can also preserve this logic in Effector's model
// and then migrate for it by following "Migrating existing feature" part of this guide
const sandwichReady = reduxInterop.dispatch.prepend((result) =>
  sandwichSlice.ready(result)
);
const sandiwchFailed = reduxInterop.dispatch.prepend((error) =>
  sandwichSlice.fail(error)
);

const makeASandwichFx = createEffect((clientName) =>
  sandwichApi.getSandwichFor(clientName)
);

sample({
  clock: makeASandwichFx.doneData,
  target: sandwichReady,
});

sample({
  clock: makeASandwichFx.failData,
  target: [
    sandwichFailed,
    reportErrorToSentry,
    // ...
  ],
});
```

That's it, Thunk is now Effect!

### Redux Sagas

Redux-Saga is a side effect management library for Redux.
Coincidentally, side effect management is also the main focus of Effector, so to migrate you will need to simply rewrite your sagas to Effector's concepts.

Thanks to `@withease/redux` you can do it partially and in any order. Here are few examples of the Saga code ported to Effector.

:::tip
These examples show the ported code, but the use of Redux actions and states is left as is, since other sagas (and any middlewares in general) may depend on them.

See the "Migrating Existing Functions" part of this guide for how to migrate from dispatchers and selectors to events and stores completely.
:::

#### Data fetching

::: code-group

```ts [saga]
function* fetchPosts() {
  yield put(actions.requestPosts());
  const page = yield select((state) => state.currentPage);
  const products = yield call(fetchApi, '/products', page);
  yield put(actions.receivePosts(products));
}

function* watchFetch() {
  while (yield take('FETCH_POSTS')) {
    yield call(fetchPosts); // waits for the fetchPosts task to terminate
  }
}
```

```ts [effector + @withease/redux]
const $page = combine(reduxInterop.$state, (state) => state.currentPage);
const postsRequested = reduxInterop.dispatch.prepend(actions.requestPosts);
const postsReceived = reduxInterop.dispatch.prepend(actions.receivePosts);
// This event should be used to dispatch this action in place of original dispatch
// See "Middleware with side-effects" part of this guide for explanation
const fetchPosts = reduxInterop.dispatch.prepend(() => ({
  type: 'FETCH_POSTS',
}));

const fetchProductsByPageFx = createEffect((page) =>
  fetchApi('/products', page)
);

// this sample describes the key part of the saga's logic
sample({
  clock: postsRequested,
  source: $page,
  target: fetchProductsByPageFx,
});

// Notice, that these two `sample`s here are used only to preserve actions dispatching,
// as there is might be other redux code depending on them
sample({
  clock: fetchPosts,
  target: postsRequested,
});

sample({
  clock: fetchProductsByPageFx.doneData,
  target: postsReceived,
});
```

:::

#### Throttle, delay and debounce

:::tip
You can implement debounce, delay and throttle logic in Effector by yourself.

But since those are common patterns, **it is recommended** to use [Patronum - the official utility library for Effector](https://patronum.effector.dev/methods/).
:::

::: code-group

```ts [saga]
import { throttle, debounce, delay } from 'redux-saga/effects';

function* handleInput(input) {
  // ...
}

function* throttleInput() {
  yield throttle(500, 'INPUT_CHANGED', handleInput);
}

function* debounceInput() {
  yield debounce(1000, 'INPUT_CHANGED', handleInput);
}

function* delayInput() {
  yield take('INPUT_CHANGED');
  yield delay(5000);
}
```

```ts [effector + @withease/redux]
import { debounce, delay, throttle } from 'patronum';
import { createEffect, createEvent, sample } from 'effector';

const inputChanged = createEvent();
const handleInputChangeFx = createEffect((input) => {
  // ...
});

sample({
  clock: [
    throttle({
      source: inputChanged,
      timeout: 500,
    }),
    debounce({
      source: inputChanged,
      timeout: 1000,
    }),
    delay({
      source: inputChanged,
      timeout: 5000,
    }),
  ],
  target: handleInputChangeFx,
});
```

:::

#### Background task

::: code-group

```ts [saga]
function* bgSync() {
  try {
    while (true) {
      yield put(actions.requestStart());
      const result = yield call(someApi);
      yield put(actions.requestSuccess(result));
      yield delay(5000);
    }
  } finally {
    if (yield cancelled()) yield put(actions.requestFailure('Sync cancelled!'));
  }
}

function* main() {
  while (yield take('START_BACKGROUND_SYNC')) {
    // starts the task in the background
    const bgSyncTask = yield fork(bgSync);

    // wait for the user stop action
    yield take('STOP_BACKGROUND_SYNC');
    // user clicked stop. cancel the background task
    // this will cause the forked bgSync task to jump into its finally block
    yield cancel(bgSyncTask);
  }
}
```

```ts [effector + @withease/redux]
import { createStore, sample, createEffect } from 'effector';
import { delay } from 'patronum';

import { reduxInterop } from 'root/redux-store';

const startRequested = reduxInterop.dispatch.prepend(actions.requestStart);
const requestSuccess = reduxInterop.dispatch.prepend(actions.requestSuccess);

export const backgroundSyncStarted = reduxInterop.dispatch.prepend(
  actions.startBackgroundSync
);
export const backgroundSyncStopped = reduxInterop.dispatch.prepend(
  actions.stopBackgroundSync
);

const $needSync = createStore(false)
  .on(backgroundSyncStarted, () => true)
  .on(backgroundSyncStopped, () => false);
const someApiFx = createEffect(someApi);

// This sample will run someApiFx in cycle with 5 second delays,
// until background sync is stopped
sample({
  clock: [
    backgroundSyncStarted,
    delay({
      source: someApiFx.done,
      timeout: 5_000,
    }),
  ],
  filter: $needSync,
  target: [
    // Dispatching original action for compatibility
    // with the rest of the project
    startRequested,
    // Calling the API
    someApiFx,
  ],
});

// Dispatching original action for compatibility
// with the rest of the project
sample({
  clock: someApiFx.doneData,
  target: requestSuccess,
});
```

:::

#### Partial Saga migration

Previous examples shown the full rewrite of sagas, but it is not necessary.
You can move parts of the logic from any saga step-by-step, without rewriting the whole thing:

1. To call an Effector's Event or Effect from Saga you can use a `call` operator, like `yield call(effectorEvent, argument)`.
2. To read state of the Effector's Store in the Saga you can also use `call` + `getState()` method of a store, like this: `yield call(() => $someStore.getState())`.

:::warning
Note that it is generally **not recommended** calling the `getState` method of Effector Stores, because it is imperative and non-reactive. This method is an escape-hatch for cases where there is no other way.

But you can sometimes use it in Sagas, since they themselves are imperative and non-reactive, and you won't always have the option to write the state to the effector right away.
:::

Here is an earlier "Data fetching" example, but in a state of partial rewrite.

```ts
// effector model
const $page = combine(reduxInterop.$state, (state) => state.currentPage);

const postsRequested = reduxInterop.dispatch.prepend(actions.requestPosts);
const postsReceived = reduxInterop.dispatch.prepend(actions.receivePosts);

export const fetchPosts = reduxInterop.dispatch.prepend(() => ({
  type: 'FETCH_POSTS',
}));

const fetchProductsByPageFx = attach({
  source: $page,
  effect(page, filter) {
    return fetchApi('/products', page, filter);
  },
});

// saga
import { $filters } from 'root/features/filters';

import { postsRequested, postsReceived, fetchProductsByPageFx } from './model';

function* fetchPosts() {
  yield call(postsRequested);
  const filters = yield call(() => $filters.getState());
  const products = yield call(fetchProductsByPageFx);
  yield call(postsReceived, products);
}

function* watchFetch() {
  while (yield take('FETCH_POSTS')) {
    yield call(fetchPosts); // waits for the fetchPosts task to terminate
  }
}
```

☝️ Notice how `yield call(effectorEvent, argument)` is used instead of `yield put(action)` here. It allows to both call Effector's event (to use it in Effector-based code) and dispatch an action (to use it in Redux-based code).

## Summary

To perform a gradual, non-blocking code migration from Redux to Effector you will need to:

1. Install `@withease/redux` helpers package.
2. Convert a single feature to Effector, so you and your colleagues are able to evaluate if it fits you.
3. Rewrite Redux code to Effector, by converting entities of the former to their counterparts of the latter. You can do it gradually over the course of months and years, without stopping feature development of your product.
4. Remove `@withease/redux`, once there is no more Redux code left.
