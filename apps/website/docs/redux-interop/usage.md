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

```ts
import { createReduxInterop } from '@withease/redux';

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

So you should do a "feature by feature" kind of migration.

In this case there are two possible situations:

1. An old feature is gradually migrated to new technologies, and its implementation uses both old and new approaches at the same time.
2. The whole new feature is written on new technologies, integrating with the old code through an adapter.

Let's break down these situations one by one

### Old feature

TBD

### New feature

When writing a new feature on new technologies, it is enough to have a minimal "bridge" of interaction with the old code. In our case, this bridge will be the `reduxInterop` object.

For the sake of this example, let's assume that we are adding a premium account feature to our product. Let's assume for now that we just need to check if the user has a premium subscription and that the existing account logic is already described using Redux.

In this case, we need to create a new Effector model for this product feature, and prepare a "mirror" of the user state from Redux.

TBD
