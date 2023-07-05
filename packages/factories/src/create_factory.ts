import { type Factory } from './factory';

export function createFactory<C extends (params: any) => any>(
  creator: C
): Factory<C> {
  return {
    __: {
      create: creator,
    },
  };
}
