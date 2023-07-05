# Important caveats

This library adds some limitations to factories created using `createFactory` function.

## Single argument

Factories created by `createFactory` function accept only one argument. If you need to pass multiple arguments to a factory, you have to wrap them in an object.

```js
import { createFactory } from '@withease/factories';

const someFactory = createFactory(({ arg1, arg2 }) => {
  // ...
});
```
