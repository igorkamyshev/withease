# Optional Fields

By default, all fields mentioned in the schema of `rec` are required. However, you can make a field optional explicitly.

In case you expect a field to have `null` as a value, you can add it to the field definition as follows:

```ts
import { rec, str, num, or, val } from '@withease/contracts';

const UserWithOptionalAge = rec({
  name: str,
  age: or(num, val(null)),
});
```

If you expect a field to be missing, you can pass `undefined` as a value:

```ts
import { rec, str, num, or, val } from '@withease/contracts';

const UserWithPossibleNoAge = rec({
  name: str,
  age: or(num, val(undefined)),
});
```

::: tip Q: But `undefined` as a field value is not the same as a missing field, right?
A: Correct. However, in **most cases**, you can treat `undefined` as a missing field and vice versa. In case you _really_ need to differentiate between the two, you can fallback to more powerful tools like Zod or Runtypes, `@withease/contracts` aims to cover only the most common use cases.
:::
