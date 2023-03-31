import {
  sample,
  attach,
  scopeBind,
  createStore,
  createEvent,
  createEffect,
  type Event,
  type Store,
} from 'effector';

import { readValue, type Setupable } from './shared';
import { type TriggerProtocol } from './trigger_protocol';

type Result = {
  $active: Store<boolean>;
  $inactive: Store<boolean>;
  activate: Event<void>;
};

type Query = string;

function trackMediaQuery(mq: Query, c: Setupable): Result;
function trackMediaQuery(
  mq: Query
): ((c: Setupable) => Result) & TriggerProtocol;

function trackMediaQuery<T extends Record<string, Query>>(
  mq: T,
  c: Setupable
): { [key in keyof T]: Result };
function trackMediaQuery<T extends Record<string, Query>>(
  mq: T
): { [key in keyof T]: ((c: Setupable) => Result) & TriggerProtocol };

function trackMediaQuery(
  mq: Query | Record<string, Query>,
  config?: Setupable
): any {
  // single query
  if (typeof mq === 'string') {
    if (config) {
      return tracker(mq, config);
    } else {
      const track = (finalConfig: Setupable) => tracker(mq, finalConfig);

      track['@@trigger'] = () => {
        const setup = createEvent();
        const teardown = createEvent();

        const { activate } = tracker(mq, { setup, teardown });

        return { setup, teardown, fired: activate };
      };

      return track;
    }
  }
  // multiple queries
  else {
    if (config) {
      const resuls = {} as Record<string, Result>;

      for (const [mqKey, mqValue] of Object.entries(mq)) {
        resuls[mqKey] = trackMediaQuery(mqValue, config);
      }

      return resuls;
    } else {
      const results = {} as Record<string, (finalConfig: Setupable) => Result>;

      for (const [mqKey, mqValue] of Object.entries(mq)) {
        results[mqKey] = (finalConfig: Setupable) =>
          trackMediaQuery(mqValue, finalConfig);
      }

      return results;
    }
  }
}

function tracker(query: string, config: Setupable): Result {
  const mq = readValue(() => window.matchMedia(query), null);

  const $active = createStore(mq?.matches ?? false, { serialize: 'ignore' });
  const $inactive = $active.map((active) => !active);

  const changed = createEvent<MediaQueryListEvent>();

  sample({ clock: changed, fn: (event) => event.matches, target: $active });

  const activate = sample({
    clock: $active.updates,
    filter: Boolean,
    fn: (): void => {
      // ...
    },
  });

  const $subscription = createStore<((e: MediaQueryListEvent) => void) | null>(
    null,
    {
      serialize: 'ignore',
    }
  );

  const startWatchingFx = createEffect(() => {
    if (!mq) return;

    const listener = scopeBind(changed, { safe: true });
    mq.addEventListener('change', listener);
    return listener;
  });

  const stopWatchingFx = attach({
    source: { subscription: $subscription },
    effect({ subscription }) {
      if (!subscription || !mq) return;
      mq.removeEventListener('change', subscription);
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

  return { $active, $inactive, activate };
}

export { trackMediaQuery };
