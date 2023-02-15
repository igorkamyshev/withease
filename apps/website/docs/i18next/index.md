# i18next

A powerful internationalization framework for Effector which is based on [i18next](https://www.i18next.com/).

## Install

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

## API

### Initialization

All you need to do is to create an integration by calling `createI18nextIntegration` with an integration options:

- `instance` - an instance of i18next or [_Store_](https://effector.dev/docs/api/effector/store) with i18next instance
- `setup` - after this [_Event_](https://effector.dev/docs/api/effector/event) all listeners will be installed, and the integration will be ready to use
- `teardown?` — after this [_Event_](https://effector.dev/docs/api/effector/event) all listeners will be removed, and the integration will be ready to be destroyed

```ts
import i18next from "i18next";
import { createStore, createEvent, fork, allSettled } from "effector";
import { createI18nextIntegration } from "@withease/i18next";

// Event that should be called after application initialization
const appStarted = createEvent();

// Create Store for i18next instance
const $i18nextInstance = createStore(null);

const integration = createI18nextIntegration({
  // Pass Store with i18next instance to the integration
  instance: $i18nextInstance,
  setup: appStarted,
});

// You can fill $someInstance later during runtime
// e.g., during fork on client or server

const scope = fork({
  values: [[$i18nextInstance, i18next.createInstance(/* ... */)]],
});

await allSettled(appStarted, { scope });
```

### Integration

Returned from `createI18nextIntegration` integration contains the following fields:

#### `$t`

A [_Store_](https://effector.dev/docs/api/effector/store) containing a [translation function](https://www.i18next.com/overview/api#t), can be used anywhere in your app.

```ts
const { $t } = createI18nextIntegration({
  /* ... */
});

const $someTranslatedString = $t.map((t) => t("cityPois.buttonText"));
```

The second argument is an optional object with options for the translation function.

```ts
const $city = createStore({ name: "Moscow" });

const { $t } = createI18nextIntegration({
  /* ... */
});

const $someTranslatedString = combine({ city: $city, t: $t }, ({ city, t }) =>
  t("cityPois.buttonText", {
    cityName: city.name,
  })
);
```

In both cases, result will be a [_Store_](https://effector.dev/docs/api/effector/store) containing a translated string. It will be updated automatically when the language or available translations will be changed.

### `translated`

A factory that returns [_Store_](https://effector.dev/docs/api/effector/store) containing a translated string.

```ts
const { translated } = createI18nextIntegration({
  /* ... */
});

const $someTranslatedString = translated("premiumLabel.BrandOne");
```

The second argument is an optional object with options for the translation function. Options can be a [_Store_](https://effector.dev/docs/api/effector/store) or a plain value.

```ts
const $city = createStore({ name: "Moscow" });

const { translated } = createI18nextIntegration({
  /* ... */
});

const $someTranslatedString = translated("cityPois.buttonText", {
  cityName: $city((city) => city.name),
});
```

Also, you can pass a template string with [_Store_](https://effector.dev/docs/api/effector/store) parts of a key:

```ts
const $pathOfAKey = createStore("BrandOne");

const { translated } = createI18nextIntegration({
  /* ... */
});

const $someTranslatedString = translated`premiumLabel.${$pathOfAKey}`;
```

Result of the factory will be a [_Store_](https://effector.dev/docs/api/effector/store) containing a translated string. It will be updated automatically when the language or available translations will be changed.
