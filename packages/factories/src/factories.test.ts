import { describe, expect, test, vi } from 'vitest';

import { createFactory } from './create_factory';
import { invoke } from './invoke';

describe('factories', () => {
  test('invoke calls original creator with passed params', () => {
    const creator = vi.fn();
    const factory = createFactory(creator);
    const params = [1, 2, 3];

    invoke(factory, params);

    expect(creator).toHaveBeenCalledWith(params);
  });
});
