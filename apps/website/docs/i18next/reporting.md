# `reporting`

An object with the following fields:

- `missingKey`, [_Event_](https://effector.dev/en/api/effector/event/) will be triggered when a key is missing in the translation resources, requires [adding `saveMissing` option to the i18next instance](https://www.i18next.com/overview/api#onmissingkey).

```ts
const { reporting } = createI18nextIntegration({
  /* ... */
});

sample({ clock: reporting.missingKey, target: sendWarningToSentry });
```
