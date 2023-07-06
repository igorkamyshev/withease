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

## Type instantiation is excessively deep and possibly infinite

In some cases, TypeScript may throw an error like this:

```
Type instantiation is excessively deep and possibly infinite
```

It happens when you try to create a factory with a complex type. For this case, you can use inline function declaration in `invoke`

```ts
const myFactory = createFactory(/* complex types there */);

const value = invoke(() => myFactory(/* complex argument there */));
```
