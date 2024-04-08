# `$t`

A [_Store_](https://effector.dev/docs/api/effector/store) containing a [translation function](https://www.i18next.com/overview/api#t), can be used anywhere in your app.

```ts
const { $t } = createI18nextIntegration({
  /* ... */
});

const $someTranslatedString = $t.map((t) => t('cityPois.buttonText'));
```

The second argument is an optional object with options for the translation function.

```ts
const $city = createStore({ name: 'Moscow' });

const { $t } = createI18nextIntegration({
  /* ... */
});

const $someTranslatedString = combine({ city: $city, t: $t }, ({ city, t }) =>
  t('cityPois.buttonText', {
    cityName: city.name,
  })
);
```

In both cases, result will be a [_Store_](https://effector.dev/docs/api/effector/store) containing a translated string. It will be updated automatically when the language or available translations will be changed.
