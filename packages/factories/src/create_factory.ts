import { type Factory } from './factory';
import { insideInvoke } from './invoke';

export function createFactory<C extends (params: any) => any>(
  creator: C
): Factory<C> {
  /*
   * DX improvement for JS-users who do not get TS error
   * when pass function with more than 1 argument
   */
  if (creator.length > 1) {
    throw new Error(
      'createFactory does not support functions with more than 1 argument'
    );
  }

  const create: C = ((params: any): any => {
    /*
     * DX improvement for brave users who try to call factory-internals directly
     */
    if (!insideInvoke) {
      throw new Error(
        `Do not call factory.__.create directly, pass factory to invoke function instead`
      );
    }
    return creator(params);
  }) as any;

  return {
    __: {
      create,
    },
  };
}
