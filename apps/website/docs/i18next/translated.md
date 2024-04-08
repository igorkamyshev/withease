# `translated`

A factory that returns [_Store_](https://effector.dev/docs/api/effector/store) containing a translated string.

```ts
const { translated } = createI18nextIntegration({
  /* ... */
});

const $someTranslatedString = translated('premiumLabel.BrandOne');
```

The second argument is an optional object with options for the translation function. Options can be a [_Store_](https://effector.dev/docs/api/effector/store) or a plain value.

```ts
const $city = createStore({ name: 'Moscow' });

const { translated } = createI18nextIntegration({
  /* ... */
});

const $someTranslatedString = translated('cityPois.buttonText', {
  cityName: $city.map((city) => city.name),
});
```

Also, you can pass a template string with [_Store_](https://effector.dev/docs/api/effector/store) parts of a key:

```ts
const $pathOfAKey = createStore('BrandOne');

const { translated } = createI18nextIntegration({
  /* ... */
});

const $someTranslatedString = translated`premiumLabel.${$pathOfAKey}`;
```

Result of the factory will be a [_Store_](https://effector.dev/docs/api/effector/store) containing a translated string. It will be updated automatically when the language or available translations will be changed.
