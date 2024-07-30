# Merge Objects

Merge two [_Contracts_](/primitives/contract) representing objects into a single [_Contract_](/primitives/contract) representing an object with fields from both input objects is a common operation in many applications.

With `@withease/contracts` in can be done with simple `and` call:

```ts
import { num, str, obj, and, type UnContract } from '@withease/contracts';

const Price = obj({
  currency: str,
  value: num,
});

const PriceWithDiscount = and(
  Price,
  obj({
    discount: num,
  })
);

type TPriceWithDiscount = UnContract<typeof PriceWithDiscount>;
// 👆 { currency: string, value: number, discount: number }
```
