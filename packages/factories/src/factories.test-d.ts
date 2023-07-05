import { describe, test, expectTypeOf } from 'vitest';

import { createFactory } from './create_factory';
import { invoke } from './invoke';

describe('factories', () => {
  test('supports overloads', () => {
    function createFlag(status: number): number;
    function createFlag(status: string): string;

    function createFlag(status: number | string) {
      return status;
    }

    const createFlagFactory = createFactory(createFlag);

    const stringFlag = invoke(createFlagFactory, '1');
    expectTypeOf(stringFlag).toEqualTypeOf<string>();

    const numberFlag = invoke(createFlagFactory, 1);
    expectTypeOf(numberFlag).toEqualTypeOf<number>();
  });
});
