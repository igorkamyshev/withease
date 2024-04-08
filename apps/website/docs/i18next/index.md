# i18next

A powerful internationalization framework for Effector which is based on [i18next](https://www.i18next.com/).

## Installation

First, you need to install integration and its peer dependency:

::: code-group

```sh [pnpm]
pnpm install @withease/i18next i18next
```

```sh [yarn]
yarn add @withease/i18next i18next
```

```sh [npm]
npm install @withease/i18next i18next
```

:::

## Initialization

All you need to do is to create an integration by calling `createI18nextIntegration` with an integration options:

- `instance`: an instance of i18next in various forms.
- `setup`: after this [_Event_](https://effector.dev/en/api/effector/event/) all listeners will be installed, and the integration will be ready to use; it is required because it is better to use [explicit initialization _Event_ in the application](/magazine/explicit_start).
- `teardown?`: after this [_Event_](https://effector.dev/en/api/effector/event/) all listeners will be removed, and the integration will be ready to be destroyed.

### Use replaceable static `i18next` instance

In the simplest case, you can pass an i18next instance to the integration.

```ts{9-11}
import i18next from 'i18next';
import { createStore, createEvent, fork, allSettled } from 'effector';
import { createI18nextIntegration } from '@withease/i18next';

// Event that should be called after application initialization
const appStarted = createEvent();

// Create Store for i18next instance
const $i18nextInstance = createStore(i18next.createInstance(/* ... */), {
  serialize: 'ignore',
});

const integration = createI18nextIntegration({
  // Pass Store with i18next instance to the integration
  instance: $i18nextInstance,
  setup: appStarted,
});

// You can replace $someInstance later during runtime
// e.g., during fork on client or server
```

### Use replaceable asynchronous `i18next` instance <Badge text="since v23.2.0" />

Sometimes you need to create an instance asynchronously. In this case, you can pass an [_Effect_](https://effector.dev/docs/api/effector/effect) that creates an instance.

```ts{9-11}
import i18next from 'i18next';
import { createStore, createEvent, fork, allSettled } from 'effector';
import { createI18nextIntegration } from '@withease/i18next';

// Event that should be called after application initialization
const appStarted = createEvent();

// Create Effect that creates i18next instance
const createI18nextFx = createEffect(() =>
  i18next.use(/* ... */).init(/* ... */)
);

const integration = createI18nextIntegration({
  // Pass Effect that creates i18next instance to the integration
  instance: createI18nextFx,
  setup: appStarted,
});

// You can replace createI18nextFx later during runtime
// e.g., during fork on client or server
```

### Use static `i18next` instance

Even though it is better to use a replaceable instance to [avoid global state](/magazine/global_variables) and make it possible to replace the instance during runtime, you can pass a static instance as well.

```ts{9}
import i18next from 'i18next';
import { createStore, createEvent } from 'effector';
import { createI18nextIntegration } from '@withease/i18next';

// Event that should be called after application initialization
const appStarted = createEvent();

const integration = createI18nextIntegration({
  instance: i18next.createInstance(/* ... */),
  setup: appStarted,
});
```

### Use static asynchronous `i18next` instance <Badge text="since v23.2.0" />

The same approach can be used with an asynchronous instance.

```ts{9}
import i18next from 'i18next';
import { createStore, createEvent } from 'effector';
import { createI18nextIntegration } from '@withease/i18next';

// Event that should be called after application initialization
const appStarted = createEvent();

const integration = createI18nextIntegration({
  instance: () => i18next.use(/* ... */).init(/* ... */),
  setup: appStarted,
});
```

## Usage

Returned from `createI18nextIntegration` integration contains the following fields:

- [`$t`](/i18next/t) is a [_Store_](https://effector.dev/docs/api/effector/store) containing a [translation function](https://www.i18next.com/overview/api#t)
- [`translated`](/i18next/translated) which can be used as a shorthand for `$t`
- [`$isReady`](/i18next/is_ready) is a [_Store_](https://effector.dev/docs/api/effector/store) containing a boolean value that indicates whether the integration is ready to use
- [`reporting`](/i18next/reporting) is an object with the fields that allow you to track different events of the integration
- <Badge text="since v23.2.0" /> [`$language`](/i18next/language) is a [_Store_](https://effector.dev/docs/api/effector/store) containing the current language
- <Badge text="since v23.2.0" /> [`changeLanguageFx`](/i18next/change_language) is an [_Effect_](https://effector.dev/docs/api/effector/effect) that changes the current language
- <Badge text="since v23.2.0" /> [`$instance`](/i18next/instance) is a [_Store_](https://effector.dev/docs/api/effector/store) containing the instance of i18next that is used by the integration
