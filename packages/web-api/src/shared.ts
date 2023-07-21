import {
  Event,
  attach,
  createEffect,
  createEvent,
  createStore,
  sample,
  scopeBind,
} from 'effector';

export type Setupable = {
  setup: Event<void>;
  teardown?: Event<void>;
};

export function readValue<T>(getter: () => T, defaultValue: T): T {
  try {
    const value = getter();

    if (value === undefined) {
      return defaultValue;
    }

    return value;
  } catch (e) {
    return defaultValue;
  }
}

export function setupListener<T>(
  {
    add,
    remove,
    readPayload,
  }: {
    add: (listener: (value: any) => void) => void;
    remove: (listener: (value: any) => void) => void;
    readPayload: () => T;
  },
  config: Setupable
): Event<T>;

export function setupListener<T>(
  {
    add,
    remove,
  }: {
    add: (listener: (value: T extends void ? any : T) => void) => void;
    remove: (listener: (value: T extends void ? any : T) => void) => void;
  },
  config: Setupable
): Event<T>;

export function setupListener<T>(
  {
    add,
    remove,
    readPayload,
  }: {
    add: (listener: (value: T) => void) => void;
    remove: (listener: (value: T) => void) => void;
    readPayload?: () => T;
  },
  config: Setupable
): Event<T> {
  const event = createEvent<T>();

  const $subscription = createStore<((value: T) => void) | null>(null, {
    serialize: 'ignore',
  });

  const startWatchingFx = createEffect(() => {
    const boundEvent = scopeBind(event, { safe: true });
    let listener = boundEvent;

    if (readPayload) {
      listener = () => boundEvent(readPayload());
    }

    add(listener);

    return listener;
  });

  const stopWatchingFx = attach({
    source: $subscription,
    effect(subscription) {
      if (!subscription) return;
      remove(subscription);
    },
  });

  sample({ clock: config.setup, target: startWatchingFx });
  sample({
    clock: startWatchingFx.doneData,
    filter: Boolean,
    target: $subscription,
  });

  if (config.teardown) {
    sample({ clock: config.teardown, target: stopWatchingFx });
  }
  sample({ clock: stopWatchingFx.done, target: $subscription.reinit! });

  return event;
}
