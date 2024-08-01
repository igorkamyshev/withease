import { describe, it, expect } from 'vitest';

import { Array, String } from 'runtypes';
import { object, string } from 'superstruct';
import { runtypeContract } from '@farfetched/runtypes';
import { superstructContract } from '@farfetched/superstruct';

import { obj, arr } from './index';

describe('runtypes', () => {
  it('supports Runtype inside', () => {
    const cntrct = obj({ name: runtypeContract(Array(String)) });

    expect(cntrct.isData({ name: ['foo'] })).toBe(true);
    expect(cntrct.getErrorMessages({ name: ['foo'] })).toEqual([]);

    expect(cntrct.isData({ name: [1] })).toBe(false);
    expect(cntrct.getErrorMessages({ name: [1] })).toMatchInlineSnapshot(`
      [
        "name: 0: Expected string, but was number",
      ]
    `);
  });
});

describe('superstruct', () => {
  it('supports Superstruct inside', () => {
    const cntrct = arr(superstructContract(object({ name: string() })));

    expect(cntrct.isData([{ name: 'foo' }])).toBe(true);
    expect(cntrct.getErrorMessages([{ name: 'foo' }])).toEqual([]);

    expect(cntrct.isData([{ name: 1 }])).toBe(false);
    expect(cntrct.getErrorMessages([{ name: 1 }])).toMatchInlineSnapshot(`
      [
        "0: name: Expected a string, but received: 1",
      ]
    `);
  });
});
