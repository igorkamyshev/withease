import { type Factory } from './factory';

export function createFactory<P, R>(creator: (params: P) => R): Factory<P, R> {
  return {
    __: {
      create: creator,
    },
  };
}
