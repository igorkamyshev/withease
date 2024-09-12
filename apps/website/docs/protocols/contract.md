# _Contract_

A rule to statically validate received data. Any object following the strict API could be used as a _Contract_.

::: tip Packages that use _Contract_

- [`@farfetched/core`](https://farfetched.pages.dev)
- [`effector-storage`](https://github.com/yumauri/effector-storage)

:::

::: tip Packages that provide integration for creating _Contract_

- [`@withease/contracts`](/contracts/)
- [`@farfetched/runtypes`](https://farfetched.pages.dev/api/contracts/runtypes.html)
- [`@withease/zod`](/zod/)
- [`@farfetched/io-ts`](https://farfetched.pages.dev/api/contracts/io-ts.html)
- [`@farfetched/superstruct`](https://farfetched.pages.dev/api/contracts/superstruct.html)
- [`@farfetched/typed-contracts`](https://farfetched.pages.dev/api/contracts/typed-contracts.html)
- [`@farfetched/valibot`](https://farfetched.pages.dev/api/contracts/valibot.html)

:::

## API reference

To create a _Contract_ you need to provide an object with the following fields:

```ts
interface Contract<Raw, Data extends Raw> {
  /**
   * Checks if Raw is Data
   */
  isData: (prepared: Raw) => prepared is Data;
  /**
   * - empty array is dedicated for valid response
   * - array of string with validation erorrs for invalidDataError
   */
  getErrorMessages: (prepared: Raw) => string[];
}
```
