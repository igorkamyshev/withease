import { type Contract } from './protocol';

/**
 * A type that allows to extract the result type of a _Contract_.
 */
export type UnContract<T> = T extends Contract<unknown, infer U> ? U : never;

/**
 * _Contract_ that checks if a value is a boolean.
 */
export const bool: Contract<unknown, boolean> = createSimpleContract(
  (x: unknown): x is boolean => {
    return typeof x === 'boolean';
  },
  'boolean'
);

/**
 * _Contract_ that checks if a value is a number.
 */
export const num: Contract<unknown, number> = createSimpleContract(
  (x: unknown): x is number => {
    return typeof x === 'number';
  },
  'number'
);

/**
 * _Contract_ that checks if a value is a string.
 */
export const str: Contract<unknown, string> = createSimpleContract(
  (x: unknown): x is string => {
    return typeof x === 'string';
  },
  'string'
);

/**
 * Function that creates a _Contract_ that checks if a value is equal to a given value.
 */
export function val<T extends string | number | boolean | null | undefined>(
  value: T
): Contract<unknown, T> {
  const check = (x: unknown): x is T => {
    return x === value;
  };

  return {
    isData: check,
    getErrorMessages: createGetErrorMessages(check, (actual) => [
      `expected ${JSON.stringify(value)}, got ${JSON.stringify(actual)}`,
    ]),
  };
}

/**
 * Function that creates a _Contract_ that checks if a value is conform to one of the given _Contracts_.
 */
export function or<T extends Array<Contract<unknown, any>>>(
  ...contracts: T
): Contract<unknown, UnContract<T[number]>> {
  const check = (x: unknown): x is UnContract<T[number]> =>
    contracts.some((c) => c.isData(x));

  return {
    isData: check,
    getErrorMessages: createGetErrorMessages(check, (x) => {
      return contracts.flatMap((c) => c.getErrorMessages(x));
    }),
  };
}

/**
 * Function that creates a _Contract_ that checks if a value is conform to an object with the given _Contracts_ as properties.
 */
export function rec<C extends Record<string, Contract<unknown, any>>>(
  c: C
): Contract<unknown, { [key in keyof C]: UnContract<C[key]> }> {
  const check = (x: unknown): x is { [key in keyof C]: UnContract<C[key]> } => {
    if (typeof x !== 'object' || x === null) return false;

    let valid = true;
    for (const [key, val] of Object.entries(c)) {
      if (!val.isData((x as any)[key])) {
        valid = false;
        break;
      }
    }

    return valid;
  };

  return {
    isData: check,
    getErrorMessages: createGetErrorMessages(check, (x) => {
      if (typeof x !== 'object' || x === null) {
        return [`expected object, got ${typeOf(x)}`];
      }
      const errors = [] as string[];

      for (const [key, val] of Object.entries(c)) {
        const newErrors = val.getErrorMessages((x as any)[key]);
        errors.push(...newErrors.map((msg) => `${key}: ${msg}`));
      }

      return errors;
    }),
  };
}

/**
 * Function that creates a _Contract_ that checks if a value is conform to an array of the given _Contracts_.
 */
export function arr<V>(c: Contract<unknown, V>): Contract<unknown, V[]> {
  const check = (x: unknown): x is V[] =>
    Array.isArray(x) && x.every((v) => c.isData(v));

  return {
    isData: check,
    getErrorMessages: createGetErrorMessages(check, (x) => {
      if (!Array.isArray(x)) {
        return [`expected array, got ${typeOf(x)}`];
      }

      return x.flatMap((v, idx) =>
        c.getErrorMessages(v).map((message) => `${idx}: ${message}`)
      );
    }),
  };
}

// -- utils

function createSimpleContract<T>(
  check: (x: unknown) => x is T,
  exepctedType: string
): Contract<unknown, T> {
  return {
    isData: check,
    getErrorMessages: createGetErrorMessages(check, (actual) => [
      `expected ${exepctedType}, got ${typeOf(actual)}`,
    ]),
  };
}

function createGetErrorMessages(
  check: (v: unknown) => boolean,
  fn: (v: unknown) => string[]
): (v: unknown) => string[] {
  return (v) => {
    if (check(v)) {
      return [];
    }

    return fn(v);
  };
}

function typeOf(x: unknown): string {
  return x === null ? 'null' : typeof x;
}
