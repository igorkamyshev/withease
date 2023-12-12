# Migrating from Redux to Effector

This guide explains how to perform a gradual, non-blocking code migration from Redux to Effector.

## Preparation

### Install effector

First of all, you need to install the `effector` package. See [the official documentation for instructions](https://effector.dev/en/introduction/installation/).

It is also highly recommended to set up the official [Effector Eslint Plugin](https://eslint.effector.dev/), so it would be easier for you to follow Effector's best practices.

Also, it is recommended to read at least some of the Effector's docs, so it is easier to follow the guide.
E.g. you can read [Effector-related terminology here](https://effector.dev/en/explanation/glossary/).

### Install @withease/redux

This guide uses the `@withease/redux` package, which is a minimalistic set of helpers to simplify the migration, so it is recommended to install it too.

See [the package documentation](/redux-interop/) for detailed installation instructions.

### Create Redux interoperability object

In order for Redux and Effector to communicate effectively with each other, a special object must be created.

You should do it by using `createReduxInterop` method of the `@withease/redux` somewhere near the Redux Store configuration itself.

Redux Toolkit `configureStore` is used here as an example, `@withease/redux` supports any kind of Redux Store.

```ts
// src/redux-store
import { createReduxInterop } from '@withease/redux';
import { configureStore } from '@reduxjs/tookit';

export const myReduxStore = configureStore({
  // ...
});

export const reduxInterop = createReduxInterop({
  reduxStore: myReduxStore,
  setup: appStarted,
});
```

☝️ Notice, how explicit `setup` event is required to initilize the interoperability. Usually it would be an `appStarted` event or any other "app's lifecycle" event.

You can read more about this best-practice [in the "Explicit start of the app" article](/magazine/explicit_start).

It is recommended to pick a place in your project architecture and add a model for the app lifecycle events declaration:

```ts
// e.g. shared/app-lifecycle/index.ts
import { createEvent } from 'effector';

export const appStarted = createEvent();
```

and then call this event in the point, which corresponds to "start of the app" - usually this is somewhere near the render.

```tsx
import { appStarted } from 'root/shared/app-lifecycle';

appStarted();

render(<App />);
```

After that, you have everything ready to start a gradual migration.

## Migration

Now you have existing code with Redux" that implements the features of your product.
There is no point in stopping development altogether to migrate between technologies, this process should be integrated into the product development.

It's a good idea to pick one of the existing features in your code, rewrite it to the new technology, and show the resulting Pull Request to your colleagues. This way you can evaluate whether this technology helps you solve your problems and how well it suits your team.

This is a list of cases with examples of organizing a migration from Redux code to Effector code.

### Migrating existing feature

First thing you need to do in that case is to create an Effector model somewhere, where you want to put a new implementation.

#### Effector API for the Redux code

At first new model will only contain a "mirrored" stores and events, which are reading and sending updates to Redux Store:

```ts
// src/features/user-info/model.ts
export const $userName = reduxInterop.fromState(
  (state) => state.userInfo.name ?? ''
);
export const updateName = reduxInterop.dispatch.prepend((name: string) =>
  userInfoSlice.updateName(name)
);
```

☝️ It is recommended to use `.prepend` API of `reduxInterop.dispatch` event to create separate Effector events, connected to their Redux action counterparts.

This model then can be used anywhere in place of classic actions and selectors.

E.g. an UI component:

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

Now that we have the Effector API for the old code, we can write some tests for it, so that the behavior of the Redux code will be captured and we won't break anything when porting the feature implementation to Effector.

Notice, that we also need to create mock version of the Redux Store, so this test is independent of any other.

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
      [reduxInterop.$store, mockStore],
    ],
  });

  await allSettled(appStarted, { scope });

  expect(scope.getState($userName)).toBe('');

  await allSettled(updateName, { scope, params: 'John' });

  expect(scope.getState($userName)).toBe('John');
});
```

Such tests will allow us to notice any changes in logic early on.

You can find more details about Effector-way testing [in the "Writing tests" guide in the documentation](https://effector.dev/en/guides/testing/).

#### Gradual rewrite

We can now extend this model with new logic or carry over existing logic from Redux, while keeping public API of Effector units.

```ts
// src/features/user-info/model.ts
export const $userName = reduxInterop.fromState(
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
2. But all related logic and side-effects are now managed by the Effector
3. and all external consumers (UI-components, other features, etc) interact with the feature through its Effector-model.

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

### Middleware with side-effects

Sometimes Redux actions are not changing state, but trigger side-effects via middlewares.

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

As a second step, gradually change all dispatches of this action to a event call.

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

Since now all analytics is sent via this event, it is now possible to fully move from a analytics middleware to Effector's model:

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
