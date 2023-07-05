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

  test('supports factories with no arguments', () => {
    function createFlag(): number {
      return 1;
    }

    const createFlagFactory = createFactory(createFlag);

    const flag = invoke(createFlagFactory);
    expectTypeOf(flag).toEqualTypeOf<number>();
  });

  test('supports factories with no arguments as part of overload', () => {
    function createFlag(): number;
    function createFlag(status: string): string;

    function createFlag(status?: string): any {
      return status ?? 0;
    }

    const createFlagFactory = createFactory(createFlag);

    const numberFlag = invoke(createFlagFactory);
    expectTypeOf(numberFlag).toEqualTypeOf<number>();

    const stringFlag = invoke(createFlagFactory, 'stat');
    expectTypeOf(stringFlag).toEqualTypeOf<string>();
  });
});
