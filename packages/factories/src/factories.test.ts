import { describe, expect, test, vi } from 'vitest';

import { createFactory } from './create_factory';
import { invoke } from './invoke';

describe('factories', () => {
  test('invoke calls original creator with passed params', () => {
    const mock = vi.fn();
    const factory = createFactory((params: number[]) => {
      mock(params);

      return params.at(0);
    });

    const valueOne = invoke(factory, [1, 2, 3]);
    expect(mock).toHaveBeenCalledWith([1, 2, 3]);
    expect(valueOne).toBe(1);

    const valueTwo = invoke(factory, [2, 3, 4]);
    expect(mock).toHaveBeenCalledWith([2, 3, 4]);
    expect(valueTwo).toBe(2);
  });
});
