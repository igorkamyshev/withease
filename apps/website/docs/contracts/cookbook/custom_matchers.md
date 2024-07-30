# Custom Matchers

Since `@withease/contracts` is built on top of [_Contract_](/protocols/contract), you can embed your own matcher into the schema naturally.

Let us write a custom matcher that checks if an age of a user is within a certain range:

```ts
import { type Contract } from '@withease/contracts';

function age(min, max): Contract<number, number> {
  return {
    isData: (data) => data >= min && data <= max,
    getErrorMessages: (data) =>
      `Expected a number between ${min} and ${max}, but got ${data}`,
  };
}
```

Now you can use this matcher in your schema:

```ts
import { obj, str, and, num } from '@withease/contracts';

const User = obj({
  name: str,
  age: and(num, age(18, 100)),
});
```
