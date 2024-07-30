import { describe, test, expectTypeOf } from 'vitest';

import { and, Contract, num, obj, str } from './index';

describe('and', () => {
  test('inline contract', () => {
    const contract = and(num, {
      isData: (data): data is number => data > 0,
      getErrorMessages: () => ['data must be greater than 0'],
    });

    expectTypeOf(contract).toEqualTypeOf<Contract<unknown, number>>();
  });

  test('as extends', () => {
    const contract = and(obj({ name: str }), obj({ age: num }));

    expectTypeOf(contract).toEqualTypeOf<
      Contract<unknown, { name: string; age: number }>
    >();
  });
});
