<script setup>
import pkg from '../../../../packages/contracts/package.json';
import demoFile from './array_numbers.live.vue?raw';
import { data as sizes } from './sizes.data';
import SizeChart from './size_chart.vue';
import bytes from 'bytes'

const maxSize = pkg['size-limit'].at(0).limit;

const allSizes = [
    { name: '@withease/contracts', size: bytes(maxSize) },
    ...(sizes ?? [])
];
</script>

# contracts

Extremely small library (less than **{{maxSize}}** controlled by CI) for creating [_Contracts_](/protocols/contract) that allows you to introduce data validation on edges of the application with no performance compromises.

## Installation

First, you need to install package:

::: code-group

```sh [pnpm]
pnpm install @withease/contracts
```

```sh [yarn]
yarn add @withease/contracts
```

```sh [npm]
npm install @withease/contracts
```

:::

## Creating a _Contract_

`@withease/contracts` exports bunch of utilities that can be used to create a _Contract_, read the full API reference [here](/contracts/api). Any of the utilities returns a _Contract_ object, that accepts something `unknown` and checks if it is something concrete defined by the used utility.

<LiveDemo :demoFile="demoFile" />

## Usage of a _Contract_

`@withease/contracts` is designed to be compatible with Effector's ecosystem without additional interop, so most of the time you can pass created [_Contract_](/protocols/contract) to other Effector's libraries as is.

### Farfetched

[Farfetched](https://ff.effector.dev) is the advanced data fetching tool for web applications based of Effector. It suggests to ensure that data received from the server is conforms desired [_Contract_](/protocols/contracts).

```ts
import { createJsonQuery } from '@farfetched/core';
import { rec, str, arr, val, or } from '@withease/contracts';

const characterQuery = createJsonQuery({
  params: declareParams<{ id: number }>(),
  request: {
    method: 'GET',
    url: ({ id }) => `https://rickandmortyapi.com/api/character/${id}`,
  },
  response: {
    // after receiving data from the server
    // check if it is conforms the Contract to ensure
    // API does not return something unexpected
    contract: rec({
      id: str,
      name: str,
      status: Status,
      species: str,
      type: str,
      gender: Gender,
      origin: rec({ name: str, url: str }),
      location: rec({ name: str, url: str }),
      image: or(val('Female'), val('Male'), val('Genderless')),
      episode: arr(str),
    }),
  },
});
```

### effector-storage

[`effector-storage`](https://github.com/yumauri/effector-storage) is a small module for Effector to sync stores with different storages (local storage, session storage, async storage, IndexedDB, cookies, server side storage, etc).

Since data is stored in an external storage it is important to validate it before using it in the application.

```ts
import { createStore } from 'effector';
import { persist } from 'effector-storage';
import { num } from '@withease/contracts';

const $counter = createStore(0);

persist({
  store: $counter,
  key: 'counter',
  // after reading value from a storage check if a value is number
  // to avoid pushing invalid data to the Store
  contract: num,
});
```

## Integration with other libraries

Since `@withease/contracts` is compatible [_Contract_](/protocols/contract) protocol it can be used with any library that supports it.

For instance, you can define a part of a [_Contract_](/protocols/contract) with [Zod](https://zod.dev/) and combine it with `@withease/contracts`:

```ts
import { z } from 'zod';
import { arr, rec } from '@withease/contracts';
import { zodContract } from '@farfetched/zod';

const User = z.object({
  name: z.string(),
});

const MyContract = arr(
  rec({
    // 👇 easily integrate Zod via compatibility layer
    users: zodContract(User),
  })
);
```

The full list of libraries that support _Contract_ protocol can be found [here](/protocols/contract).

## Differences from other libraries

<section v-if="sizes">
It is extremely small and we mean it 👇

<SizeChart :sizes="allSizes" />

::: tip
Data fetched directly from https://esm.run/ and updates on every commit.
:::

</section>
<section v-else>
It is significantly smaller than other libraries for creating _Contracts_.
</section>
