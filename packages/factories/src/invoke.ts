import { factoryCalledDirectly, invokeAcceptsOnlyFactories } from './errors';

/*
 * The following variables are used for checking that factory is called inside invoke function on correct nesting level
 */
export let invokeLevel = 0;
let invokeCount = 0;
let factoryCalledCount = 0;

/**
 * Have to be called inside factory created by createFactory
 * @private
 */
export function markFactoryAsCalled() {
  factoryCalledCount += 1;
}

export function invoke<C extends (...args: any) => any>(
  factory: C
): OverloadReturn<void, OverloadUnion<C>>;

export function invoke<
  C extends (...args: any) => any,
  P extends OverloadParameters<C>[0]
>(factory: C, params: P): OverloadReturn<P, OverloadUnion<C>>;

export function invoke<
  C extends (...args: any) => any,
  P extends OverloadParameters<C>[0]
>(factory: C, params?: P): OverloadReturn<P, OverloadUnion<C>> {
  /* Increase invoke level before factory calling */
  invokeLevel += 1;
  invokeCount += 1;

  const result = factory(params);

  /* And descrese in after */
  invokeLevel -= 1;

  const haveToThrowBecauseOfCalledFactory = factoryCalledCount === 0;
  let haveToThrowErrorBecauseInvokeLevel = false;

  if (invokeLevel === 0 /* Ending of nexted invoke calls */) {
    haveToThrowErrorBecauseInvokeLevel /* Amount of invokes and factoies does not match */ =
      factoryCalledCount !== invokeCount;

    /* Reset related variables */
    factoryCalledCount = 0;
    invokeCount = 0;
  }

  if (haveToThrowBecauseOfCalledFactory) {
    throw invokeAcceptsOnlyFactories();
  }

  if (haveToThrowErrorBecauseInvokeLevel) {
    throw factoryCalledDirectly();
  }

  return result;
}

/*
 * The reason for the following types is that by default TypeScript does not
 * support overloaded functions in generics — https://github.com/microsoft/TypeScript/issues/14107
 *
 * But we need to support overloads in `invoke` function because it is used in
 * many factories in Effector's ecosystem and we don't want to break them.
 *
 * The following types are adapted from the following comment:
 * https://github.com/microsoft/TypeScript/issues/14107#issuecomment-1146738780
 *
 * Changes from the original implementation:
 * 1. OverloadReturn were changed because the original implementation does not infer
 * exact return type but do infer union of all possible return types.
 * 2. OverloadReturn supports only single-agrument functions because @withease/factories
 * does not support multiple arguments in general.
 */

type OverloadProps<TOverload> = Pick<TOverload, keyof TOverload>;

type OverloadUnionRecursive<
  TOverload,
  TPartialOverload = unknown
> = TOverload extends (...args: infer TArgs) => infer TReturn
  ? TPartialOverload extends TOverload
    ? never
    :
        | OverloadUnionRecursive<
            TPartialOverload & TOverload,
            TPartialOverload &
              ((...args: TArgs) => TReturn) &
              OverloadProps<TOverload>
          >
        | ((...args: TArgs) => TReturn)
  : never;

type OverloadUnion<TOverload extends (...args: any[]) => any> = Exclude<
  OverloadUnionRecursive<(() => never) & TOverload>,
  TOverload extends () => never ? never : () => never
>;

type OverloadParameters<T extends (...args: any) => any> = Parameters<
  OverloadUnion<T>
>;

type OverloadReturn<P, F extends (...args: any[]) => any> =
  /*
   * Function with no arguments (() => any) is a special case
   * because it extends (...args: any[]) => any in TypeScript.
   *
   * So we need to handle it separately to prevent incorrect inference.
   */
  F extends () => any
    ? /*
       * In case of functions without arguments
       * we need to return ReturnType<F> because it is the only possible return type.
       */
      P extends void
      ? ReturnType<F>
      : never
    : /*
     * In case of function with single argument
     * We need to find correct overload and return its return type.
     */
    F extends (params: P) => infer R
    ? R
    : never;
