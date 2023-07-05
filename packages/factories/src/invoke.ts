import { type Factory } from './factory';

export function invoke<P, R>(factory: Factory<P, R>, params: P): R {
  return factory.__.create(params);
}
