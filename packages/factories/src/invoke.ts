import { type Factory } from './factory';

export function invoke<
  C extends (...args: any) => any,
  P extends OverloadParameters<C>[0]
>(factory: Factory<C>, params: P): OverloadReturn<P, OverloadUnion<C>> {
  return factory.__.create(params);
}

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
