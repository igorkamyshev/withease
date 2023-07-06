import { markFactoryAsCalled, insideInvoke } from './invoke';

export function createFactory<C extends (params: any) => any>(creator: C): C {
  /*
   * DX improvement for JS-users who do not get TS error
   * when pass function with more than 1 argument
   */
  if (creator.length > 1) {
    throw new Error(
      'createFactory does not support functions with more than 1 argument'
    );
  }

  const create = (params: any) => {
    /*
     * DX improvement for users who try to call factory directly without invoke
     */
    if (!insideInvoke) {
      throw new Error(
        `Do not call factory directly, pass it to invoke function instead`
      );
    }

    const value = creator(params);

    /*
     * It is important to call markFactoryAsCalled after creator call
     * because invoke function checks this flag to throw an error
     * if called function is not created by createFactory
     */
    markFactoryAsCalled();

    return value;
  };

  return create as C;
}
