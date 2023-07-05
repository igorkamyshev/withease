import { type Factory } from './factory';

export function invoke<
  C extends (...args: any) => any,
  P extends OverloadParameters<C>[0]
>(factory: Factory<C>, params: P): OverloadReturn<P, OverloadUnion<C>> {
  return factory.__.create(params);
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

type OverloadReturn<P, F extends (...args: any[]) => any> = F extends (
  params: P
) => infer R
  ? R
  : never;
