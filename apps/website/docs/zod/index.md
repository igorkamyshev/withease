# zod

Compatibility layer for [Zod](https://zod.dev/) and [_Contract_](/protocols/contract). You need to install it and its peer dependencies before usage:

::: code-group

```sh [pnpm]
pnpm install zod @withease/zod
```

```sh [yarn]
yarn add zod @withease/zod
```

```sh [npm]
npm install zod @withease/zod
```

:::

## `zodContract`

Creates a [_Contract_](/protocols/contract) based on given `ZodType`.

```ts
import { z } from 'zod';
import { zodContract } from '@farfetched/zod';

const Asteroid = z.object({
  type: z.literal('asteroid'),
  mass: z.number(),
});

const asteroidContract = zodContract(Asteroid);

/* typeof asteroidContract === Contract<
 *   unknown, 👈 it accepts something unknown
 *   { type: 'asteriod', mass: number }, 👈 and validates if it is an asteroid
 * >
 */
```
