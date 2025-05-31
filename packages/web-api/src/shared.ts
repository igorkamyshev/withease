import {
  type Event,
  type Store,
  type EventCallable,
  type StoreWritable,
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

export function readonly<T>(unit: StoreWritable<T>): Store<T>;
export function readonly<T>(unit: EventCallable<T>): Event<T>;

export function readonly(unit: any) {
  return unit.map((v: any) => v);
}

type UnsubscribeFn = () => void;
type UpdaterFn = (updateFn: () => void) => UnsubscribeFn;

export const createAutoUpdatedStore =
  ({ setup, teardown }: Setupable) =>
  <T>(readValue: () => T, updater: UpdaterFn) => {
    const store = createStore(readValue());
    const update = createEvent<T>();

    let unsubscribe: () => void | undefined;

    sample({
      clock: update,
      target: store,
    });

    sample({
      clock: setup,
      target: createEffect(
        () => (unsubscribe = updater(() => update(readValue())))
      ),
    });

    if (teardown) {
      sample({
        clock: teardown,
        filter: () => Boolean(unsubscribe),
        target: createEffect(() => {
          unsubscribe!();
        }),
      });
    }

    return store;
  };
