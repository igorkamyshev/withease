import { describe, test, expectTypeOf } from 'vitest';

import { and, Contract, num } from './index';

describe('and', () => {
  test('inline contract', () => {
    const contract = and(num, {
      isData: (data): data is number => data > 0,
      getErrorMessages: () => ['data must be greater than 0'],
    });

    expectTypeOf(contract).toEqualTypeOf<Contract<unknown, number>>();
  });
});
