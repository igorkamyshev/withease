---
'@withease/redux': minor
---

This PR adds a new overload for the `createReduxIntegration` - without explicit `reduxStore`, which allows you to pass the Store via `setup` event later.

This helps to avoid dependency cycles, but at a cost:
The type support for `reduxInterop.$state` will be slightly worse and `reduxInterop.dispatch` will be no-op (and will show warnings in console) until interop object is provided with Redux Store.
