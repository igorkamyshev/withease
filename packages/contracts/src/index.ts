import { func } from 'superstruct';

/**
 * A type that allows to extract the result type of a _Contract_.
 *
 * @example
 * const User = rec({
 *   name: str,
 *   age: num,
 * });
 *
 * type User = UnContract<typeof User>; // { name: string, age: number }
 */
export type UnContract<T> = T extends Contract<unknown, infer U> ? U : never;

/**
 * A _Contract_ is a type that allows to check if a value is conform to a given structure.
 *
 * @example
 * function age(min, max): Contract<unknown, number> {
 *   return {
 *     isData: (data) => typeof data === 'number' && data >= min && data <= max,
 *     getErrorMessages: (data) =>
 *       `Expected a number between ${min} and ${max}, but got ${data}`,
 *   };
 * }
 */
export type Contract<Raw, Data extends Raw> = {
  /**
   * Checks if Raw is Data
   */
  isData: (prepared: Raw) => prepared is Data;
  /**
   * - empty array is dedicated for valid response
   * - array of string with validation errors for invalidDataError
   */
  getErrorMessages: (prepared: Raw) => string[];
};

/**
 * _Contract_ that checks if a value is a boolean.
 *
 * @example
 * bool.isData(true) === true;
 * bool.isData(42) === false;
 */
export const bool: Contract<unknown, boolean> = createSimpleContract(
  (x: unknown): x is boolean => {
    return typeof x === 'boolean';
  },
  'boolean'
);

/**
 * _Contract_ that checks if a value is a number.
 *
 * @example
 * num.isData(42) === true;
 * num.isData('42') === false;
 */
export const num: Contract<unknown, number> = createSimpleContract(
  (x: unknown): x is number => {
    return typeof x === 'number';
  },
  'number'
);

/**
 * _Contract_ that checks if a value is a string.
 *
 * @example
 * str.isData('hello') === true;
 * str.isData(42) === false;
 */
export const str: Contract<unknown, string> = createSimpleContract(
  (x: unknown): x is string => {
    return typeof x === 'string';
  },
  'string'
);

/**
 * Function that creates a _Contract_ that checks if a value is equal to a given value.
 *
 * @example
 * const only42 = val(42);
 * only42.isData(42) === true;
 * only42.isData(43) === false;
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
 *
 * @example
 * const stringOrNumber = or(str, num);
 * stringOrNumber.isData('hello') === true;
 * stringOrNumber.isData(42) === true;
 * stringOrNumber.isData(true) === false;
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
 * Function that creates a _Contract_ that checks if a value is conform to all of the given _Contracts_.
 *
 * @example
 * function age(min, max): Contract<number, number> {
 *   return {
 *     isData: (data) => data >= min && data <= max,
 *     getErrorMessages: (data) =>
 *       `Expected a number between ${min} and ${max}, but got ${data}`,
 *   };
 * }
 *
 * const User = rec({
 *   name: str,
 *   age: and(num, age(18, 100)),
 * });
 */
export function and<T>(
  first: Contract<unknown, T>,
  ...rest: Array<Contract<T, T>>
): Contract<unknown, T> {
  const all = [first, ...rest];
  return {
    isData: (x): x is T => all.every((c) => c.isData(x as any)),
    getErrorMessages: (x) => {
      for (const c of all) {
        if (!c.isData(x as any)) {
          return c.getErrorMessages(x as any);
        }
      }

      return [];
    },
  };
}

/**
 * Function that creates a _Contract_ that checks if a value is object and every property is conform to the given _Contract_.
 * 
 * @overload "rec(str, contract)"
 *
 * @example
 * const Ids = rec(str, num);
 *
 * Ids.isData({ id1: 1, id2: 2 }) === true;
 * Ids.isData({ id1: 1, id2: '2' }) === false;
 */
export function rec<V>(
  keys: typeof str,
  values: Contract<unknown, V>
): Contract<unknown, Record<string, V>>;

/**
 * Function that creates a _Contract_ that checks if a value is conform to an object with the given _Contracts_ as properties.
 *
 * @overload "rec(shape)"
 * 
 * @example
 * const User = rec({
 *  name: str,
 *  age: num,
 * });
 *
 * User.isData({ name: 'Alice', age: 42 }) === true;
 * User.isData({ name: 'Alice' }) === false;
 */
export function rec<C extends Record<string, Contract<unknown, any>>>(
  c: C
): Contract<unknown, { [key in keyof C]: UnContract<C[key]> }>;

export function rec(shape: any, fieldContract?: any): any {
  const check = (x: unknown) => {
    if (typeof x !== 'object' || x === null) return false;

    let valid = true;
    if (shape === str) {
      for (const val of Object.values(x)) {
        if (fieldContract.isData(val) === false) {
          valid = false;
          break;
        }
      }
    } else {
      for (const [key, val] of Object.entries(shape)) {
        // @ts-expect-error
        if (!val.isData((x as any)[key])) {
          valid = false;
          break;
        }
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

      if (shape === str) {
        for (const [key, val] of Object.entries(x)) {
          if (fieldContract.isData(val) === false) {
            errors.push(`${key}: ${fieldContract.getErrorMessages(val)}`);
          }
        }
      } else {
        for (const [key, val] of Object.entries(shape)) {
          // @ts-expect-error
          const newErrors = val.getErrorMessages((x as any)[key]);
          errors.push(...newErrors.map((msg: string) => `${key}: ${msg}`));
        }
      }

      return errors;
    }),
  };
}

/**
 * Function that creates a _Contract_ that checks if a value is conform to an array of the given _Contracts_.
 *
 * @example
 * const arrayOfStrings = arr(str);
 * arrayOfStrings.isData(['hello', 'world']) === true;
 * arrayOfStrings.isData(['hello', 42]) === false;
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
