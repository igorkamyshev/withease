# @withease/redux

## 1.1.2

### Patch Changes

- c3a3bb4: Update toolchain

## 1.1.1

### Patch Changes

- a6ac670: Add missed license field to package.json

## 1.1.0

### Minor Changes

- e08a5d6: Add a new overload for the `createReduxIntegration` - without explicit `reduxStore`, which allows you to pass the Store via `setup` _Event_ later.

  This helps to avoid dependency cycles, but at a cost:
  The type support for `reduxInterop.$state` will be slightly worse and `reduxInterop.dispatch` will be no-op (and will show warnings in console) until interop object is provided with Redux Store.

## 1.0.2

### Patch Changes

- 72b097b: Fix \$reduxStore public type

## 1.0.1

### Patch Changes

- 6fa3703: Fixed public types generation

## 1.0.0

### Major Changes

- 0e84e06: Initial release of Redux interop package for Effector
