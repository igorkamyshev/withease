# `changeLanguageFx`

An [_Effect_](https://effector.dev/en/api/effector/effect/) that can be called with a language code to change the current language.

```ts
const { changeLanguageFx } = createI18nextIntegration({
  /* ... */
});

sample({
  clock: someButtonClicked,
  fn: () => 'en',
  target: changeLanguageFx,
});
```
