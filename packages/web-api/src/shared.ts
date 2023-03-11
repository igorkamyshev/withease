import { Event } from 'effector';

export type Setupable = {
  setup: Event<void>;
  teardown?: Event<void>;
};

export function readValue<T>(getter: () => T, defaultValue: T): T {
  try {
    return getter();
  } catch (e) {
    return defaultValue;
  }
}
