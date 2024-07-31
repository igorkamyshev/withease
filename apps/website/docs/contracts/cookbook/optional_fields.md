# Optional Fields

By default, all fields mentioned in the schema of `obj` are required. However, you can make a field optional explicitly.

In case you do not care how exactly the field is optional, you can use the `or` in combination with `noting`:

```ts
import { obj, str, num, or, nothing } from '@withease/contracts';

const UserWithOptionalAge = obj({
  name: str,
  age: or(num, nothing),
});
```

In the example above, the `age` field can be either a number or missing or `null` or `undefined`.

## Only `null`

In case you expect a field to have `null` as a value, you can add it to the field definition as follows:

```ts
import { obj, str, num, or, val } from '@withease/contracts';

const UserWithOptionalAge = obj({
  name: str,
  age: or(num, val(null)),
});
```

## Only `undefined`

If you expect a field to be missing, you can pass `undefined` as a value:

::: warning
In `@withease/contracts`, `undefined` as a field value is the same as a missing field. If you need to differentiate between the two, you can fallback to more powerful tools like Zod or Runtypes.
:::

```ts
import { obj, str, num, or, val } from '@withease/contracts';

const UserWithPossibleNoAge = obj({
  name: str,
  age: or(num, val(undefined)),
});
```
